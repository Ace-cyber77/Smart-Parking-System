"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import LoginForm from "./components/auth/LoginForm"
import RegisterForm from "./components/auth/RegisterForm"
import AdminLayout from "./components/admin/AdminLayout"
import Dashboard from "./components/admin/Dashboard"
import ParkingSlots from "./components/admin/ParkingSlots"
import AdminBookings from "./components/admin/AdminBookings"
import UserLayout from "./components/user/UserLayout"
import UserDashboard from "./components/user/UserDashboard"
import FindParking from "./components/user/FindParking"
import MyBookings from "./components/user/MyBookings"
import ParkingMap from "./components/shared/ParkingMap"

// Placeholder components - will be built in next tasks
const AdminUsers = () => <div className="p-8">Admin Users - Coming Soon</div>
const AdminAnalytics = () => <div className="p-8">Admin Analytics - Coming Soon</div>
const UserProfile = () => <div className="p-8">User Profile - Coming Soon</div>

const AdminMap = () => (
  <div className="p-6">
    <ParkingMap isAdmin={true} />
  </div>
)

const UserMap = () => (
  <div className="p-6">
    <ParkingMap isAdmin={false} />
  </div>
)

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  </div>
)

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginForm /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterForm /> : <Navigate to="/dashboard" replace />} />

        {/* User routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="parking" element={<FindParking />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="map" element={<UserMap />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="slots" element={<ParkingSlots />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="map" element={<AdminMap />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/dashboard") : "/login"} replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
