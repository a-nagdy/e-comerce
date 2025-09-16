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

// Default settings for client-side usage
export const defaultSiteSettings: SiteSettings = {
    // Branding
    siteName: "MarketPlace Pro",
    siteTagline: "Your premier destination for quality products",
    siteLogo: { url: "", alt: "MarketPlace Pro Logo" },
    siteFavicon: { url: "" },

    // SEO
    metaTitle: "MarketPlace Pro - Quality Products from Trusted Vendors",
    metaDescription: "Discover quality products from verified vendors. Shop electronics, fashion, home goods and more.",
    metaKeywords: "marketplace, ecommerce, online shopping, vendors",
    ogImage: { url: "" },

    // Colors
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    accentColor: "#10b981",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",

    // Typography
    primaryFont: "Inter",
    headingFont: "Inter",
    baseFontSize: 16,
    lineHeight: 1.5,

    // Layout
    containerWidth: "standard",
    headerStyle: "standard",
    productGridColumns: 4,
    stickyHeader: true,
    roundedCorners: true,
    dropShadows: true,

    // Homepage
    heroTitle: "Discover Amazing Products from Trusted Vendors",
    heroSubtitle: "Shop from thousands of products across multiple categories with fast shipping and secure checkout.",
    heroCTAText: "Start Shopping",
    heroBackground: { url: "", type: "image" },
    showHeroSearch: true,
    showFeaturedCategories: true,
    showFeaturedProducts: true,
    showTopVendors: true,
    showTestimonials: false,
    showNewsletterSignup: true,
    featuredProductsCount: 12,

    // Footer
    footerText: "© 2024 MarketPlace Pro. All rights reserved.",
    showSocialLinks: true,
    showNewsletterFooter: true,
    showPaymentMethods: true,

    // Social Media
    socialFacebook: "",
    socialTwitter: "",
    socialInstagram: "",
    socialLinkedin: "",
    socialYoutube: "",
    socialTiktok: "",
}

// Client-side settings hook for dynamic settings
export function useSiteSettings(): SiteSettings {
    // For now, return default settings
    // In the future, this could fetch settings from an API endpoint
    return defaultSiteSettings
}

// Utility function to get container class based on settings
export function getContainerClass(containerWidth: 'standard' | 'wide' | 'full'): string {
    switch (containerWidth) {
        case "wide":
            return "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
        case "full":
            return "w-full px-4 sm:px-6 lg:px-8";
        default: // 'standard'
            return "container";
    }
}
