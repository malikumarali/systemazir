'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AgencyOS] Unhandled error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0e13',
        flexDirection: 'column',
        gap: 24,
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{
            width: 56, height: 56,
            background: 'rgba(239,68,68,0.12)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 24,
          }}>
            ⚠️
          </div>
          <h1 style={{
            color: '#f1f5f9', fontSize: 22, fontWeight: 700,
            marginBottom: 8, letterSpacing: '-0.02em',
          }}>
            Something went wrong
          </h1>
          <p style={{
            color: '#94a3b8', fontSize: 14, lineHeight: 1.6,
            marginBottom: 28,
          }}>
            An unexpected error occurred. Your data is safe — this was a display issue only.
          </p>
          <button
            onClick={reset}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ color: '#475569', fontSize: 11, marginTop: 16 }}>
              Error ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
