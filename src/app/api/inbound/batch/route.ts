// Inbound Batch DELETE
import { NextRequest } from 'next/server'
import { ok, err, requireAuth, isAuthError, requireFounder, checkRateLimit, getClientIp } from '@/lib/api-helpers'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { DemoStore } from '@/lib/demo-store'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)
  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const founderCheck = requireFounder(authResult.authedUser)
  if (founderCheck) return founderCheck

  let body: any
  try { body = await req.json() } catch { return err('Invalid JSON body') }

  const ids = Array.isArray(body.ids) ? body.ids.slice(0, 100) : []
  if (ids.length === 0) return err('ids array is required')

  if (!isSupabaseConfigured) {
    const deleted = DemoStore.getInbound().filter(e => ids.includes(e.id)).map(e => e.id)
    DemoStore.deleteInboundBatch(ids)
    return ok({ deleted, count: deleted.length })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)
  const { error } = await admin.from('inbound_entries').delete().in('id', ids)
  if (error) return err('Batch delete failed: ' + error.message, 500)
  return ok({ deleted: ids, count: ids.length })
}
