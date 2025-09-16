import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/vendors/[id] - Get specific vendor details
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

        // Get vendor details with user and product information
        const { data: vendor, error: vendorError } = await supabase
            .from("vendors")
            .select(`
        *,
        users!inner(
          id,
          email,
          full_name,
          phone,
          avatar_url,
          created_at
        )
      `)
            .eq("id", params.id)
            .single();

        if (vendorError) {
            console.error("Error fetching vendor:", vendorError);
            return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        }

        // Get vendor's products count and stats
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("id, is_active, created_at")
            .eq("vendor_id", params.id);

        const productStats = {
            total: products?.length || 0,
            active: products?.filter(p => p.is_active).length || 0,
            inactive: products?.filter(p => !p.is_active).length || 0,
        };

        // Get vendor's orders stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: orders, error: ordersError } = await supabase
            .from("order_items")
            .select(`
        id,
        total_price,
        created_at,
        orders!inner(status)
      `)
            .eq("vendor_id", params.id)
            .gte("created_at", thirtyDaysAgo.toISOString());

        const orderStats = {
            totalOrders: orders?.length || 0,
            totalRevenue: orders?.reduce((sum, order) => sum + (parseFloat(order.total_price.toString()) || 0), 0) || 0,
            completedOrders: orders?.filter((o: any) => o.orders?.status === "delivered").length || 0,
        };

        return NextResponse.json({
            vendor,
            productStats,
            orderStats,
        });
    } catch (error) {
        console.error("Error in admin vendor details API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/admin/vendors/[id] - Update vendor status and details
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
            status,
            commission_rate,
            business_name,
            business_description,
            business_address,
            business_phone,
            business_email,
            rejection_reason
        } = body;

        // Validate status
        const validStatuses = ["pending", "approved", "rejected", "suspended"];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Update vendor
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (status) updateData.status = status;
        if (commission_rate !== undefined) updateData.commission_rate = commission_rate;
        if (business_name) updateData.business_name = business_name;
        if (business_description) updateData.business_description = business_description;
        if (business_address) updateData.business_address = business_address;
        if (business_phone) updateData.business_phone = business_phone;
        if (business_email) updateData.business_email = business_email;

        const { data: updatedVendor, error: updateError } = await supabase
            .from("vendors")
            .update(updateData)
            .eq("id", params.id)
            .select(`
        *,
        users!inner(
          id,
          email,
          full_name,
          phone
        )
      `)
            .single();

        if (updateError) {
            console.error("Error updating vendor:", updateError);
            return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
        }

        // TODO: Send notification email to vendor about status change
        // This would be implemented with your email service

        return NextResponse.json({
            message: "Vendor updated successfully",
            vendor: updatedVendor
        });
    } catch (error) {
        console.error("Error in admin vendor update API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
