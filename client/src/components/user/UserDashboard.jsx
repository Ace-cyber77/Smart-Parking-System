"use client"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { API_ENDPOINTS } from "../../config/api"
import { Car, Calendar, DollarSign, MapPin, Plus } from "lucide-react"
import { format } from "date-fns"

const QuickStatCard = ({ title, value, icon: Icon, color = "primary" }) => (
  <div className="card p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
)

const UserDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalBookings: 0,
    totalSpent: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.MY_BOOKINGS}?limit=5`)
      const bookingsData = response.data.data

      setBookings(bookingsData)

      // Calculate stats
      const activeBookings = bookingsData.filter((b) => b.status === "active").length
      const totalSpent = bookingsData.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.totalAmount, 0)

      setStats({
        activeBookings,
        totalBookings: response.data.pagination?.total || bookingsData.length,
        totalSpent,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="mt-1 text-sm text-gray-500">Here's an overview of your parking activity.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <QuickStatCard title="Active Bookings" value={stats.activeBookings} icon={Calendar} color="green" />
        <QuickStatCard title="Total Bookings" value={stats.totalBookings} icon={Car} />
        <QuickStatCard title="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} icon={DollarSign} color="blue" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/dashboard/parking"
          className="card p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Car className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Find Parking</h3>
              <p className="text-sm text-gray-500">Browse available parking slots and make a reservation</p>
            </div>
            <Plus className="w-5 h-5 text-gray-400 ml-auto" />
          </div>
        </Link>

        <Link
          to="/dashboard/map"
          className="card p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Parking Map</h3>
              <p className="text-sm text-gray-500">View real-time parking availability on the map</p>
            </div>
            <Plus className="w-5 h-5 text-gray-400 ml-auto" />
          </div>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
          <Link to="/dashboard/bookings" className="text-sm text-primary-600 hover:text-primary-500">
            View all
          </Link>
        </div>
        <div className="overflow-hidden">
          {bookings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.parkingSlot?.slotNumber}</div>
                      <div className="text-sm text-gray-500">
                        Floor {booking.parkingSlot?.floor}, Section {booking.parkingSlot?.section}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.vehicleNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(booking.startTime), "MMM dd, HH:mm")}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {format(new Date(booking.endTime), "MMM dd, HH:mm")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.totalAmount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by finding a parking slot.</p>
              <div className="mt-6">
                <Link to="/dashboard/parking" className="btn-primary">
                  Find Parking
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
