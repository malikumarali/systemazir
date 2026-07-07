// ============================================================
// Agency OS — Auth: Login
// POST /api/auth/login
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { ok, err, sanitizeString, checkRateLimit, getClientIp, withSecurityHeaders } from '@/lib/api-helpers'
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase'
import { DEMO_USERS } from '@/lib/mockData'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests — try again later', 429)

  let body: any
  try {
    body = await req.json()
  } catch {
    return err('Invalid JSON body')
  }

  const email = sanitizeString(body.email).toLowerCase()
  const password = body.password as string

  if (!email || !password) {
    return err('Email and password are required')
  }

  // ---------------------------------------------------------------
  // Demo Mode fallback (no Supabase configured)
  // ---------------------------------------------------------------
  if (!isSupabaseConfigured) {
    const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email)
    if (!demoUser) return err('No account found with this email', 401)
    if (password !== 'demo123') return err('Invalid password. Use demo123 for demo accounts.', 401)

    // Return sanitized user — never return passwords
    const response = ok({
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
      },
      token: null, // Demo mode has no token
      mode: 'demo',
    })
    return response
  }

  // ---------------------------------------------------------------
  // Live Supabase Auth
  // ---------------------------------------------------------------
  const supabase = getSupabaseClient()
  if (!supabase) return err('Server configuration error', 500)

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user || !data.session) {
    // Generic error message to prevent user enumeration
    return err('Invalid email or password', 401)
  }

  // Fetch profile (role etc.)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, name, role')
    .eq('id', data.user.id)
    .single()

  // Set HttpOnly session cookie for browser clients
  const response = withSecurityHeaders(
    NextResponse.json({
      data: {
        user: {
          id: profile?.id || data.user.id,
          email: profile?.email || data.user.email,
          name: profile?.name || data.user.email,
          role: profile?.role || 'team_member',
        },
        // Access token for API calls (stored in memory by client, not localStorage)
        token: data.session.access_token,
        mode: 'live',
      },
      ok: true,
    })
  )

  // Set secure HttpOnly cookie for session persistence
  response.cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.session.expires_in,
    path: '/',
  })

  return response
}
