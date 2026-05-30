const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");


const protect = asyncHandler(async (req, res, next) => {
  let token;


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


  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired. Please log in again.");
    }
    throw new ApiError(401, "Invalid authentication token.");
  }


  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    throw new ApiError(401, "The user belonging to this token no longer exists.");
  }


  req.user = user;
  next();
});

module.exports = { protect };
