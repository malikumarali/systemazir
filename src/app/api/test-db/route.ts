import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      status: 'demo_mode',
      message: 'Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to test DB connection.',
      ok: true
    })
  }

  try {
    const supabase = createServerSupabaseClient()
    
    // Perform a simple test query to verify the connection works
    // In PostgreSQL, querying profiles or settings is a great check.
    // Since we may not have auth headers in this browser test, let's run a query that validates the client can speak to Supabase.
    // Supabase JS allows querying public tables or calling RPC.
    // Let's do a select from profiles or just read settings.
    const { data, error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      // If error is related to permission/RLS (e.g. 401/403/PGRST301), the connection still works but is blocked by security (which is expected without a token).
      // If error is network or credentials invalid, it means the connection failed.
      const isConnectionError = error.message.includes('FetchError') || error.message.includes('Failed to fetch') || error.code === 'PGRST100'
      
      return NextResponse.json({
        status: isConnectionError ? 'connection_failed' : 'connected_with_auth_required',
        message: 'Supabase responded, but with an error status (likely expected if unauthenticated).',
        ok: !isConnectionError,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      })
    }

    return NextResponse.json({
      status: 'connected',
      message: 'Successfully connected to Supabase and fetched test records.',
      ok: true,
      data
    })
  } catch (err: any) {
    return NextResponse.json({
      status: 'exception',
      message: 'An exception occurred while attempting to connect.',
      ok: false,
      error: err.message || err
    }, { status: 500 })
  }
}
