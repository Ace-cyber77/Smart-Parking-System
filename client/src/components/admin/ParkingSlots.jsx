"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { API_ENDPOINTS } from "../../config/api"
import { Plus, Edit, Trash2, Search, MapPin } from "lucide-react"
import toast from "react-hot-toast"

const SlotModal = ({ isOpen, onClose, slot, onSave }) => {
  const [formData, setFormData] = useState({
    slotNumber: "",
    floor: 0,
    section: "",
    type: "regular",
    pricePerHour: 5,
    coordinates: { x: 0, y: 0 },
    features: [],
    status: "available",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (slot) {
      setFormData({
        slotNumber: slot.slotNumber || "",
        floor: slot.floor || 0,
        section: slot.section || "",
        type: slot.type || "regular",
        pricePerHour: slot.pricePerHour || 5,
        coordinates: slot.coordinates || { x: 0, y: 0 },
        features: slot.features || [],
        status: slot.status || "available",
      })
    } else {
      setFormData({
        slotNumber: "",
        floor: 0,
        section: "",
        type: "regular",
        pricePerHour: 5,
        coordinates: { x: 0, y: 0 },
        features: [],
        status: "available",
      })
    }
  }, [slot, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (slot) {
        await axios.put(`${API_ENDPOINTS.SLOTS}/${slot._id}`, formData)
        toast.success("Slot updated successfully")
      } else {
        await axios.post(API_ENDPOINTS.SLOTS, formData)
        toast.success("Slot created successfully")
      }
      onSave()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {slot ? "Edit Parking Slot" : "Create New Parking Slot"}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slot Number</label>
                  <input
                    type="text"
                    required
                    value={formData.slotNumber}
                    onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
                    className="input-field mt-1"
                    placeholder="A101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Floor</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number.parseInt(e.target.value) })}
                    className="input-field mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Section</label>
                  <input
                    type="text"
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="input-field mt-1"
                    placeholder="A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field mt-1"
                  >
                    <option value="regular">Regular</option>
                    <option value="compact">Compact</option>
                    <option value="large">Large</option>
                    <option value="disabled">Disabled</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Hour ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({ ...formData, pricePerHour: Number.parseFloat(e.target.value) })}
                    className="input-field mt-1"
                  />
                </div>

                {slot && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field mt-1"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="grid grid-cols-2 gap-2">
                  {["covered", "security_camera", "ev_charging", "near_entrance", "near_elevator"].map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{feature.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? "Saving..." : slot ? "Update" : "Create"}
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

const ParkingSlots = () => {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SLOTS)
      setSlots(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch parking slots")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slotId) => {
    if (!confirm("Are you sure you want to delete this parking slot?")) return

    try {
      await axios.delete(`${API_ENDPOINTS.SLOTS}/${slotId}`)
      toast.success("Slot deleted successfully")
      fetchSlots()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete slot")
    }
  }

  const filteredSlots = slots.filter((slot) => {
    const matchesSearch =
      slot.slotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.section.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || slot.type === filterType
    const matchesStatus = !filterStatus || slot.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-red-100 text-red-800"
      case "reserved":
        return "bg-yellow-100 text-yellow-800"
      case "maintenance":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Parking Slots</h1>
          <button
            onClick={() => {
              setSelectedSlot(null)
              setModalOpen(true)
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Slot
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search slots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field">
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="compact">Compact</option>
            <option value="large">Large</option>
            <option value="disabled">Disabled</option>
            <option value="electric">Electric</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Slots Table */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price/Hour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Features
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSlots.map((slot) => (
              <tr key={slot._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{slot.slotNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Floor {slot.floor}</div>
                  <div className="text-sm text-gray-500">Section {slot.section}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="capitalize text-sm text-gray-900">{slot.type}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(slot.status)}`}
                  >
                    {slot.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${slot.pricePerHour}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {slot.features.map((feature) => (
                      <span key={feature} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {feature.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSlot(slot)
                        setModalOpen(true)
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(slot._id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSlots.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No parking slots</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new parking slot.</p>
          </div>
        )}
      </div>

      <SlotModal isOpen={modalOpen} onClose={() => setModalOpen(false)} slot={selectedSlot} onSave={fetchSlots} />
    </div>
  )
}

export default ParkingSlots
