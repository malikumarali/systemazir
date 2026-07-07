// Inbound [id] PUT / DELETE (founder only)
import { NextRequest } from 'next/server'
import { ok, err, requireAuth, isAuthError, requireFounder, sanitizeNumber, checkRateLimit, getClientIp } from '@/lib/api-helpers'
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
    const entry = DemoStore.getInbound().find(e => e.id === params.id)
    if (!entry) return err('Entry not found', 404)
    // Simple partial update — build patch
    const updated = { ...entry, ...body }
    DemoStore.deleteInbound(params.id)
    DemoStore.addInbound(updated)
    return ok({ entry: updated })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  const patch: Record<string, any> = {}
  const map: Record<string, string> = {
    budgetUsd: 'budget_usd', cpc: 'cpc', convRatio: 'conv_ratio',
    apptRatio: 'appt_ratio', showUpRatio: 'show_up_ratio', closeRatio: 'close_ratio',
    followupRatio: 'followup_ratio', avgTicketSize: 'avg_ticket_size',
    upsellRatio: 'upsell_ratio', upsellValue: 'upsell_value',
    tRecurring: 't_recurring', grossPL: 'gross_pl', exchangeRate: 'exchange_rate',
  }
  for (const [camel, snake] of Object.entries(map)) {
    if (body[camel] !== undefined) patch[snake] = sanitizeNumber(body[camel])
  }

  const { data, error } = await admin.from('inbound_entries').update(patch).eq('id', params.id).select().single()
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
    const exists = DemoStore.getInbound().find(e => e.id === params.id)
    if (!exists) return err('Entry not found', 404)
    DemoStore.deleteInbound(params.id)
    return ok({ deleted: params.id })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)
  const { error } = await admin.from('inbound_entries').delete().eq('id', params.id)
  if (error) return err('Failed to delete: ' + error.message, 500)
  return ok({ deleted: params.id })
}
