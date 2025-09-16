import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Check if slug is unique (excluding current category)
        if (slug) {
            const { data: existingCategory, error: slugError } = await supabase
                .from("categories")
                .select("id")
                .eq("slug", slug)
                .neq("id", params.id)
                .single();

            if (existingCategory) {
                return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
            }
        }

        // Update category
        const updateData: any = {};
        if (name) updateData.name = name;
        if (slug) updateData.slug = slug;
        if (description !== undefined) updateData.description = description;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (parent_id !== undefined) updateData.parent_id = parent_id;
        if (sort_order !== undefined) updateData.sort_order = sort_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        const { data: updatedCategory, error: updateError } = await supabase
            .from("categories")
            .update(updateData)
            .eq("id", params.id)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating category:", updateError);
            return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
        }

        return NextResponse.json({
            message: "Category updated successfully",
            category: updatedCategory
        });
    } catch (error) {
        console.error("Error in admin category update API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Check if category has products
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("id")
            .eq("category_id", params.id)
            .limit(1);

        if (productsError) {
            console.error("Error checking category products:", productsError);
            return NextResponse.json({ error: "Failed to check category products" }, { status: 500 });
        }

        if (products && products.length > 0) {
            return NextResponse.json({
                error: "Cannot delete category with products. Move products to another category first."
            }, { status: 400 });
        }

        // Check if category has subcategories
        const { data: subcategories, error: subcategoriesError } = await supabase
            .from("categories")
            .select("id")
            .eq("parent_id", params.id)
            .limit(1);

        if (subcategoriesError) {
            console.error("Error checking subcategories:", subcategoriesError);
            return NextResponse.json({ error: "Failed to check subcategories" }, { status: 500 });
        }

        if (subcategories && subcategories.length > 0) {
            return NextResponse.json({
                error: "Cannot delete category with subcategories. Delete or move subcategories first."
            }, { status: 400 });
        }

        // Safe to delete
        const { error: deleteError } = await supabase
            .from("categories")
            .delete()
            .eq("id", params.id);

        if (deleteError) {
            console.error("Error deleting category:", deleteError);
            return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
        }

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error in admin category delete API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
