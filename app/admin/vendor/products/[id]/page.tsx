"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface VendorProduct {
  id: string;
  catalog_id: string;
  vendor_id: string;
  price: number;
  compare_price: number;
  condition: string;
  color: string;
  size: string;
  storage: string;
  sku: string;
  inventory_quantity: number;
  title: string;
  description: string;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  product_catalog: {
    id: string;
    name: string;
    brand: string;
    model: string;
    base_description: string;
    specifications: any;
    categories: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  vendors: {
    id: string;
    business_name: string;
    status: string;
    users: {
      full_name: string;
      email: string;
    };
  };
}

export default function VendorProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [product, setProduct] = useState<VendorProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/vendor/products/${params.id}`);

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load product"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Product</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {product.title || product.product_catalog.name}
          </h1>
          <p className="text-gray-600">Vendor Product Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Product Name
                </label>
                <p className="text-lg font-semibold">
                  {product.product_catalog.name}
                </p>
              </div>

              {product.title &&
                product.title !== product.product_catalog.name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Vendor Title
                    </label>
                    <p className="text-lg">{product.title}</p>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Brand
                  </label>
                  <p>{product.product_catalog.brand || "No brand"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Model
                  </label>
                  <p>{product.product_catalog.model || "No model"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Category
                </label>
                <p>
                  {product.product_catalog.categories?.name || "Uncategorized"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="flex gap-2 mt-1">
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {product.is_featured && (
                    <Badge variant="outline" className="text-yellow-600">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Business Name
                </label>
                <p className="font-semibold">{product.vendors.business_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Contact Person
                </label>
                <p>{product.vendors.users.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p>{product.vendors.users.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Vendor Status
                </label>
                <Badge
                  variant={
                    product.vendors.status === "approved"
                      ? "default"
                      : "secondary"
                  }
                >
                  {product.vendors.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing and Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${product.price}
              </p>
              <p className="text-sm text-gray-600">Selling Price</p>
            </div>
          </CardContent>
        </Card>

        {product.compare_price && (
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-500">
                  ${product.compare_price}
                </p>
                <p className="text-sm text-gray-600">Compare Price</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {product.inventory_quantity}
              </p>
              <p className="text-sm text-gray-600">Stock Quantity</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">
                {product.condition}
              </p>
              <p className="text-sm text-gray-600">Condition</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variants and Details */}
      {(product.color || product.size || product.storage) && (
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {product.color && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Color
                  </label>
                  <p>{product.color}</p>
                </div>
              )}
              {product.size && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Size
                  </label>
                  <p>{product.size}</p>
                </div>
              )}
              {product.storage && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Storage
                  </label>
                  <p>{product.storage}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {(product.description || product.product_catalog.base_description) && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {product.description && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Vendor Description:
                </h4>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}
            {product.product_catalog.base_description && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Catalog Description:
                </h4>
                <p className="text-gray-600">
                  {product.product_catalog.base_description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
