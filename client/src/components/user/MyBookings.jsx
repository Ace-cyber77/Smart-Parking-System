"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { API_ENDPOINTS } from "../../config/api"
import { Calendar, Clock, MapPin, Car, X } from "lucide-react"
import { format, isAfter, isBefore } from "date-fns"
import toast from "react-hot-toast"

const BookingCard = ({ booking, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const canCancel = () => {
    return booking.status === "active" && isAfter(new Date(booking.startTime), new Date())
  }

  const isOngoing = () => {
    const now = new Date()
    return (
      booking.status === "active" &&
      isAfter(now, new Date(booking.startTime)) &&
      isBefore(now, new Date(booking.endTime))
    )
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{booking.parkingSlot?.slotNumber}</h3>
          <p className="text-sm text-gray-500">
            Floor {booking.parkingSlot?.floor}, Section {booking.parkingSlot?.section}
          </p>
          <p className="text-sm text-gray-500 capitalize">{booking.parkingSlot?.type} slot</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(booking.status)}`}
          >
            {booking.status}
          </span>
          {isOngoing() && (
            <div className="mt-1">
              <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Ongoing</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Car className="w-4 h-4 mr-2" />
          <span>{booking.vehicleNumber}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span>${booking.parkingSlot?.pricePerHour}/hour</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Start: {format(new Date(booking.startTime), "MMM dd, yyyy HH:mm")}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>End: {format(new Date(booking.endTime), "MMM dd, yyyy HH:mm")}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-gray-900">${booking.totalAmount?.toFixed(2)}</span>
            <span className="text-sm text-gray-500 ml-1">
              ({booking.paymentStatus === "paid" ? "Paid" : "Pending"})
            </span>
          </div>
          {canCancel() && (
            <button
              onClick={() => onCancel(booking._id)}
              className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MY_BOOKINGS)
      setBookings(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return

    try {
      await axios.put(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/cancel`)
      toast.success("Booking cancelled successfully")
      fetchBookings() // Refresh bookings
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking")
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    return !filterStatus || booking.status === filterStatus
  })

  const stats = {
    total: bookings.length,
    active: bookings.filter((b) => b.status === "active").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your parking reservations and view booking history.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field">
          <option value="">All Bookings</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} onCancel={handleCancelBooking} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus ? `No ${filterStatus} bookings to display.` : "You haven't made any bookings yet."}
          </p>
        </div>
      )}
    </div>
  )
}

export default MyBookings
