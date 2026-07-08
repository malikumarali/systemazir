// ============================================================
// Agency OS — API Helpers
// Shared utilities for all API route handlers:
//   - Auth guard (validate session JWT)
//   - Role enforcement (founder-only)
//   - Input sanitization
//   - Standardized error/success responses
//   - Rate limiting (in-memory, per IP)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, getSupabaseAdmin } from './supabase'
import { DemoStore } from './demo-store'

// ---------------------------------------------------------------
// Rate Limiter (in-memory, resets on cold start)
// ---------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100 // requests per window
const RATE_WINDOW_MS = 60_000 // 1 minute

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true // allowed
  }

  if (entry.count >= RATE_LIMIT) return false // blocked

  entry.count++
  return true
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0'
  )
}

// ---------------------------------------------------------------
// Standard security headers applied to every response
// ---------------------------------------------------------------
export function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return res
}

// ---------------------------------------------------------------
// Standardized JSON responses
// ---------------------------------------------------------------
export function ok(data: any, status = 200): NextResponse {
  return withSecurityHeaders(
    NextResponse.json({ data, ok: true }, { status })
  )
}

export function err(message: string, status = 400, details?: any): NextResponse {
  return withSecurityHeaders(
    NextResponse.json({ error: message, ok: false, ...(details ? { details } : {}) }, { status })
  )
}

// ---------------------------------------------------------------
// Auth Session Guard
// Returns { user, profile } or throws/returns error response
// ---------------------------------------------------------------
export interface AuthedUser {
  id: string
  email: string
  role: 'founder' | 'team_member'
  name: string
}

export async function requireAuth(req: NextRequest): Promise<{ authedUser: AuthedUser } | NextResponse> {
  // Demo mode — validate against mutable DemoStore (includes runtime signups)
  if (!isSupabaseConfigured) {
    const demoHeader = req.headers.get('x-demo-user-id')
    if (demoHeader) {
      const demoUser = DemoStore.findUser(demoHeader)
      if (demoUser) {
        return {
          authedUser: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
          }
        }
      }
    }
    // No valid user header — authentication required
    return err('Authentication required', 401)
  }

  // Supabase mode: validate Bearer token
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '').trim()

  if (!token) {
    return err('Authentication required', 401)
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server configuration error', 500)

  const { data: { user }, error } = await admin.auth.getUser(token)

  if (error || !user) {
    return err('Invalid or expired session', 401)
  }

  // Fetch role from profiles table
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, email, name, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return err('User profile not found', 404)
  }

  return {
    authedUser: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as 'founder' | 'team_member',
    }
  }
}

export function isAuthError(result: any): result is NextResponse {
  return result instanceof NextResponse
}

// ---------------------------------------------------------------
// Role enforcement
// ---------------------------------------------------------------
export function requireFounder(authedUser: AuthedUser): NextResponse | null {
  if (authedUser.role !== 'founder') {
    return err('Forbidden: Founder access required', 403)
  }
  return null
}

// ---------------------------------------------------------------
// Input sanitization
// ---------------------------------------------------------------
export function sanitizeString(s: unknown, maxLen = 1000): string {
  if (typeof s !== 'string') return ''
  // Strip HTML tags, trim whitespace
  return s.replace(/<[^>]*>/g, '').trim().slice(0, maxLen)
}

export function sanitizeNumber(n: unknown, fallback = 0): number {
  const parsed = Number(n)
  return isNaN(parsed) || !isFinite(parsed) ? fallback : parsed
}

// ---------------------------------------------------------------
// Supabase query helper — returns demo data or live data
// ---------------------------------------------------------------
export async function queryTable(
  tableName: string,
  authedUser: AuthedUser,
  filters: Record<string, string | undefined> = {}
) {
  const admin = getSupabaseAdmin()
  if (!admin) return null

  let query = admin.from(tableName).select('*')

  // Team members can only see their own data for write operations
  if (authedUser.role === 'team_member') {
    query = query.eq('user_id', authedUser.id)
  }

  // Apply optional filters
  for (const [key, value] of Object.entries(filters)) {
    if (value) query = query.eq(key, value)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}
