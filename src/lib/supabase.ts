// ============================================================
// Agency OS — Supabase Client Configuration
// Fixed: uses proper static imports instead of require()
// Two clients:
//   - browser client (anon key)
//   - admin client  (service role — server only, never ship to browser)
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const isSupabaseConfigured = !!(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your_supabase')
)

// ---------------------------------------------------------------
// Browser client (anon key — safe for client components)
// ---------------------------------------------------------------
let _supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (_supabaseClient) return _supabaseClient
  _supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'agencyos_session',
    },
  })
  return _supabaseClient
}

// ---------------------------------------------------------------
// Admin client (service role — SERVER ONLY, never import in client components)
// ---------------------------------------------------------------
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured || !SUPABASE_SERVICE_KEY) return null
  if (_supabaseAdmin) return _supabaseAdmin
  _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return _supabaseAdmin
}

// Legacy export
export const supabase = null
export function useSupabase() {
  return isSupabaseConfigured
}
