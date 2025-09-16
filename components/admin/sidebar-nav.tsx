"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Package,
  PackageCheck,
  Palette,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  children?: NavItem[];
}

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/vendors",
    label: "Vendor Management",
    icon: Store,
    children: [
      { href: "/admin/vendors", label: "All Vendors", icon: Building2 },
      {
        href: "/admin/vendor/products",
        label: "Vendor Products",
        icon: PackageCheck,
      },
    ],
  },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/products", label: "All Products", icon: Package },
  { href: "/admin/orders", label: "Order Management", icon: ShoppingCart },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/moderation", label: "Content Moderation", icon: Shield },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/appearance", label: "Appearance", icon: Palette },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand vendor section if we're on a vendor-related page
  useEffect(() => {
    if (pathname.startsWith("/admin/vendor") || pathname === "/admin/vendors") {
      setExpandedItems((prev) =>
        prev.includes("/admin/vendors") ? prev : [...prev, "/admin/vendors"]
      );
    }
  }, [pathname]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isItemActive = (item: NavItem) => {
    if (item.children) {
      return (
        item.children.some((child) => pathname === child.href) ||
        pathname === item.href
      );
    }
    return pathname === item.href;
  };

  const isChildActive = (href: string) => pathname === href;

  return (
    <nav className="p-4 space-y-2">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item);
        const isExpanded = expandedItems.includes(item.href);

        return (
          <div key={item.href}>
            {/* Main nav item */}
            <div className="flex items-center">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>

              {/* Expand/collapse button for items with children */}
              {item.children && (
                <button
                  onClick={() => toggleExpanded(item.href)}
                  className={cn(
                    "p-1 rounded transition-colors",
                    isActive
                      ? "text-blue-700 hover:bg-blue-100"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Child items */}
            {item.children && isExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => {
                  const ChildIcon = child.icon;
                  const isChildItemActive = isChildActive(child.href);

                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                        isChildItemActive
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <ChildIcon className="h-3.5 w-3.5" />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
