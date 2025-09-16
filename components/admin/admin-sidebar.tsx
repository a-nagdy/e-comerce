"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminSidebarNav } from "./sidebar-nav";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vendors", label: "Vendor Management", icon: Store },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/products", label: "All Products", icon: Package },
  { href: "/admin/orders", label: "Order Management", icon: ShoppingCart },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/moderation", label: "Content Moderation", icon: Shield },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export function AdminSidebar() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }
      // Router will be handled by the auth state listener in layout
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: force redirect to login
      router.push("/admin/login");
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-600 mt-1">Marketplace Management</p>
      </div>

      <div className="flex-1">
        <AdminSidebarNav />
      </div>

      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
