import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/products - Get all products with filtering
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated and is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: adminUser, error: adminError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (adminError || adminUser?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const isActive = searchParams.get("isActive");
        const isFeatured = searchParams.get("isFeatured");
        const vendorId = searchParams.get("vendorId");
        const categoryId = searchParams.get("categoryId");
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build query for catalog-based products
        let query = supabase
            .from("product_catalog")
            .select(`
        *,
        categories(
          id,
          name,
          slug
        ),
        product_offers!inner(
          id,
          vendor_id,
          price,
          compare_price,
          condition,
          color,
          size,
          storage,
          sku,
          inventory_quantity,
          track_inventory,
          title,
          description,
          images,
          is_active,
          is_featured,
          created_at,
          updated_at,
          vendors!inner(
            id,
            business_name,
            status,
            users!inner(
              full_name,
              email
            )
          )
        )
      `, { count: "exact" });

        // Apply filters
        if (isActive !== null && isActive !== undefined && isActive !== "") {
            // Filter by catalog active status AND offer active status
            query = query.eq("is_active", isActive === "true");
            query = query.eq("product_offers.is_active", isActive === "true");
        }

        if (isFeatured !== null && isFeatured !== undefined && isFeatured !== "") {
            query = query.eq("product_offers.is_featured", isFeatured === "true");
        }

        if (vendorId) {
            query = query.eq("product_offers.vendor_id", vendorId);
        }

        if (categoryId) {
            query = query.eq("category_id", categoryId);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,base_description.ilike.%${search}%,brand.ilike.%${search}%,product_offers.sku.ilike.%${search}%,product_offers.title.ilike.%${search}%`);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: catalogProducts, error: productsError, count } = await query;

        if (productsError) {
            console.error("Error fetching products:", productsError);
            return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
        }

        // Transform catalog data to flatten offers for easier consumption
        const products = catalogProducts?.map(catalog => {
            // Get the best offer (lowest price) as primary
            const offers = catalog.product_offers || [];
            const bestOffer = offers.reduce((best: any, current: any) => {
                return !best || current.price < best.price ? current : best;
            }, null);

            return {
                id: catalog.id,
                name: catalog.name,
                brand: catalog.brand,
                catalog_id: catalog.id,
                category_id: catalog.category_id,
                categories: catalog.categories,
                base_description: catalog.base_description,
                specifications: catalog.specifications,
                images: catalog.images,
                slug: catalog.slug,
                is_active: catalog.is_active,
                created_at: catalog.created_at,
                updated_at: catalog.updated_at,
                // Primary offer details
                offer_id: bestOffer?.id,
                vendor_id: bestOffer?.vendor_id,
                vendors: bestOffer?.vendors,
                price: bestOffer?.price,
                compare_price: bestOffer?.compare_price,
                condition: bestOffer?.condition,
                sku: bestOffer?.sku,
                inventory_quantity: bestOffer?.inventory_quantity,
                track_inventory: bestOffer?.track_inventory,
                is_featured: bestOffer?.is_featured,
                // Additional info
                total_offers: offers.length,
                offers: offers,
                variant_info: offers.length > 1 ? {
                    colors: [...new Set(offers.map((o: any) => o.color).filter(Boolean))],
                    sizes: [...new Set(offers.map((o: any) => o.size).filter(Boolean))],
                    storage: [...new Set(offers.map((o: any) => o.storage).filter(Boolean))]
                } : null
            };
        }) || [];

        // Get catalog and offer statistics
        const { data: catalogStats } = await supabase.rpc('get_catalog_statistics');

        let statistics = {
            total: 0,
            active: 0,
            inactive: 0,
            featured: 0,
            catalog_items: 0,
            total_offers: 0,
        };

        if (catalogStats && catalogStats.length > 0) {
            const stats = catalogStats[0];
            statistics.catalog_items = stats.total_catalog_items || 0;
            statistics.total_offers = stats.total_offers || 0;
            statistics.active = stats.active_offers || 0;
        }

        // Get featured count from current results
        statistics.featured = products.filter(p => p.is_featured).length;
        statistics.total = products.length;
        statistics.inactive = statistics.total - statistics.active;

        return NextResponse.json({
            products: products || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
            statistics,
            filters: {
                isActive,
                isFeatured,
                vendorId,
                categoryId,
                search,
                sortBy,
                sortOrder,
            },
        });
    } catch (error) {
        console.error("Error in admin products API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
