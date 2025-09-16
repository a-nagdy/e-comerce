"use client";

import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { getContainerClass, useSiteSettings } from "@/lib/settings-client";
import { Filter, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Mock data - will be replaced with real data from Supabase
const searchResults = [
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
    name: "Professional Camera Lens",
    price: 449.99,
    images: ["/camera-lens.png"],
    vendor: { businessName: "PhotoPro Equipment" },
    rating: 4.9,
    reviewCount: 34,
  },
];

const categories = [
  { id: "electronics", name: "Electronics", count: 1250 },
  { id: "fashion", name: "Fashion", count: 890 },
  { id: "home-garden", name: "Home & Garden", count: 675 },
  { id: "sports", name: "Sports", count: 432 },
];

const brands = [
  { id: "techgear", name: "TechGear Pro", count: 45 },
  { id: "fittech", name: "FitTech Solutions", count: 23 },
  { id: "photopro", name: "PhotoPro Equipment", count: 12 },
  { id: "ecowear", name: "EcoWear", count: 67 },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const settings = useSiteSettings();

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    }
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brandId]);
    } else {
      setSelectedBrands(selectedBrands.filter((id) => id !== brandId));
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 1000]);
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  const containerClass = getContainerClass(settings.containerWidth);
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className={containerClass}>
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2">{activeFiltersCount}</Badge>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {query ? `Search results for "${query}"` : "All Products"}
                </h1>
                <p className="text-muted-foreground">
                  {searchResults.length} products found
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm font-medium">Active filters:</span>
                {selectedCategories.map((categoryId) => {
                  const category = categories.find((c) => c.id === categoryId);
                  return (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="gap-1"
                    >
                      {category?.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleCategoryChange(categoryId, false)}
                      />
                    </Badge>
                  );
                })}
                {selectedBrands.map((brandId) => {
                  const brand = brands.find((b) => b.id === brandId);
                  return (
                    <Badge key={brandId} variant="secondary" className="gap-1">
                      {brand?.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleBrandChange(brandId, false)}
                      />
                    </Badge>
                  );
                })}
                {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <Badge variant="secondary" className="gap-1">
                    ${priceRange[0]} - ${priceRange[1]}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setPriceRange([0, 1000])}
                    />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div
              className={`space-y-6 ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              {/* Categories Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={category.id}
                        className="flex-1 cursor-pointer"
                      >
                        {category.name}
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        ({category.count})
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Price Range Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Price Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Brands Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {brands.map((brand) => (
                    <div key={brand.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand.id}
                        checked={selectedBrands.includes(brand.id)}
                        onCheckedChange={(checked) =>
                          handleBrandChange(brand.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={brand.id}
                        className="flex-1 cursor-pointer"
                      >
                        {brand.name}
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        ({brand.count})
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Search Results */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="default">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
