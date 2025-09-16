import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/orders - Get all orders with filtering
export async function GET(request: NextRequest) {
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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const paymentStatus = searchParams.get("paymentStatus");
        const customerId = searchParams.get("customerId");
        const search = searchParams.get("search");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from("orders")
            .select(`
        *,
        users!customer_id(
          id,
          full_name,
          email
        ),
        order_items(
          id,
          quantity,
          unit_price,
          total_price,
          products(
            id,
            name,
            images
          ),
          vendors(
            id,
            business_name
          )
        )
      `, { count: "exact" });

        // Apply filters
        if (status) {
            query = query.eq("status", status);
        }

        if (paymentStatus) {
            query = query.eq("payment_status", paymentStatus);
        }

        if (customerId) {
            query = query.eq("customer_id", customerId);
        }

        if (search) {
            query = query.or(`order_number.ilike.%${search}%`);
        }

        if (dateFrom) {
            query = query.gte("created_at", dateFrom);
        }

        if (dateTo) {
            query = query.lte("created_at", dateTo);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: orders, error: ordersError, count } = await query;

        if (ordersError) {
            console.error("Error fetching orders:", ordersError);
            return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
        }

        // Get order statistics
        const { data: stats, error: statsError } = await supabase
            .from("orders")
            .select("status, payment_status, total_amount");

        let statistics = {
            total: 0,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            totalRevenue: 0,
            avgOrderValue: 0,
        };

        if (!statsError && stats) {
            statistics.total = stats.length;
            statistics.pending = stats.filter(o => o.status === "pending").length;
            statistics.processing = stats.filter(o => o.status === "processing").length;
            statistics.shipped = stats.filter(o => o.status === "shipped").length;
            statistics.delivered = stats.filter(o => o.status === "delivered").length;
            statistics.cancelled = stats.filter(o => o.status === "cancelled").length;

            const totalRevenue = stats.reduce((sum, order) => sum + (parseFloat(order.total_amount.toString()) || 0), 0);
            statistics.totalRevenue = totalRevenue;
            statistics.avgOrderValue = stats.length > 0 ? totalRevenue / stats.length : 0;
        }

        return NextResponse.json({
            orders: orders || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
            statistics,
            filters: {
                status,
                paymentStatus,
                customerId,
                search,
                dateFrom,
                dateTo,
                sortBy,
                sortOrder,
            },
        });
    } catch (error) {
        console.error("Error in admin orders API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
