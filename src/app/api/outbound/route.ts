// ============================================================
// Agency OS — Outbound Entries API
// GET  /api/outbound   — list
// POST /api/outbound   — create
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
    let entries = [...DemoStore.getOutbound()]
    if (authedUser.role === 'team_member') entries = entries.filter(e => e.userId === authedUser.id)
    if (channel) entries = entries.filter(e => e.channel === channel)
    if (month) entries = entries.filter(e => e.month === month)
    return ok({ entries, total: entries.length })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  let query = admin.from('outbound_entries').select('*', { count: 'exact' })
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
  const tier = sanitizeString(body.tier)

  if (!['Cold Call', 'Cold Email', 'Cold Social DM'].includes(channel)) return err('Invalid channel')
  if (!/^\d{4}-\d{2}$/.test(month)) return err('month must be YYYY-MM format')
  if (!['S', 'M', 'L'].includes(tier)) return err('tier must be S, M, or L')

  const n = (key: string) => body[key] !== undefined ? sanitizeNumber(body[key]) : undefined

  if (!isSupabaseConfigured) {
    const newEntry = {
      id: `out-${Date.now()}`,
      userId: authedUser.id,
      channel: channel as any, month, tier: tier as any,
      outbound: sanitizeNumber(body.outbound),
      connRatio: n('connRatio'), connect: n('connect'), intRatio: n('intRatio'),
      interested: n('interested'), openRatio: n('openRatio'), openRate: n('openRate'),
      responseRatio: n('responseRatio'), responseRate: n('responseRate'),
      positiveRatio: n('positiveRatio'), positiveRespond: n('positiveRespond'),
      apptRatio: sanitizeNumber(body.apptRatio), appointments: sanitizeNumber(body.appointments),
      showUpRatio: sanitizeNumber(body.showUpRatio), showUp: sanitizeNumber(body.showUp),
      closeRatio: sanitizeNumber(body.closeRatio), closings: sanitizeNumber(body.closings),
      followupRatio: sanitizeNumber(body.followupRatio),
      followupClosings: sanitizeNumber(body.followupClosings),
      totalClosings: sanitizeNumber(body.totalClosings),
      avgTicketSize: sanitizeNumber(body.avgTicketSize),
      totalSales: sanitizeNumber(body.totalSales),
      upsellRatio: sanitizeNumber(body.upsellRatio), upsellValue: sanitizeNumber(body.upsellValue),
      upsells: sanitizeNumber(body.upsells), upsellRevenue: sanitizeNumber(body.upsellRevenue),
      tRecurring: sanitizeNumber(body.tRecurring),
      listing: sanitizeNumber(body.listing), sdr: sanitizeNumber(body.sdr),
      closer: sanitizeNumber(body.closer), tools: sanitizeNumber(body.tools),
      other: sanitizeNumber(body.other), training: sanitizeNumber(body.training),
      totalEstCost: sanitizeNumber(body.totalEstCost), grossPL: sanitizeNumber(body.grossPL),
      exchangeRate: sanitizeNumber(body.exchangeRate, 280),
      createdAt: new Date().toISOString(),
    }
    DemoStore.addOutbound(newEntry as any)
    return ok({ entry: newEntry }, 201)
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  const { data, error } = await admin.from('outbound_entries').insert({
    user_id: authedUser.id, channel, month, tier,
    outbound: sanitizeNumber(body.outbound),
    conn_ratio: n('connRatio'), int_ratio: n('intRatio'),
    open_ratio: n('openRatio'), response_ratio: n('responseRatio'),
    positive_ratio: n('positiveRatio'), connect_ratio: n('connect'),
    appt_ratio: sanitizeNumber(body.apptRatio), show_up_ratio: sanitizeNumber(body.showUpRatio),
    close_ratio: sanitizeNumber(body.closeRatio), followup_ratio: sanitizeNumber(body.followupRatio),
    avg_ticket_size: sanitizeNumber(body.avgTicketSize), upsell_ratio: sanitizeNumber(body.upsellRatio),
    upsell_value: sanitizeNumber(body.upsellValue), appointments: sanitizeNumber(body.appointments),
    show_up: sanitizeNumber(body.showUp), closings: sanitizeNumber(body.closings),
    followup_closings: sanitizeNumber(body.followupClosings), total_closings: sanitizeNumber(body.totalClosings),
    total_sales: sanitizeNumber(body.totalSales), upsells: sanitizeNumber(body.upsells),
    upsell_revenue: sanitizeNumber(body.upsellRevenue), t_recurring: sanitizeNumber(body.tRecurring),
    listing: sanitizeNumber(body.listing), sdr: sanitizeNumber(body.sdr),
    closer: sanitizeNumber(body.closer), tools: sanitizeNumber(body.tools),
    other_cost: sanitizeNumber(body.other), training: sanitizeNumber(body.training),
    total_est_cost: sanitizeNumber(body.totalEstCost), gross_pl: sanitizeNumber(body.grossPL),
    exchange_rate: sanitizeNumber(body.exchangeRate, 280),
  }).select().single()

  if (error) return err('Failed to create entry: ' + error.message, 500)
  return ok({ entry: data }, 201)
}
