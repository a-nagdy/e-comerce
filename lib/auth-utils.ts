import { createClient } from "@/lib/supabase/server";

export async function getUserRole(userId: string) {
    const supabase = await createClient();

    const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user role:', error);
        return null;
    }

    return user?.role || 'customer';
}

export function getRedirectPath(role: string): string {
    switch (role) {
        case 'admin':
            return '/admin/dashboard';
        case 'vendor':
            return '/vendor/dashboard';
        case 'customer':
        default:
            return '/';
    }
}

export async function checkUserRole(userId: string) {
    const role = await getUserRole(userId);
    return {
        role,
        redirectPath: getRedirectPath(role || "customer"),
        isAdmin: role === "admin",
        isVendor: role === "vendor",
        isCustomer: role === "customer",
    };
}
