"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

interface ConditionalHeaderProps {
  siteName?: string;
  siteLogo?: { url: string; alt: string };
  containerWidth?: "standard" | "wide" | "full";
  stickyHeader?: boolean;
  showHeroSearch?: boolean;
}

export function ConditionalHeader(props: ConditionalHeaderProps) {
  const pathname = usePathname();

  // Don't show header on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <Header {...props} />;
}
