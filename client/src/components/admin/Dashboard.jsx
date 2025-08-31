"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { API_ENDPOINTS } from "../../config/api"
import { Car, Calendar, Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react"

const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
  <div className="card p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            {change && (
              <div
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                {change}
              </div>
            )}
          </dd>
        </dl>
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    slots: null,
    bookings: null,
    users: null,
    loading: true,
  })
  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [slotsRes, bookingsRes, usersRes, recentBookingsRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.SLOTS}/statistics`),
        axios.get(`${API_ENDPOINTS.BOOKINGS}/statistics/overview`),
        axios.get(`${API_ENDPOINTS.USERS}/statistics`),
        axios.get(`${API_ENDPOINTS.BOOKINGS}?limit=5`),
      ])

      setStats({
        slots: slotsRes.data.data,
        bookings: bookingsRes.data.data,
        users: usersRes.data.data,
        loading: false,
      })
      setRecentBookings(recentBookingsRes.data.data)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setStats((prev) => ({ ...prev, loading: false }))
    }
  }

  if (stats.loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your parking system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Parking Slots"
          value={stats.slots?.total || 0}
          icon={Car}
          change={`${stats.slots?.occupancyRate || 0}% occupied`}
        />
        <StatCard
          title="Active Bookings"
          value={stats.bookings?.active || 0}
          icon={Calendar}
          change={`${stats.bookings?.total || 0} total`}
        />
        <StatCard
          title="Total Users"
          value={stats.users?.total || 0}
          icon={Users}
          change={`${stats.users?.newUsersLast30Days || 0} new this month`}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.bookings?.totalRevenue?.toFixed(2) || "0.00"}`}
          icon={DollarSign}
          change={`${stats.bookings?.completed || 0} completed`}
          changeType="increase"
        />
      </div>

      {/* Parking Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Parking Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.slots?.available || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Occupied</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.slots?.occupied || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Reserved</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.slots?.reserved || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Maintenance</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.slots?.maintenance || 0}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Bookings</span>
              <span className="text-sm font-medium text-gray-900">{stats.bookings?.active || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed Today</span>
              <span className="text-sm font-medium text-gray-900">{stats.bookings?.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancelled</span>
              <span className="text-sm font-medium text-gray-900">{stats.bookings?.cancelled || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-sm font-medium text-green-600">
                ${stats.bookings?.totalRevenue?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
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
              {recentBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.user?.name}</div>
                    <div className="text-sm text-gray-500">{booking.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.parkingSlot?.slotNumber}</div>
                    <div className="text-sm text-gray-500">
                      Floor {booking.parkingSlot?.floor}, Section {booking.parkingSlot?.section}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.vehicleNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === "active"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
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
          {recentBookings.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
              <p className="mt-1 text-sm text-gray-500">No recent bookings to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
