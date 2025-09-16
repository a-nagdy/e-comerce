import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Package, ShoppingCart, TrendingUp, Eye, Plus } from "lucide-react"
import Link from "next/link"

// Mock data - will be replaced with real data from Supabase
const dashboardStats = {
  totalRevenue: 12450.75,
  totalProducts: 89,
  totalOrders: 156,
  conversionRate: 3.2,
  recentOrders: [
    {
      id: "ORD-20241201-000123",
      customer: "John Doe",
      amount: 89.99,
      status: "processing",
      date: "2024-12-01",
    },
    {
      id: "ORD-20241201-000124",
      customer: "Jane Smith",
      amount: 156.5,
      status: "shipped",
      date: "2024-12-01",
    },
    {
      id: "ORD-20241130-000125",
      customer: "Mike Johnson",
      amount: 45.25,
      status: "delivered",
      date: "2024-11-30",
    },
  ],
  topProducts: [
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      sales: 45,
      revenue: 3599.55,
    },
    {
      id: "2",
      name: "Smart Fitness Watch",
      sales: 23,
      revenue: 4599.77,
    },
    {
      id: "3",
      name: "Professional Camera Lens",
      sales: 12,
      revenue: 5399.88,
    },
  ],
}

export default function VendorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <Button asChild>
          <Link href="/vendor/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">+0.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">${order.amount}</p>
                    <Badge
                      variant={
                        order.status === "delivered" ? "default" : order.status === "shipped" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
              <Link href="/vendor/orders">
                <Eye className="mr-2 h-4 w-4" />
                View All Orders
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Your best-selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.topProducts.map((product, index) => (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.sales} sales</span>
                    <span>${product.revenue.toLocaleString()}</span>
                  </div>
                  <Progress value={(product.sales / 50) * 100} className="h-2" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
              <Link href="/vendor/products">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
