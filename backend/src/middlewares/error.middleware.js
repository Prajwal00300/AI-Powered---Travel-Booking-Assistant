const ApiError = require("../utils/ApiError");


const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];


  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }


  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed. Please check the provided data.";
  }

  if (err.code && err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  // --- JWT errors ---
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired. Please log in again.";
  }


  if (process.env.NODE_ENV === "development") {
    console.error(`❌ [Error] ${statusCode}: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};


const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
