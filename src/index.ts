import { Hono } from "hono";
import { serve } from "@hono/node-server";

import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";
import { connectDB } from "./config/db";
import "dotenv/config";

const app = new Hono();

connectDB();

app.route("/auth", authRoutes);
app.route("/api", protectedRoutes);


serve({
    fetch: app.fetch,
    port: 3000,
});

export default app;
