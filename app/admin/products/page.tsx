"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  category_id: string;
  base_description: string;
  specifications: any;
  images: string[];
  slug: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  categories: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface VendorOffer {
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
  product_catalog: CatalogProduct;
  vendors: {
    id: string;
    business_name: string;
    status: string;
  };
}

interface ProductsResponse {
  products: CatalogProduct[] | VendorOffer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    total: number;
    active: number;
    inactive: number;
    featured?: number;
  };
}

export default function AllProductsManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("catalog");
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [vendorOffers, setVendorOffers] = useState<VendorOffer[]>([]);
  const [catalogPagination, setCatalogPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [offersPagination, setOffersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [catalogStats, setCatalogStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [offersStats, setOffersStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0,
  });
  const [filters, setFilters] = useState({
    isActive: "",
    isFeatured: "",
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCatalogProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: catalogPagination.page.toString(),
        limit: catalogPagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.isActive) params.append("isActive", filters.isActive);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/admin/catalog?${params}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch catalog products: ${response.statusText}`
        );
      }

      const data = await response.json();
      setCatalogProducts(data.catalog as CatalogProduct[]);
      setCatalogPagination(data.pagination);
      setCatalogStats({
        total: data.statistics.total_catalog_items || 0,
        active: data.catalog?.filter((p: any) => p.is_active).length || 0,
        inactive: data.catalog?.filter((p: any) => !p.is_active).length || 0,
      });
    } catch (error) {
      console.error("Error fetching catalog products:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load catalog products"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendorOffers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: offersPagination.page.toString(),
        limit: offersPagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.isActive) params.append("isActive", filters.isActive);
      if (filters.isFeatured) params.append("isFeatured", filters.isFeatured);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/admin/vendor/products?${params}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch vendor offers: ${response.statusText}`
        );
      }

      const data: ProductsResponse = await response.json();
      setVendorOffers(data.products as VendorOffer[]);
      setOffersPagination(data.pagination);
      setOffersStats({
        total: data.statistics.total,
        active: data.statistics.active,
        inactive: data.statistics.inactive,
        featured: data.statistics.featured || 0,
      });
    } catch (error) {
      console.error("Error fetching vendor offers:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load vendor offers"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "catalog") {
      fetchCatalogProducts();
    } else {
      fetchVendorOffers();
    }
  }, [activeTab, catalogPagination.page, offersPagination.page, filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    if (activeTab === "catalog") {
      setCatalogPagination((prev) => ({ ...prev, page: 1 }));
    } else {
      setOffersPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const filterValue = value === "all" ? "" : value;
    setFilters((prev) => ({ ...prev, [key]: filterValue }));
    if (activeTab === "catalog") {
      setCatalogPagination((prev) => ({ ...prev, page: 1 }));
    } else {
      setOffersPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handlePageChange = (newPage: number) => {
    if (activeTab === "catalog") {
      setCatalogPagination((prev) => ({ ...prev, page: newPage }));
    } else {
      setOffersPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const updateCatalogProduct = async (productId: string, updates: any) => {
    try {
      setActionLoading(productId);

      const response = await fetch(`/api/admin/catalog/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update catalog product");
      }

      toast({
        title: "Success",
        description: "Catalog product updated successfully",
      });

      fetchCatalogProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update catalog product",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const updateVendorOffer = async (offerId: string, updates: any) => {
    try {
      setActionLoading(offerId);

      const response = await fetch(`/api/admin/vendor/products/${offerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update vendor offer");
      }

      toast({
        title: "Success",
        description: "Vendor offer updated successfully",
      });

      fetchVendorOffers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor offer",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const currentPagination =
    activeTab === "catalog" ? catalogPagination : offersPagination;
  const currentStats = activeTab === "catalog" ? catalogStats : offersStats;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Products</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button
            onClick={() =>
              activeTab === "catalog"
                ? fetchCatalogProducts()
                : fetchVendorOffers()
            }
            variant="outline"
            className="mt-4"
          >
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
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive view of catalog products and vendor offers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              activeTab === "catalog"
                ? fetchCatalogProducts()
                : fetchVendorOffers()
            }
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => router.push("/admin/catalog/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog">
            Product Catalog ({catalogStats.total})
          </TabsTrigger>
          <TabsTrigger value="offers">
            Vendor Offers ({offersStats.total})
          </TabsTrigger>
        </TabsList> */}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {currentStats.total}
                </p>
                <p className="text-sm text-gray-600">
                  Total {activeTab === "catalog" ? "Products" : "Offers"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {currentStats.active}
                </p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {currentStats.inactive}
                </p>
                <p className="text-sm text-gray-600">Inactive</p>
              </div>
            </CardContent>
          </Card>
          {activeTab === "offers" && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {offersStats.featured}
                  </p>
                  <p className="text-sm text-gray-600">Featured</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${
                    activeTab === "catalog"
                      ? "catalog products"
                      : "vendor offers"
                  }...`}
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <Select
                value={filters.isActive === "" ? "all" : filters.isActive}
                onValueChange={(value) => handleFilterChange("isActive", value)}
              >
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {activeTab === "offers" && (
                <Select
                  value={filters.isFeatured === "" ? "all" : filters.isFeatured}
                  onValueChange={(value) =>
                    handleFilterChange("isFeatured", value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Offers</SelectItem>
                    <SelectItem value="true">Featured</SelectItem>
                    <SelectItem value="false">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  {activeTab === "offers" && (
                    <SelectItem value="price">Price</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="catalog">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catalogProducts?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 max-w-xs truncate">
                                  {product.name}
                                </p>
                                {product.model && (
                                  <p className="text-sm text-gray-500">
                                    Model: {product.model}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.categories
                              ? product.categories.name
                              : "Uncategorized"}
                          </TableCell>
                          <TableCell>{product.brand || "No brand"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.is_active ? "default" : "secondary"
                              }
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === product.id}
                                onClick={() =>
                                  updateCatalogProduct(product.id, {
                                    is_active: !product.is_active,
                                  })
                                }
                              >
                                {product.is_active ? (
                                  <Ban className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* 
        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Offers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorOffers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {offer.images && offer.images.length > 0 ? (
                                  <img
                                    src={offer.images[0]}
                                    alt={
                                      offer.title || offer.product_catalog?.name
                                    }
                                    className="w-12 h-12 object-cover"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 max-w-xs truncate">
                                  {offer.title || offer.product_catalog?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  SKU: {offer.sku || "N/A"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">${offer.price}</p>
                              {offer.compare_price &&
                                offer.compare_price > offer.price && (
                                  <p className="text-sm text-gray-500 line-through">
                                    ${offer.compare_price}
                                  </p>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium">
                                {offer.vendors.business_name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={
                                  offer.is_active ? "default" : "secondary"
                                }
                              >
                                {offer.is_active ? "Active" : "Inactive"}
                              </Badge>
                              {offer.is_featured && (
                                <Badge
                                  variant="outline"
                                  className="text-yellow-600"
                                >
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                offer.inventory_quantity > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {offer.inventory_quantity} units
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === offer.id}
                                onClick={() =>
                                  updateVendorOffer(offer.id, {
                                    is_active: !offer.is_active,
                                  })
                                }
                              >
                                {offer.is_active ? (
                                  <Ban className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === offer.id}
                                onClick={() =>
                                  updateVendorOffer(offer.id, {
                                    is_featured: !offer.is_featured,
                                  })
                                }
                              >
                                {offer.is_featured ? (
                                  <StarOff className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <Star className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {(currentPagination.page - 1) * currentPagination.limit + 1}{" "}
            to{" "}
            {Math.min(
              currentPagination.page * currentPagination.limit,
              currentPagination.total
            )}{" "}
            of {currentPagination.total}{" "}
            {activeTab === "catalog" ? "products" : "offers"}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPagination.page <= 1}
              onClick={() => handlePageChange(currentPagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, currentPagination.totalPages) },
                (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={
                        currentPagination.page === page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPagination.page >= currentPagination.totalPages}
              onClick={() => handlePageChange(currentPagination.page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
