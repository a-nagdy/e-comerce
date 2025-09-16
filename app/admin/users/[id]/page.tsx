"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { UserDetails } from "@/types/UserTypes";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CreditCard,
  Edit,
  Mail,
  Package,
  Phone,
  RefreshCw,
  Save,
  Shield,
  ShoppingCart,
  Star,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    active: false,
  });

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.statusText}`);
      }

      const data: UserDetails = await response.json();
      setUserDetails(data);
      // Initialize edit form
      setEditForm({
        full_name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone || "",
        role: data.user.role,
        active: data.user.active,
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load user details"
      );
      toast({
        title: "Error",
        description: "Failed to load user details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditing(false);
      fetchUserDetails(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast({
        title: "Success",
        description: `User ${
          newActive ? "activated" : "deactivated"
        } successfully`,
      });

      fetchUserDetails(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "vendor":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "vendor":
        return <Building2 className="h-4 w-4" />;
      case "customer":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading User</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button onClick={fetchUserDetails} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { user, userStats, recentActivity } = userDetails;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600 mt-1">
              Manage user information and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone || "",
                    role: user.role,
                    active: user.active,
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.totalOrders}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(userStats.totalSpent)}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(userStats.averageOrderValue)}
                </p>
                <p className="text-sm text-gray-600">Avg Order Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.completedOrders}
                </p>
                <p className="text-sm text-gray-600">Completed Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="active">Account Status</Label>
                  <Select
                    value={editForm.active.toString()}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({
                        ...prev,
                        active: value === "true",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.full_name || "Unnamed User"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(user.role)}>
                        <span className="mr-1">{getRoleIcon(user.role)}</span>
                        {user.role}
                      </Badge>
                      <Badge variant={user.active ? "default" : "secondary"}>
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Email
                    </Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                      <Badge
                        variant={
                          user.email_verified ? "outline" : "destructive"
                        }
                        className="text-xs"
                      >
                        {user.email_verified ? "Verified" : "Unverified"}
                      </Badge>
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Phone
                    </Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {user.phone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Member Since
                    </Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Last Updated
                    </Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(user.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Vendor Information if applicable */}
                {user.role === "vendor" &&
                  user.vendors &&
                  user.vendors.length > 0 && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium text-gray-500">
                        Vendor Business
                      </Label>
                      <div className="mt-2 space-y-2">
                        {user.vendors.map((vendor) => (
                          <div
                            key={vendor.id}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {vendor.business_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Commission: {vendor.commission_rate}%
                              </p>
                            </div>
                            <Badge
                              className={
                                vendor.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : vendor.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {vendor.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Activity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Activity & Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Registration Date
                  </Label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(
                      recentActivity.registrationDate
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Last Login
                  </Label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {recentActivity.lastLogin
                      ? new Date(recentActivity.lastLogin).toLocaleDateString()
                      : "Never logged in"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Last Order
                  </Label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    {recentActivity.lastOrder
                      ? new Date(recentActivity.lastOrder).toLocaleDateString()
                      : "No orders yet"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-500 mb-3 block">
                  Order Statistics
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">
                      {userStats.totalOrders}
                    </p>
                    <p className="text-xs text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">
                      {userStats.completedOrders}
                    </p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Management */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge variant={user.active ? "default" : "secondary"}>
                  {user.active ? "Active" : "Inactive"}
                </Badge>
                <Badge
                  variant={user.email_verified ? "outline" : "destructive"}
                  className="text-xs"
                >
                  {user.email_verified ? "Email Verified" : "Email Unverified"}
                </Badge>
              </div>

              <div className="flex gap-2">
                {user.active ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleStatusChange(true)}>
                    <Check className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                )}

                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>

                <Button size="sm" variant="outline">
                  Reset Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
