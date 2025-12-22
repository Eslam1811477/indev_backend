import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../services/user.service";
import { signToken } from "../config/jwt";

const auth = new Hono();

auth.post("/register", async (c) => {
  const { email, password } = await c.req.json();


  const user = await createUser(email, password);
  if (!user) {
    return c.json({ message: "User already exists" }, 400);
  }

  return c.json({ message: "Registered successfully" });
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const user = await findUserByEmail(email);
  if (!user) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return c.json({ token });
});

export default auth;
