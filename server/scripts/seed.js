const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const User = require("../models/User")
const ParkingSlot = require("../models/ParkingSlot")
const Booking = require("../models/Booking")

// Load environment variables
dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected for seeding")
  } catch (error) {
    console.error("Database connection error:", error)
    process.exit(1)
  }
}

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({})

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: process.env.ADMIN_EMAIL || "admin@parking.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin",
      phone: "+1234567890",
      vehicleNumber: "ADMIN001",
    })

    // Create regular users
    const users = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "user123",
        role: "user",
        phone: "+1234567891",
        vehicleNumber: "ABC123",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "user123",
        role: "user",
        phone: "+1234567892",
        vehicleNumber: "XYZ789",
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        password: "user123",
        role: "user",
        phone: "+1234567893",
        vehicleNumber: "DEF456",
      },
    ]

    const userInstances = users.map((userData) => new User(userData))

    await adminUser.save()
    await User.insertMany(userInstances)

    console.log("Users seeded successfully")
    return { admin: adminUser, users: userInstances }
  } catch (error) {
    console.error("Error seeding users:", error)
    throw error
  }
}

const seedParkingSlots = async () => {
  try {
    // Clear existing slots
    await ParkingSlot.deleteMany({})

    const slots = []

    // Generate slots for 3 floors
    for (let floor = 0; floor <= 2; floor++) {
      const sections = ["A", "B", "C", "D"]

      for (const section of sections) {
        for (let i = 1; i <= 10; i++) {
          const slotNumber = `${section}${floor}${i.toString().padStart(2, "0")}`

          // Vary slot types
          let type = "regular"
          if (i <= 2) type = "compact"
          else if (i === 9) type = "disabled"
          else if (i === 10) type = "electric"
          else if (i >= 7) type = "large"

          // Vary prices based on floor and type
          let pricePerHour = 5 + floor * 2
          if (type === "electric") pricePerHour += 3
          else if (type === "large") pricePerHour += 1
          else if (type === "disabled") pricePerHour -= 1

          // Generate coordinates
          const x = sections.indexOf(section) * 100 + i * 8
          const y = floor * 50 + 20

          // Add some features
          const features = []
          if (floor === 0) features.push("covered")
          if (i <= 3) features.push("near_entrance")
          if (i === 5) features.push("near_elevator")
          if (Math.random() > 0.7) features.push("security_camera")
          if (type === "electric") features.push("ev_charging")

          slots.push({
            slotNumber,
            floor,
            section,
            type,
            pricePerHour,
            coordinates: { x, y },
            features,
            status: Math.random() > 0.8 ? "occupied" : "available", // 20% occupied
          })
        }
      }
    }

    await ParkingSlot.insertMany(slots)
    console.log(`${slots.length} parking slots seeded successfully`)
    return slots
  } catch (error) {
    console.error("Error seeding parking slots:", error)
    throw error
  }
}

const seedBookings = async (users, slots) => {
  try {
    await Booking.deleteMany({})

    const bookings = []

    // Bookings for occupied slots
    const occupiedSlots = slots.filter((slot) => slot.status === "occupied")
    for (let i = 0; i < Math.min(occupiedSlots.length, users.length); i++) {
      const user = users[i % users.length]
      const slot = occupiedSlots[i]

      if (!slot) continue // safety check

      const startTime = new Date()
      startTime.setHours(startTime.getHours() - Math.floor(Math.random() * 4) - 1)

      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 3) + 2)

      const duration = (endTime - startTime) / (1000 * 60 * 60)
      const totalAmount = duration * slot.pricePerHour

      bookings.push({
        user: user._id,
        parkingSlot: slot._id,
        vehicleNumber: user.vehicleNumber,
        startTime,
        endTime,
        totalAmount,
        status: "active",
        paymentStatus: "paid",
      })
    }

    // Bookings for completed slots
    const availableSlots = slots.filter((slot) => slot.status === "available")
    for (let i = 0; i < Math.min(5, users.length); i++) {
      const user = users[i % users.length]
      const availableSlot = availableSlots[i]

      if (!availableSlot) continue // skip if no slot

      const startTime = new Date()
      startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 7) - 1)

      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 4) + 1)

      const actualEndTime = new Date(endTime)
      actualEndTime.setMinutes(actualEndTime.getMinutes() + Math.floor(Math.random() * 30))

      const duration = (endTime - startTime) / (1000 * 60 * 60)
      const totalAmount = duration * availableSlot.pricePerHour

      bookings.push({
        user: user._id,
        parkingSlot: availableSlot._id,
        vehicleNumber: user.vehicleNumber,
        startTime,
        endTime,
        actualEndTime,
        totalAmount,
        status: "completed",
        paymentStatus: "paid",
      })
    }

    if (bookings.length > 0) {
      await Booking.insertMany(bookings)
      console.log(`${bookings.length} bookings seeded successfully`)
    }

    return bookings
  } catch (error) {
    console.error("Error seeding bookings:", error)
    throw error
  }
}


const seedDatabase = async () => {
  try {
    await connectDB()

    console.log("Starting database seeding...")

    const { admin, users } = await seedUsers()
    const slots = await seedParkingSlots()
    await seedBookings([admin, ...users], slots)

    console.log("Database seeding completed successfully!")
    console.log("\nLogin credentials:")
    console.log(`Admin: ${admin.email} / ${process.env.ADMIN_PASSWORD || "admin123"}`)
    console.log("Users: john@example.com, jane@example.com, mike@example.com / user123")

    process.exit(0)
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
