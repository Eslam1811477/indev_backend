import { Context, Next } from "hono";
import { verifyToken } from "../config/jwt";
import type { JwtPayload } from "../config/jwt";

export const authMiddleware = async (c: Context, next: Next) => {
  if (c.req.method === "OPTIONS") {
    return next();
  }
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return c.json({ message: "Invalid authorization format" }, 401);
  }

  try {
    const payload = verifyToken(token) as JwtPayload;

    c.set("user", payload);

    await next();
  } catch (error) {
    console.log(error)
    return c.json({ message: "Invalid or expired token" }, 401);
  }
};
