import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/vendor/products/[id] - Get single vendor product
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

        const { data: vendorProduct, error: productError } = await supabase
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
            `)
            .eq("id", params.id)
            .single();

        if (productError || !vendorProduct) {
            return NextResponse.json({ error: "Vendor product not found" }, { status: 404 });
        }

        return NextResponse.json({
            product: vendorProduct
        });

    } catch (error) {
        console.error("Error fetching vendor product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/admin/vendor/products/[id] - Update vendor product
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

        const updates = await request.json();

        // Only allow specific fields to be updated by admin
        const allowedFields = [
            'is_active',
            'is_featured',
            'price',
            'compare_price',
            'inventory_quantity',
            'title',
            'description'
        ];

        const sanitizedUpdates = Object.keys(updates)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {} as any);

        if (Object.keys(sanitizedUpdates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const { data: updatedProduct, error: updateError } = await supabase
            .from("product_offers")
            .update({
                ...sanitizedUpdates,
                updated_at: new Date().toISOString()
            })
            .eq("id", params.id)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating vendor product:", updateError);
            return NextResponse.json({ error: "Failed to update vendor product" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error in vendor product update:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
