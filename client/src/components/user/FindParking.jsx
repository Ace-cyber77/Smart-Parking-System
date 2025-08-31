"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { API_ENDPOINTS } from "../../config/api"
import { Search, MapPin, Car, Zap, Shield } from "lucide-react"
import toast from "react-hot-toast"

const BookingModal = ({ isOpen, onClose, slot, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    startTime: "",
    endTime: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Set default start time to now
      const now = new Date()
      const startTime = new Date(now.getTime() + 30 * 60000) // 30 minutes from now
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60000) // 2 hours later

      setFormData({
        vehicleNumber: "",
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
      })
    }
  }, [isOpen])

  const calculateAmount = () => {
    if (!formData.startTime || !formData.endTime || !slot) return 0
    const start = new Date(formData.startTime)
    const end = new Date(formData.endTime)
    const hours = (end - start) / (1000 * 60 * 60)
    return Math.max(0, hours * slot.pricePerHour)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const bookingData = {
        parkingSlotId: slot._id,
        vehicleNumber: formData.vehicleNumber,
        startTime: formData.startTime,
        endTime: formData.endTime,
      }

      await axios.post(API_ENDPOINTS.BOOKINGS, bookingData)
      toast.success("Booking created successfully!")
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create booking")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Book Parking Slot</h3>

              {/* Slot Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{slot?.slotNumber}</h4>
                    <p className="text-sm text-gray-500">
                      Floor {slot?.floor}, Section {slot?.section}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{slot?.type} slot</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">${slot?.pricePerHour}/hour</p>
                  </div>
                </div>
                {slot?.features && slot.features.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {slot.features.map((feature) => (
                      <span key={feature} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {feature.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="input-field mt-1"
                    placeholder="Enter your vehicle number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="input-field mt-1"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="input-field mt-1"
                      min={formData.startTime}
                    />
                  </div>
                </div>

                {/* Amount Calculation */}
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                    <span className="text-lg font-bold text-primary-600">${calculateAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading || calculateAmount() <= 0}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? "Booking..." : `Book for $${calculateAmount().toFixed(2)}`}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const SlotCard = ({ slot, onBook }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case "electric":
        return <Zap className="w-4 h-4" />
      case "disabled":
        return <Shield className="w-4 h-4" />
      default:
        return <Car className="w-4 h-4" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "electric":
        return "text-green-600 bg-green-100"
      case "disabled":
        return "text-blue-600 bg-blue-100"
      case "large":
        return "text-purple-600 bg-purple-100"
      case "compact":
        return "text-orange-600 bg-orange-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{slot.slotNumber}</h3>
          <p className="text-sm text-gray-500">
            Floor {slot.floor}, Section {slot.section}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-primary-600">${slot.pricePerHour}</p>
          <p className="text-sm text-gray-500">per hour</p>
        </div>
      </div>

      <div className="flex items-center mb-3">
        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(slot.type)}`}
        >
          {getTypeIcon(slot.type)}
          <span className="ml-1 capitalize">{slot.type}</span>
        </div>
      </div>

      {slot.features && slot.features.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {slot.features.slice(0, 3).map((feature) => (
              <span key={feature} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {feature.replace("_", " ")}
              </span>
            ))}
            {slot.features.length > 3 && (
              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                +{slot.features.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <button onClick={() => onBook(slot)} className="w-full btn-primary">
        Book Now
      </button>
    </div>
  )
}

const FindParking = () => {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFloor, setFilterFloor] = useState("")
  const [filterType, setFilterType] = useState("")
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)

  useEffect(() => {
    fetchAvailableSlots()
  }, [])

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.SLOTS}?available=true`)
      setSlots(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch available slots")
    } finally {
      setLoading(false)
    }
  }

  const handleBookSlot = (slot) => {
    setSelectedSlot(slot)
    setBookingModalOpen(true)
  }

  const handleBookingSuccess = () => {
    fetchAvailableSlots() // Refresh the slots
  }

  const filteredSlots = slots.filter((slot) => {
    const matchesSearch =
      slot.slotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.section.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFloor = !filterFloor || slot.floor.toString() === filterFloor
    const matchesType = !filterType || slot.type === filterType
    return matchesSearch && matchesFloor && matchesType
  })

  const floors = [...new Set(slots.map((slot) => slot.floor))].sort((a, b) => a - b)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Parking</h1>
        <p className="text-gray-600">Browse available parking slots and make a reservation.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by slot number or section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} className="input-field">
          <option value="">All Floors</option>
          {floors.map((floor) => (
            <option key={floor} value={floor}>
              Floor {floor}
            </option>
          ))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field">
          <option value="">All Types</option>
          <option value="regular">Regular</option>
          <option value="compact">Compact</option>
          <option value="large">Large</option>
          <option value="disabled">Disabled</option>
          <option value="electric">Electric</option>
        </select>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {filteredSlots.length} of {slots.length} available parking slots
        </p>
      </div>

      {/* Slots Grid */}
      {filteredSlots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlots.map((slot) => (
            <SlotCard key={slot._id} slot={slot} onBook={handleBookSlot} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No parking slots available</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterFloor || filterType
              ? "Try adjusting your search filters."
              : "All parking slots are currently occupied."}
          </p>
        </div>
      )}

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        slot={selectedSlot}
        onSuccess={handleBookingSuccess}
      />
    </div>
  )
}

export default FindParking
