const mongoose = require("mongoose")

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: [true, "Slot number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, "Floor is required"],
      min: [0, "Floor cannot be negative"],
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["regular", "compact", "large", "disabled", "electric"],
      default: "regular",
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "maintenance"],
      default: "available",
    },
    pricePerHour: {
      type: Number,
      required: [true, "Price per hour is required"],
      min: [0, "Price cannot be negative"],
    },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    features: [
      {
        type: String,
        enum: ["covered", "security_camera", "ev_charging", "near_entrance", "near_elevator"],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
parkingSlotSchema.index({ floor: 1, section: 1 })
parkingSlotSchema.index({ status: 1 })
parkingSlotSchema.index({ type: 1 })

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema)
