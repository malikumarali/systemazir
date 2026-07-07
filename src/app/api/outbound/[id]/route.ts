// Outbound [id] PUT / DELETE (founder only)
import { NextRequest } from 'next/server'
import { ok, err, requireAuth, isAuthError, requireFounder, checkRateLimit, getClientIp } from '@/lib/api-helpers'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { DemoStore } from '@/lib/demo-store'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)
  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const founderCheck = requireFounder(authResult.authedUser)
  if (founderCheck) return founderCheck

  let body: any
  try { body = await req.json() } catch { return err('Invalid JSON body') }

  if (!isSupabaseConfigured) {
    const entry = DemoStore.getOutbound().find(e => e.id === params.id)
    if (!entry) return err('Entry not found', 404)
    const updated = { ...entry, ...body }
    DemoStore.deleteOutbound(params.id)
    DemoStore.addOutbound(updated)
    return ok({ entry: updated })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)
  const { data, error } = await admin.from('outbound_entries').update(body).eq('id', params.id).select().single()
  if (error || !data) return err('Failed to update: ' + (error?.message || 'not found'), 404)
  return ok({ entry: data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)
  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const founderCheck = requireFounder(authResult.authedUser)
  if (founderCheck) return founderCheck

  if (!isSupabaseConfigured) {
    if (!DemoStore.getOutbound().find(e => e.id === params.id)) return err('Entry not found', 404)
    DemoStore.deleteOutbound(params.id)
    return ok({ deleted: params.id })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)
  const { error } = await admin.from('outbound_entries').delete().eq('id', params.id)
  if (error) return err('Failed to delete: ' + error.message, 500)
  return ok({ deleted: params.id })
}
