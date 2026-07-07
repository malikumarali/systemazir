// ============================================================
// Agency OS — Supabase Client
// This module requires NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
//
// Without these, the app runs in Demo Mode using local state.
// ============================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)

let supabase: any = null

if (isSupabaseConfigured) {
  // Dynamic import only when credentials are present
  // In production, import { createClient } from '@supabase/supabase-js'
  // supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
}

export { supabase }

/**
 * Helper: Check if we should use Supabase or local state
 */
export function useSupabase() {
  return isSupabaseConfigured && supabase !== null
}
