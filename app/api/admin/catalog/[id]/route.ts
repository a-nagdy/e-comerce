import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/admin/catalog/[id] - Update catalog product
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
            'name',
            'brand',
            'model',
            'base_description',
            'specifications',
            'images'
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
            .from("product_catalog")
            .update({
                ...sanitizedUpdates,
                updated_at: new Date().toISOString()
            })
            .eq("id", params.id)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating catalog product:", updateError);
            return NextResponse.json({ error: "Failed to update catalog product" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error in catalog product update:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
