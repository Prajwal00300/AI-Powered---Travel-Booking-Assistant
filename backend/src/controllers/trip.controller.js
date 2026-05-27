const TripService = require("../services/trip.service");
const UploadService = require("../services/upload.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

/**
 * TripController
 * Handles HTTP for all trip-related CRUD operations.
 * Delegates data access to TripService and cleanup to UploadService.
 */

/**
 * @route   GET /api/trips
 * @desc    Get all trips for the authenticated user
 * @access  Protected
 */
const getAllTrips = asyncHandler(async (req, res) => {
  const trips = await TripService.getAllTrips(req.user._id);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: trips.length, trips },
        "Trips fetched successfully."
      )
    );
});

/**
 * @route   GET /api/trips/:id
 * @desc    Get a single trip by ID (must belong to the authenticated user)
 * @access  Protected
 */
const getTripById = asyncHandler(async (req, res) => {
  const trip = await TripService.getTripById(req.params.id, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, { trip }, "Trip fetched successfully."));
});

/**
 * @route   DELETE /api/trips/:id
 * @desc    Delete a trip and remove its file from Cloudinary
 * @access  Protected
 */
const deleteTrip = asyncHandler(async (req, res) => {
  // Get and delete the trip record (ownership is verified inside TripService)
  const deletedTrip = await TripService.deleteTrip(req.params.id, req.user._id);

  // Clean up the file from Cloudinary asynchronously
  const resourceType = deletedTrip.documentType === "PDF" ? "raw" : "image";
  await UploadService.deleteFromCloudinary(
    deletedTrip.cloudinaryPublicId,
    resourceType
  );

  res
    .status(200)
    .json(new ApiResponse(200, null, "Trip deleted successfully."));
});

module.exports = { getAllTrips, getTripById, deleteTrip };
