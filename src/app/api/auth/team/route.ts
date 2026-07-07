// ============================================================
// Agency OS — Auth: Fetch all team members (Founder-only)
// GET /api/auth/team
// ============================================================

import { NextRequest } from 'next/server'
import { ok, err, requireAuth, isAuthError, requireFounder, checkRateLimit, getClientIp } from '@/lib/api-helpers'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { DEMO_USERS } from '@/lib/mockData'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const { authedUser } = authResult

  const founderCheck = requireFounder(authedUser)
  if (founderCheck) return founderCheck

  // 1. Demo Mode
  if (!isSupabaseConfigured) {
    return ok({ team: DEMO_USERS.filter(u => u.role === 'team_member') })
  }

  // 2. Live Supabase Mode
  const admin = getSupabaseAdmin()
  if (!admin) return err('Server configuration error', 500)

  const { data, error } = await admin
    .from('profiles')
    .select('id, email, name, role, created_at')
    .eq('role', 'team_member')
    .order('created_at', { ascending: false })

  if (error) {
    return err('Failed to fetch team members: ' + error.message, 500)
  }

  return ok({ team: data })
}
