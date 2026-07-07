'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Target, TrendingUp, BarChart3, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      const stored = localStorage.getItem('agencyos_user')
      const user = stored ? JSON.parse(stored) : null
      router.replace(user?.role === 'founder' ? '/dashboard' : '/leads')
    }
  }

  const quickLogin = async (role: 'founder' | 'team') => {
    const e = role === 'founder' ? 'founder@agencyos.com' : 'team@agencyos.com'
    setEmail(e)
    setPassword('demo123')
    const result = await login(e, 'demo123')
    if (!result.error) {
      router.replace(role === 'founder' ? '/dashboard' : '/leads')
    }
  }

  const FEATURES = [
    { icon: Target, label: 'Lead Source Attribution', desc: 'Every deal tagged to its acquisition channel — no guessing.' },
    { icon: TrendingUp, label: 'True ROI Calculation', desc: 'Revenue minus all costs. The number that actually matters.' },
    { icon: BarChart3, label: 'Niche Profitability Rank', desc: 'Which niche makes you money? Now you know for certain.' },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ink-900)' }}>

      {/* ---- Left: Statement panel ---- */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between relative overflow-hidden"
        style={{
          background: 'var(--ink-800)',
          borderRight: '1px solid var(--ink-600)',
        }}
      >
        {/* Sienna top accent bar */}
        <div style={{ height: '3px', background: 'var(--sienna)', width: '100%' }} />

        {/* Content */}
        <div className="flex flex-col flex-1 px-14 py-12">
          {/* Wordmark */}
          <div className="flex items-center gap-3 mb-auto">
            <div style={{
              width: 10, height: 10,
              background: 'var(--sienna)',
              borderRadius: 2,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--cream-muted)',
            }}>
              Agency OS
            </span>
          </div>

          {/* Main statement — deliberately off-center, large */}
          <div style={{ paddingTop: '15vh', paddingBottom: '4vh' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--sienna)',
              marginBottom: 20,
            }}>
              Performance Intelligence
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
              lineHeight: 1.05,
              color: 'var(--cream)',
              letterSpacing: '-0.02em',
              maxWidth: 480,
            }}>
              Finally know where your best clients actually come from.
            </h1>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              lineHeight: 1.7,
              color: 'var(--ink-300)',
              marginTop: 20,
              maxWidth: 400,
              fontWeight: 400,
            }}>
              ROI, niche profitability, and acquisition attribution. One operating system built for agencies that demand clarity over comfort.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '16px 0',
                  borderTop: '1px solid var(--ink-600)',
                }}
              >
                <div style={{
                  width: 32, height: 32,
                  background: 'var(--sienna-faint)',
                  border: '1px solid rgba(194,82,42,0.2)',
                  borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={14} color="var(--sienna)" strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--cream)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-300)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 56px',
          borderTop: '1px solid var(--ink-600)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <ShieldCheck size={13} color="var(--ink-400)" strokeWidth={1.5} />
          <span style={{ fontSize: 11, color: 'var(--ink-400)' }}>
            Agency OS v1.0 · Session-secured · Role-based access
          </span>
        </div>
      </div>

      {/* ---- Right: Login form ---- */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12" style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Mobile wordmark */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <div style={{ width: 8, height: 8, background: 'var(--sienna)', borderRadius: 1 }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>
            Agency OS
          </span>
        </div>

        {/* Form header */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', lineHeight: 1.1, marginBottom: 8 }}>
            Sign in
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-300)', fontWeight: 400 }}>
            Access your agency command center
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-300)', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              className="field"
              placeholder="you@agency.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              id="login-email"
              autoComplete="email"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-300)', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="field"
                style={{ paddingRight: 44 }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                id="login-password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--ink-400)', display: 'flex', alignItems: 'center',
                  padding: 4,
                }}
              >
                {showPw ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(217,79,79,0.08)',
              border: '1px solid rgba(217,79,79,0.3)',
              borderLeft: '2px solid #d94f4f',
              borderRadius: 2,
              fontSize: 13,
              color: '#e88080',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary press-effect"
            style={{ marginTop: 4, padding: '12px 20px', fontSize: 14 }}
            id="login-submit"
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14 }} />
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={14} strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        {/* Demo access */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--ink-600)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 12 }}>
            Demo Access
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              onClick={() => quickLogin('founder')}
              className="btn btn-ghost press-effect"
              style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '12px 14px' }}
              id="demo-founder-login"
            >
              <span style={{ fontWeight: 700, color: 'var(--sienna-light)' }}>Founder</span>
              <span style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 400 }}>Full access</span>
            </button>
            <button
              onClick={() => quickLogin('team')}
              className="btn btn-ghost press-effect"
              style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '12px 14px' }}
              id="demo-team-login"
            >
              <span style={{ fontWeight: 700, color: 'var(--cream-muted)' }}>Team Member</span>
              <span style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 400 }}>Input only</span>
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 10, textAlign: 'center' }}>
            Password: <span style={{ color: 'var(--ink-400)', fontWeight: 600 }}>demo123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
