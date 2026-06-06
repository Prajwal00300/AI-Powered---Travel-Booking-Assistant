const express = require("express");
const { uploadDocument } = require("../controllers/upload.controller");
const { protect } = require("../middlewares/auth.middleware");
const { uploadSingle } = require("../middlewares/upload.middleware");

const router = express.Router();


router.post("/", protect, uploadSingle, uploadDocument);

module.exports = router;
