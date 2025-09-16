import { createServerClient } from "@/lib/supabase/server"

export interface HeroSlide {
    id: string
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    backgroundImage: string
    backgroundColor: string
    textColor: string
    overlayOpacity: number
    sortOrder: number
    isActive: boolean
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
    const supabase = await createServerClient()

    const { data: slides, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")

    if (error) {
        console.error("Error fetching hero slides:", error)
        return []
    }

    return slides?.map(slide => ({
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle || "",
        ctaText: slide.cta_text || "Shop Now",
        ctaLink: slide.cta_link || "/categories",
        backgroundImage: slide.background_image || "",
        backgroundColor: slide.background_color || "#3b82f6",
        textColor: slide.text_color || "#ffffff",
        overlayOpacity: slide.overlay_opacity || 0.4,
        sortOrder: slide.sort_order || 0,
        isActive: slide.is_active ?? true,
    })) || []
}
