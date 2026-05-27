const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * protect - JWT Authentication Middleware
 *
 * Verifies the JWT from the Authorization header.
 * Attaches the authenticated user to req.user for downstream handlers.
 * Throws ApiError(401) for missing, invalid, or expired tokens.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from "Authorization: Bearer <token>" header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(
      401,
      "Access denied. No authentication token provided."
    );
  }

  // Verify token signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired. Please log in again.");
    }
    throw new ApiError(401, "Invalid authentication token.");
  }

  // Fetch the user from DB to ensure they still exist
  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    throw new ApiError(401, "The user belonging to this token no longer exists.");
  }

  // Attach user to request object
  req.user = user;
  next();
});

module.exports = { protect };
