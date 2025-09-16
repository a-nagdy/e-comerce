import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/categories - Get all active categories (public access for vendors/customers)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated (no role restriction for reading categories)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");

        // Build query - only return active categories for non-admin users
        let query = supabase
            .from("categories")
            .select(`
                id,
                name,
                slug,
                description,
                image_url,
                parent_id,
                sort_order,
                is_active,
                parent:parent_id(
                    id,
                    name,
                    slug
                )
            `)
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        // Apply search filter if provided
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: categories, error: categoriesError } = await query;

        if (categoriesError) {
            console.error("Error fetching categories:", categoriesError);
            return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
        }

        return NextResponse.json({
            categories: categories || [],
        });
    } catch (error) {
        console.error("Error in categories API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
