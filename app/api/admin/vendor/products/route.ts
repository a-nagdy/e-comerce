import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/vendor/products - Get all vendor products (product_offers)
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

        // Build query for vendor products (product_offers)
        let query = supabase
            .from("product_offers")
            .select(`
                id,
                catalog_id,
                vendor_id,
                price,
                compare_price,
                condition,
                color,
                size,
                storage,
                sku,
                inventory_quantity,
                title,
                description,
                images,
                is_active,
                is_featured,
                created_at,
                updated_at,
                product_catalog(
                    id,
                    name,
                    brand,
                    model,
                    category_id,
                    base_description,
                    specifications,
                    categories(
                        id,
                        name,
                        slug
                    )
                ),
                vendors(
                    id,
                    business_name,
                    status,
                    users(
                        full_name,
                        email
                    )
                )
            `, { count: "exact" });

        // Apply filters
        if (isActive !== null && isActive !== undefined && isActive !== "") {
            query = query.eq("is_active", isActive === "true");
        }

        if (isFeatured !== null && isFeatured !== undefined && isFeatured !== "") {
            query = query.eq("is_featured", isFeatured === "true");
        }

        if (vendorId) {
            query = query.eq("vendor_id", vendorId);
        }

        if (categoryId) {
            query = query.eq("product_catalog.category_id", categoryId);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%,product_catalog.name.ilike.%${search}%,product_catalog.brand.ilike.%${search}%`);
        }

        // Apply sorting
        if (sortBy === "name") {
            query = query.order("product_catalog.name", { ascending: sortOrder === "asc" });
        } else {
            query = query.order(sortBy, { ascending: sortOrder === "asc" });
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: vendorProducts, error: productsError, count } = await query;

        if (productsError) {
            console.error("Error fetching vendor products:", productsError);
            return NextResponse.json({ error: "Failed to fetch vendor products" }, { status: 500 });
        }

        // Transform the data to match expected interface
        const products = vendorProducts?.map((offer: any) => ({
            id: offer.id,
            vendor_id: offer.vendor_id,
            category_id: offer.product_catalog?.category_id,
            name: offer.title || offer.product_catalog?.name,
            slug: offer.product_catalog?.slug || `${offer.sku}`,
            description: offer.description,
            short_description: offer.description,
            price: offer.price,
            compare_price: offer.compare_price,
            cost_price: 0, // Not stored in product_offers
            sku: offer.sku,
            barcode: "", // Not stored in product_offers
            track_inventory: true, // Assuming true for all offers
            inventory_quantity: offer.inventory_quantity,
            weight: 0, // Not stored in product_offers
            dimensions: {}, // Not stored in product_offers
            images: offer.images,
            is_active: offer.is_active,
            is_featured: offer.is_featured,
            seo_title: offer.title || offer.product_catalog?.name,
            seo_description: offer.description,
            created_at: offer.created_at,
            updated_at: offer.updated_at,
            vendors: offer.vendors,
            categories: offer.product_catalog?.categories,
            // Additional vendor product fields
            catalog_id: offer.catalog_id,
            condition: offer.condition,
            color: offer.color,
            size: offer.size,
            storage: offer.storage,
            product_catalog: offer.product_catalog
        })) || [];

        // Get statistics
        const { data: allOffers } = await supabase
            .from("product_offers")
            .select("is_active, is_featured");

        const statistics = {
            total: allOffers?.length || 0,
            active: allOffers?.filter(p => p.is_active).length || 0,
            inactive: allOffers?.filter(p => !p.is_active).length || 0,
            featured: allOffers?.filter(p => p.is_featured).length || 0,
        };

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
        console.error("Error in admin vendor products API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
