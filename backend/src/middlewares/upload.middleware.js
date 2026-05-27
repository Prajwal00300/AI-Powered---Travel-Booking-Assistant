const multer = require("multer");
const ApiError = require("../utils/ApiError");

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * File filter function for Multer.
 * Rejects files with unsupported MIME types before they even hit the storage engine.
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new ApiError(
        415,
        `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, GIF, PDF.`
      ),
      false
    );
  }
};

/**
 * Multer instance using memoryStorage.
 * Files are stored in memory as Buffer objects (no temp disk files).
 * This integrates cleanly with the stream-based Cloudinary upload in UploadService.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

/**
 * Middleware to handle a single file upload under the field name "document".
 * Wraps multer errors into our standardized ApiError format.
 */
const uploadSingle = (req, res, next) => {
  const multerUpload = upload.single("document");

  multerUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new ApiError(413, `File too large. Maximum allowed size is 10MB.`)
        );
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    }
    if (err) {
      return next(err);
    }

    // Ensure a file was actually provided
    if (!req.file) {
      return next(new ApiError(400, "No file uploaded. Please provide a document."));
    }

    next();
  });
};

module.exports = { uploadSingle };
