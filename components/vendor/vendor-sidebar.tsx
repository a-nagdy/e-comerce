"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Store,
  Plus,
  FileText,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/vendor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/vendor/products",
    icon: Package,
  },
  {
    title: "Add Product",
    href: "/vendor/products/new",
    icon: Plus,
  },
  {
    title: "Orders",
    href: "/vendor/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/vendor/customers",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/vendor/analytics",
    icon: BarChart3,
  },
  {
    title: "Payouts",
    href: "/vendor/payouts",
    icon: CreditCard,
  },
  {
    title: "Reports",
    href: "/vendor/reports",
    icon: FileText,
  },
  {
    title: "Store Settings",
    href: "/vendor/settings",
    icon: Settings,
  },
]

export function VendorSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-muted/30 border-r">
      <div className="flex items-center gap-2 p-6 border-b">
        <Store className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Vendor Portal</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-2", isActive && "bg-primary/10 text-primary")}
              asChild
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
