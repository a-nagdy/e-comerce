import { CategoryCard } from "@/components/category/category-card";
import { Footer } from "@/components/layout/footer";
import { HeroSlider } from "@/components/layout/hero-slider";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getHeroSlides } from "@/lib/hero-slides";
import { getSiteSettings } from "@/lib/settings";
import { ArrowRight, Headphones, RefreshCw, Shield, Truck } from "lucide-react";
import Link from "next/link";

// Mock data - will be replaced with real data from Supabase
const featuredProducts = [
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
    vendor: { businessName: "FitTech Solutions" },
    rating: 4.8,
    reviewCount: 89,
  },
  {
    id: "3",
    name: "Organic Cotton T-Shirt",
    price: 24.99,
    comparePrice: 34.99,
    images: ["/cotton-t-shirt.jpg"],
    vendor: { businessName: "EcoWear" },
    rating: 4.3,
    reviewCount: 56,
    isOnSale: true,
  },
  {
    id: "4",
    name: "Professional Camera Lens",
    price: 449.99,
    images: ["/camera-lens.png"],
    vendor: { businessName: "PhotoPro Equipment" },
    rating: 4.9,
    reviewCount: 34,
  },
];

const categories = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    imageUrl: "/electronics-components.png",
    productCount: 1250,
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    imageUrl: "/diverse-fashion-collection.png",
    productCount: 890,
  },
  {
    id: "3",
    name: "Home & Garden",
    slug: "home-garden",
    imageUrl: "/lush-home-garden.png",
    productCount: 675,
  },
  {
    id: "4",
    name: "Sports",
    slug: "sports",
    imageUrl: "/diverse-group-playing-various-sports.png",
    productCount: 432,
  },
  {
    id: "5",
    name: "Books",
    slug: "books",
    imageUrl: "/stack-of-diverse-books.png",
    productCount: 298,
  },
  {
    id: "6",
    name: "Health & Beauty",
    slug: "health-beauty",
    imageUrl: "/health-beauty.jpg",
    productCount: 567,
  },
];

export default async function HomePage() {
  // Load site settings and hero slides from database
  const settings = await getSiteSettings();
  const heroSlides = await getHeroSlides();

  // Dynamic container class based on settings
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
    <div className="min-h-screen flex flex-col w-full">
      {/* <Header
        siteName={settings.siteName}
        siteLogo={settings.siteLogo}
        containerWidth={settings.containerWidth}
        stickyHeader={settings.stickyHeader}
        showHeroSearch={settings.showHeroSearch}
      /> */}

      <main className="flex-1">
        {/* Hero Slider */}
        <HeroSlider
          slides={heroSlides}
          showSearch={settings.showHeroSearch}
          containerClass={containerClass}
        />

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className={containerClass}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Free shipping on orders over $50
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment information is safe
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get help whenever you need it
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">
                  30-day return policy
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {settings.showFeaturedCategories && (
          <section className="py-16">
            <div className={containerClass}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Shop by Category</h2>
                <Button variant="outline" asChild>
                  <Link href="/categories">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        {settings.showFeaturedProducts && (
          <section className="py-16 bg-muted/30">
            <div className={containerClass}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <Button variant="outline" asChild>
                  <Link href="/products">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${
                  settings.productGridColumns === 2
                    ? "lg:grid-cols-2"
                    : settings.productGridColumns === 3
                    ? "lg:grid-cols-3"
                    : settings.productGridColumns === 5
                    ? "lg:grid-cols-5"
                    : "lg:grid-cols-4"
                }`}
              >
                {featuredProducts
                  .slice(0, settings.featuredProductsCount)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Vendor Spotlight */}
        {settings.showTopVendors && (
          <section className="py-16">
            <div className={containerClass}>
              <h2 className="text-3xl font-bold text-center mb-12">
                Trusted by Top Vendors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        TG
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">TechGear Pro</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Premium electronics and accessories for tech enthusiasts
                    </p>
                    <Badge variant="secondary">Electronics</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        EW
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">EcoWear</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sustainable fashion made from organic materials
                    </p>
                    <Badge variant="secondary">Fashion</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        PP
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">PhotoPro Equipment</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Professional photography gear and accessories
                    </p>
                    <Badge variant="secondary">Photography</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {settings.showTestimonials && (
          <section className="py-16 bg-muted/30">
            <div className={containerClass}>
              <h2 className="text-3xl font-bold text-center mb-12">
                What Our Customers Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      "Amazing quality products and fast shipping. I've been
                      shopping here for over a year and never disappointed!"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">JS</span>
                      </div>
                      <div>
                        <p className="font-medium">John Smith</p>
                        <p className="text-sm text-muted-foreground">
                          Verified Customer
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      "Great marketplace with reliable vendors. Customer service
                      is excellent and returns are hassle-free."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">MJ</span>
                      </div>
                      <div>
                        <p className="font-medium">Maria Johnson</p>
                        <p className="text-sm text-muted-foreground">
                          Verified Customer
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      "Love the variety of products available. Found exactly
                      what I was looking for at competitive prices."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">RW</span>
                      </div>
                      <div>
                        <p className="font-medium">Robert Wilson</p>
                        <p className="text-sm text-muted-foreground">
                          Verified Customer
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Section */}
        {settings.showNewsletterSignup && (
          <section className="py-16">
            <div className={containerClass}>
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                <p className="text-muted-foreground mb-8">
                  Subscribe to our newsletter and be the first to know about new
                  products, sales, and exclusive offers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1"
                  />
                  <Button>Subscribe</Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer
        siteName={settings.siteName}
        siteLogo={settings.siteLogo}
        containerWidth={settings.containerWidth}
        footerText={settings.footerText}
        showSocialLinks={settings.showSocialLinks}
        showNewsletterFooter={settings.showNewsletterFooter}
        showPaymentMethods={settings.showPaymentMethods}
        socialFacebook={settings.socialFacebook}
        socialTwitter={settings.socialTwitter}
        socialInstagram={settings.socialInstagram}
        socialLinkedin={settings.socialLinkedin}
        socialYoutube={settings.socialYoutube}
        socialTiktok={settings.socialTiktok}
      />
    </div>
  );
}
