const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

/**
 * AuthService
 * Handles all authentication-related business logic.
 * No Express req/res objects — purely data in, data out.
 */
const AuthService = {
  /**
   * Registers a new user.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Object} Newly created user (without password) and JWT token.
   */
  registerUser: async (name, email, password) => {
    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "A user with this email already exists.");
    }

    // Create user — password hashing is handled by the pre-save hook in the model
    const user = await User.create({ name, email, password });

    // Generate JWT
    const token = AuthService._generateToken(user._id);

    // Return user data without password field
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return { user: userResponse, token };
  },

  /**
   * Logs in an existing user.
   * @param {string} email
   * @param {string} password
   * @returns {Object} User data and JWT token.
   */
  loginUser: async (email, password) => {
    // Explicitly select password (it has select: false in schema)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const token = AuthService._generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return { user: userResponse, token };
  },

  /**
   * Private helper: Generates a signed JWT token.
   * @param {string} userId - The MongoDB ObjectId of the user.
   * @returns {string} Signed JWT token.
   */
  _generateToken: (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  },
};

module.exports = AuthService;
