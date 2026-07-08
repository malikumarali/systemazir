'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AgencyOS] App error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--ink-900, #0d0e13)',
      flexDirection: 'column',
      gap: 20,
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          width: 48, height: 48,
          background: 'rgba(239,68,68,0.1)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 22,
        }}>
          ⚠️
        </div>
        <h2 style={{
          color: '#f1f5f9', fontSize: 20, fontWeight: 700,
          marginBottom: 8, letterSpacing: '-0.02em',
        }}>
          Page error
        </h2>
        <p style={{
          color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24,
        }}>
          This page encountered an error. Your data is safe.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/leads'}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}
