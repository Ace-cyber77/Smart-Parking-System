const Booking = require("../models/Booking")
const ParkingSlot = require("../models/ParkingSlot")
const User = require("../models/User")
const { validationResult } = require("express-validator")

// Create new booking
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { parkingSlotId, vehicleNumber, startTime, endTime } = req.body
    const userId = req.user._id

    // Check if parking slot exists and is available
    const parkingSlot = await ParkingSlot.findById(parkingSlotId)
    if (!parkingSlot) {
      return res.status(404).json({ message: "Parking slot not found" })
    }

    if (parkingSlot.status !== "available") {
      return res.status(400).json({ message: "Parking slot is not available" })
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      parkingSlot: parkingSlotId,
      status: "active",
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    })

    if (overlappingBooking) {
      return res.status(400).json({ message: "Slot is already booked for this time period" })
    }

    // Calculate total amount
    const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60) // hours
    const totalAmount = duration * parkingSlot.pricePerHour

    // Create booking
    const booking = new Booking({
      user: userId,
      parkingSlot: parkingSlotId,
      vehicleNumber: vehicleNumber.toUpperCase(),
      startTime,
      endTime,
      totalAmount,
    })

    await booking.save()

    // Update slot status to reserved
    await ParkingSlot.findByIdAndUpdate(parkingSlotId, { status: "reserved" })

    // Populate booking data
    await booking.populate([
      { path: "user", select: "name email phone" },
      { path: "parkingSlot", select: "slotNumber floor section type pricePerHour" },
    ])

    // Emit real-time updates
    req.io.emit("bookingCreated", booking)
    req.io.emit("slotStatusChanged", { slotId: parkingSlotId, status: "reserved" })

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    })
  } catch (error) {
    console.error("Create booking error:", error)
    res.status(500).json({ message: "Failed to create booking", error: error.message })
  }
}

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const userId = req.user._id

    const filter = { user: userId }
    if (status) filter.status = status

    const bookings = await Booking.find(filter)
      .populate("parkingSlot", "slotNumber floor section type pricePerHour")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Booking.countDocuments(filter)

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get user bookings error:", error)
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message })
  }
}

// Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, userId, slotId } = req.query

    const filter = {}
    if (status) filter.status = status
    if (userId) filter.user = userId
    if (slotId) filter.parkingSlot = slotId

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone vehicleNumber")
      .populate("parkingSlot", "slotNumber floor section type pricePerHour")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Booking.countDocuments(filter)

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get all bookings error:", error)
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message })
  }
}

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone vehicleNumber")
      .populate("parkingSlot", "slotNumber floor section type pricePerHour features")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user owns this booking or is admin
    if (req.user.role !== "admin" && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    console.error("Get booking error:", error)
    res.status(500).json({ message: "Failed to fetch booking", error: error.message })
  }
}

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user owns this booking or is admin
    if (req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (booking.status !== "active") {
      return res.status(400).json({ message: "Only active bookings can be cancelled" })
    }

    // Update booking status
    booking.status = "cancelled"
    await booking.save()

    // Update slot status back to available
    await ParkingSlot.findByIdAndUpdate(booking.parkingSlot, { status: "available" })

    // Populate booking data
    await booking.populate([
      { path: "user", select: "name email phone" },
      { path: "parkingSlot", select: "slotNumber floor section type" },
    ])

    // Emit real-time updates
    req.io.emit("bookingCancelled", booking)
    req.io.emit("slotStatusChanged", { slotId: booking.parkingSlot._id, status: "available" })

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    })
  } catch (error) {
    console.error("Cancel booking error:", error)
    res.status(500).json({ message: "Failed to cancel booking", error: error.message })
  }
}

// Complete booking (Admin only)
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status !== "active") {
      return res.status(400).json({ message: "Only active bookings can be completed" })
    }

    // Update booking
    booking.status = "completed"
    booking.actualEndTime = new Date()
    booking.paymentStatus = "paid"
    await booking.save()

    // Update slot status back to available
    await ParkingSlot.findByIdAndUpdate(booking.parkingSlot, { status: "available" })

    // Populate booking data
    await booking.populate([
      { path: "user", select: "name email phone" },
      { path: "parkingSlot", select: "slotNumber floor section type" },
    ])

    // Emit real-time updates
    req.io.emit("bookingCompleted", booking)
    req.io.emit("slotStatusChanged", { slotId: booking.parkingSlot._id, status: "available" })

    res.json({
      success: true,
      message: "Booking completed successfully",
      data: booking,
    })
  } catch (error) {
    console.error("Complete booking error:", error)
    res.status(500).json({ message: "Failed to complete booking", error: error.message })
  }
}

// Get booking statistics (Admin only)
const getBookingStatistics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments()
    const activeBookings = await Booking.countDocuments({ status: "active" })
    const completedBookings = await Booking.countDocuments({ status: "completed" })
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" })

    // Revenue calculation
    const revenueData = await Booking.aggregate([
      { $match: { status: "completed", paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ])

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0

    // Bookings by date (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const bookingsByDate = await Booking.aggregate([
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
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        totalRevenue,
        bookingsByDate,
      },
    })
  } catch (error) {
    console.error("Get booking statistics error:", error)
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message })
  }
}

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  completeBooking,
  getBookingStatistics,
}
