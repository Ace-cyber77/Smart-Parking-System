const User = require("../models/User")
const Booking = require("../models/Booking")
const { validationResult } = require("express-validator")

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10, search } = req.query

    const filter = {}
    if (role) filter.role = role
    if (isActive !== undefined) filter.isActive = isActive === "true"

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } },
      ]
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(filter)

    res.json({
      success: true,
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Failed to fetch users", error: error.message })
  }
}

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get user's booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ])

    const totalBookings = await Booking.countDocuments({ user: user._id })

    res.json({
      success: true,
      data: {
        user,
        bookingStats: {
          total: totalBookings,
          byStatus: bookingStats,
        },
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Failed to fetch user", error: error.message })
  }
}

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { name, email, phone, vehicleNumber, role, isActive } = req.body

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      })
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" })
      }
    }

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber
    if (role) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ message: "Failed to update user", error: error.message })
  }
}

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    // Check if user has active bookings
    const activeBookings = await Booking.find({
      user: req.params.id,
      status: "active",
    })

    if (activeBookings.length > 0) {
      return res.status(400).json({
        message: "Cannot delete user with active bookings",
        activeBookings: activeBookings.length,
      })
    }

    // Soft delete - deactivate user instead of removing
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ message: "Failed to delete user", error: error.message })
  }
}

// Get user statistics (Admin only)
const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const adminUsers = await User.countDocuments({ role: "admin" })
    const regularUsers = await User.countDocuments({ role: "user" })

    // Users registered in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // User registration by date (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const usersByDate = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admins: adminUsers,
        regular: regularUsers,
        newUsersLast30Days: newUsers,
        registrationsByDate: usersByDate,
      },
    })
  } catch (error) {
    console.error("Get user statistics error:", error)
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message })
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStatistics,
}
