// ============================================================
// Agency OS — Health Check
// GET /api/health
// Returns: { status: 'ok'|'degraded', db: boolean, mode: 'live'|'demo', timestamp }
// ============================================================

import { NextRequest } from 'next/server'
import { withSecurityHeaders } from '@/lib/api-helpers'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString()
  let dbOk = false
  let dbLatencyMs: number | null = null

  if (isSupabaseConfigured) {
    const admin = getSupabaseAdmin()
    if (admin) {
      const start = Date.now()
      try {
        // Simple query to confirm DB connection
        const { error } = await admin.from('profiles').select('id').limit(1)
        dbOk = !error
        dbLatencyMs = Date.now() - start
      } catch {
        dbOk = false
      }
    }
  }

  const mode = isSupabaseConfigured ? 'live' : 'demo'
  const status = isSupabaseConfigured ? (dbOk ? 'ok' : 'degraded') : 'ok'

  return withSecurityHeaders(
    NextResponse.json({
      status,
      db: dbOk || !isSupabaseConfigured, // true in demo mode
      mode,
      ...(dbLatencyMs !== null ? { dbLatencyMs } : {}),
      timestamp,
      version: '1.0.0',
    })
  )
}
