"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import axios from "axios"
import { API_ENDPOINTS } from "../config/api"
import toast from "react-hot-toast"

const AuthContext = createContext()

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return { ...state, loading: true, error: null }
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      }
    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      }
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    default:
      return state
  }
}

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set up axios interceptor for token
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      // Verify token on app load
      verifyToken()
    }
  }, [])

  // Verify token validity
  const verifyToken = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PROFILE)
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          token: localStorage.getItem("token"),
        },
      })
    } catch (error) {
      logout()
    }
  }

  // Login function
  const login = async (credentials) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, credentials)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      })

      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed"
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Register function
  const register = async (userData) => {
    dispatch({ type: "REGISTER_START" })
    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, userData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      dispatch({
        type: "REGISTER_SUCCESS",
        payload: { user, token },
      })

      toast.success("Registration successful!")
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed"
      dispatch({
        type: "REGISTER_FAILURE",
        payload: errorMessage,
      })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    dispatch({ type: "LOGOUT" })
    toast.success("Logged out successfully")
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(API_ENDPOINTS.PROFILE, profileData)
      dispatch({
        type: "UPDATE_USER",
        payload: response.data.user,
      })
      toast.success("Profile updated successfully!")
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Profile update failed"
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
