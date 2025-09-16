"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Package, Clock, Shield, Truck, MessageCircle, Share2 } from "lucide-react"
import { use } from "react"

// Mock data - will be replaced with real data from Supabase
const vendorData = {
  id: "1",
  businessName: "TechGear Pro",
  description:
    "Premium electronics and accessories for tech enthusiasts worldwide. We specialize in cutting-edge technology products that enhance your digital lifestyle.",
  rating: 4.8,
  reviewCount: 245,
  productCount: 89,
  location: "San Francisco, CA",
  joinDate: "2023-01-15",
  responseTime: "Within 2 hours",
  shippingPolicy: "Free shipping on orders over $50",
  returnPolicy: "30-day return policy",
  logo: "/abstract-tech-logo.png",
  banner: "/tech-store-banner.png",
  categories: ["Electronics", "Accessories", "Audio"],
  products: [
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      price: 79.99,
      comparePrice: 99.99,
      images: ["/wireless-headphones.png"],
      vendor: { businessName: "TechGear Pro" },
      rating: 4.5,
      reviewCount: 128,
      isOnSale: true,
    },
    {
      id: "2",
      name: "Smart Fitness Watch",
      price: 199.99,
      images: ["/fitness-watch.png"],
      vendor: { businessName: "TechGear Pro" },
      rating: 4.8,
      reviewCount: 89,
    },
    {
      id: "4",
      name: "Professional Camera Lens",
      price: 449.99,
      images: ["/camera-lens.png"],
      vendor: { businessName: "TechGear Pro" },
      rating: 4.9,
      reviewCount: 34,
    },
  ],
  reviews: [
    {
      id: "1",
      user: "John D.",
      rating: 5,
      comment: "Excellent service and fast shipping. Products are exactly as described.",
      date: "2024-11-15",
    },
    {
      id: "2",
      user: "Sarah M.",
      rating: 4,
      comment: "Great quality products. Had a question and they responded quickly.",
      date: "2024-11-10",
    },
    {
      id: "3",
      user: "Mike R.",
      rating: 5,
      comment: "Best tech store on the platform. Highly recommend!",
      date: "2024-11-05",
    },
  ],
}

export default function VendorStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Store Banner */}
        <div className="relative h-48 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container h-full flex items-end pb-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={vendorData.logo || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {vendorData.businessName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{vendorData.businessName}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{vendorData.rating}</span>
                    <span>({vendorData.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{vendorData.productCount} products</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{vendorData.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Store Info Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-sm text-muted-foreground">{vendorData.responseTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Shipping</p>
                      <p className="text-sm text-muted-foreground">{vendorData.shippingPolicy}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Returns</p>
                      <p className="text-sm text-muted-foreground">{vendorData.returnPolicy}</p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Store
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Store
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {vendorData.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="products" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="products">Products ({vendorData.productCount})</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({vendorData.reviewCount})</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendorData.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Load More */}
                  <div className="text-center">
                    <Button variant="outline">Load More Products</Button>
                  </div>
                </TabsContent>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {vendorData.businessName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed mb-6">{vendorData.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">Store Details</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Member since:</span>
                              <span>{new Date(vendorData.joinDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Location:</span>
                              <span>{vendorData.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total products:</span>
                              <span>{vendorData.productCount}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Policies</h3>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Shipping:</span>
                              <p className="text-muted-foreground">{vendorData.shippingPolicy}</p>
                            </div>
                            <div>
                              <span className="font-medium">Returns:</span>
                              <p className="text-muted-foreground">{vendorData.returnPolicy}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <div className="space-y-4">
                    {vendorData.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback>{review.user[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{review.user}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-muted-foreground">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
