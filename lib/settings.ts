import { createServerClient } from "@/lib/supabase/server";

export interface SiteSettings {
  // Branding
  siteName: string
  siteTagline: string
  siteLogo: { url: string; alt: string }
  siteFavicon: { url: string }

  // SEO
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogImage: { url: string }

  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string

  // Typography
  primaryFont: string
  headingFont: string
  baseFontSize: number
  lineHeight: number

  // Layout
  containerWidth: 'standard' | 'wide' | 'full'
  headerStyle: 'standard' | 'centered'
  productGridColumns: number
  stickyHeader: boolean
  roundedCorners: boolean
  dropShadows: boolean

  // Homepage
  heroTitle: string
  heroSubtitle: string
  heroCTAText: string
  heroBackground: { url: string; type: 'image' | 'color' }
  showHeroSearch: boolean
  showFeaturedCategories: boolean
  showFeaturedProducts: boolean
  showTopVendors: boolean
  showTestimonials: boolean
  showNewsletterSignup: boolean
  featuredProductsCount: number

  // Footer
  footerText: string
  showSocialLinks: boolean
  showNewsletterFooter: boolean
  showPaymentMethods: boolean

  // Social Media
  socialFacebook: string
  socialTwitter: string
  socialInstagram: string
  socialLinkedin: string
  socialYoutube: string
  socialTiktok: string
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createServerClient()

  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")

  const settingsMap = new Map(settings?.map((s) => {
    try {
      // Try to parse as JSON first
      return [s.key, JSON.parse(s.value)]
    } catch {
      // If parsing fails, return the raw value (for plain text)
      return [s.key, s.value]
    }
  }) || [])

  return {
    // Branding
    siteName: settingsMap.get("site_name") || "MarketPlace Pro",
    siteTagline: settingsMap.get("site_tagline") || "Your premier destination for quality products",
    siteLogo: settingsMap.get("site_logo") || { url: "", alt: "MarketPlace Pro Logo" },
    siteFavicon: settingsMap.get("site_favicon") || { url: "" },

    // SEO
    metaTitle: settingsMap.get("meta_title") || "MarketPlace Pro - Quality Products from Trusted Vendors",
    metaDescription: settingsMap.get("meta_description") || "Discover quality products from verified vendors. Shop electronics, fashion, home goods and more.",
    metaKeywords: settingsMap.get("meta_keywords") || "marketplace, ecommerce, online shopping, vendors",
    ogImage: settingsMap.get("og_image") || { url: "" },

    // Colors
    primaryColor: settingsMap.get("primary_color") || "#3b82f6",
    secondaryColor: settingsMap.get("secondary_color") || "#64748b",
    accentColor: settingsMap.get("accent_color") || "#10b981",
    backgroundColor: settingsMap.get("background_color") || "#ffffff",
    textColor: settingsMap.get("text_color") || "#1f2937",

    // Typography
    primaryFont: settingsMap.get("primary_font") || "Inter",
    headingFont: settingsMap.get("heading_font") || "Inter",
    baseFontSize: settingsMap.get("base_font_size") || 16,
    lineHeight: settingsMap.get("line_height") || 1.5,

    // Layout
    containerWidth: settingsMap.get("container_width") || "standard",
    headerStyle: settingsMap.get("header_style") || "standard",
    productGridColumns: settingsMap.get("product_grid_columns") || 4,
    stickyHeader: settingsMap.get("sticky_header") ?? true,
    roundedCorners: settingsMap.get("rounded_corners") ?? true,
    dropShadows: settingsMap.get("drop_shadows") ?? true,

    // Homepage
    heroTitle: settingsMap.get("hero_title") || "Discover Amazing Products from Trusted Vendors",
    heroSubtitle: settingsMap.get("hero_subtitle") || "Shop from thousands of products across multiple categories with fast shipping and secure checkout.",
    heroCTAText: settingsMap.get("hero_cta_text") || "Start Shopping",
    heroBackground: settingsMap.get("hero_background") || { url: "", type: "image" },
    showHeroSearch: settingsMap.get("show_hero_search") ?? true,
    showFeaturedCategories: settingsMap.get("show_featured_categories") ?? true,
    showFeaturedProducts: settingsMap.get("show_featured_products") ?? true,
    showTopVendors: settingsMap.get("show_top_vendors") ?? true,
    showTestimonials: settingsMap.get("show_testimonials") ?? false,
    showNewsletterSignup: settingsMap.get("show_newsletter_signup") ?? true,
    featuredProductsCount: settingsMap.get("featured_products_count") || 12,

    // Footer
    footerText: settingsMap.get("footer_text") || "© 2024 MarketPlace Pro. All rights reserved.",
    showSocialLinks: settingsMap.get("show_social_links") ?? true,
    showNewsletterFooter: settingsMap.get("show_newsletter_footer") ?? true,
    showPaymentMethods: settingsMap.get("show_payment_methods") ?? true,

    // Social Media
    socialFacebook: settingsMap.get("social_facebook") || "",
    socialTwitter: settingsMap.get("social_twitter") || "",
    socialInstagram: settingsMap.get("social_instagram") || "",
    socialLinkedin: settingsMap.get("social_linkedin") || "",
    socialYoutube: settingsMap.get("social_youtube") || "",
    socialTiktok: settingsMap.get("social_tiktok") || "",
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  const supabase = await createServerClient()

  const updates = Object.entries(settings).map(([key, value]) => ({
    key: camelToSnake(key),
    value: JSON.stringify(value),
    updated_at: new Date().toISOString(),
  }))

  for (const update of updates) {
    await supabase.from("site_settings").upsert(update, { onConflict: "key" })
  }
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
