"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { API_ENDPOINTS } from "../../config/api"
import { useSocket } from "../../contexts/SocketContext"
import { Car, Zap, Shield, RefreshCw } from "lucide-react"

const ParkingSlot = ({ slot, onSlotClick, isAdmin = false }) => {
  const getSlotColor = () => {
    switch (slot.status) {
      case "available":
        return "bg-green-500 hover:bg-green-600 border-green-600"
      case "occupied":
        return "bg-red-500 hover:bg-red-600 border-red-600"
      case "reserved":
        return "bg-yellow-500 hover:bg-yellow-600 border-yellow-600"
      case "maintenance":
        return "bg-gray-500 hover:bg-gray-600 border-gray-600"
      default:
        return "bg-gray-300 border-gray-400"
    }
  }

  const getSlotIcon = () => {
    switch (slot.type) {
      case "electric":
        return <Zap className="w-3 h-3 text-white" />
      case "disabled":
        return <Shield className="w-3 h-3 text-white" />
      default:
        return <Car className="w-3 h-3 text-white" />
    }
  }

  return (
    <div
      className={`
        relative w-16 h-12 rounded border-2 cursor-pointer transition-all duration-200 
        flex items-center justify-center text-white text-xs font-medium
        ${getSlotColor()}
        ${onSlotClick ? "hover:scale-105" : ""}
      `}
      onClick={() => onSlotClick && onSlotClick(slot)}
      title={`${slot.slotNumber} - ${slot.status} - $${slot.pricePerHour}/hr`}
      style={{
        position: "absolute",
        left: `${slot.coordinates.x}px`,
        top: `${slot.coordinates.y}px`,
      }}
    >
      <div className="flex flex-col items-center">
        {getSlotIcon()}
        <span className="text-xs mt-1">{slot.slotNumber}</span>
      </div>
    </div>
  )
}

const FloorSelector = ({ floors, selectedFloor, onFloorChange }) => (
  <div className="flex space-x-2 mb-4">
    {floors.map((floor) => (
      <button
        key={floor}
        onClick={() => onFloorChange(floor)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          selectedFloor === floor
            ? "bg-primary-600 text-white"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        Floor {floor}
      </button>
    ))}
  </div>
)

const Legend = () => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
    <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
        <span className="text-sm text-gray-700">Available</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
        <span className="text-sm text-gray-700">Occupied</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
        <span className="text-sm text-gray-700">Reserved</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
        <span className="text-sm text-gray-700">Maintenance</span>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          <Car className="w-4 h-4 mr-1" />
          <span>Regular</span>
        </div>
        <div className="flex items-center">
          <Zap className="w-4 h-4 mr-1" />
          <span>Electric</span>
        </div>
        <div className="flex items-center">
          <Shield className="w-4 h-4 mr-1" />
          <span>Disabled</span>
        </div>
      </div>
    </div>
  </div>
)

const ParkingMap = ({ onSlotClick, isAdmin = false }) => {
  const [slots, setSlots] = useState([])
  const [selectedFloor, setSelectedFloor] = useState(0)
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket()

  useEffect(() => {
    fetchSlots()
  }, [])

  useEffect(() => {
    if (socket) {
      // Listen for real-time slot updates
      socket.on("slotStatusChanged", (data) => {
        setSlots((prevSlots) =>
          prevSlots.map((slot) => (slot._id === data.slotId ? { ...slot, status: data.status } : slot)),
        )
      })

      socket.on("slotCreated", (newSlot) => {
        setSlots((prevSlots) => [...prevSlots, newSlot])
      })

      socket.on("slotUpdated", (updatedSlot) => {
        setSlots((prevSlots) => prevSlots.map((slot) => (slot._id === updatedSlot._id ? updatedSlot : slot)))
      })

      socket.on("slotDeleted", (data) => {
        setSlots((prevSlots) => prevSlots.filter((slot) => slot._id !== data.slotId))
      })

      return () => {
        socket.off("slotStatusChanged")
        socket.off("slotCreated")
        socket.off("slotUpdated")
        socket.off("slotDeleted")
      }
    }
  }, [socket])

  const fetchSlots = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SLOTS)
      setSlots(response.data.data)
    } catch (error) {
      console.error("Failed to fetch slots:", error)
    } finally {
      setLoading(false)
    }
  }

  const floors = [...new Set(slots.map((slot) => slot.floor))].sort((a, b) => a - b)
  const currentFloorSlots = slots.filter((slot) => slot.floor === selectedFloor)

  const stats = {
    total: currentFloorSlots.length,
    available: currentFloorSlots.filter((s) => s.status === "available").length,
    occupied: currentFloorSlots.filter((s) => s.status === "occupied").length,
    reserved: currentFloorSlots.filter((s) => s.status === "reserved").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Parking Map</h2>
          <p className="text-sm text-gray-600">Real-time parking slot availability</p>
        </div>
        <button
          onClick={fetchSlots}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <FloorSelector floors={floors} selectedFloor={selectedFloor} onFloorChange={setSelectedFloor} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Legend />

          {/* Floor Stats */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Floor {selectedFloor} Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="text-sm font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Available:</span>
                <span className="text-sm font-medium">{stats.available}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-600">Occupied:</span>
                <span className="text-sm font-medium">{stats.occupied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-yellow-600">Reserved:</span>
                <span className="text-sm font-medium">{stats.reserved}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6 min-h-96">
            <div className="relative" style={{ minHeight: "400px", position: "relative" }}>
              {currentFloorSlots.map((slot) => (
                <ParkingSlot key={slot._id} slot={slot} onSlotClick={onSlotClick} isAdmin={isAdmin} />
              ))}

              {currentFloorSlots.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Car className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No parking slots</h3>
                    <p className="mt-1 text-sm text-gray-500">No slots available on this floor.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParkingMap
