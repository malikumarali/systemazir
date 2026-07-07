// ============================================================
// Agency OS — Auth: Public Founder Signup
// POST /api/auth/signup
// ============================================================

import { NextRequest } from 'next/server'
import { ok, err, sanitizeString, checkRateLimit, getClientIp } from '@/lib/api-helpers'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  let body: any
  try {
    body = await req.json()
  } catch {
    return err('Invalid JSON body')
  }

  const email = sanitizeString(body.email).toLowerCase()
  const password = body.password as string
  const name = sanitizeString(body.name)

  if (!email || !password || !name) {
    return err('Name, email, and password are required')
  }

  if (password.length < 8) {
    return err('Password must be at least 8 characters')
  }

  // 1. Demo Mode
  if (!isSupabaseConfigured) {
    // In demo mode, we just return a mocked success, since everything runs client-side fallback
    const mockUser = {
      id: `founder-${Date.now()}`,
      email,
      name,
      role: 'founder',
    }
    return ok({ user: mockUser, token: 'demo-token' }, 201)
  }

  // 2. Live Supabase Mode
  const admin = getSupabaseAdmin()
  if (!admin) return err('Server configuration error', 500)

  // Create user with founder role in user_metadata
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'founder' },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return err('An account with this email already exists', 409)
    }
    return err('Failed to create account: ' + error.message, 500)
  }

  // The database trigger 'handle_new_user' inside supabase/schema.sql will auto-insert the profile
  return ok({
    user: {
      id: data.user.id,
      email: data.user.email,
      name,
      role: 'founder',
    }
  }, 201)
}
