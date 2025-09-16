import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/catalog - Get all catalog items with their offers
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
        const categoryId = searchParams.get("categoryId");
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from("product_catalog")
            .select(`
                *,
                categories(
                    id,
                    name,
                    slug
                ),
                product_offers(
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
                    vendors(
                        id,
                        business_name,
                        status
                    )
                )
            `, { count: "exact" });

        // Apply filters
        if (isActive !== null && isActive !== undefined && isActive !== "") {
            query = query.eq("is_active", isActive === "true");
        }

        if (categoryId) {
            query = query.eq("category_id", categoryId);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,base_description.ilike.%${search}%`);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: catalogItems, error: catalogError, count } = await query;

        if (catalogError) {
            console.error("Error fetching catalog:", catalogError);
            return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 });
        }

        // Enrich catalog items with offer statistics
        const enrichedCatalog = catalogItems?.map(item => {
            const offers = item.product_offers || [];
            const activeOffers = offers.filter((o: any) => o.is_active);
            const bestOffer = activeOffers.reduce((best: any, current: any) => {
                return !best || current.price < best.price ? current : best;
            }, null);

            return {
                ...item,
                offer_stats: {
                    total_offers: offers.length,
                    active_offers: activeOffers.length,
                    vendors_count: new Set(offers.map((o: any) => o.vendor_id)).size,
                    price_range: activeOffers.length > 0 ? {
                        min: Math.min(...activeOffers.map((o: any) => o.price)),
                        max: Math.max(...activeOffers.map((o: any) => o.price))
                    } : null,
                    best_price: bestOffer?.price,
                    best_vendor: bestOffer?.vendors?.business_name,
                    total_inventory: activeOffers.reduce((sum: any, o: any) => sum + (o.inventory_quantity || 0), 0)
                }
            };
        }) || [];

        // Get statistics for all catalog items
        const { data: allCatalogItems } = await supabase
            .from("product_catalog")
            .select("is_active");

        const statistics = {
            total_catalog_items: allCatalogItems?.length || 0,
            active: allCatalogItems?.filter(p => p.is_active).length || 0,
            inactive: allCatalogItems?.filter(p => !p.is_active).length || 0,
        };

        return NextResponse.json({
            catalog: enrichedCatalog,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
            statistics,
            filters: {
                isActive,
                categoryId,
                search,
                sortBy,
                sortOrder,
            },
        });
    } catch (error) {
        console.error("Error in admin catalog API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/admin/catalog - Create new catalog item
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const {
            name,
            brand,
            model,
            category_id,
            base_description,
            specifications,
            images,
            gtin,
            mpn
        } = body;

        // Create slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100);

        // Check for existing catalog item with same name and category
        const { data: existing } = await supabase
            .from('product_catalog')
            .select('id')
            .eq('name', name)
            .eq('category_id', category_id)
            .single();

        if (existing) {
            return NextResponse.json({
                error: "A catalog item with this name already exists in this category"
            }, { status: 409 });
        }

        // Create catalog item
        const { data: catalogItem, error: catalogError } = await supabase
            .from('product_catalog')
            .insert({
                name,
                brand,
                model,
                category_id,
                base_description,
                specifications: specifications || {},
                images: images || [],
                gtin,
                mpn,
                slug,
                created_by: user.id,
                is_active: true
            })
            .select(`
                *,
                categories(id, name, slug)
            `)
            .single();

        if (catalogError) {
            console.error("Error creating catalog item:", catalogError);
            return NextResponse.json({ error: "Failed to create catalog item" }, { status: 500 });
        }

        // Generate keywords for better matching
        if (name) {
            const keywords = name.toLowerCase()
                .replace(/[^a-z0-9\s]/g, ' ')
                .split(' ')
                .filter((word: any) => word.length > 2)
                .slice(0, 10);

            if (keywords.length > 0) {
                const keywordInserts = keywords.map((keyword: any) => ({
                    catalog_id: catalogItem.id,
                    keyword: keyword,
                    weight: keyword === brand?.toLowerCase() ? 3 : 1
                }));

                await supabase
                    .from('product_keywords')
                    .insert(keywordInserts);
            }
        }

        return NextResponse.json({
            message: "Catalog item created successfully",
            catalog_item: catalogItem
        });

    } catch (error) {
        console.error("Error in catalog creation API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
