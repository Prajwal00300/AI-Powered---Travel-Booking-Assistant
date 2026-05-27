/**
 * Custom API Error class that extends the native Error.
 * Used to create structured, predictable errors throughout the application.
 * The global error handler will pick these up and format the response.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
