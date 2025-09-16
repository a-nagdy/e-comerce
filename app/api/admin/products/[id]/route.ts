import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/products/[id] - Get specific product details
export async function GET(
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

        // Get product details with vendor and category information
        const { data: product, error: productError } = await supabase
            .from("products")
            .select(`
        *,
        vendors!inner(
          id,
          business_name,
          status,
          users!inner(
            full_name,
            email
          )
        ),
        categories(
          id,
          name,
          slug
        ),
        product_variants(*)
      `)
            .eq("id", params.id)
            .single();

        if (productError) {
            console.error("Error fetching product:", productError);
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Get product order statistics
        const { data: orderItems, error: orderError } = await supabase
            .from("order_items")
            .select(`
        id,
        quantity,
        total_price,
        created_at,
        orders!inner(status)
      `)
            .eq("product_id", params.id);

        const orderStats = {
            totalSold: orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0,
            totalRevenue: orderItems?.reduce((sum, item) => sum + (parseFloat(item.total_price.toString()) || 0), 0) || 0,
            totalOrders: orderItems?.length || 0,
        };

        return NextResponse.json({
            product,
            orderStats,
        });
    } catch (error) {
        console.error("Error in admin product details API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/admin/products/[id] - Update product (moderation)
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
        const {
            is_active,
            is_featured,
            name,
            description,
            price,
            category_id,
            moderation_notes
        } = body;

        // Update product
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (is_active !== undefined) updateData.is_active = is_active;
        if (is_featured !== undefined) updateData.is_featured = is_featured;
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (category_id) updateData.category_id = category_id;

        const { data: updatedProduct, error: updateError } = await supabase
            .from("products")
            .update(updateData)
            .eq("id", params.id)
            .select(`
        *,
        vendors!inner(
          id,
          business_name,
          users!inner(
            full_name,
            email
          )
        ),
        categories(
          id,
          name,
          slug
        )
      `)
            .single();

        if (updateError) {
            console.error("Error updating product:", updateError);
            return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
        }

        // TODO: Send notification to vendor if product status changed
        // This would be implemented with your notification service

        return NextResponse.json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error in admin product update API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/products/[id] - Delete product
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

        // Check if product has orders - don't delete if it does
        const { data: orderItems, error: orderError } = await supabase
            .from("order_items")
            .select("id")
            .eq("product_id", params.id)
            .limit(1);

        if (orderError) {
            console.error("Error checking product orders:", orderError);
            return NextResponse.json({ error: "Failed to check product orders" }, { status: 500 });
        }

        if (orderItems && orderItems.length > 0) {
            // Deactivate instead of delete if has orders
            const { error: deactivateError } = await supabase
                .from("products")
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq("id", params.id);

            if (deactivateError) {
                console.error("Error deactivating product:", deactivateError);
                return NextResponse.json({ error: "Failed to deactivate product" }, { status: 500 });
            }

            return NextResponse.json({
                message: "Product deactivated (has order history)"
            });
        }

        // Safe to delete - no order history
        const { error: deleteError } = await supabase
            .from("products")
            .delete()
            .eq("id", params.id);

        if (deleteError) {
            console.error("Error deleting product:", deleteError);
            return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
        }

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error in admin product delete API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
