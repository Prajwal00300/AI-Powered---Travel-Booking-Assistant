const Trip = require("../models/trip.model");
const ApiError = require("../utils/ApiError");


const TripService = {
  /**
   * @param {Object} tripData 
   * @returns {Object} 
   */
  createTrip: async (tripData) => {
    const trip = await Trip.create(tripData);
    return trip;
  },

  /**
   * @param {string} userId 
   * @returns {Array}
   */
  getAllTrips: async (userId) => {
    const trips = await Trip.find({ userId })
      .sort({ createdAt: -1 })
      .select("-extractedRawText");
    return trips;
  },

  /**
  
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

  /**
   * Retrieves a shared trip by ID (unprotected).
   * @param {string} tripId - The MongoDB ObjectId of the trip.
   * @returns {Object} The Trip document.
   */
  getSharedTripById: async (tripId) => {
    const trip = await Trip.findOne({ _id: tripId })
      // Exclude userId to protect privacy in public links
      .select("-userId");

    if (!trip) {
      throw new ApiError(
        404,
        "This trip does not exist."
      );
    }
    return trip;
  },
};

module.exports = TripService;
