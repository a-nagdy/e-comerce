"use client";

import type React from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addToUserCart, guestCart } from "@/lib/cart";
import { getSiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Store,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";

// Mock data - will be replaced with real data from Supabase
const productData = {
  id: "1",
  name: "Wireless Bluetooth Headphones",
  price: 79.99,
  comparePrice: 99.99,
  description:
    "Experience premium sound quality with these wireless Bluetooth headphones. Featuring active noise cancellation, 30-hour battery life, and comfortable over-ear design perfect for music lovers and professionals.",
  shortDescription:
    "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
  images: [
    "/wireless-headphones.png",
    "/wireless-headphones.png",
    "/wireless-headphones.png",
  ],
  vendor: {
    id: "1",
    businessName: "TechGear Pro",
    rating: 4.8,
    reviewCount: 245,
  },
  category: "Electronics",
  sku: "WBH-001",
  inStock: true,
  inventory: 45,
  rating: 4.5,
  reviewCount: 128,
  variants: [
    {
      name: "Color",
      options: ["Black", "White", "Blue"],
    },
  ],
  specifications: {
    "Battery Life": "30 hours",
    Connectivity: "Bluetooth 5.0",
    Weight: "250g",
    Warranty: "2 years",
  },
  reviews: [
    {
      id: "1",
      user: "John D.",
      rating: 5,
      comment: "Amazing sound quality and battery life. Highly recommend!",
      date: "2024-11-15",
      verified: true,
    },
    {
      id: "2",
      user: "Sarah M.",
      rating: 4,
      comment:
        "Great headphones, very comfortable for long listening sessions.",
      date: "2024-11-10",
      verified: true,
    },
    {
      id: "3",
      user: "Mike R.",
      rating: 5,
      comment:
        "Best purchase I've made this year. The noise cancellation is incredible.",
      date: "2024-11-05",
      verified: false,
    },
  ],
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  const discountPercentage = productData.comparePrice
    ? Math.round(
        ((productData.comparePrice - productData.price) /
          productData.comparePrice) *
          100
      )
    : 0;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    try {
      if (user) {
        // Add to authenticated user's cart
        await addToUserCart(user.id, id, quantity);
      } else {
        // Add to guest cart
        const variant = Object.values(selectedVariants).join("-") || undefined;
        guestCart.addItem(id, quantity, variant);
      }

      // Show success feedback (you could add a toast notification here)
      console.log("Added to cart successfully");
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Show error feedback
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist functionality
  };

  const settings = await getSiteSettings();
  const getContainerClass = () => {
    switch (settings.containerWidth) {
      case "wide":
        return "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
      case "full":
        return "w-full px-4 sm:px-6 lg:px-8";
      default: // 'standard'
        return "container";
    }
  };
  const containerClass = getContainerClass();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className={containerClass}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={productData.images[selectedImage] || "/placeholder.svg"}
                  alt={productData.name}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {productData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-muted"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${productData.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{productData.category}</Badge>
                  {discountPercentage > 0 && (
                    <Badge variant="destructive">
                      -{discountPercentage}% OFF
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{productData.name}</h1>
                <p className="text-muted-foreground">
                  {productData.shortDescription}
                </p>
              </div>

              {/* Vendor Info */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/vendors/${productData.vendor.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {productData.vendor.businessName}
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{productData.vendor.rating}</span>
                    <span>({productData.vendor.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(productData.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{productData.rating}</span>
                <span className="text-muted-foreground">
                  ({productData.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">
                  ${productData.price.toFixed(2)}
                </span>
                {productData.comparePrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${productData.comparePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Variants */}
              {productData.variants.map((variant) => (
                <div key={variant.name} className="space-y-2">
                  <Label className="text-sm font-medium">{variant.name}</Label>
                  <div className="flex gap-2">
                    {variant.options.map((option) => (
                      <Button
                        key={option}
                        variant={
                          selectedVariants[variant.name] === option
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setSelectedVariants({
                            ...selectedVariants,
                            [variant.name]: option,
                          })
                        }
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= productData.inventory}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {productData.inventory} items available
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1"
                  size="lg"
                  disabled={isAddingToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddToWishlist}
                  className={isWishlisted ? "text-red-500 border-red-500" : ""}
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">
                    On orders over $50
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">
                    100% protected
                  </p>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({productData.reviewCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {productData.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(productData.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-2 border-b"
                          >
                            <span className="font-medium">{key}</span>
                            <span className="text-muted-foreground">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* Review Summary */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center">
                          <div className="text-4xl font-bold mb-2">
                            {productData.rating}
                          </div>
                          <div className="flex justify-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(productData.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground">
                            Based on {productData.reviewCount} reviews
                          </p>
                        </div>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((stars) => (
                            <div
                              key={stars}
                              className="flex items-center gap-2"
                            >
                              <span className="text-sm w-8">{stars}★</span>
                              <Progress
                                value={stars === 5 ? 70 : stars === 4 ? 20 : 5}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground w-8">
                                {stars === 5
                                  ? "70%"
                                  : stars === 4
                                  ? "20%"
                                  : "5%"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {productData.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback>{review.user[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">
                                  {review.user}
                                </span>
                                {review.verified && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-muted-foreground">
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
