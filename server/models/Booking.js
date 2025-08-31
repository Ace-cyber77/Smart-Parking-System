const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    parkingSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSlot",
      required: [true, "Parking slot is required"],
    },
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      uppercase: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    actualEndTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "expired"],
      default: "active",
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "digital_wallet", "online"],
      default: "online",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Validate that end time is after start time
bookingSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    next(new Error("End time must be after start time"))
  }
  next()
})

// Index for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 })
bookingSchema.index({ parkingSlot: 1, startTime: 1 })
bookingSchema.index({ status: 1 })

module.exports = mongoose.model("Booking", bookingSchema)
