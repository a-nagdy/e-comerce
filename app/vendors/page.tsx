import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Package } from "lucide-react"
import Link from "next/link"

// Mock data - will be replaced with real data from Supabase
const vendors = [
  {
    id: "1",
    businessName: "TechGear Pro",
    description: "Premium electronics and accessories for tech enthusiasts worldwide",
    rating: 4.8,
    reviewCount: 245,
    productCount: 89,
    location: "San Francisco, CA",
    categories: ["Electronics", "Accessories"],
    logoUrl: "/abstract-tech-logo.png",
  },
  {
    id: "2",
    businessName: "EcoWear",
    description: "Sustainable fashion made from organic and recycled materials",
    rating: 4.6,
    reviewCount: 156,
    productCount: 67,
    location: "Portland, OR",
    categories: ["Fashion", "Sustainable"],
    logoUrl: "/eco-logo.png",
  },
  {
    id: "3",
    businessName: "PhotoPro Equipment",
    description: "Professional photography gear and accessories for creators",
    rating: 4.9,
    reviewCount: 89,
    productCount: 45,
    location: "New York, NY",
    categories: ["Photography", "Professional"],
    logoUrl: "/photo-logo.jpg",
  },
  {
    id: "4",
    businessName: "FitTech Solutions",
    description: "Innovative fitness technology and wellness products",
    rating: 4.7,
    reviewCount: 198,
    productCount: 34,
    location: "Austin, TX",
    categories: ["Fitness", "Technology"],
    logoUrl: "/fitness-logo.png",
  },
]

export default function VendorsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Our Vendors</h1>
            <p className="text-muted-foreground">
              Discover amazing products from our trusted network of verified vendors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {vendor.businessName
                        .split(" ")
                        .map((word) => word[0])
                        .join("")}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{vendor.businessName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">{vendor.description}</p>

                  <div className="flex items-center justify-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(vendor.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{vendor.rating}</span>
                    <span className="text-sm text-muted-foreground">({vendor.reviewCount} reviews)</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{vendor.productCount} products</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{vendor.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {vendor.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/vendors/${vendor.id}`}>View Store</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Become a Vendor CTA */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Want to Sell on Our Marketplace?</h2>
                <p className="text-muted-foreground mb-6">
                  Join thousands of successful vendors and start selling your products to customers worldwide.
                </p>
                <Button size="lg" asChild>
                  <Link href="/auth/signup">Become a Vendor</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
