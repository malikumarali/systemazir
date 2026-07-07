'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ink-900)',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 4, height: 40,
          background: 'var(--sienna)',
          animation: 'loadBar 0.8s ease-in-out infinite alternate',
        }} />
        <style>{`
          @keyframes loadBar {
            from { transform: scaleY(0.4); opacity: 0.4; }
            to   { transform: scaleY(1); opacity: 1; }
          }
        `}</style>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>
          Loading
        </span>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--ink-900)',
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }} className="animate-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
