import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/vendor/products - Get vendor's product offers
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get vendor info
        const { data: vendorData, error: vendorError } = await supabase
            .from('users')
            .select(`
                role,
                vendors(id, status)
            `)
            .eq('id', user.id)
            .single();

        if (vendorError || vendorData?.role !== 'vendor') {
            console.log('Vendor access check failed:', {
                vendorError,
                role: vendorData?.role,
                userId: user.id,
                vendors: vendorData?.vendors
            });
            return NextResponse.json({ error: "Forbidden: Vendor access required" }, { status: 403 });
        }

        const vendorRecord = Array.isArray(vendorData.vendors) ? vendorData.vendors[0] : vendorData.vendors;
        const vendorId = vendorRecord?.id;
        console.log('Vendor record check:', {
            vendorData: vendorData?.vendors,
            vendorRecord,
            vendorId,
            isArray: Array.isArray(vendorData.vendors)
        });
        if (!vendorId) {
            return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const isActive = searchParams.get("isActive");
        const isFeatured = searchParams.get("isFeatured");
        const categoryId = searchParams.get("categoryId");
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build query for vendor's offers
        let query = supabase
            .from("product_offers")
            .select(`
                *,
                product_catalog!inner(
                    id,
                    name,
                    brand,
                    model,
                    category_id,
                    base_description,
                    specifications,
                    images,
                    slug,
                    is_active,
                    categories(
                        id,
                        name,
                        slug
                    )
                )
            `, { count: "exact" })
            .eq("vendor_id", vendorId);

        // Apply filters
        if (isActive !== null && isActive !== undefined && isActive !== "") {
            query = query.eq("is_active", isActive === "true");
        }

        if (isFeatured !== null && isFeatured !== undefined && isFeatured !== "") {
            query = query.eq("is_featured", isFeatured === "true");
        }

        if (categoryId) {
            query = query.eq("product_catalog.category_id", categoryId);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%,product_catalog.name.ilike.%${search}%,product_catalog.brand.ilike.%${search}%`);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: offers, error: offersError, count } = await query;

        if (offersError) {
            console.error("Error fetching vendor offers:", offersError);
            return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
        }

        // Transform offers to include catalog info
        const products = offers?.map((offer: any) => ({
            id: offer.id,
            catalog_id: offer.catalog_id,
            offer_id: offer.id,
            // Catalog info
            name: offer.product_catalog?.name,
            brand: offer.product_catalog?.brand,
            model: offer.product_catalog?.model,
            category_id: offer.product_catalog?.category_id,
            categories: offer.product_catalog?.categories,
            base_description: offer.product_catalog?.base_description,
            specifications: offer.product_catalog?.specifications,
            catalog_images: offer.product_catalog?.images,
            slug: offer.product_catalog?.slug,
            catalog_active: offer.product_catalog?.catalog_active,
            // Offer-specific info
            vendor_id: offer.vendor_id,
            price: offer.price,
            compare_price: offer.compare_price,
            condition: offer.condition,
            color: offer.color,
            size: offer.size,
            storage: offer.storage,
            other_variants: offer.other_variants,
            sku: offer.sku,
            inventory_quantity: offer.inventory_quantity,
            track_inventory: offer.track_inventory,
            title: offer.title,
            description: offer.description,
            images: offer.images,
            is_active: offer.is_active,
            is_featured: offer.is_featured,
            created_at: offer.created_at,
            updated_at: offer.updated_at
        })) || [];

        // Get vendor statistics
        const { data: stats, error: statsError } = await supabase
            .from("product_offers")
            .select("is_active, is_featured")
            .eq("vendor_id", vendorId);

        let statistics = {
            total: 0,
            active: 0,
            inactive: 0,
            featured: 0,
        };

        if (!statsError && stats) {
            statistics.total = stats.length;
            statistics.active = stats.filter(p => p.is_active).length;
            statistics.inactive = stats.filter(p => !p.is_active).length;
            statistics.featured = stats.filter(p => p.is_featured).length;
        }

        return NextResponse.json({
            products,
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
                categoryId,
                search,
                sortBy,
                sortOrder,
            },
        });
    } catch (error) {
        console.error("Error in vendor products API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/vendor/products - Create new product offer (with smart catalog linking)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get vendor info
        const { data: vendorData, error: vendorError } = await supabase
            .from('users')
            .select(`
                role,
                vendors(id, status)
            `)
            .eq('id', user.id)
            .single();

        if (vendorError || vendorData?.role !== 'vendor') {
            console.log('Vendor access check failed:', {
                vendorError,
                role: vendorData?.role,
                userId: user.id,
                vendors: vendorData?.vendors
            });
            return NextResponse.json({ error: "Forbidden: Vendor access required" }, { status: 403 });
        }

        const vendorRecord = Array.isArray(vendorData.vendors) ? vendorData.vendors[0] : vendorData.vendors;
        const vendorId = vendorRecord?.id;
        console.log('Vendor record check:', {
            vendorData: vendorData?.vendors,
            vendorRecord,
            vendorId,
            isArray: Array.isArray(vendorData.vendors)
        });
        if (!vendorId) {
            return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
        }

        const body = await request.json();
        const {
            productName,
            categoryId,
            catalogId, // Optional: link to specific catalog item
            price,
            comparePrice,
            condition = 'new',
            color,
            size,
            storage,
            otherVariants,
            inventoryQuantity = 0,
            trackInventory = true,
            title,
            description,
            images = [],
            isFeatured = false
        } = body;

        // Check platform settings for product approval
        const { data: platformSettings } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['auto_approve_products', 'require_product_moderation']);

        const autoApproveProducts = platformSettings?.find(s => s.key === 'auto_approve_products')?.value === 'true';
        const requireModeration = platformSettings?.find(s => s.key === 'require_product_moderation')?.value === 'true';

        // Auto-generate SKU
        const generateSKU = () => {
            const timestamp = Date.now().toString().slice(-6);
            const vendorPrefix = vendorId.toString().slice(0, 8).toUpperCase();
            const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
            return `${vendorPrefix}-${timestamp}-${randomSuffix}`;
        };

        const autoSku = generateSKU();

        let finalCatalogId = catalogId;

        // If no catalog ID provided, try to find or create catalog item
        if (!finalCatalogId) {
            // Use smart matching to find existing catalog item
            const { data: suggestions } = await supabase
                .rpc('find_similar_products_smart', {
                    product_name: productName,
                    category_id: categoryId,
                    similarity_threshold: 0.8 // High threshold for auto-linking
                });

            if (suggestions && suggestions.length > 0 && suggestions[0].confidence_score >= 0.8) {
                finalCatalogId = suggestions[0].catalog_id;
            } else {
                // Create new catalog item
                const { data: extractedBrand } = await supabase
                    .rpc('extract_brand_from_text', {
                        product_text: productName
                    });

                const catalogData = {
                    name: productName,
                    brand: extractedBrand || null,
                    category_id: categoryId,
                    base_description: description || '',
                    specifications: {},
                    images: images || [],
                    slug: productName.toLowerCase()
                        .replace(/[^a-z0-9\s]/g, '')
                        .replace(/\s+/g, '-')
                        .substring(0, 100),
                    created_by: user.id,
                    is_active: true
                };

                const { data: newCatalog, error: catalogError } = await supabase
                    .from('product_catalog')
                    .insert(catalogData)
                    .select('id')
                    .single();

                if (catalogError) {
                    console.error("Error creating catalog:", catalogError);
                    return NextResponse.json({ error: "Failed to create catalog entry" }, { status: 500 });
                }

                finalCatalogId = newCatalog.id;

                // Generate keywords
                const keywords = productName.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, ' ')
                    .split(' ')
                    .filter((word: string) => word.length > 2)
                    .slice(0, 10);

                if (keywords.length > 0) {
                    const keywordInserts = keywords.map((keyword: string) => ({
                        catalog_id: finalCatalogId,
                        keyword: keyword,
                        weight: keyword === extractedBrand?.toLowerCase() ? 3 : 1
                    }));

                    await supabase
                        .from('product_keywords')
                        .insert(keywordInserts);
                }
            }
        }

        // Create the product offer
        const offerData = {
            catalog_id: finalCatalogId,
            vendor_id: vendorId,
            price: parseFloat(price),
            compare_price: comparePrice ? parseFloat(comparePrice) : null,
            condition,
            color,
            size,
            storage,
            other_variants: otherVariants || {},
            sku: autoSku, // Use auto-generated SKU
            inventory_quantity: parseInt(inventoryQuantity),
            track_inventory: trackInventory,
            title: title || productName,
            description: description || '',
            images: images || [],
            is_active: autoApproveProducts && !requireModeration, // Respect platform settings
            is_featured: isFeatured
        };

        const { data: newOffer, error: offerError } = await supabase
            .from('product_offers')
            .insert(offerData)
            .select(`
                *,
                product_catalog!inner(
                    id,
                    name,
                    brand,
                    category_id,
                    categories(id, name, slug)
                )
            `)
            .single();

        if (offerError) {
            console.error("Error creating offer:", offerError);
            return NextResponse.json({ error: "Failed to create product offer" }, { status: 500 });
        }

        const isActive = autoApproveProducts && !requireModeration;
        const message = isActive
            ? "Product created and published successfully!"
            : "Product created successfully! It will be reviewed by admin before being published.";

        return NextResponse.json({
            success: true,
            message,
            product: newOffer,
            requiresApproval: !isActive
        });

    } catch (error) {
        console.error("Error in vendor product creation API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
