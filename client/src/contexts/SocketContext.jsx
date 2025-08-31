"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { SOCKET_URL } from "../config/api"
import { useAuth } from "./AuthContext"
import toast from "react-hot-toast"

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(SOCKET_URL, {
        auth: {
          userId: user.id,
          role: user.role,
        },
      })

      newSocket.on("connect", () => {
        console.log("Connected to server")
        setConnected(true)
      })

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server")
        setConnected(false)
      })

      // Real-time event listeners
      newSocket.on("slotStatusChanged", (data) => {
        toast.success(`Slot ${data.slotId} status updated to ${data.status}`)
      })

      newSocket.on("bookingCreated", (booking) => {
        if (user.role === "admin") {
          toast.success(`New booking created for slot ${booking.parkingSlot?.slotNumber}`)
        }
      })

      newSocket.on("bookingCancelled", (booking) => {
        if (user.role === "admin") {
          toast.info(`Booking cancelled for slot ${booking.parkingSlot?.slotNumber}`)
        }
      })

      newSocket.on("bookingCompleted", (booking) => {
        if (user.role === "admin") {
          toast.success(`Booking completed for slot ${booking.parkingSlot?.slotNumber}`)
        }
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [isAuthenticated, user])

  const value = {
    socket,
    connected,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
