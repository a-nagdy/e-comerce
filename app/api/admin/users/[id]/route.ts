import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/users/[id] - Get specific user details
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

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`
        *,
        vendors(
          id,
          business_name,
          status,
          commission_rate
        )
      `)
      .eq("id", params.id)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's order statistics
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        created_at
      `)
      .eq("user_id", params.id);

    const userStats = {
      totalOrders: orders?.length || 0,
      totalSpent: orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount.toString()) || 0), 0) || 0,
      completedOrders: orders?.filter(order => order.status === "delivered").length || 0,
      averageOrderValue: 0,
    };

    // Calculate average order value
    if (userStats.totalOrders > 0) {
      userStats.averageOrderValue = userStats.totalSpent / userStats.totalOrders;
    }

    // Get recent activity data
    const recentActivity = {
      registrationDate: userData.created_at,
      lastLogin: userData.updated_at, // This could be enhanced with a proper last_login field
      lastOrder: orders && orders.length > 0
        ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null,
    };

    return NextResponse.json({
      user: userData,
      userStats,
      recentActivity,
    });
  } catch (error) {
    console.error("Error in admin user details API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] - Update user details
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
      full_name,
      email,
      phone,
      role,
      active
    } = body;

    // Validate role
    const validRoles = ["customer", "vendor", "admin"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        vendors(
          id,
          business_name,
          status,
          commission_rate
        )
      `)
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    // If role changed to vendor, create vendor record if it doesn't exist
    if (role === "vendor") {
      const { data: existingVendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", params.id)
        .single();

      if (!existingVendor) {
        const { error: vendorError } = await supabase
          .from("vendors")
          .insert({
            user_id: params.id,
            business_name: full_name || "Unnamed Business",
            business_description: "",
            status: "pending",
            commission_rate: 10.00
          });

        if (vendorError) {
          console.error("Error creating vendor record:", vendorError);
        }
      }
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in admin user update API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user
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

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", params.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting admin users (safety measure)
    if (existingUser.role === "admin") {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 403 });
    }

    // Delete user (this will cascade to related records due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error in admin user delete API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}