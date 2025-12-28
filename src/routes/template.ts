import { Hono } from "hono";
import { Template } from "../models/templates.model";
import { authMiddleware } from "../middleware/auth";
import path from "path";
import { randomUUID } from "crypto";

import fs from "fs";

import { writeFile } from "fs/promises";

const templates = new Hono();

/**
 * =========================
 * Create Template
 * POST /templates
 * =========================
 */
templates.post("/", authMiddleware, async (c) => {
  const { templateName, content, plugins, active } = await c.req.json();

  const exists = await Template.findOne({ templateName });
  if (exists) {
    return c.json({ message: "Template already exists" }, 400);
  }

  const template = await Template.create({
    templateName,
    content,
    plugins,
    active,
  });

  return c.json(template, 201);
});

/**
 * =========================
 * Get All Templates
 * GET /templates
 * =========================
 */
templates.get("/", authMiddleware, async (c) => {
  const templates = await Template.find();
  return c.json(templates);
});

/**
 * =========================
 * Get Template By ID
 * GET /templates/:id
 * =========================
 */
templates.get("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const template = await Template.findById(id);
  if (!template) {
    return c.json({ message: "Template not found" }, 404);
  }

  return c.json(template);
});

/**
 * =========================
 * Update Template
 * PUT /templates/:id
 * =========================
 */
templates.put("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const template = await Template.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  if (!template) {
    return c.json({ message: "Template not found" }, 404);
  }

  return c.json(template);
});

/**
 * =========================
 * Delete Template
 * DELETE /templates/:id
 * =========================
 */
templates.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const template = await Template.findByIdAndDelete(id);
  if (!template) {
    return c.json({ message: "Template not found" }, 404);
  }

  return c.json({ message: "Template deleted successfully" });
});

/**
 * =========================
 * Toggle Active
 * PATCH /templates/:id/toggle
 * =========================
 */
templates.patch("/:id/toggle", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const template = await Template.findById(id);
  if (!template) {
    return c.json({ message: "Template not found" }, 404);
  }

  template.active = !template.active;
  await template.save();

  return c.json(template);
});

templates.post("/:id/image", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const template = await Template.findById(id);
  if (!template) {
    return c.json({ message: "Template not found" }, 404);
  }

  const body = await c.req.parseBody();
  const file = body.image as File;

  if (!file) {
    return c.json({ message: "Image is required" }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return c.json({ message: "Invalid file type" }, 400);
  }

  const ext = path.extname(file.name);
  const fileName = `${randomUUID()}${ext}`;

  const dir = path.join(process.cwd(), "src", "storage", "templates");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.promises.writeFile(filePath, buffer);

  template.image = fileName;
  await template.save();

  return c.json({
    message: "Image uploaded successfully",
    image: fileName,
  });
});

export default templates;
