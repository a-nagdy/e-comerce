"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle, Clock, Search, Eye, Download } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

// Mock order data
const orders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    status: "delivered",
    total: 479.97,
    items: [
      {
        id: "1",
        name: "Wireless Bluetooth Headphones",
        price: 79.99,
        quantity: 1,
        image: "/wireless-headphones.png",
        vendor: "TechGear Pro",
      },
      {
        id: "2",
        name: "Smart Fitness Watch",
        price: 199.99,
        quantity: 2,
        image: "/fitness-watch.png",
        vendor: "FitTech Solutions",
      },
    ],
    tracking: "1Z999AA1234567890",
    estimatedDelivery: "2024-01-22",
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-20",
    status: "shipped",
    total: 149.99,
    items: [
      {
        id: "3",
        name: "Wireless Mouse",
        price: 49.99,
        quantity: 1,
        image: "/wireless-mouse.png",
        vendor: "TechGear Pro",
      },
      {
        id: "4",
        name: "USB-C Hub",
        price: 99.99,
        quantity: 1,
        image: "/usb-hub.png",
        vendor: "ConnectTech",
      },
    ],
    tracking: "1Z999AA1234567891",
    estimatedDelivery: "2024-01-25",
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-22",
    status: "processing",
    total: 299.99,
    items: [
      {
        id: "5",
        name: "Mechanical Keyboard",
        price: 299.99,
        quantity: 1,
        image: "/mechanical-keyboard.png",
        vendor: "KeyCraft",
      },
    ],
    tracking: null,
    estimatedDelivery: "2024-01-30",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "shipped":
      return "bg-blue-100 text-blue-800"
    case "processing":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return CheckCircle
    case "shipped":
      return Truck
    case "processing":
      return Package
    default:
      return Clock
  }
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-1">Track and manage your orders</p>
              </div>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders by order number or product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status)

                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon className="h-5 w-5 text-gray-600" />
                          <div>
                            <CardTitle className="text-lg">Order {order.id}</CardTitle>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">Total: ${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">by {item.vendor}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Order Status & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {order.tracking && (
                            <p className="text-sm text-gray-600">
                              <strong>Tracking:</strong> {order.tracking}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            <strong>Estimated Delivery:</strong>{" "}
                            {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {order.tracking && (
                            <Button size="sm" variant="outline">
                              <Truck className="h-4 w-4 mr-1" />
                              Track Package
                            </Button>
                          )}
                          {order.status === "delivered" && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? "No orders match your search criteria." : "You haven't placed any orders yet."}
                  </p>
                  <Button asChild>
                    <Link href="/">Start Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
