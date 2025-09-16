import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/users - Get all users with pagination and filtering
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
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const active = searchParams.get("active");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        avatar_url,
        email_verified,
        active,
        created_at,
        updated_at,
        vendors(
          id,
          business_name,
          status,
          commission_rate
        )
      `, { count: "exact" });

    // Apply filters
    if (role) {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (active) {
      query = query.eq("active", active === "true");
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, error: usersError, count } = await query;

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    // Also get users without vendor profiles
    let basicUsersQuery = supabase
      .from("users")
      .select("*", { count: "exact" });

    // Apply same filters for basic users (customers/admins without vendor profiles)
    if (role) {
      basicUsersQuery = basicUsersQuery.eq("role", role);
    }

    if (search) {
      basicUsersQuery = basicUsersQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (active) {
      basicUsersQuery = basicUsersQuery.eq("active", active === "true");
    }

    basicUsersQuery = basicUsersQuery.order(sortBy, { ascending: sortOrder === "asc" });
    basicUsersQuery = basicUsersQuery.range(offset, offset + limit - 1);

    const { data: basicUsers, error: basicUsersError, count: basicCount } = await basicUsersQuery;

    if (basicUsersError) {
      console.error("Error fetching basic users:", basicUsersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    return NextResponse.json({
      users: basicUsers || [],
      pagination: {
        page,
        limit,
        total: basicCount || 0,
        totalPages: Math.ceil((basicCount || 0) / limit),
      },
      filters: {
        role,
        search,
        active,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error in admin users API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
