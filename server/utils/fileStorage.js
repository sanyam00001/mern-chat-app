const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { UPLOAD_DIR } = require("../config/upload");

const assertSafeStorageKey = (storageKey) => {
  if (typeof storageKey !== "string" || !storageKey) {
    const error = new Error("Invalid storage key");
    error.statusCode = 400;
    throw error;
  }

  const parts = storageKey.split("/").filter(Boolean);

  if (
    parts.length !== 2 ||
    parts.some((part) => part.includes("..") || part.includes("\\"))
  ) {
    const error = new Error("Invalid storage key");
    error.statusCode = 400;
    throw error;
  }

  return parts;
};

const getAbsoluteStoragePath = (storageKey) => {
  const parts = assertSafeStorageKey(storageKey);
  const uploadRoot = path.resolve(UPLOAD_DIR);
  const absolutePath = path.resolve(uploadRoot, ...parts);
  const relative = path.relative(uploadRoot, absolutePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    const error = new Error("Invalid storage key");
    error.statusCode = 400;
    throw error;
  }

  return absolutePath;
};

const saveUploadBuffer = async (buffer, conversationId, extension) => {
  const folder = conversationId.toString();
  const filename = `${crypto.randomUUID()}${extension}`;
  const storageKey = `${folder}/${filename}`;
  const absolutePath = getAbsoluteStoragePath(storageKey);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  return storageKey;
};

const deleteStoredFile = async (storageKey) => {
  if (!storageKey) {
    return;
  }

  try {
    await fs.unlink(getAbsoluteStoragePath(storageKey));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const fileExists = async (storageKey) => {
  try {
    await fs.access(getAbsoluteStoragePath(storageKey));
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  getAbsoluteStoragePath,
  saveUploadBuffer,
  deleteStoredFile,
  fileExists,
};
