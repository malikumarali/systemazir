// ============================================================
// Agency OS — Leads: Single record operations
// GET    /api/leads/[id]   — get one
// PUT    /api/leads/[id]   — update (founder only)
// DELETE /api/leads/[id]   — delete (founder only)
// ============================================================

import { NextRequest } from 'next/server'
import {
  ok, err, requireAuth, isAuthError, requireFounder,
  sanitizeString, sanitizeNumber, checkRateLimit, getClientIp
} from '@/lib/api-helpers'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { DemoStore } from '@/lib/demo-store'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const { authedUser } = authResult

  if (!isSupabaseConfigured) {
    const lead = DemoStore.getLeads().find(l => l.id === params.id)
    if (!lead) return err('Lead not found', 404)
    if (authedUser.role === 'team_member' && lead.userId !== authedUser.id) {
      return err('Access denied', 403)
    }
    return ok({ lead })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  const { data, error } = await admin.from('leads').select('*').eq('id', params.id).single()
  if (error || !data) return err('Lead not found', 404)
  if (authedUser.role === 'team_member' && data.user_id !== authedUser.id) return err('Access denied', 403)
  return ok({ lead: data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const { authedUser } = authResult

  const founderCheck = requireFounder(authedUser)
  if (founderCheck) return founderCheck

  let body: any
  try { body = await req.json() } catch { return err('Invalid JSON body') }

  if (!isSupabaseConfigured) {
    const lead = DemoStore.getLeads().find(l => l.id === params.id)
    if (!lead) return err('Lead not found', 404)

    const patch: Partial<typeof lead> = {}
    if (body.clientName !== undefined) patch.clientName = sanitizeString(body.clientName) as any
    if (body.leadSource !== undefined) patch.leadSource = sanitizeString(body.leadSource) as any
    if (body.niche !== undefined) patch.niche = sanitizeString(body.niche)
    if (body.leadDate !== undefined) patch.leadDate = sanitizeString(body.leadDate)
    if (body.dealStatus !== undefined) patch.dealStatus = sanitizeString(body.dealStatus) as any
    if (body.dealValueUsd !== undefined) patch.dealValueUsd = sanitizeNumber(body.dealValueUsd)
    if (body.monthlyRetainer !== undefined) patch.monthlyRetainer = sanitizeNumber(body.monthlyRetainer)
    if (body.notes !== undefined) patch.notes = sanitizeString(body.notes, 2000)
    if (body.exchangeRate !== undefined) patch.exchangeRate = sanitizeNumber(body.exchangeRate, 280)

    DemoStore.updateLead(params.id, patch)
    const updated = DemoStore.getLeads().find(l => l.id === params.id)
    return ok({ lead: updated })
  }

  const patch: Record<string, any> = {}
  if (body.clientName !== undefined) patch.client_name = sanitizeString(body.clientName)
  if (body.leadSource !== undefined) patch.lead_source = sanitizeString(body.leadSource)
  if (body.niche !== undefined) patch.niche = sanitizeString(body.niche)
  if (body.leadDate !== undefined) patch.lead_date = sanitizeString(body.leadDate)
  if (body.dealStatus !== undefined) patch.deal_status = sanitizeString(body.dealStatus)
  if (body.dealValueUsd !== undefined) patch.deal_value_usd = sanitizeNumber(body.dealValueUsd)
  if (body.monthlyRetainer !== undefined) patch.monthly_retainer = sanitizeNumber(body.monthlyRetainer)
  if (body.notes !== undefined) patch.notes = sanitizeString(body.notes, 2000)
  if (body.exchangeRate !== undefined) patch.exchange_rate = sanitizeNumber(body.exchangeRate, 280)
  if (patch.deal_value_usd !== undefined && patch.exchange_rate !== undefined) {
    patch.deal_value_pkr = Math.round(patch.deal_value_usd * patch.exchange_rate)
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  const { data, error } = await admin.from('leads').update(patch).eq('id', params.id).select().single()
  if (error || !data) return err('Failed to update lead: ' + (error?.message || 'not found'), 404)
  return ok({ lead: data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const { authedUser } = authResult

  const founderCheck = requireFounder(authedUser)
  if (founderCheck) return founderCheck

  if (!isSupabaseConfigured) {
    const exists = DemoStore.getLeads().find(l => l.id === params.id)
    if (!exists) return err('Lead not found', 404)
    DemoStore.deleteLead(params.id)
    return ok({ deleted: params.id })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  const { error } = await admin.from('leads').delete().eq('id', params.id)
  if (error) return err('Failed to delete lead: ' + error.message, 500)
  return ok({ deleted: params.id })
}
