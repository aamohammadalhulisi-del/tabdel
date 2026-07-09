import { Router, type IRouter } from "express";
import path from "path";
import fs from "fs";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

const UPLOADS_DIR = "/tmp/tabdeel-uploads";
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed image MIME types and their corresponding extensions
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

// Detect MIME from base64 data-URI prefix
function detectMimeFromDataUri(base64: string): string | null {
  const match = base64.match(/^data:([a-zA-Z0-9+/]+\/[a-zA-Z0-9+/]+);base64,/);
  return match ? match[1] : null;
}

// Verify first bytes match the expected magic numbers
function validateImageBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  if (mimeType === "image/gif") {
    return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
  }
  if (mimeType === "image/webp") {
    return buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  }
  return false;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

router.post("/upload", requireAuth, async (req, res): Promise<void> => {
  const { base64 } = req.body;
  if (!base64 || typeof base64 !== "string") {
    res.status(400).json({ error: "No image data provided" });
    return;
  }

  // Detect MIME from data-URI prefix; fall back to JPEG
  const mimeType = detectMimeFromDataUri(base64) || "image/jpeg";

  if (!ALLOWED_TYPES[mimeType]) {
    res.status(400).json({ error: "Unsupported image type. Allowed: JPEG, PNG, GIF, WEBP" });
    return;
  }

  const rawData = base64.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(rawData, "base64");

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    res.status(400).json({ error: "Image exceeds maximum allowed size of 5 MB" });
    return;
  }

  if (!validateImageBytes(buffer, mimeType)) {
    res.status(400).json({ error: "File content does not match declared image type" });
    return;
  }

  const ext = ALLOWED_TYPES[mimeType];
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(UPLOADS_DIR, name);

  fs.writeFileSync(filePath, buffer);

  res.json({ url: `/api/uploads/${name}` });
});

// Serve uploaded files with proper content-type, no path traversal
router.get("/uploads/:filename", (req, res): void => {
  const raw = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;

  // Reject path traversal attempts
  if (raw.includes("..") || raw.includes("/") || raw.includes("\\")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  const filePath = path.join(UPLOADS_DIR, raw);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  const ext = path.extname(raw).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  const contentType = mimeMap[ext] || "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.sendFile(filePath);
});

export default router;
