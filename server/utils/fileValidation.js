const path = require("path");
const {
  IMAGE_MIME_TYPES,
  FILE_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_UPLOAD_BYTES,
} = require("../config/upload");

const throwValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

const getExtension = (filename) =>
  path.extname(String(filename || "")).toLowerCase();

const sanitizeOriginalName = (filename) => {
  const base = path
    .basename(String(filename || "file"))
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"/\\|?*]/g, "_")
    .trim();

  const cleaned = base.replace(/^\.+/, "") || "file";
  return cleaned.slice(0, 180);
};

const looksLikeText = (buffer) => {
  const sample = buffer.subarray(0, Math.min(buffer.length, 4096));

  if (sample.includes(0x00)) {
    return false;
  }

  let suspicious = 0;

  for (let i = 0; i < sample.length; i += 1) {
    const byte = sample[i];

    if (byte === 0x09 || byte === 0x0a || byte === 0x0d) {
      continue;
    }

    if (byte < 0x20 || byte === 0x7f) {
      suspicious += 1;
    }
  }

  return suspicious / Math.max(sample.length, 1) < 0.05;
};

const isZipMagic = (buffer) =>
  buffer.length >= 4 &&
  buffer[0] === 0x50 &&
  buffer[1] === 0x4b &&
  (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
  (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08);

const detectFileFromBuffer = (buffer, originalName) => {
  if (!buffer || buffer.length === 0) {
    throwValidationError("Uploaded file is empty");
  }

  const declaredExt = getExtension(originalName);

  if (declaredExt && !ALLOWED_EXTENSIONS.has(declaredExt)) {
    throwValidationError("This file type is not allowed");
  }

  let detected = null;

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    detected = { mimeType: "image/jpeg", extension: ".jpg", messageType: "image" };
  } else if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    detected = { mimeType: "image/png", extension: ".png", messageType: "image" };
  } else if (
    buffer.length >= 6 &&
    (buffer.toString("ascii", 0, 6) === "GIF87a" ||
      buffer.toString("ascii", 0, 6) === "GIF89a")
  ) {
    detected = { mimeType: "image/gif", extension: ".gif", messageType: "image" };
  } else if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    detected = { mimeType: "image/webp", extension: ".webp", messageType: "image" };
  } else if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "%PDF") {
    detected = {
      mimeType: "application/pdf",
      extension: ".pdf",
      messageType: "file",
    };
  } else if (isZipMagic(buffer)) {
    if (declaredExt === ".docx") {
      detected = {
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        extension: ".docx",
        messageType: "file",
      };
    } else if (declaredExt === ".xlsx") {
      detected = {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        extension: ".xlsx",
        messageType: "file",
      };
    } else if (declaredExt === ".zip" || !declaredExt) {
      detected = {
        mimeType: "application/zip",
        extension: ".zip",
        messageType: "file",
      };
    }
  } else if (
    (declaredExt === ".txt" || declaredExt === ".csv") &&
    looksLikeText(buffer)
  ) {
    detected = {
      mimeType: declaredExt === ".csv" ? "text/csv" : "text/plain",
      extension: declaredExt,
      messageType: "file",
    };
  }

  if (!detected) {
    throwValidationError("This file type is not allowed");
  }

  if (
    declaredExt &&
    declaredExt !== detected.extension &&
    !(declaredExt === ".jpeg" && detected.extension === ".jpg")
  ) {
    throwValidationError("File content does not match the file extension");
  }

  const allowedMimes = { ...IMAGE_MIME_TYPES, ...FILE_MIME_TYPES };

  if (!allowedMimes[detected.mimeType]) {
    throwValidationError("This file type is not allowed");
  }

  return detected;
};

const validateUploadSize = (size) => {
  if (!Number.isFinite(size) || size <= 0) {
    throwValidationError("Uploaded file is empty");
  }

  if (size > MAX_UPLOAD_BYTES) {
    throwValidationError(
      `File is too large. Maximum size is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))}MB`
    );
  }
};

module.exports = {
  sanitizeOriginalName,
  detectFileFromBuffer,
  validateUploadSize,
  getExtension,
};
