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
      trim: true,
      default: null,
    },
    cloudinaryUrl: {
      type: String,
      default: null,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    documentType: {
      type: String,
      enum: ["PDF", "IMAGE", "MANUAL", "MULTIPLE"],
      required: [true, "Document type is required"],
    },
    fileReferences: [
      {
        originalFileName: String,
        cloudinaryUrl: String,
        cloudinaryPublicId: String,
        documentType: { type: String, enum: ["PDF", "IMAGE"] },
      }
    ],
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
