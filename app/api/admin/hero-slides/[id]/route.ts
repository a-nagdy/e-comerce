import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// DELETE /api/admin/hero-slides/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerClient()

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { error } = await supabase
            .from("hero_slides")
            .delete()
            .eq("id", params.id)

        if (error) {
            console.error("Error deleting hero slide:", error)
            return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "Hero slide deleted successfully" })
    } catch (error) {
        console.error("Error in DELETE /api/admin/hero-slides/[id]:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
