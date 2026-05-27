const Trip = require("../models/trip.model");
const ApiError = require("../utils/ApiError");

/**
 * TripService
 * Handles all database operations (CRUD) for the Trip collection.
 * No business logic here — only data access.
 */
const TripService = {
  /**
   * Creates a new trip document in MongoDB.
   * @param {Object} tripData - All trip fields.
   * @returns {Object} The newly created Trip document.
   */
  createTrip: async (tripData) => {
    const trip = await Trip.create(tripData);
    return trip;
  },

  /**
   * Retrieves all trips for a specific user.
   * @param {string} userId - The MongoDB ObjectId of the user.
   * @returns {Array} Array of Trip documents, sorted newest first.
   */
  getAllTrips: async (userId) => {
    const trips = await Trip.find({ userId })
      .sort({ createdAt: -1 })
      .select("-extractedRawText"); // Exclude large raw text from list view
    return trips;
  },

  /**
   * Retrieves a single trip by ID, verifying it belongs to the user.
   * @param {string} tripId - The MongoDB ObjectId of the trip.
   * @param {string} userId - The authenticated user's ID (for ownership check).
   * @returns {Object} The Trip document.
   */
  getTripById: async (tripId, userId) => {
    const trip = await Trip.findOne({ _id: tripId, userId });
    if (!trip) {
      throw new ApiError(
        404,
        "Trip not found or you are not authorized to view it."
      );
    }
    return trip;
  },

  /**
   * Deletes a trip by ID, verifying ownership.
   * @param {string} tripId - The MongoDB ObjectId of the trip.
   * @param {string} userId - The authenticated user's ID.
   * @returns {Object} The deleted Trip document (for Cloudinary cleanup).
   */
  deleteTrip: async (tripId, userId) => {
    const trip = await Trip.findOneAndDelete({ _id: tripId, userId });
    if (!trip) {
      throw new ApiError(
        404,
        "Trip not found or you are not authorized to delete it."
      );
    }
    return trip;
  },

  /**
   * Updates the processing status and data fields of a trip.
   * Used by WorkflowService to progressively update the trip as processing completes.
   * @param {string} tripId - The MongoDB ObjectId of the trip.
   * @param {Object} updates - Fields to update.
   * @returns {Object} Updated Trip document.
   */
  updateTrip: async (tripId, updates) => {
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!trip) {
      throw new ApiError(404, "Trip not found for update.");
    }
    return trip;
  },
};

module.exports = TripService;
