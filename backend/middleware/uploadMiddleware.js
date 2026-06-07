const path = require("path");
const multer = require("multer");

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".webm"]);
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    callback(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
    const error = new Error("Unsupported file type. Please upload JPG, PNG, WEBP, MP4, MOV, or WEBM.");
    error.statusCode = 400;
    error.publicMessage = error.message;
    callback(error);
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
});

function uploadMedia(req, res, next) {
  upload.single("media")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "Video file is too large. Please upload a video under 50MB.",
      });
      return;
    }

    res.status(error.statusCode || 400).json({
      success: false,
      message: error.publicMessage || error.message || "Upload failed. Please try again.",
    });
  });
}

module.exports = { uploadMedia };
