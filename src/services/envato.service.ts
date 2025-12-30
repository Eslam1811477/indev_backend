import UserLicense from "../models/userLicense";

const ENVATO_API = "https://api.envato.com/v3/market/author/sale";
const ENVATO_API_KEY = process.env.ENVATO_API_KEY!;

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

  try {
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

    if (res.status === 401) {
      return c.json({ valid: false, message: "Invalid Envato token" }, 401);
    }

    if (res.status === 403) {
      return c.json(
        { valid: false, message: "Not authorized for this sale", data: await res.json() },
        403
      );
    }

    if (res.status === 404) {
      return c.json(
        { valid: false, message: "Invalid purchase code" },
        404
      );
    }

    if (!res.ok) {
      return c.json({ valid: false }, res.status);
    }

    const data = await res.json();

    if (!data?.item?.id) {
      return c.json({ valid: false });
    }

    return c.json({
      valid: true,
      item: {
        id: data.item.id,
        name: data.item.name,
      },
      buyer: data.buyer,
      sold_at: data.sold_at,
      supported_until: data.supported_until,
      license: data.license,
    });

  } catch (error) {
    console.error("Envato verify error:", error);
    return c.json({ valid: false }, 500);
  }
};

const validatePurchaseCode = (code: string, c: any) => {
  const regex = /^(\w{8})-((\w{4})-){3}(\w{12})$/;
  if (!regex.test(code)) {
    return c.json({ valid: false, message: "Invalid code format" }, 400);
  }
  return null;
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

  // التحقق من صيغة الكود
  const validationError = validatePurchaseCode(code, c);
  if (validationError) return validationError;

  try {
    const existing = await UserLicense.findOne({ code });
    if (existing) {
      return c.json({ message: "This code is already registered", license: existing }, 400);
    }

    const newLicense = await UserLicense.create({
      code,
      buyerUsername: username,
      itemId: itemId || null,
      itemName: itemName || null,
      active: true,
    });

    return c.json({ message: "User added successfully", license: newLicense });
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};
