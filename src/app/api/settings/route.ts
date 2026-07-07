// ============================================================
// Agency OS — Settings API (Founder only)
// GET /api/settings  — get settings
// PUT /api/settings  — update settings
// ============================================================

import { NextRequest } from 'next/server'
import {
  ok, err, requireAuth, isAuthError, requireFounder,
  sanitizeNumber, sanitizeString, checkRateLimit, getClientIp
} from '@/lib/api-helpers'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const founderCheck = requireFounder(authResult.authedUser)
  if (founderCheck) return founderCheck

  if (!isSupabaseConfigured) {
    return ok({ settings: { exchangeRate: 280, currencyDisplay: 'Both' } })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  const { data } = await admin
    .from('settings')
    .select('*')
    .eq('user_id', authResult.authedUser.id)
    .single()

  return ok({
    settings: data
      ? { exchangeRate: data.exchange_rate, currencyDisplay: data.currency_display }
      : { exchangeRate: 280, currencyDisplay: 'Both' }
  })
}

export async function PUT(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) return err('Too many requests', 429)

  const authResult = await requireAuth(req)
  if (isAuthError(authResult)) return authResult
  const founderCheck = requireFounder(authResult.authedUser)
  if (founderCheck) return founderCheck

  let body: any
  try { body = await req.json() } catch { return err('Invalid JSON body') }

  const exchangeRate = sanitizeNumber(body.exchangeRate, 280)
  const currencyDisplay = sanitizeString(body.currencyDisplay)

  if (exchangeRate <= 0) return err('exchangeRate must be positive')
  const validDisplays = ['USD', 'PKR', 'Both']
  if (currencyDisplay && !validDisplays.includes(currencyDisplay)) {
    return err('currencyDisplay must be USD, PKR, or Both')
  }

  if (!isSupabaseConfigured) {
    return ok({ settings: { exchangeRate, currencyDisplay: currencyDisplay || 'Both' } })
  }

  const admin = getSupabaseAdmin()
  if (!admin) return err('Server error', 500)

  const { data, error } = await admin.from('settings').upsert({
    user_id: authResult.authedUser.id,
    exchange_rate: exchangeRate,
    currency_display: currencyDisplay || 'Both',
    updated_at: new Date().toISOString(),
  }).select().single()

  if (error) return err('Failed to save settings: ' + error.message, 500)
  return ok({
    settings: { exchangeRate: data.exchange_rate, currencyDisplay: data.currency_display }
  })
}
