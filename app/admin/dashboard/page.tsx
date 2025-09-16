"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  DollarSign,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardData {
  overview: {
    totalUsers: number;
    totalVendors: number;
    totalProducts: number;
    totalOffers: number;
    totalOrders: number;
    totalRevenue: number;
    pendingVendors: number;
    activeProducts: number;
    activeOffers: number;
    pendingProducts: number;
    pendingOffers: number;
    recentOrders: number;
  };
  userStats: any;
  vendorStats: any;
  productStats: any;
  offerStats: any;
  orderStats: any;
  recentOrders: any[];
  analytics: {
    avgOrderValue: number;
    conversionRate: number;
    weeklyRevenue: number;
    weeklyOrders: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/admin/dashboard");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch dashboard data: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(data);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Navigation functions
  const navigateToVendors = (status?: string) => {
    const params = status ? `?status=${status}` : "";
    router.push(`/admin/vendors${params}`);
  };

  const navigateToProducts = () => {
    router.push("/admin/products");
  };

  const navigateToVendorProducts = () => {
    router.push("/admin/vendor/products");
  };

  const navigateToUsers = () => {
    router.push("/admin/users");
  };

  const navigateToSettings = () => {
    router.push("/admin/settings");
  };

  const statsData = dashboardData
    ? [
        {
          title: "Total Users",
          value: dashboardData.overview.totalUsers,
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          onClick: () => navigateToUsers(),
        },
        {
          title: "Total Vendors",
          value: dashboardData.overview.totalVendors,
          icon: Store,
          color: "text-green-600",
          bgColor: "bg-green-50",
          onClick: () => navigateToVendors("approved"),
        },
        {
          title: "Pending Vendors",
          value: dashboardData.overview.pendingVendors,
          icon: AlertCircle,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          onClick: () => navigateToVendors("pending"),
        },
        {
          title: "Catalog Products",
          value: dashboardData.overview.totalProducts,
          icon: Package,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          onClick: () => navigateToProducts(),
        },
        {
          title: "Total Orders",
          value: dashboardData.overview.totalOrders,
          icon: ShoppingBag,
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          onClick: () => {
            // Future: Navigate to orders page when implemented
            router.push("/admin/settings");
          },
        },
        {
          title: "Total Revenue",
          value: `$${dashboardData.overview.totalRevenue.toLocaleString()}`,
          icon: DollarSign,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          onClick: () => navigateToSettings(),
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Marketplace overview and management
          </p>
        </div>
        <Button onClick={() => navigateToSettings()}>Platform Settings</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${dashboardData.analytics.avgOrderValue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.analytics.conversionRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Weekly Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${dashboardData.analytics.weeklyRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Weekly Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.analytics.weeklyOrders}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Vendor Applications</p>
                <p className="text-sm text-gray-600">
                  {dashboardData.vendorStats.pending} pending review
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateToVendors("pending")}
              >
                Review
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Pending Offers</p>
                <p className="text-sm text-gray-600">
                  {dashboardData.overview.pendingOffers} vendor offers awaiting
                  approval
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateToVendorProducts()}
              >
                Review
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Active Products</p>
                <p className="text-sm text-gray-600">
                  {dashboardData.overview.activeProducts} catalog items,{" "}
                  {dashboardData.overview.activeOffers} live offers
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateToProducts()}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentOrders?.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.users?.full_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${order.total_amount}
                    </p>
                    <Badge
                      variant={
                        order.status === "delivered" ? "default" : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
