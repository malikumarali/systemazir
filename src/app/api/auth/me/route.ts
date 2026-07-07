// ============================================================
// Agency OS — Auth: Get current session user
// GET /api/auth/me
// ============================================================

import { NextRequest } from 'next/server'
import { ok, err, requireAuth, isAuthError, checkRateLimit, getClientIp } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult

  // Return sanitized user — no passwords, no keys
  return ok({ user: authResult.authedUser })
}
