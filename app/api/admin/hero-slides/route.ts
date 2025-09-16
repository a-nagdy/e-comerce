import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

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

// GET /api/admin/hero-slides
export async function GET() {
    try {
        const supabase = await createServerClient()

        const { data: slides, error } = await supabase
            .from("hero_slides")
            .select("*")
            .eq("is_active", true)
            .order("sort_order")

        if (error) {
            console.error("Error fetching hero slides:", error)
            return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 })
        }

        const heroSlides: HeroSlide[] = slides?.map(slide => ({
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

        return NextResponse.json(heroSlides)
    } catch (error) {
        console.error("Error in GET /api/admin/hero-slides:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST /api/admin/hero-slides
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient()

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const slideData: Partial<HeroSlide> = await request.json()

        const { data: newSlide, error } = await supabase
            .from("hero_slides")
            .insert({
                title: slideData.title || "New Hero Slide",
                subtitle: slideData.subtitle || "",
                cta_text: slideData.ctaText || "Shop Now",
                cta_link: slideData.ctaLink || "/categories",
                background_image: slideData.backgroundImage || "",
                background_color: slideData.backgroundColor || "#3b82f6",
                text_color: slideData.textColor || "#ffffff",
                overlay_opacity: slideData.overlayOpacity || 0.4,
                sort_order: slideData.sortOrder || 0,
                is_active: slideData.isActive ?? true,
            })
            .select()
            .single()

        if (error) {
            console.error("Error creating hero slide:", error)
            return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 })
        }

        return NextResponse.json(newSlide)
    } catch (error) {
        console.error("Error in POST /api/admin/hero-slides:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PUT /api/admin/hero-slides
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerClient()

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const slides: HeroSlide[] = await request.json()

        // Update all slides
        for (const slide of slides) {
            const { error } = await supabase
                .from("hero_slides")
                .update({
                    title: slide.title,
                    subtitle: slide.subtitle,
                    cta_text: slide.ctaText,
                    cta_link: slide.ctaLink,
                    background_image: slide.backgroundImage,
                    background_color: slide.backgroundColor,
                    text_color: slide.textColor,
                    overlay_opacity: slide.overlayOpacity,
                    sort_order: slide.sortOrder,
                    is_active: slide.isActive,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", slide.id)

            if (error) {
                console.error("Error updating hero slide:", error)
                return NextResponse.json({ error: "Failed to update hero slides" }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true, message: "Hero slides updated successfully" })
    } catch (error) {
        console.error("Error in PUT /api/admin/hero-slides:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
