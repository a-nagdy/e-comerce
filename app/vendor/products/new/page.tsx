"use client";

import { SmartProductInput } from "@/components/product/smart-product-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewProductPage() {
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(
    null
  );
  const [linkedProduct, setLinkedProduct] = useState<any>(null);

  // Form data
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [condition, setCondition] = useState("new");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [storage, setStorage] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("");
  const [trackInventory, setTrackInventory] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Handle product suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    setSelectedCatalogId(suggestion.catalog_id);
    setLinkedProduct(suggestion);
    setTitle(suggestion.name);
    if (suggestion.bestPrice) {
      setPrice(suggestion.bestPrice.toString());
    }

    toast({
      title: "Product Linked!",
      description: `Linked to "${suggestion.name}" - ${Math.round(
        suggestion.confidence_score * 100
      )}% match`,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !categoryId || !price) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in product name, category, and price.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        productName,
        categoryId,
        catalogId: selectedCatalogId,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        condition,
        color: color || null,
        size: size || null,
        storage: storage || null,
        inventoryQuantity: parseInt(inventoryQuantity) || 0,
        trackInventory,
        title: title || productName,
        description,
        images,
        isFeatured,
      };

      const response = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();

        toast({
          title: result.requiresApproval
            ? "Product Submitted for Review"
            : "Product Created!",
          description:
            result.message ||
            "Your product has been successfully added to the catalog.",
        });

        // Show additional info for approval process
        if (result.requiresApproval) {
          setTimeout(() => {
            toast({
              title: "Approval Required",
              description:
                "Your product will appear in your listings once approved by admin.",
            });
          }, 2000);
        }

        router.push("/vendor/products");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vendor/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category first" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <SmartProductInput
                    categoryId={categoryId}
                    value={productName}
                    onChange={setProductName}
                    onSuggestionSelect={handleSuggestionSelect}
                    placeholder="Start typing product name..."
                    label="Product Name *"
                    disabled={!categoryId}
                  />
                  {!categoryId && (
                    <p className="text-sm text-muted-foreground">
                      Please select a category first to enable smart suggestions
                    </p>
                  )}
                </div>

                {linkedProduct && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>Linked to existing product:</strong>{" "}
                          {linkedProduct.name}
                          <br />
                          <span className="text-sm">
                            {linkedProduct.vendorCount} other seller(s) • Best
                            price: ${linkedProduct.bestPrice}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {Math.round(linkedProduct.confidence_score * 100)}%
                          match
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Custom title for your listing (optional)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use the product name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your specific offer, condition, or additional details..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auto-sku">SKU (Auto-generated)</Label>
                    <Input
                      id="auto-sku"
                      value="Will be generated automatically"
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground">
                      A unique SKU will be automatically generated when you
                      create the product
                    </p>
                  </div>
                </div>

                {/* Variant Options */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g., Space Black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="e.g., Large, XL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage">Storage/Memory</Label>
                    <Input
                      id="storage"
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      placeholder="e.g., 128GB"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={images}
                  onChange={setImages}
                  maxFiles={8}
                  uploadType="product-image"
                  placeholder="Drag and drop product images here, or click to browse"
                />
              </CardContent>
            </Card>

            {/* Note about variants */}
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Product variants (color, size, storage) are now handled
                    above in the Product Information section.
                  </p>
                  <p>
                    Each variant combination will create a separate offer for
                    the same catalog product.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  {linkedProduct && linkedProduct.bestPrice && (
                    <p className="text-sm text-muted-foreground">
                      Current best price: ${linkedProduct.bestPrice}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compare-price">Compare at Price</Label>
                  <Input
                    id="compare-price"
                    type="number"
                    step="0.01"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="track-inventory">Track Inventory</Label>
                  <Switch
                    id="track-inventory"
                    checked={trackInventory}
                    onCheckedChange={setTrackInventory}
                  />
                </div>

                {trackInventory && (
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={inventoryQuantity}
                      onChange={(e) => setInventoryQuantity(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="0.0 kg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <Input id="length" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width</Label>
                    <Input id="width" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input id="height" type="number" placeholder="0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured Product</Label>
                  <Switch
                    id="featured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={isSaving || !productName || !categoryId || !price}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Product...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Product
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" asChild disabled={isSaving}>
            <Link href="/vendor/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
