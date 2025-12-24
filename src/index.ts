import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";

import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";
import { connectDB } from "./config/db";
import "dotenv/config";
import templates from "./routes/template";

const app = new Hono();

connectDB();

app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URI ||'localhost',
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.route("/auth", authRoutes);
app.route("/api", protectedRoutes);
app.route("/templates", templates);


serve({
  fetch: app.fetch,
  port: 3000,
});

export default app;
