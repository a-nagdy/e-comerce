import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/vendors - Get all vendors with filtering
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
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        // Calculate offset
        const offset = (page - 1) * limit;

        // First, create missing vendor records for users with vendor role
        const { data: vendorUsers, error: vendorUsersError } = await supabase
            .from("users")
            .select("id, email, full_name, role")
            .eq("role", "vendor");

        if (vendorUsersError) {
            console.error("Error fetching vendor users:", vendorUsersError);
        }

        if (vendorUsers) {
            for (const user of vendorUsers) {
                // Check if vendor record exists
                const { data: existingVendor, error: vendorCheckError } = await supabase
                    .from("vendors")
                    .select("id")
                    .eq("user_id", user.id)
                    .single();

                if (vendorCheckError && vendorCheckError.code !== 'PGRST116') {
                    console.error("Error checking vendor:", vendorCheckError);
                }

                if (!existingVendor) {
                    const { error: insertError } = await supabase
                        .from("vendors")
                        .insert({
                            user_id: user.id,
                            business_name: user.full_name || "Unnamed Business",
                            business_description: "",
                            status: "pending",
                            commission_rate: 10.00
                        });

                    if (insertError) {
                        console.error("Error creating vendor record:", insertError);
                    }
                }
            }
        }

        // Build query with manual join (fetch vendors and users separately)
        let vendorQuery = supabase
            .from("vendors")
            .select("*", { count: "exact" });

        // Apply filters
        if (status) {
            vendorQuery = vendorQuery.eq("status", status);
        }

        if (search) {
            vendorQuery = vendorQuery.or(`business_name.ilike.%${search}%,business_description.ilike.%${search}%`);
        }

        // Apply sorting
        vendorQuery = vendorQuery.order(sortBy, { ascending: sortOrder === "asc" });

        // Apply pagination
        vendorQuery = vendorQuery.range(offset, offset + limit - 1);

        const { data: vendors, error: vendorsError, count } = await vendorQuery;

        if (vendorsError) {
            console.error("Error fetching vendors:", vendorsError);
            return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
        }

        // Fetch user data for all vendors
        let enrichedVendors = [];
        if (vendors && vendors.length > 0) {
            const userIds = vendors.map(v => v.user_id);
            const { data: users } = await supabase
                .from("users")
                .select("id, email, full_name, phone, role, avatar_url, created_at, updated_at")
                .in("id", userIds);

            // Create a map for quick lookup
            const userMap: Record<string, any> = {};
            if (users) {
                users.forEach(user => {
                    userMap[user.id] = user;
                });
            }

            // Enrich vendors with user data
            enrichedVendors = vendors.map(vendor => ({
                ...vendor,
                users: userMap[vendor.user_id] || null
            }));
        }

        // Get vendor statistics
        const { data: stats, error: statsError } = await supabase
            .from("vendors")
            .select("status");

        let statistics = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            suspended: 0,
        };

        if (!statsError && stats) {
            statistics.total = stats.length;
            statistics.pending = stats.filter(v => v.status === "pending").length;
            statistics.approved = stats.filter(v => v.status === "approved").length;
            statistics.rejected = stats.filter(v => v.status === "rejected").length;
            statistics.suspended = stats.filter(v => v.status === "suspended").length;
        }

        return NextResponse.json({
            vendors: enrichedVendors || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
            statistics,
            filters: {
                status,
                search,
                sortBy,
                sortOrder,
            },
        });
    } catch (error) {
        console.error("Error in admin vendors API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
