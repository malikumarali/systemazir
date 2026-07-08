// ============================================================
// Agency OS — Inbound Entries API
// GET  /api/inbound   — list
// POST /api/inbound   — create
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
  const channel = searchParams.get('channel') || undefined
  const month = searchParams.get('month') || undefined

  if (!isSupabaseConfigured) {
    let entries = [...DemoStore.getInbound()].filter(e => e.userId === authedUser.id)
    if (channel) entries = entries.filter(e => e.channel === channel)
    if (month) entries = entries.filter(e => e.month === month)
    return ok({ entries, total: entries.length })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  let query = admin.from('inbound_entries').select('*', { count: 'exact' })
  if (authedUser.role === 'team_member') query = query.eq('user_id', authedUser.id)
  if (channel) query = query.eq('channel', channel)
  if (month) query = query.eq('month', month)
  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query
  if (error) return err('Database error: ' + error.message, 500)
  return ok({ entries: data, total: count })
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const { authedUser } = authResult

  let body: any
  try { body = await req.json() } catch { return err('Invalid JSON body') }

  const channel = sanitizeString(body.channel)
  const month = sanitizeString(body.month)
  if (!['Meta Ads', 'Google Ads'].includes(channel)) return err('Invalid channel')
  if (!/^\d{4}-\d{2}$/.test(month)) return err('month must be YYYY-MM format')

  const n = (key: string, fallback = 0) => sanitizeNumber(body[key], fallback)

  const entry = {
    userId: authedUser.id,
    channel: channel as any, month,
    budgetUsd: n('budgetUsd'), cpc: n('cpc'), convRatio: n('convRatio'),
    apptRatio: n('apptRatio'), showUpRatio: n('showUpRatio'), closeRatio: n('closeRatio'),
    followupRatio: n('followupRatio'), avgTicketSize: n('avgTicketSize'),
    upsellRatio: n('upsellRatio'), upsellValue: n('upsellValue'),
    pipelineDeals: n('pipelineDeals'), clicks: n('clicks'), leads: n('leads'),
    appointments: n('appointments'), showUp: n('showUp'), closings: n('closings'),
    followupClosings: n('followupClosings'), totalClosings: n('totalClosings'),
    totalSales: n('totalSales'), upsells: n('upsells'), upsellRevenue: n('upsellRevenue'),
    tRecurring: n('tRecurring'), costPerLead: n('costPerLead'),
    costPerAppointment: n('costPerAppointment'), cac: n('cac'), roas: n('roas'),
    pipelineWorth: n('pipelineWorth'), grossPL: n('grossPL'),
    exchangeRate: n('exchangeRate', 280),
    createdAt: new Date().toISOString(),
  }

  if (!isSupabaseConfigured) {
    const newEntry = { id: `inb-${Date.now()}`, ...entry }
    DemoStore.addInbound(newEntry as any)
    return ok({ entry: newEntry }, 201)
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  // Map camelCase to snake_case for Supabase
  const { data, error } = await admin.from('inbound_entries').insert({
    user_id: entry.userId, channel: entry.channel, month: entry.month,
    budget_usd: entry.budgetUsd, cpc: entry.cpc, conv_ratio: entry.convRatio,
    appt_ratio: entry.apptRatio, show_up_ratio: entry.showUpRatio,
    close_ratio: entry.closeRatio, followup_ratio: entry.followupRatio,
    avg_ticket_size: entry.avgTicketSize, upsell_ratio: entry.upsellRatio,
    upsell_value: entry.upsellValue, clicks: entry.clicks, leads: entry.leads,
    appointments: entry.appointments, show_up: entry.showUp, closings: entry.closings,
    followup_closings: entry.followupClosings, total_closings: entry.totalClosings,
    total_sales: entry.totalSales, upsells: entry.upsells, upsell_revenue: entry.upsellRevenue,
    t_recurring: entry.tRecurring, cost_per_lead: entry.costPerLead,
    cost_per_appointment: entry.costPerAppointment, cac: entry.cac, roas: entry.roas,
    pipeline_deals: entry.pipelineDeals, pipeline_worth: entry.pipelineWorth,
    gross_pl: entry.grossPL, exchange_rate: entry.exchangeRate,
  }).select().single()

  if (error) return err('Failed to create entry: ' + error.message, 500)
  return ok({ entry: data }, 201)
}
