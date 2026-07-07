// ============================================================
// Agency OS — Auth: Register new user (Founder-only action)
// POST /api/auth/register
// ============================================================

import { NextRequest } from 'next/server'
import {
  ok, err, requireAuth, isAuthError, requireFounder,
  sanitizeString, checkRateLimit, getClientIp
} from '@/lib/api-helpers'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  // Auth check
  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const { authedUser } = authResult

  // Only founders can create accounts
  const founderCheck = requireFounder(authedUser)
  if (founderCheck) return founderCheck

  if (!isSupabaseConfigured) {
    return err('Supabase is not configured. Running in demo mode.', 503)
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return err('Invalid JSON body')
  }

  const email = sanitizeString(body.email)
  const password = body.password as string
  const name = sanitizeString(body.name)
  const role = body.role === 'founder' ? 'founder' : 'team_member'

  if (!email || !password || !name) {
    return err('email, password, and name are required')
  }

  if (password.length < 8) {
    return err('Password must be at least 8 characters')
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return err('Invalid email address')
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server configuration error', 500)

  // Create user via admin — password is bcrypt-hashed by Supabase Auth
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password, // Supabase hashes this server-side
    email_confirm: true,
    user_metadata: { name, role },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return err('An account with this email already exists', 409)
    }
    return err('Failed to create user: ' + error.message, 500)
  }

  // Profile is auto-created by the DB trigger (handle_new_user)
  // Return sanitized user data (NEVER return password or tokens)
  return ok({
    user: {
      id: data.user.id,
      email: data.user.email,
      name,
      role,
    }
  }, 201)
}
