import { ConditionalHeader } from "@/components/layout/conditional-header";
import { Toaster } from "@/components/ui/toaster";
import { getSiteSettings } from "@/lib/settings";
import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type React from "react";
import { Suspense } from "react";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
    keywords: settings.metaKeywords,
    generator: "v0.app",
    icons: {
      icon: settings.siteFavicon.url || "/favicon.ico",
    },
    openGraph: {
      title: settings.metaTitle,
      description: settings.metaDescription,
      images: settings.ogImage.url ? [settings.ogImage.url] : undefined,
    },
    twitter: {
      title: settings.metaTitle,
      description: settings.metaDescription,
      images: settings.ogImage.url ? [settings.ogImage.url] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        style={{
          fontFamily: `${settings.primaryFont}, ${GeistSans.style.fontFamily}`,
          fontSize: `${settings.baseFontSize}px`,
          lineHeight: settings.lineHeight,
        }}
        suppressHydrationWarning={true}
      >
        <ConditionalHeader
          siteName={settings.siteName}
          siteLogo={settings.siteLogo}
          containerWidth={settings.containerWidth}
          stickyHeader={settings.stickyHeader}
          showHeroSearch={settings.showHeroSearch}
        />
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
