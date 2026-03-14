import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import express from "express";
import { WebSocketServer } from "ws";
import { convertDesign } from "./aiService";
import archiver from "archiver";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const OUTPUT_DIR = path.join(process.cwd(), "output");

const upload = multer({ 
  dest: UPLOADS_DIR,
  limits: { fileSize: 20 * 1024 * 1024 }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Ensure directories exist
  await fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(() => {});
  await fs.mkdir(OUTPUT_DIR, { recursive: true }).catch(() => {});

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  
  const broadcastStatus = (message: string) => {
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify({ type: "status", payload: { message } }));
      }
    });
  };

  const broadcastReady = (uuid: string) => {
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "preview_ready", payload: { uuid } }));
      }
    });
  };

  app.use('/uploads', express.static(UPLOADS_DIR));
  
  // Preview route to serve generated files
  app.get('/preview/:id', async (req, res) => {
    const id = req.params.id;
    const projectDir = path.join(OUTPUT_DIR, id);
    try {
      const htmlPath = path.join(projectDir, "index.html");
      const html = await fs.readFile(htmlPath, "utf-8");
      res.send(html);
    } catch (e) {
      res.status(404).send("Preview not found or not ready yet.");
    }
  });
  
  app.use('/preview-assets/:id', (req, res, next) => {
    const id = req.params.id;
    express.static(path.join(OUTPUT_DIR, id))(req, res, next);
  });

  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  });

  app.delete(api.projects.delete.path, async (req, res) => {
    await storage.deleteProject(req.params.id);
    res.status(204).send();
  });

  app.post(api.upload.create.path, upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const id = uuidv4();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const SUPPORTED_FORMATS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

    if (!SUPPORTED_FORMATS.includes(ext)) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        message: `Unsupported file format "${ext}". Please upload a PNG, JPG, GIF, or WebP image.`
      });
    }

    const newPath = path.join(UPLOADS_DIR, `${id}${ext}`);
    
    await fs.rename(req.file.path, newPath);
    
    const url = `/uploads/${id}${ext}`;
    
    const project = await storage.createProject({
      id,
      filename: req.file.originalname,
      originalImageUrl: url,
      html: null,
      css: null,
      js: null,
      description: null,
      components: null,
      createdAt: new Date(),
    });

    res.status(201).json({ id, filename: req.file.originalname, url });
  });

  app.post(api.convert.create.path, async (req, res) => {
    try {
      const input = api.convert.create.input.parse(req.body);
      const project = await storage.getProject(input.id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      broadcastStatus("Uploading to AI...");
      
      const imagePath = path.join(UPLOADS_DIR, path.basename(project.originalImageUrl));
      const ext = path.extname(imagePath).slice(1).toLowerCase();
      const SUPPORTED_FORMATS = ["png", "jpg", "jpeg", "gif", "webp"];

      if (!SUPPORTED_FORMATS.includes(ext)) {
        return res.status(400).json({
          message: `Unsupported file format ".${ext}". Please upload a PNG, JPG, GIF, or WebP image.`
        });
      }

      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

      broadcastStatus("Analyzing design...");

      const result = await convertDesign({
        imageBase64: base64Image,
        mimeType,
        provider: input.provider,
        apiKey: input.apiKey,
        model: input.model,
        baseUrl: input.baseUrl
      });

      broadcastStatus("Generating HTML...");

      // Save output files
      const projectOutDir = path.join(OUTPUT_DIR, input.id);
      await fs.mkdir(projectOutDir, { recursive: true });
      
      let finalHtml = result.html;
      // Ensure we have a basic HTML structure if AI only returned a snippet
      if (!finalHtml.toLowerCase().includes('<html')) {
        finalHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Generated Design</title></head><body>${finalHtml}</body></html>`;
      }

      if (!finalHtml.includes('styles.css') && result.css) {
         finalHtml = finalHtml.replace('</head>', `<link rel="stylesheet" href="./styles.css"></head>`);
      }
      if (!finalHtml.includes('script.js') && result.js) {
         finalHtml = finalHtml.replace('</body>', `<script src="./script.js"></script></body>`);
      }
      
      await fs.writeFile(path.join(projectOutDir, "index.html"), finalHtml);
      await fs.writeFile(path.join(projectOutDir, "styles.css"), result.css || "");
      await fs.writeFile(path.join(projectOutDir, "script.js"), result.js || "");

      const updated = await storage.updateProject(input.id, {
        html: finalHtml,
        css: result.css,
        js: result.js,
        description: result.description,
        components: result.components
      });

      broadcastReady(input.id);

      res.json(result);
    } catch (e: any) {
      console.error(e);
      res.status(400).json({ message: e.message || "Error converting design" });
    }
  });
  
  app.post(api.chat.create.path, async (req, res) => {
    // Basic stub for chat
    res.json({ message: "Chat AI integration not fully implemented in stub." });
  });

  app.get('/api/export/:id', async (req, res) => {
    const id = req.params.id;
    const projectDir = path.join(OUTPUT_DIR, id);
    
    try {
      const stat = await fs.stat(projectDir);
      if (!stat.isDirectory()) throw new Error();
    } catch (e) {
      return res.status(404).send("Export not found");
    }

    res.attachment(`${id}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(projectDir, false);
    archive.finalize();
  });

  return httpServer;
}
