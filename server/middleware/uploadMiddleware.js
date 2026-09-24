const multer = require("multer");
const { MAX_UPLOAD_BYTES } = require("../config/upload");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
});

const optionalMessageUpload = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";

  if (!contentType.includes("multipart/form-data")) {
    return next();
  }

  upload.single("file")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      error.statusCode = 400;

      if (error.code === "LIMIT_FILE_SIZE") {
        error.message = `File is too large. Maximum size is ${Math.floor(
          MAX_UPLOAD_BYTES / (1024 * 1024)
        )}MB`;
      } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
        error.message = "Unexpected file field";
      } else {
        error.message = "File upload failed";
      }
    }

    return next(error);
  });
};

module.exports = {
  optionalMessageUpload,
};
