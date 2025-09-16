import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/products/auto-link - Auto-link product to catalog or create new
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user role and vendor info
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
                role,
                vendors(id, status)
            `)
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isAdmin = userData.role === 'admin';
        const isVendor = userData.role === 'vendor';
        const vendorId = isVendor ? userData.vendors?.[0]?.id : null;

        if (!isAdmin && !isVendor) {
            return NextResponse.json({ error: "Unauthorized: Must be admin or vendor" }, { status: 403 });
        }

        const body = await request.json();
        const {
            productName,
            categoryId,
            forceNewCatalog = false, // Force create new catalog entry
            catalogId = null, // Explicitly link to this catalog ID
            productData // Full product data (price, description, etc.)
        } = body;

        let finalCatalogId = catalogId;
        let action = 'linked'; // 'linked' or 'created'

        // If not forcing new catalog and no explicit catalog ID provided, try to find matches
        if (!forceNewCatalog && !catalogId) {
            const { data: suggestions } = await supabase
                .rpc('find_similar_products_smart', {
                    product_name: productName,
                    category_id: categoryId,
                    similarity_threshold: 0.95 // High threshold for auto-linking
                });

            // Auto-link if high confidence match (95%+)
            if (suggestions && suggestions.length > 0 && suggestions[0].confidence_score >= 0.95) {
                finalCatalogId = suggestions[0].catalog_id;
                action = 'linked';
            }
        }

        // Create new catalog entry if no match found or forced
        if (!finalCatalogId) {
            // Extract brand from product name
            const { data: extractedBrand } = await supabase
                .rpc('extract_brand_from_text', {
                    product_text: productName
                });

            const catalogData = {
                name: productName,
                brand: extractedBrand || null,
                category_id: categoryId,
                base_description: productData.description || '',
                specifications: productData.specifications || {},
                images: productData.images || [],
                gtin: productData.gtin || null,
                mpn: productData.mpn || null,
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
            action = 'created';

            // Generate keywords for better matching in the future
            const keywords = productName.toLowerCase()
                .replace(/[^a-z0-9\s]/g, ' ')
                .split(' ')
                .filter((word: string) => word.length > 2)
                .slice(0, 10); // Limit to 10 keywords

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

        // Create the product offer
        const offerData = {
            catalog_id: finalCatalogId,
            vendor_id: isAdmin ? null : vendorId, // Admin products don't have vendor_id
            price: productData.price,
            compare_price: productData.comparePrice || null,
            condition: productData.condition || 'new',
            color: productData.color || null,
            size: productData.size || null,
            storage: productData.storage || null,
            other_variants: productData.otherVariants || {},
            sku: productData.sku || null,
            inventory_quantity: productData.inventoryQuantity || 0,
            track_inventory: productData.trackInventory !== false,
            title: productData.title || productName,
            description: productData.description || '',
            images: productData.images || [],
            is_active: true,
            is_featured: productData.isFeatured || false
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
                    category_id
                )
            `)
            .single();

        if (offerError) {
            console.error("Error creating offer:", offerError);
            return NextResponse.json({ error: "Failed to create product offer" }, { status: 500 });
        }

        // Record feedback if this was an auto-link
        if (action === 'linked' && catalogId) {
            await supabase
                .from('product_match_feedback')
                .insert({
                    input_text: productName,
                    suggested_catalog_id: finalCatalogId,
                    user_choice: true,
                    actual_catalog_id: finalCatalogId,
                    confidence_score: 0.95,
                    user_id: user.id,
                    category_id: categoryId
                });
        }

        return NextResponse.json({
            success: true,
            action: action, // 'linked' or 'created'
            catalogId: finalCatalogId,
            offerId: newOffer.id,
            product: newOffer
        });

    } catch (error) {
        console.error("Error in auto-link API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
