const express = require("express");
const { uploadDocument } = require("../controllers/upload.controller");
const { protect } = require("../middlewares/auth.middleware");
const { uploadMultiple } = require("../middlewares/upload.middleware");

const router = express.Router();

// @route  POST /api/upload
// Middleware chain: protect (JWT) → uploadMultiple (Multer) → uploadDocument (Controller)
router.post("/", protect, uploadMultiple, uploadDocument);

module.exports = router;
