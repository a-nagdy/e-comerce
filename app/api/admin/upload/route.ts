import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient()

        // Check if user is authenticated and is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user has upload permissions (admin or vendor)
        const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!userData || !['admin', 'vendor'].includes(userData.role)) {
            return NextResponse.json({ error: "Upload access required" }, { status: 403 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File
        const type = formData.get("type") as string // 'logo', 'favicon', 'hero-bg', 'og-image'

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        if (!type) {
            return NextResponse.json({ error: "Upload type is required" }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, SVG, and WebP are allowed." }, { status: 400 })
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop()
        const filename = `${type}-${timestamp}-${randomString}.${fileExtension}`

        // Determine upload path based on user role
        const uploadPath = userData.role === 'admin' ? `appearance/${filename}` : `products/${filename}`

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Try to upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("marketplace-assets")
            .upload(uploadPath, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)

            // If bucket doesn't exist, try to create it
            if (uploadError.message?.includes("bucket") || uploadError.message?.includes("not found")) {
                // Try to create the bucket
                const { error: bucketError } = await supabase.storage.createBucket("marketplace-assets", {
                    public: true,
                    fileSizeLimit: 5242880, // 5MB
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif']
                })

                if (bucketError) {
                    console.error("Bucket creation error:", bucketError)
                    return NextResponse.json({
                        error: "Storage bucket not found. Please run the storage setup script in your Supabase dashboard.",
                        details: uploadError.message
                    }, { status: 500 })
                }

                // Retry upload after creating bucket
                const { data: retryData, error: retryError } = await supabase.storage
                    .from("marketplace-assets")
                    .upload(uploadPath, buffer, {
                        contentType: file.type,
                        upsert: false
                    })

                if (retryError) {
                    console.error("Retry upload error:", retryError)
                    return NextResponse.json({ error: "Failed to upload file after bucket creation" }, { status: 500 })
                }

                // Use retry data if successful
                if (retryData) {
                    // Continue with the rest of the function using retryData
                }
            } else {
                return NextResponse.json({
                    error: "Failed to upload file",
                    details: uploadError.message
                }, { status: 500 })
            }
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("marketplace-assets")
            .getPublicUrl(uploadPath)

        if (!urlData?.publicUrl) {
            return NextResponse.json({ error: "Failed to get file URL" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            filename: filename,
            type: type
        })

    } catch (error) {
        console.error("Error in file upload:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE /api/admin/upload - for deleting uploaded files
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const filename = searchParams.get("filename")

        if (!filename) {
            return NextResponse.json({ error: "Filename required" }, { status: 400 })
        }

        // Delete from storage
        const { error: deleteError } = await supabase.storage
            .from("marketplace-assets")
            .remove([`appearance/${filename}`])

        if (deleteError) {
            console.error("Delete error:", deleteError)
            return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "File deleted successfully" })

    } catch (error) {
        console.error("Error in file deletion:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
