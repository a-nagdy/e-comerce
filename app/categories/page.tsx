import { CategoryCard } from "@/components/category/category-card";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/settings";

// Mock data - will be replaced with real data from Supabase
const allCategories = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    imageUrl: "/electronics-components.png",
    productCount: 1250,
  },
  {
    id: "2",
    name: "Fashion & Apparel",
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
    name: "Sports & Outdoors",
    slug: "sports",
    imageUrl: "/diverse-group-playing-various-sports.png",
    productCount: 432,
  },
  {
    id: "5",
    name: "Books & Media",
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
  {
    id: "7",
    name: "Automotive",
    slug: "automotive",
    imageUrl: "/classic-car-restoration.png",
    productCount: 234,
  },
  {
    id: "8",
    name: "Toys & Games",
    slug: "toys-games",
    imageUrl: "/colorful-toys-and-games.png",
    productCount: 345,
  },
];

export default async function CategoriesPage() {
  const settings = await getSiteSettings();

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
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className={containerClass}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">All Categories</h1>
            <p className="text-muted-foreground">
              Explore our wide range of product categories and find exactly what
              you're looking for.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
