/**
 * asyncHandler - Higher-order function to wrap async route handlers.
 * Catches any rejected promises or thrown errors and passes them to Express's
 * next(err) middleware, eliminating the need for try/catch in every controller.
 *
 * @param {Function} fn - The async controller function to wrap.
 * @returns {Function} Express middleware function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
