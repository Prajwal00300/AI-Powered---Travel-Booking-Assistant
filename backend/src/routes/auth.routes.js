const express = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// @route  POST /api/auth/register
router.post("/register", register);

// @route  POST /api/auth/login
router.post("/login", login);

// @route  GET /api/auth/me  (Protected)
router.get("/me", protect, getMe);

module.exports = router;
