"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, MapPin, Users, BarChart3, Settings, Calendar, CreditCard, CheckCircle } from "lucide-react"

// Mock data for demonstration
const mockParkingSlots = [
  { id: 1, number: "A001", location: "Ground Floor - Section A", status: "available", price: 5.0, type: "regular" },
  { id: 2, number: "A002", location: "Ground Floor - Section A", status: "occupied", price: 5.0, type: "regular" },
  { id: 3, number: "A003", location: "Ground Floor - Section A", status: "available", price: 5.0, type: "regular" },
  { id: 4, number: "B001", location: "Ground Floor - Section B", status: "reserved", price: 7.0, type: "premium" },
  { id: 5, number: "B002", location: "Ground Floor - Section B", status: "available", price: 7.0, type: "premium" },
  { id: 6, number: "C001", location: "First Floor - Section C", status: "occupied", price: 4.0, type: "compact" },
  { id: 7, number: "C002", location: "First Floor - Section C", status: "available", price: 4.0, type: "compact" },
  { id: 8, number: "D001", location: "First Floor - Section D", status: "maintenance", price: 6.0, type: "disabled" },
]

const mockBookings = [
  {
    id: 1,
    slotNumber: "A002",
    vehicleNumber: "ABC123",
    startTime: "2024-01-15T09:00:00",
    endTime: "2024-01-15T17:00:00",
    status: "active",
    amount: 40.0,
  },
  {
    id: 2,
    slotNumber: "B001",
    vehicleNumber: "XYZ789",
    startTime: "2024-01-15T14:00:00",
    endTime: "2024-01-15T18:00:00",
    status: "reserved",
    amount: 28.0,
  },
  {
    id: 3,
    slotNumber: "C001",
    vehicleNumber: "DEF456",
    startTime: "2024-01-14T08:00:00",
    endTime: "2024-01-14T16:00:00",
    status: "completed",
    amount: 32.0,
  },
]

export default function SmartParkingSystem() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookingForm, setBookingForm] = useState({
    vehicleNumber: "",
    startTime: "",
    endTime: "",
    duration: 1,
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getSlotStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-gray-500"
      default:
        return "bg-gray-300"
    }
  }

  const getSlotStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case "occupied":
        return <Badge className="bg-red-100 text-red-800">Occupied</Badge>
      case "reserved":
        return <Badge className="bg-yellow-100 text-yellow-800">Reserved</Badge>
      case "maintenance":
        return <Badge className="bg-gray-100 text-gray-800">Maintenance</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const availableSlots = mockParkingSlots.filter((slot) => slot.status === "available").length
  const totalSlots = mockParkingSlots.length
  const occupancyRate = (((totalSlots - availableSlots) / totalSlots) * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SmartPark</h1>
                <p className="text-sm text-gray-500">Intelligent Parking Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentTime.toLocaleTimeString()}</p>
                <p className="text-xs text-gray-500">{currentTime.toLocaleDateString()}</p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{availableSlots}</div>
              <p className="text-xs text-muted-foreground">out of {totalSlots} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">current utilization</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {mockBookings.filter((b) => b.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">currently parked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">$248</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="parking-map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="parking-map">Parking Map</TabsTrigger>
            <TabsTrigger value="book-slot">Book Slot</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="admin">Admin Panel</TabsTrigger>
          </TabsList>

          {/* Parking Map */}
          <TabsContent value="parking-map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Real-time Parking Map</span>
                </CardTitle>
                <CardDescription>Live view of all parking slots with real-time availability updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {mockParkingSlots.map((slot) => (
                    <Dialog key={slot.id}>
                      <DialogTrigger asChild>
                        <div className="cursor-pointer">
                          <div
                            className={`w-16 h-20 rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center space-y-1 hover:shadow-md transition-shadow ${getSlotStatusColor(slot.status)} ${slot.status === "available" ? "hover:bg-green-600" : ""}`}
                          >
                            <Car
                              className={`h-6 w-6 ${slot.status === "available" ? "text-white" : "text-gray-600"}`}
                            />
                            <span
                              className={`text-xs font-medium ${slot.status === "available" ? "text-white" : "text-gray-600"}`}
                            >
                              {slot.number}
                            </span>
                          </div>
                          <p className="text-xs text-center mt-1 text-gray-600">${slot.price}/hr</p>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Parking Slot {slot.number}</DialogTitle>
                          <DialogDescription>Detailed information about this parking slot</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Status:</span>
                            {getSlotStatusBadge(slot.status)}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Location:</span>
                            <span className="text-sm text-gray-600">{slot.location}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Price:</span>
                            <span className="text-sm font-semibold">${slot.price}/hour</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Type:</span>
                            <Badge variant="outline">{slot.type}</Badge>
                          </div>
                          {slot.status === "available" && (
                            <Button className="w-full" onClick={() => setSelectedSlot(slot)}>
                              Book This Slot
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Occupied</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Reserved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span className="text-sm">Maintenance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Book Slot */}
          <TabsContent value="book-slot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book a Parking Slot</CardTitle>
                <CardDescription>Reserve your parking spot in advance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vehicle">Vehicle Number</Label>
                      <Input
                        id="vehicle"
                        placeholder="Enter vehicle number (e.g., ABC123)"
                        value={bookingForm.vehicleNumber}
                        onChange={(e) => setBookingForm({ ...bookingForm, vehicleNumber: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="datetime-local"
                        value={bookingForm.startTime}
                        onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Select
                        value={bookingForm.duration.toString()}
                        onValueChange={(value) => setBookingForm({ ...bookingForm, duration: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="4">4 hours</SelectItem>
                          <SelectItem value="8">8 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Available Slots</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {mockParkingSlots
                        .filter((slot) => slot.status === "available")
                        .map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium">{slot.number}</p>
                              <p className="text-sm text-gray-600">{slot.location}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${slot.price}/hr</p>
                              <Badge variant="outline">{slot.type}</Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="text-2xl font-bold text-blue-600">$15.00</p>
                  </div>
                  <Button size="lg" className="px-8">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>View and manage your parking reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Car className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Slot {booking.slotNumber}</p>
                          <p className="text-sm text-gray-600">Vehicle: {booking.vehicleNumber}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.startTime).toLocaleDateString()} •
                            {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                            -{new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-semibold">${booking.amount}</p>
                        {booking.status === "active" && <Badge className="bg-green-100 text-green-800">Active</Badge>}
                        {booking.status === "reserved" && (
                          <Badge className="bg-yellow-100 text-yellow-800">Reserved</Badge>
                        )}
                        {booking.status === "completed" && (
                          <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
                        )}
                        {booking.status === "active" && (
                          <Button variant="outline" size="sm" className="ml-2 bg-transparent">
                            End Parking
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Panel */}
          <TabsContent value="admin" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Users</span>
                      <Badge>1,247</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Today</span>
                      <Badge variant="outline">89</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>New Registrations</span>
                      <Badge className="bg-green-100 text-green-800">+12</Badge>
                    </div>
                    <Button className="w-full bg-transparent" variant="outline">
                      View All Users
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Peak Hours</span>
                      <span className="text-sm font-medium">9AM - 11AM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Duration</span>
                      <span className="text-sm font-medium">3.2 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Revenue This Month</span>
                      <span className="text-sm font-medium text-green-600">$12,450</span>
                    </div>
                    <Button className="w-full bg-transparent" variant="outline">
                      View Detailed Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Slot Management</CardTitle>
                <CardDescription>Manage parking slots and their configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockParkingSlots.slice(0, 4).map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getSlotStatusColor(slot.status)}`}></div>
                        <div>
                          <p className="font-medium">{slot.number}</p>
                          <p className="text-sm text-gray-600">{slot.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">${slot.price}/hr</span>
                        {getSlotStatusBadge(slot.status)}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-transparent" variant="outline">
                    <Car className="h-4 w-4 mr-2" />
                    Add New Slot
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
