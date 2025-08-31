const ParkingSlot = require("../models/ParkingSlot")
const Booking = require("../models/Booking")
const { validationResult } = require("express-validator")

// Get all parking slots with optional filters
const getAllSlots = async (req, res) => {
  try {
    const { floor, section, type, status, available } = req.query
    const filter = { isActive: true }

    // Apply filters
    if (floor) filter.floor = Number.parseInt(floor)
    if (section) filter.section = section.toUpperCase()
    if (type) filter.type = type
    if (status) filter.status = status

    let slots = await ParkingSlot.find(filter).sort({ floor: 1, section: 1, slotNumber: 1 })

    // Filter for available slots only
    if (available === "true") {
      slots = slots.filter((slot) => slot.status === "available")
    }

    res.json({
      success: true,
      count: slots.length,
      data: slots,
    })
  } catch (error) {
    console.error("Get slots error:", error)
    res.status(500).json({ message: "Failed to fetch parking slots", error: error.message })
  }
}

// Get single parking slot
const getSlotById = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id)

    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" })
    }

    res.json({
      success: true,
      data: slot,
    })
  } catch (error) {
    console.error("Get slot error:", error)
    res.status(500).json({ message: "Failed to fetch parking slot", error: error.message })
  }
}

// Create new parking slot (Admin only)
const createSlot = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { slotNumber, floor, section, type, pricePerHour, coordinates, features } = req.body

    // Check if slot number already exists
    const existingSlot = await ParkingSlot.findOne({ slotNumber: slotNumber.toUpperCase() })
    if (existingSlot) {
      return res.status(400).json({ message: "Slot number already exists" })
    }

    const slot = new ParkingSlot({
      slotNumber: slotNumber.toUpperCase(),
      floor,
      section: section.toUpperCase(),
      type,
      pricePerHour,
      coordinates,
      features: features || [],
    })

    await slot.save()

    // Emit real-time update
    req.io.emit("slotCreated", slot)

    res.status(201).json({
      success: true,
      message: "Parking slot created successfully",
      data: slot,
    })
  } catch (error) {
    console.error("Create slot error:", error)
    res.status(500).json({ message: "Failed to create parking slot", error: error.message })
  }
}

// Update parking slot (Admin only)
const updateSlot = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { slotNumber, floor, section, type, pricePerHour, coordinates, features, status } = req.body

    // Check if new slot number conflicts with existing slots
    if (slotNumber) {
      const existingSlot = await ParkingSlot.findOne({
        slotNumber: slotNumber.toUpperCase(),
        _id: { $ne: req.params.id },
      })
      if (existingSlot) {
        return res.status(400).json({ message: "Slot number already exists" })
      }
    }

    const updateData = {}
    if (slotNumber) updateData.slotNumber = slotNumber.toUpperCase()
    if (floor !== undefined) updateData.floor = floor
    if (section) updateData.section = section.toUpperCase()
    if (type) updateData.type = type
    if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour
    if (coordinates) updateData.coordinates = coordinates
    if (features) updateData.features = features
    if (status) updateData.status = status

    const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" })
    }

    // Emit real-time update
    req.io.emit("slotUpdated", slot)

    res.json({
      success: true,
      message: "Parking slot updated successfully",
      data: slot,
    })
  } catch (error) {
    console.error("Update slot error:", error)
    res.status(500).json({ message: "Failed to update parking slot", error: error.message })
  }
}

// Delete parking slot (Admin only)
const deleteSlot = async (req, res) => {
  try {
    // Check if slot has active bookings
    const activeBookings = await Booking.find({
      parkingSlot: req.params.id,
      status: "active",
    })

    if (activeBookings.length > 0) {
      return res.status(400).json({
        message: "Cannot delete slot with active bookings",
        activeBookings: activeBookings.length,
      })
    }

    const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" })
    }

    // Emit real-time update
    req.io.emit("slotDeleted", { slotId: req.params.id })

    res.json({
      success: true,
      message: "Parking slot deleted successfully",
    })
  } catch (error) {
    console.error("Delete slot error:", error)
    res.status(500).json({ message: "Failed to delete parking slot", error: error.message })
  }
}

// Get parking statistics (Admin only)
const getSlotStatistics = async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments({ isActive: true })
    const availableSlots = await ParkingSlot.countDocuments({ status: "available", isActive: true })
    const occupiedSlots = await ParkingSlot.countDocuments({ status: "occupied", isActive: true })
    const reservedSlots = await ParkingSlot.countDocuments({ status: "reserved", isActive: true })
    const maintenanceSlots = await ParkingSlot.countDocuments({ status: "maintenance", isActive: true })

    // Get slots by floor
    const slotsByFloor = await ParkingSlot.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$floor", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    // Get slots by type
    const slotsByType = await ParkingSlot.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ])

    res.json({
      success: true,
      data: {
        total: totalSlots,
        available: availableSlots,
        occupied: occupiedSlots,
        reserved: reservedSlots,
        maintenance: maintenanceSlots,
        occupancyRate: totalSlots > 0 ? (((occupiedSlots + reservedSlots) / totalSlots) * 100).toFixed(1) : 0,
        byFloor: slotsByFloor,
        byType: slotsByType,
      },
    })
  } catch (error) {
    console.error("Get statistics error:", error)
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message })
  }
}

module.exports = {
  getAllSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
  getSlotStatistics,
}
