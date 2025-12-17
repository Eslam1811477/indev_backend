import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

const protectedRoutes = new Hono();


protectedRoutes.use("*", authMiddleware);

protectedRoutes.get("/profile", async (c:any) => {
  const user = c.get("user");
  return c.json({
    message: "You are authenticated ✅",
    user,
  });
});

export default protectedRoutes;
