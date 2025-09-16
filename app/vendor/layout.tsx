"use client";

import { VendorHeader } from "@/components/vendor/vendor-header";
import { VendorSidebar } from "@/components/vendor/vendor-sidebar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkVendorAccess = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          // Not authenticated - redirect to login
          router.replace("/auth/login?redirect=/vendor/dashboard");
          return;
        }

        // Get user role
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user role:", userError);
          router.replace("/auth/login?redirect=/vendor/dashboard");
          return;
        }

        // Check role-based access
        if (userData.role === "admin") {
          // Admin should go to admin dashboard
          router.replace("/admin/dashboard");
          return;
        }

        if (userData.role !== "vendor") {
          // Not a vendor - redirect to login
          router.replace("/auth/login?redirect=/vendor/dashboard");
          return;
        }

        // User is a vendor - allow access
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error checking vendor access:", error);
        router.replace("/auth/login?redirect=/vendor/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    checkVendorAccess();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/auth/login?redirect=/vendor/dashboard");
      } else if (event === "SIGNED_IN") {
        // Re-check access when user signs in
        checkVendorAccess();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render vendor layout for authenticated vendors
  return (
    <div className="flex h-screen">
      <VendorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
