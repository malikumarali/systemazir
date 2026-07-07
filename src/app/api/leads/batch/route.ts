// ============================================================
// Agency OS — Leads: Batch operations (founder only)
// POST /api/leads/batch
// Body: { action: 'delete', ids: string[] }
//       { action: 'update', ids: string[], patch: Partial<Lead> }
// ============================================================

import { NextRequest } from 'next/server'
import {
  ok, err, requireAuth, isAuthError, requireFounder,
  sanitizeString, checkRateLimit, getClientIp
} from '@/lib/api-helpers'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { DemoStore } from '@/lib/demo-store'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const { authedUser } = authResult

  const founderCheck = requireFounder(authedUser)
  if (founderCheck) return founderCheck

  let body: any
  try { body = await req.json() } catch { return err('Invalid JSON body') }

  const action = body.action as string
  const ids = Array.isArray(body.ids) ? body.ids.filter((id: any) => typeof id === 'string').slice(0, 100) : []

  if (!action) return err('action is required')
  if (!['delete', 'update'].includes(action)) return err('action must be "delete" or "update"')
  if (ids.length === 0) return err('ids array must not be empty')

  // ---- Batch Delete ----
  if (action === 'delete') {
    if (!isSupabaseConfigured) {
      const deleted = DemoStore.getLeads().filter(l => ids.includes(l.id)).map(l => l.id)
      DemoStore.deleteLeads(ids)
      return ok({ deleted, count: deleted.length })
    }

    const admin = getSupabaseAdmin()
    if (!admin) return err('Server error', 500)

    const { error } = await admin.from('leads').delete().in('id', ids)
    if (error) return err('Batch delete failed: ' + error.message, 500)
    return ok({ deleted: ids, count: ids.length })
  }

  // ---- Batch Update ----
  if (action === 'update') {
    const patch = body.patch || {}
    const cleanPatchDemo: Record<string, any> = {}
    const cleanPatchDB: Record<string, any> = {}

    if (patch.dealStatus !== undefined) {
      const validStatuses = ['Prospect', 'Qualified', 'Appointment Set', 'Closed Won', 'Closed Lost', 'Churned']
      const s = sanitizeString(patch.dealStatus)
      if (!validStatuses.includes(s)) return err('Invalid dealStatus in patch')
      cleanPatchDemo.dealStatus = s
      cleanPatchDB.deal_status = s
    }
    if (patch.niche !== undefined) {
      const n = sanitizeString(patch.niche)
      cleanPatchDemo.niche = n
      cleanPatchDB.niche = n
    }

    if (Object.keys(cleanPatchDB).length === 0) return err('No valid fields in patch')

    if (!isSupabaseConfigured) {
      let count = 0
      ids.forEach((id: string) => {
        if (DemoStore.getLeads().find(l => l.id === id)) {
          DemoStore.updateLead(id, cleanPatchDemo as any)
          count++
        }
      })
      return ok({ updated: ids, count })
    }

    const admin = getSupabaseAdmin()
    if (!admin) return err('Server error', 500)

    const { error } = await admin.from('leads').update(cleanPatchDB).in('id', ids)
    if (error) return err('Batch update failed: ' + error.message, 500)
    return ok({ updated: ids, count: ids.length })
  }

  return err('Unknown action')
}
