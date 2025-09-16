import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated (allow admin and vendor to read categories)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (userError || !userData || !['admin', 'vendor'].includes(userData.role)) {
            return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const isActive = searchParams.get("isActive");
        const search = searchParams.get("search");

        // Build query
        let query = supabase
            .from("categories")
            .select(`
        *,
        parent:parent_id(
          id,
          name,
          slug
        )
      `)
            .order("sort_order", { ascending: true });

        // Apply filters
        if (isActive !== null && isActive !== undefined && isActive !== "") {
            query = query.eq("is_active", isActive === "true");
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: categories, error: categoriesError } = await query;

        if (categoriesError) {
            console.error("Error fetching categories:", categoriesError);
            return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
        }

        // Get category statistics
        const { data: stats, error: statsError } = await supabase
            .from("categories")
            .select("is_active");

        let statistics = {
            total: 0,
            active: 0,
            inactive: 0,
        };

        if (!statsError && stats) {
            statistics.total = stats.length;
            statistics.active = stats.filter(c => c.is_active).length;
            statistics.inactive = stats.filter(c => !c.is_active).length;
        }

        return NextResponse.json({
            categories: categories || [],
            statistics,
        });
    } catch (error) {
        console.error("Error in admin categories API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/admin/categories - Create new category
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
        const { name, slug, description, image_url, parent_id, sort_order, is_active } = body;

        // Validate required fields
        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        // Check if slug is unique
        const { data: existingCategory, error: slugError } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", slug)
            .single();

        if (existingCategory) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
        }

        // Create category
        const { data: newCategory, error: createError } = await supabase
            .from("categories")
            .insert({
                name,
                slug,
                description,
                image_url,
                parent_id,
                sort_order: sort_order || 0,
                is_active: is_active !== undefined ? is_active : true,
            })
            .select()
            .single();

        if (createError) {
            console.error("Error creating category:", createError);
            return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
        }

        return NextResponse.json({
            message: "Category created successfully",
            category: newCategory
        }, { status: 201 });
    } catch (error) {
        console.error("Error in admin category creation API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
