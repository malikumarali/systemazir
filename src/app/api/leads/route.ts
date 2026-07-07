// ============================================================
// Agency OS — Leads API
// GET  /api/leads          — list all (founder sees all, team sees own)
// POST /api/leads          — create one
// ============================================================

import { NextRequest } from 'next/server'
import {
  ok, err, requireAuth, isAuthError, sanitizeString, sanitizeNumber,
  checkRateLimit, getClientIp
} from '@/lib/api-helpers'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { DemoStore } from '@/lib/demo-store'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const { authedUser } = authResult

  const { searchParams } = new URL(req.url)
  const source = searchParams.get('source') || undefined
  const niche = searchParams.get('niche') || undefined
  const status = searchParams.get('status') || undefined
  const from = searchParams.get('from') || undefined
  const to = searchParams.get('to') || undefined
  const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500)
  const offset = parseInt(searchParams.get('offset') || '0')

  // Demo mode
  if (!isSupabaseConfigured) {
    let leads = [...DemoStore.getLeads()]
    if (authedUser.role === 'team_member') {
      leads = leads.filter(l => l.userId === authedUser.id)
    }
    if (source) leads = leads.filter(l => l.leadSource === source)
    if (niche) leads = leads.filter(l => l.niche === niche)
    if (status) leads = leads.filter(l => l.dealStatus === status)
    if (from) leads = leads.filter(l => l.leadDate >= from)
    if (to) leads = leads.filter(l => l.leadDate <= to)
    return ok({ leads: leads.slice(offset, offset + limit), total: leads.length })
  }

  // Live Supabase
  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  let query = admin.from('leads').select('*', { count: 'exact' })

  // RLS-equivalent: team members see only their own leads
  if (authedUser.role === 'team_member') {
    query = query.eq('user_id', authedUser.id)
  }

  if (source) query = query.eq('lead_source', source)
  if (niche) query = query.eq('niche', niche)
  if (status) query = query.eq('deal_status', status)
  if (from) query = query.gte('lead_date', from)
  if (to) query = query.lte('lead_date', to)

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) return err('Database error: ' + error.message, 500)
  return ok({ leads: data, total: count })
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const { authedUser } = authResult

  let body: any
  try { body = await req.json() } catch { return err('Invalid JSON body') }

  // Validate required fields
  const clientName = sanitizeString(body.clientName || body.client_name)
  const leadSource = sanitizeString(body.leadSource || body.lead_source)
  const niche = sanitizeString(body.niche)
  const leadDate = sanitizeString(body.leadDate || body.lead_date)
  const dealStatus = sanitizeString(body.dealStatus || body.deal_status)

  if (!clientName) return err('clientName is required')
  if (!leadSource) return err('leadSource is required')
  if (!niche) return err('niche is required')
  if (!leadDate) return err('leadDate is required')
  if (!dealStatus) return err('dealStatus is required')

  const validSources = ['Meta Ads', 'Google Ads', 'Cold Call', 'Cold Email', 'Cold Social DM', 'Referral', 'Other']
  if (!validSources.includes(leadSource)) return err('Invalid leadSource value')

  const validStatuses = ['Prospect', 'Qualified', 'Appointment Set', 'Closed Won', 'Closed Lost', 'Churned']
  if (!validStatuses.includes(dealStatus)) return err('Invalid dealStatus value')

  const exchangeRate = sanitizeNumber(body.exchangeRate || body.exchange_rate, 280)
  const dealValueUsd = sanitizeNumber(body.dealValueUsd || body.deal_value_usd)
  const dealValuePkr = Math.round(dealValueUsd * exchangeRate)
  const monthlyRetainer = sanitizeNumber(body.monthlyRetainer || body.monthly_retainer)
  const notes = sanitizeString(body.notes, 2000)

  // Demo mode
  if (!isSupabaseConfigured) {
    const newLead = {
      id: `lead-${Date.now()}`,
      userId: authedUser.id,
      clientName, leadSource: leadSource as any, niche,
      leadDate, dealStatus: dealStatus as any,
      dealValueUsd, dealValuePkr, monthlyRetainer,
      notes, exchangeRate,
      createdAt: new Date().toISOString(),
    }
    DemoStore.addLead(newLead as any)
    return ok({ lead: newLead }, 201)
  }

  // Live Supabase
  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  const { data, error } = await admin.from('leads').insert({
    user_id: authedUser.id,
    client_name: clientName,
    lead_source: leadSource,
    niche,
    lead_date: leadDate,
    deal_status: dealStatus,
    deal_value_usd: dealValueUsd,
    deal_value_pkr: dealValuePkr,
    monthly_retainer: monthlyRetainer,
    notes,
    exchange_rate: exchangeRate,
  }).select().single()

  if (error) return err('Failed to create lead: ' + error.message, 500)
  return ok({ lead: data }, 201)
}
