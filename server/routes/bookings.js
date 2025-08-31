const express = require("express")
const { body } = require("express-validator")
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  completeBooking,
  getBookingStatistics,
} = require("../controllers/bookingController")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const bookingValidation = [
  body("parkingSlotId").isMongoId().withMessage("Invalid parking slot ID"),
  body("vehicleNumber").trim().isLength({ min: 2, max: 15 }).withMessage("Vehicle number must be 2-15 characters"),
  body("startTime").isISO8601().withMessage("Invalid start time format"),
  body("endTime").isISO8601().withMessage("Invalid end time format"),
]

// User routes
router.post("/", authenticateToken, bookingValidation, createBooking)
router.get("/my-bookings", authenticateToken, getUserBookings)
router.get("/:id", authenticateToken, getBookingById)
router.put("/:id/cancel", authenticateToken, cancelBooking)

// Admin routes
router.get("/", authenticateToken, requireAdmin, getAllBookings)
router.get("/statistics/overview", authenticateToken, requireAdmin, getBookingStatistics)
router.put("/:id/complete", authenticateToken, requireAdmin, completeBooking)

module.exports = router
