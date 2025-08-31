const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  PROFILE: `${API_BASE_URL}/auth/profile`,

  // Parking slots endpoints
  SLOTS: `${API_BASE_URL}/slots`,
  SLOTS_AVAILABLE: `${API_BASE_URL}/slots/available`,

  // Bookings endpoints
  BOOKINGS: `${API_BASE_URL}/bookings`,
  MY_BOOKINGS: `${API_BASE_URL}/bookings/my-bookings`,

  // Users endpoints (admin only)
  USERS: `${API_BASE_URL}/users`,

  // Health check
  HEALTH: `${API_BASE_URL}/health`,
}

export { API_BASE_URL, SOCKET_URL }
