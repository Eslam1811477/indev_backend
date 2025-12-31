import UserLicense from "../models/userLicense";

const ENVATO_API = "https://api.envato.com/v3/market/author/sale";
const ENVATO_API_KEY = process.env.ENVATO_API_KEY!;

/* =========================
   Helpers
========================= */

const validatePurchaseCodeFormat = (code: string) => {
  const regex = /^(\w{8})-((\w{4})-){3}(\w{12})$/;
  return regex.test(code);
};

const checkEnvatoPurchase = async (purchaseCode: string) => {
  const res = await fetch(
    `${ENVATO_API}?code=${encodeURIComponent(purchaseCode)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ENVATO_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  return {
    status: res.status,
    ok: res.ok,
    data,
  };
};

/* =========================
   Controllers
========================= */

export const verifyPurchase = async (c: any) => {
  let body;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: "Invalid JSON body" }, 400);
  }

  const { purchaseCode } = body;

  if (!purchaseCode) {
    return c.json({ message: "purchaseCode is required" }, 400);
  }

  if (!validatePurchaseCodeFormat(purchaseCode)) {
    return c.json({ valid: false, message: "Invalid code format" }, 400);
  }

  try {
    const result = await checkEnvatoPurchase(purchaseCode);

    if (result.status === 401) {
      return c.json({ valid: false, message: "Invalid Envato token" }, 401);
    }

    if (result.status === 403) {
      return c.json(
        {
          valid: false,
          message: "Not authorized for this sale",
          data: result.data,
        },
        403
      );
    }

    if (result.status === 404) {
      return c.json({ valid: false, message: "Invalid purchase code" }, 404);
    }

    if (!result.ok) {
      return c.json({ valid: false }, result.status);
    }

    if (!result.data?.item?.id) {
      return c.json({ valid: false });
    }

    return c.json({
      valid: true,
      item: {
        id: result.data.item.id,
        name: result.data.item.name,
      },
      buyer: result.data.buyer,
      sold_at: result.data.sold_at,
      supported_until: result.data.supported_until,
      license: result.data.license,
    });
  } catch (error) {
    console.error("Envato verify error:", error);
    return c.json({ valid: false }, 500);
  }
};

export const addUserLicense = async (c: any) => {
  let body;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: "Invalid JSON body" }, 400);
  }

  const { code, username, itemId, itemName } = body;

  if (!code || !username) {
    return c.json({ message: "code and username are required" }, 400);
  }

  if (!validatePurchaseCodeFormat(code)) {
    return c.json({ valid: false, message: "Invalid code format" }, 400);
  }

  try {
    const existing = await UserLicense.findOne({ code });
    if (existing) {
      return c.json(
        { message: "This code is already registered", license: existing },
        400
      );
    }

    const envatoResult = await checkEnvatoPurchase(code);

    const isActive =
      envatoResult.ok && envatoResult.data?.item?.id ? true : false;

    const newLicense = await UserLicense.create({
      code,
      buyerUsername: username,
      itemId: itemId || envatoResult.data?.item?.id || null,
      itemName: itemName || envatoResult.data?.item?.name || null,
      active: isActive,
      soldAt: envatoResult.data?.sold_at || null,
      supportedUntil: envatoResult.data?.supported_until || null,
      licenseType: envatoResult.data?.license || null,
    });

    return c.json({
      message: "User added successfully",
      active: isActive,
      license: newLicense,
    });
  } catch (error) {
    console.error("Add license error:", error);
    return c.json({ message: "Server error" }, 500);
  }
};
