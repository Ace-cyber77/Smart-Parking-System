const express = require("express")
const { body } = require("express-validator")
const {
  getAllSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
  getSlotStatistics,
} = require("../controllers/slotController")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const slotValidation = [
  body("slotNumber").trim().isLength({ min: 1, max: 10 }).withMessage("Slot number must be 1-10 characters"),
  body("floor").isInt({ min: 0 }).withMessage("Floor must be a non-negative integer"),
  body("section").trim().isLength({ min: 1, max: 5 }).withMessage("Section must be 1-5 characters"),
  body("type").isIn(["regular", "compact", "large", "disabled", "electric"]).withMessage("Invalid slot type"),
  body("pricePerHour").isFloat({ min: 0 }).withMessage("Price per hour must be a positive number"),
  body("coordinates.x").isNumeric().withMessage("X coordinate must be a number"),
  body("coordinates.y").isNumeric().withMessage("Y coordinate must be a number"),
]

const updateSlotValidation = [
  body("slotNumber").optional().trim().isLength({ min: 1, max: 10 }).withMessage("Slot number must be 1-10 characters"),
  body("floor").optional().isInt({ min: 0 }).withMessage("Floor must be a non-negative integer"),
  body("section").optional().trim().isLength({ min: 1, max: 5 }).withMessage("Section must be 1-5 characters"),
  body("type")
    .optional()
    .isIn(["regular", "compact", "large", "disabled", "electric"])
    .withMessage("Invalid slot type"),
  body("pricePerHour").optional().isFloat({ min: 0 }).withMessage("Price per hour must be a positive number"),
  body("coordinates.x").optional().isNumeric().withMessage("X coordinate must be a number"),
  body("coordinates.y").optional().isNumeric().withMessage("Y coordinate must be a number"),
  body("status").optional().isIn(["available", "occupied", "reserved", "maintenance"]).withMessage("Invalid status"),
]

// Public routes (require authentication)
router.get("/", authenticateToken, getAllSlots)
router.get("/statistics", authenticateToken, requireAdmin, getSlotStatistics)
router.get("/:id", authenticateToken, getSlotById)

// Admin only routes
router.post("/", authenticateToken, requireAdmin, slotValidation, createSlot)
router.put("/:id", authenticateToken, requireAdmin, updateSlotValidation, updateSlot)
router.delete("/:id", authenticateToken, requireAdmin, deleteSlot)

module.exports = router
