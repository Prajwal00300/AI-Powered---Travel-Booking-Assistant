const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true, // Index for faster per-user trip queries
    },
    originalFileName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
    },
    cloudinaryUrl: {
      type: String,
      required: [true, "Cloudinary URL is required"],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    documentType: {
      type: String,
      enum: ["PDF", "IMAGE"],
      required: [true, "Document type is required"],
    },
    extractedRawText: {
      type: String,
      default: null,
    },
    extractedStructuredData: {
      type: mongoose.Schema.Types.Mixed, // Flexible schema for AI-parsed JSON
      default: null,
    },
    generatedItinerary: {
      type: String,
      default: null,
    },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processingError: {
      type: String,
      default: null,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
