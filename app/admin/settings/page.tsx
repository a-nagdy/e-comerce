"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";

interface PlatformSettings {
  // General Settings
  site_name: string;
  site_description: string;
  contact_email: string;
  support_phone: string;

  // Vendor Settings
  auto_approve_vendors: boolean;
  require_vendor_verification: boolean;
  vendor_commission: number;
  min_payout_amount: number;

  // Product Settings
  auto_approve_products: boolean;
  require_product_moderation: boolean;
  max_images_per_product: number;
  max_image_size_mb: number;

  // Payment Settings
  default_currency: string;
  default_tax_rate: number;
  default_shipping_fee: number;
  free_shipping_minimum: number;

  // Email Settings
  email_order_confirmations: boolean;
  email_vendor_notifications: boolean;
  email_marketing_enabled: boolean;

  // Security Settings
  require_2fa_admin: boolean;
  gdpr_compliance: boolean;
  session_timeout_minutes: number;
}

export default function PlatformSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>({
    // Default values
    site_name: "MarketPlace Pro",
    site_description:
      "Your premier destination for quality products from trusted vendors",
    contact_email: "admin@marketplace.com",
    support_phone: "+1 (555) 123-4567",
    auto_approve_vendors: false,
    require_vendor_verification: true,
    vendor_commission: 5,
    min_payout_amount: 50,
    auto_approve_products: false,
    require_product_moderation: true,
    max_images_per_product: 10,
    max_image_size_mb: 5,
    default_currency: "USD",
    default_tax_rate: 8.5,
    default_shipping_fee: 9.99,
    free_shipping_minimum: 75,
    email_order_confirmations: true,
    email_vendor_notifications: true,
    email_marketing_enabled: false,
    require_2fa_admin: true,
    gdpr_compliance: true,
    session_timeout_minutes: 60,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/settings/platform");

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load settings"
      );
      toast({
        title: "Error",
        description: "Failed to load platform settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/settings/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast({
        title: "Success",
        description: "Platform settings saved successfully",
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Settings</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button onClick={fetchSettings} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure marketplace settings and preferences
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.site_name}
                onChange={(e) => updateSetting("site_name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.site_description}
                onChange={(e) =>
                  updateSetting("site_description", e.target.value)
                }
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contact_email}
                onChange={(e) => updateSetting("contact_email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={settings.support_phone}
                onChange={(e) => updateSetting("support_phone", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vendor Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve vendors</Label>
                <p className="text-sm text-gray-600">
                  Automatically approve new vendor applications
                </p>
              </div>
              <Switch
                checked={settings.auto_approve_vendors}
                onCheckedChange={(checked) =>
                  updateSetting("auto_approve_vendors", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Require vendor verification</Label>
                <p className="text-sm text-gray-600">
                  Require business documents for verification
                </p>
              </div>
              <Switch
                checked={settings.require_vendor_verification}
                onCheckedChange={(checked) =>
                  updateSetting("require_vendor_verification", checked)
                }
              />
            </div>
            <Separator />
            <div>
              <Label htmlFor="vendorCommission">Vendor Commission (%)</Label>
              <Input
                id="vendorCommission"
                type="number"
                value={settings.vendor_commission}
                onChange={(e) =>
                  updateSetting(
                    "vendor_commission",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="0"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="minPayout">Minimum Payout Amount ($)</Label>
              <Input
                id="minPayout"
                type="number"
                value={settings.min_payout_amount}
                onChange={(e) =>
                  updateSetting(
                    "min_payout_amount",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve products</Label>
                <p className="text-sm text-gray-600">
                  Automatically approve new product submissions
                </p>
              </div>
              <Switch
                checked={settings.auto_approve_products}
                onCheckedChange={(checked) =>
                  updateSetting("auto_approve_products", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Require product moderation</Label>
                <p className="text-sm text-gray-600">
                  All products must be reviewed before going live
                </p>
              </div>
              <Switch
                checked={settings.require_product_moderation}
                onCheckedChange={(checked) =>
                  updateSetting("require_product_moderation", checked)
                }
              />
            </div>
            <Separator />
            <div>
              <Label htmlFor="maxImages">Max Images per Product</Label>
              <Input
                id="maxImages"
                type="number"
                value={settings.max_images_per_product}
                onChange={(e) =>
                  updateSetting(
                    "max_images_per_product",
                    parseInt(e.target.value) || 1
                  )
                }
                min="1"
                max="20"
              />
            </div>
            <div>
              <Label htmlFor="maxFileSize">Max Image Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.max_image_size_mb}
                onChange={(e) =>
                  updateSetting(
                    "max_image_size_mb",
                    parseInt(e.target.value) || 1
                  )
                }
                min="1"
                max="20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Payment & Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <select
                id="currency"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={settings.default_currency}
                onChange={(e) =>
                  updateSetting("default_currency", e.target.value)
                }
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="EGP">EGP - Egyptian Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
            <div>
              <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={settings.default_tax_rate}
                onChange={(e) =>
                  updateSetting(
                    "default_tax_rate",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="0"
                max="50"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="shippingFee">Default Shipping Fee ($)</Label>
              <Input
                id="shippingFee"
                type="number"
                value={settings.default_shipping_fee}
                onChange={(e) =>
                  updateSetting(
                    "default_shipping_fee",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="freeShippingMin">Free Shipping Minimum ($)</Label>
              <Input
                id="freeShippingMin"
                type="number"
                value={settings.free_shipping_minimum}
                onChange={(e) =>
                  updateSetting(
                    "free_shipping_minimum",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Order confirmations</Label>
                <p className="text-sm text-gray-600">
                  Send email when orders are placed
                </p>
              </div>
              <Switch
                checked={settings.email_order_confirmations}
                onCheckedChange={(checked) =>
                  updateSetting("email_order_confirmations", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Vendor notifications</Label>
                <p className="text-sm text-gray-600">
                  Notify vendors of new orders
                </p>
              </div>
              <Switch
                checked={settings.email_vendor_notifications}
                onCheckedChange={(checked) =>
                  updateSetting("email_vendor_notifications", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing emails</Label>
                <p className="text-sm text-gray-600">
                  Send promotional emails to customers
                </p>
              </div>
              <Switch
                checked={settings.email_marketing_enabled}
                onCheckedChange={(checked) =>
                  updateSetting("email_marketing_enabled", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-factor authentication</Label>
                <p className="text-sm text-gray-600">
                  Require 2FA for admin accounts
                </p>
              </div>
              <Switch
                checked={settings.require_2fa_admin}
                onCheckedChange={(checked) =>
                  updateSetting("require_2fa_admin", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>GDPR compliance</Label>
                <p className="text-sm text-gray-600">
                  Enable GDPR data protection features
                </p>
              </div>
              <Switch
                checked={settings.gdpr_compliance}
                onCheckedChange={(checked) =>
                  updateSetting("gdpr_compliance", checked)
                }
              />
            </div>
            <Separator />
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.session_timeout_minutes}
                onChange={(e) =>
                  updateSetting(
                    "session_timeout_minutes",
                    parseInt(e.target.value) || 15
                  )
                }
                min="15"
                max="480"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
