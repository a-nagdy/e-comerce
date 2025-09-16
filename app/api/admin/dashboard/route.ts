import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/dashboard - Get dashboard analytics
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

        // Get date ranges
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Parallel queries for dashboard data
        const [
            usersResult,
            vendorsResult,
            productsResult,
            offersResult,
            ordersResult,
            recentOrdersResult,
            revenueResult,
        ] = await Promise.all([
            // Users statistics
            supabase
                .from("users")
                .select("role, created_at"),

            // Vendors statistics
            supabase
                .from("vendors")
                .select("status, created_at"),

            // Products statistics (using product_catalog as it represents the main product database)
            supabase
                .from("product_catalog")
                .select("is_active, created_at"),

            // Vendor offers statistics (product_offers)
            supabase
                .from("product_offers")
                .select("is_active, is_featured, created_at"),

            // Orders statistics
            supabase
                .from("orders")
                .select("status, payment_status, total_amount, created_at"),

            // Recent orders (last 10)
            supabase
                .from("orders")
                .select(`
          id,
          status,
          total_amount,
          created_at,
          users!user_id(
            full_name,
            email
          )
        `)
                .order("created_at", { ascending: false })
                .limit(10),

            // Revenue data for chart (last 30 days by day)
            supabase
                .from("orders")
                .select("total_amount, created_at")
                .gte("created_at", thirtyDaysAgo.toISOString())
                .eq("payment_status", "paid"),
        ]);

        // Process users data
        const usersData = usersResult.data || [];
        const userStats = {
            total: usersData.length,
            customers: usersData.filter(u => u.role === "customer").length,
            vendors: usersData.filter(u => u.role === "vendor").length,
            admins: usersData.filter(u => u.role === "admin").length,
            newThisWeek: usersData.filter(u => new Date(u.created_at) >= sevenDaysAgo).length,
        };

        // Process vendors data
        const vendorsData = vendorsResult.data || [];
        const vendorStats = {
            total: vendorsData.length,
            pending: vendorsData.filter(v => v.status === "pending").length,
            approved: vendorsData.filter(v => v.status === "approved").length,
            rejected: vendorsData.filter(v => v.status === "rejected").length,
            suspended: vendorsData.filter(v => v.status === "suspended").length,
            newThisWeek: vendorsData.filter(v => new Date(v.created_at) >= sevenDaysAgo).length,
        };

        // Process product catalog data
        const productsData = productsResult.data || [];
        console.log('Product catalog data debug:', {
            totalProducts: productsData.length,
            sampleProduct: productsData[0],
            activeProducts: productsData.filter(p => p.is_active).length,
            inactiveProducts: productsData.filter(p => !p.is_active).length
        });

        const productStats = {
            total: productsData.length,
            active: productsData.filter(p => p.is_active).length,
            inactive: productsData.filter(p => !p.is_active).length,
            newThisWeek: productsData.filter(p => new Date(p.created_at) >= sevenDaysAgo).length,
            pending: productsData.filter(p => !p.is_active).length, // Inactive catalog items
        };

        // Process vendor offers data
        const offersData = offersResult.data || [];
        console.log('Product offers data debug:', {
            totalOffers: offersData.length,
            sampleOffer: offersData[0],
            activeOffers: offersData.filter(o => o.is_active).length,
            inactiveOffers: offersData.filter(o => !o.is_active).length
        });

        const offerStats = {
            total: offersData.length,
            active: offersData.filter(o => o.is_active).length,
            inactive: offersData.filter(o => !o.is_active).length,
            featured: offersData.filter(o => o.is_featured).length,
            newThisWeek: offersData.filter(o => new Date(o.created_at) >= sevenDaysAgo).length,
        };

        // Process orders data
        const ordersData = ordersResult.data || [];
        const orderStats = {
            total: ordersData.length,
            pending: ordersData.filter(o => o.status === "pending").length,
            processing: ordersData.filter(o => o.status === "processing").length,
            shipped: ordersData.filter(o => o.status === "shipped").length,
            delivered: ordersData.filter(o => o.status === "delivered").length,
            cancelled: ordersData.filter(o => o.status === "cancelled").length,
            newThisWeek: ordersData.filter(o => new Date(o.created_at) >= sevenDaysAgo).length,
        };

        // Process revenue data
        const revenueData = revenueResult.data || [];
        const totalRevenue = revenueData.reduce((sum, order) => sum + (parseFloat(order.total_amount.toString()) || 0), 0);
        const thisWeekRevenue = revenueData
            .filter(o => new Date(o.created_at) >= sevenDaysAgo)
            .reduce((sum, order) => sum + (parseFloat(order.total_amount.toString()) || 0), 0);

        // Group revenue by day for chart
        const revenueByDay: { [key: string]: number } = {};
        revenueData.forEach(order => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            revenueByDay[date] = (revenueByDay[date] || 0) + (parseFloat(order.total_amount.toString()) || 0);
        });

        const revenueChart = Object.entries(revenueByDay)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Recent orders
        const recentOrders = recentOrdersResult.data || [];

        // Calculate growth percentages (simplified - would need historical data for accurate calculation)
        const overview = {
            totalUsers: userStats.total,
            totalVendors: vendorStats.approved,
            totalProducts: productStats.total, // Total catalog items
            totalOffers: offerStats.total, // Total vendor offers
            totalOrders: orderStats.total,
            totalRevenue,
            pendingVendors: vendorStats.pending,
            activeProducts: productStats.active,
            activeOffers: offerStats.active, // Active vendor offers
            pendingProducts: productStats.pending, // Inactive catalog items
            pendingOffers: offerStats.inactive, // Inactive vendor offers
            recentOrders: orderStats.newThisWeek,
        };

        return NextResponse.json({
            overview,
            userStats,
            vendorStats,
            productStats,
            offerStats,
            orderStats,
            revenueChart,
            recentOrders,
            analytics: {
                avgOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0,
                conversionRate: userStats.customers > 0 ? (orderStats.total / userStats.customers) * 100 : 0,
                weeklyRevenue: thisWeekRevenue,
                weeklyOrders: orderStats.newThisWeek,
            },
        });
    } catch (error) {
        console.error("Error in admin dashboard API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
