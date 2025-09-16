import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/products/suggestions - Live product suggestions for matching
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");
        const categoryId = searchParams.get("categoryId");
        const limit = parseInt(searchParams.get("limit") || "5");

        if (!query || query.length < 3) {
            return NextResponse.json({ suggestions: [] });
        }

        // Use the smart matching function with 50% threshold for better brand matching
        const { data: suggestions, error: suggestionsError } = await supabase
            .rpc('find_similar_products_smart', {
                product_name: query,
                category_id: categoryId || null,
                similarity_threshold: 0.5
            });

        if (suggestionsError) {
            console.error("Error getting suggestions:", suggestionsError);
            return NextResponse.json({ suggestions: [] });
        }

        // Get offer counts and best prices for each suggestion
        const enrichedSuggestions = await Promise.all(
            (suggestions || []).slice(0, limit).map(async (suggestion: any) => {
                // Get best offer for this catalog item
                const { data: bestOffer } = await supabase
                    .rpc('get_best_offer', {
                        catalog_item_id: suggestion.catalog_id
                    });

                // Get total offer count
                const { count: offerCount } = await supabase
                    .from('product_offers')
                    .select('*', { count: 'exact', head: true })
                    .eq('catalog_id', suggestion.catalog_id)
                    .eq('is_active', true);

                return {
                    ...suggestion,
                    bestPrice: bestOffer?.[0]?.best_price || null,
                    vendorCount: offerCount || 0,
                    bestVendor: bestOffer?.[0]?.vendor_name || null
                };
            })
        );

        return NextResponse.json({
            suggestions: enrichedSuggestions,
            query: query,
            hasMatches: enrichedSuggestions.length > 0
        });

    } catch (error) {
        console.error("Error in product suggestions API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

