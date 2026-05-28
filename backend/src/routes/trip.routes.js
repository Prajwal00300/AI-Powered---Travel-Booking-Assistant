const express = require("express");
const {
  getAllTrips,
  getTripById,
  deleteTrip,
  getSharedTripById,
} = require("../controllers/trip.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// @route  GET  /api/trips/shared/:id
// @desc   Publicly accessible route to view shared trips
router.get("/shared/:id", getSharedTripById);

// All routes below are JWT-protected
router.use(protect);

// @route  GET  /api/trips
router.get("/", getAllTrips);

// @route  GET  /api/trips/:id
router.get("/:id", getTripById);

// @route  DELETE /api/trips/:id
router.delete("/:id", deleteTrip);

module.exports = router;
