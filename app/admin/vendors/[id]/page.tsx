"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { VendorDetails } from "@/types/VendorTypes";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  DollarSign,
  Edit,
  Mail,
  Package,
  Phone,
  RefreshCw,
  Save,
  ShoppingCart,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();

  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    business_name: "",
    business_description: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    commission_rate: 0,
    status: "",
  });

  const fetchVendorDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/vendors/${id}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch vendor details: ${response.statusText}`
        );
      }

      const data: VendorDetails = await response.json();
      setVendorDetails(data);
      // Initialize edit form
      setEditForm({
        business_name: data.vendor.business_name,
        business_description: data.vendor.business_description || "",
        business_address: data.vendor.business_address || "",
        business_phone: data.vendor.business_phone || "",
        business_email: data.vendor.business_email || "",
        commission_rate: data.vendor.commission_rate,
        status: data.vendor.status,
      });
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load vendor details"
      );
      toast({
        title: "Error",
        description: "Failed to load vendor details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/admin/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update vendor");
      }

      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });

      setIsEditing(false);
      fetchVendorDetails(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast({
        title: "Success",
        description: `Vendor ${newStatus} successfully`,
      });

      fetchVendorDetails(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (error || !vendorDetails) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Vendor</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button
            onClick={fetchVendorDetails}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { vendor, productStats, orderStats } = vendorDetails;

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
            <h1 className="text-2xl font-bold text-gray-900">Vendor Details</h1>
            <p className="text-gray-600 mt-1">
              Manage vendor information and settings
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
                    business_name: vendor.business_name,
                    business_description: vendor.business_description || "",
                    business_address: vendor.business_address || "",
                    business_phone: vendor.business_phone || "",
                    business_email: vendor.business_email || "",
                    commission_rate: vendor.commission_rate,
                    status: vendor.status,
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
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {productStats.total}
                </p>
                <p className="text-sm text-gray-600">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.totalOrders}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${orderStats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.completedOrders}
                </p>
                <p className="text-sm text-gray-600">Completed Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={editForm.business_name}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        business_name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_description">Description</Label>
                  <Textarea
                    id="business_description"
                    value={editForm.business_description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        business_description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_address">Address</Label>
                  <Textarea
                    id="business_address"
                    value={editForm.business_address}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        business_address: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_phone">Phone</Label>
                    <Input
                      id="business_phone"
                      value={editForm.business_phone}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          business_phone: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_email">Email</Label>
                    <Input
                      id="business_email"
                      type="email"
                      value={editForm.business_email}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          business_email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editForm.commission_rate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        commission_rate: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {vendor.logo_url ? (
                      <img
                        src={vendor.logo_url}
                        alt={vendor.business_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {vendor.business_name}
                    </h3>
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Description
                    </Label>
                    <p className="text-sm mt-1">
                      {vendor.business_description || "No description provided"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Address
                    </Label>
                    <p className="text-sm mt-1">
                      {vendor.business_address || "No address provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Phone
                      </Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {vendor.business_phone || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Email
                      </Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {vendor.business_email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Commission Rate
                    </Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {vendor.commission_rate}%
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  {vendor.users.avatar_url ? (
                    <img
                      src={vendor.users.avatar_url}
                      alt={vendor.users.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{vendor.users.full_name}</h3>
                  <p className="text-sm text-gray-500">{vendor.users.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Phone
                  </Label>
                  <p className="text-sm mt-1">
                    {vendor.users.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Member Since
                  </Label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(vendor.users.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Vendor Since
                  </Label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(vendor.created_at).toLocaleDateString()}
                  </p>
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
            <CardTitle>Status Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge className={getStatusColor(vendor.status)}>
                  {vendor.status}
                </Badge>
              </div>

              {vendor.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusChange("approved")}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusChange("rejected")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {vendor.status === "approved" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("suspended")}
                >
                  Suspend
                </Button>
              )}

              {vendor.status === "suspended" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("approved")}
                >
                  Reactivate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
