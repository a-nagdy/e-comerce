"use client";

import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContainerClass, useSiteSettings } from "@/lib/settings-client";
import { CheckCircle, Download, Mail, Package, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CheckoutSuccessPage() {
  const [orderNumber] = useState(() =>
    Math.random().toString(36).substr(2, 9).toUpperCase()
  );
  const [estimatedDelivery] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });
  const settings = useSiteSettings();
  const containerClass = getContainerClass(settings.containerWidth);
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50">
        <div className={containerClass}>
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Order Confirmed!
              </h1>
              <p className="text-gray-600">
                Thank you for your purchase. Your order has been successfully
                placed and is being processed.
              </p>
            </div>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Order Number:</span>
                  <Badge variant="outline" className="font-mono">
                    #{orderNumber}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Delivery:</span>
                  <span>{estimatedDelivery}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">$479.97</span>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Order Confirmation Email</h3>
                      <p className="text-sm text-gray-600">
                        You'll receive an email confirmation with your order
                        details shortly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Order Processing</h3>
                      <p className="text-sm text-gray-600">
                        Our vendors will prepare your items for shipment within
                        1-2 business days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Shipping Updates</h3>
                      <p className="text-sm text-gray-600">
                        Track your package with real-time updates via email and
                        SMS.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/account/orders">View Order Status</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            </div>

            {/* Support */}
            <div className="text-center text-sm text-gray-600">
              <p>
                Need help? Contact our{" "}
                <Link href="/support" className="text-blue-600 hover:underline">
                  customer support team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
