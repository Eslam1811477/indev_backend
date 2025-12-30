import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import fs from "fs";
import path from "path";
import "dotenv/config";

import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";
import templates from "./routes/template";
import { connectDB } from "./config/db";
import envato from "./routes/envato";

const app = new Hono();

/* =========================
    Database
========================= */
connectDB();

/* =========================
    CORS
========================= */
const origin = process.env.FRONTEND_URI ?? "";

app.use(
  "*",
  cors({
    origin,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* =========================
    Serve static files (storage)
========================= */

app.use(
  "/storage/*",
  cors({
    origin,
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/storage/*", async (c) => {
  const filePath = c.req.path.replace("/storage/", "");
  const fullPath = path.join(process.cwd(), "src", "storage", filePath);

  if (!fs.existsSync(fullPath)) {
    return c.notFound();
  }

  const file = await fs.promises.readFile(fullPath);

  return new Response(file, {
    headers: {
      "Content-Type": getMimeType(fullPath),
      "Cache-Control": "public, max-age=31536000",
    },
  });
});


/* =========================
    Routes
========================= */
app.route("/auth", authRoutes);
app.route("/api", protectedRoutes);
app.route("/templates", templates);
app.route("/envato", envato);


/* =========================
    Start Server
========================= */
serve({
  fetch: app.fetch,
  port: 3000,
});

export default app;

/* =========================
    Helpers
========================= */
function getMimeType(filePath: string) {
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg"))
    return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}
