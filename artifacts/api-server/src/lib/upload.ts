import multer from "multer";
import { getMaxUploadBytes, getUploadDir } from "./upload-storage.js";

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
  "video/x-matroska",
  "application/octet-stream",
]);

export const gameplayUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, getUploadDir());
    },
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
      cb(null, `${Date.now()}-${safe || "gameplay"}`);
    },
  }),
  limits: { fileSize: getMaxUploadBytes() },
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype.toLowerCase();
    const ext = file.originalname.toLowerCase();
    const looksLikeVideo =
      mime.startsWith("video/") ||
      ALLOWED_VIDEO_TYPES.has(mime) ||
      /\.(mp4|mov|avi|webm|mkv)$/i.test(ext);

    if (looksLikeVideo) {
      cb(null, true);
      return;
    }

    cb(new Error("Only video files are allowed (MP4, MOV, AVI, WEBM)"));
  },
});
