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


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});


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

const uploadMultiple = (req, res, next) => {
  const multerUpload = upload.array("documents", 5);

  multerUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new ApiError(413, `File too large. Maximum allowed size is 10MB per file.`)
        );
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
         return next(new ApiError(400, "Maximum of 5 documents allowed per upload."));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    }
    if (err) {
      return next(err);
    }

    if (!req.files || req.files.length === 0) {
      return next(new ApiError(400, "No files uploaded. Please provide at least one document."));
    }

    next();
  });
};

module.exports = { uploadSingle, uploadMultiple };
