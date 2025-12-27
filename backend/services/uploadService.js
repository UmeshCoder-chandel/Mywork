import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memoryStorage so we can upload buffers to Cloudinary (or other remote storage)
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype && (file.mimetype.startsWith("image") || file.mimetype.startsWith("video"))) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
  },
});

// kept for backward compatibility if some paths still use local path
export const buildFileUrl = (filename) => `/uploads/${filename}`;

