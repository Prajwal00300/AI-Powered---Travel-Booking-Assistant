const AuthService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");



/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Basic input validation
  if (!name || !email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Name, email, and password are required."));
  }

  const { user, token } = await AuthService.registerUser(name, email, password);

  res
    .status(201)
    .json(new ApiResponse(201, { user, token }, "Registration successful."));
});

/**
 * @route   
 * @desc    
 * @access  
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Email and password are required."));
  }

  const { user, token } = await AuthService.loginUser(email, password);

  res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "Login successful."));
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user's profile
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware
  res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, "User profile fetched."));
});

module.exports = { register, login, getMe };
