import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/settings/platform - Get platform settings
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

        // Get all platform settings
        const { data: settings, error: settingsError } = await supabase
            .from("site_settings")
            .select("key, value");

        if (settingsError) {
            console.error("Error fetching settings:", settingsError);
            return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
        }

        // Convert array to object for easier access
        const settingsObj: Record<string, any> = {};
        settings?.forEach(setting => {
            try {
                // Try to parse JSON, fallback to string value
                settingsObj[setting.key] = JSON.parse(setting.value);
            } catch {
                settingsObj[setting.key] = setting.value;
            }
        });

        // Provide default values for missing settings
        const defaultSettings = {
            // General Settings
            site_name: "MarketPlace Pro",
            site_description: "Your premier destination for quality products from trusted vendors",
            contact_email: "admin@marketplace.com",
            support_phone: "+1 (555) 123-4567",

            // Vendor Settings
            auto_approve_vendors: false,
            require_vendor_verification: true,
            vendor_commission: 5,
            min_payout_amount: 50,

            // Product Settings
            auto_approve_products: false,
            require_product_moderation: true,
            max_images_per_product: 10,
            max_image_size_mb: 5,

            // Payment Settings
            default_currency: "USD",
            default_tax_rate: 8.5,
            default_shipping_fee: 9.99,
            free_shipping_minimum: 75,

            // Email Settings
            email_order_confirmations: true,
            email_vendor_notifications: true,
            email_marketing_enabled: false,

            // Security Settings
            require_2fa_admin: true,
            gdpr_compliance: true,
            session_timeout_minutes: 60,
        };

        const finalSettings = { ...defaultSettings, ...settingsObj };

        return NextResponse.json({ settings: finalSettings });
    } catch (error) {
        console.error("Error in platform settings API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/admin/settings/platform - Update platform settings
export async function PUT(request: NextRequest) {
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
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
        }

        // Update or insert each setting
        const updatePromises = Object.entries(settings).map(async ([key, value]) => {
            const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

            const { error } = await supabase
                .from("site_settings")
                .upsert({
                    key: key,
                    value: settingValue,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'key'
                });

            if (error) {
                console.error(`Error updating setting ${key}:`, error);
                throw error;
            }
        });

        await Promise.all(updatePromises);

        return NextResponse.json({
            message: "Settings updated successfully"
        });
    } catch (error) {
        console.error("Error updating platform settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
