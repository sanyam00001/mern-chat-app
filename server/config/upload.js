const path = require("path");

const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const parsedMaxBytes = Number(process.env.MAX_UPLOAD_BYTES);
const MAX_UPLOAD_BYTES =
  Number.isFinite(parsedMaxBytes) && parsedMaxBytes > 0
    ? parsedMaxBytes
    : DEFAULT_MAX_UPLOAD_BYTES;

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, "..", "uploads");

const IMAGE_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const FILE_MIME_TYPES = {
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "application/zip": ".zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
};

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".txt",
  ".csv",
  ".zip",
  ".docx",
  ".xlsx",
]);

module.exports = {
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
  IMAGE_MIME_TYPES,
  FILE_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
