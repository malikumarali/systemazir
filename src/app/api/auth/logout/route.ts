// ============================================================
// Agency OS — Auth: Logout
// POST /api/auth/logout
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { withSecurityHeaders } from '@/lib/api-helpers'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  const response = withSecurityHeaders(
    NextResponse.json({ ok: true, message: 'Logged out successfully' })
  )

  // Clear session cookie
  response.cookies.set('sb-access-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
