const express = require("express")
const { body } = require("express-validator")
const { register, login, getProfile, updateProfile, changePassword } = require("../controllers/authController")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("vehicleNumber").optional().isLength({ min: 2, max: 15 }).withMessage("Vehicle number must be 2-15 characters"),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
]

const updateProfileValidation = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("vehicleNumber").optional().isLength({ min: 2, max: 15 }).withMessage("Vehicle number must be 2-15 characters"),
]

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
]

// Public routes
router.post("/register", registerValidation, register)
router.post("/login", loginValidation, login)

// Protected routes
router.get("/profile", authenticateToken, getProfile)
router.put("/profile", authenticateToken, updateProfileValidation, updateProfile)
router.put("/change-password", authenticateToken, changePasswordValidation, changePassword)

module.exports = router
