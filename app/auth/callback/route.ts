import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // If next parameter is specified, use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Otherwise, redirect based on user role
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (!userError && userData) {
          switch (userData.role) {
            case 'admin':
              return NextResponse.redirect(`${origin}/admin/dashboard`)
            case 'vendor':
              return NextResponse.redirect(`${origin}/vendor/dashboard`)
            case 'customer':
            default:
              return NextResponse.redirect(`${origin}/`)
          }
        }
      } catch (roleError) {
        console.error('Error fetching user role:', roleError)
      }

      // Fallback to home page
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
