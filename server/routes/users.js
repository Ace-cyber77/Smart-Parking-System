const express = require("express")
const { body } = require("express-validator")
const { getAllUsers, getUserById, updateUser, deleteUser, getUserStatistics } = require("../controllers/userController")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const updateUserValidation = [
  body("name").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("vehicleNumber").optional().isLength({ min: 2, max: 15 }).withMessage("Vehicle number must be 2-15 characters"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
]

// All routes require admin access
router.get("/", authenticateToken, requireAdmin, getAllUsers)
router.get("/statistics", authenticateToken, requireAdmin, getUserStatistics)
router.get("/:id", authenticateToken, requireAdmin, getUserById)
router.put("/:id", authenticateToken, requireAdmin, updateUserValidation, updateUser)
router.delete("/:id", authenticateToken, requireAdmin, deleteUser)

module.exports = router
