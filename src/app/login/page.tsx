'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Target, TrendingUp, BarChart3, ArrowRight, ShieldCheck, UserPlus, LogIn } from 'lucide-react'
import './login.css'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (isSignUp) {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        const json = await res.json()
        setLoading(false)
        if (!res.ok || !json.ok) {
          setError(json.error || 'Failed to create account')
        } else {
          setSuccess('Account created. You can now sign in.')
          setIsSignUp(false)
          setPassword('')
        }
      } catch (err: any) {
        setLoading(false)
        setError(err.message || 'An error occurred')
      }
    } else {
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
  }

  const FEATURES = [
    { icon: Target, label: 'Lead Source Attribution', desc: 'Every deal tagged to its acquisition channel.' },
    { icon: TrendingUp, label: 'True ROI Calculation', desc: 'Revenue minus all costs. The number that matters.' },
    { icon: BarChart3, label: 'Niche Profitability Rank', desc: 'Which niche makes you money? Now you know.' },
  ]

  return (
    <div className="login-root">

      {/* LEFT — sticky, stays in view */}
      <div className="left-panel">
        <div className="left-top-bar" />
        <div className="left-inner">
          <div className="wordmark">
            <div className="wordmark-dot" />
            <span className="wordmark-text">Systemizer</span>
          </div>

          <div className="headline-area">
            <p className="eyebrow">Performance Intelligence</p>
            <h1 className="main-headline">
              Only the funnel you <em>NEED</em> for your revenue and client tracking
            </h1>
            <p className="sub-text">
  ROI, niche profitability, and acquisition attribution <br />
  A 360 Solution built for agencies that demand clarity.
</p>
          </div>

          <div className="feature-list">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div className="feature-item" key={label}>
                <div className="feature-icon">
                  <Icon size={13} color="#d32f2f" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="feature-label">{label}</div>
                  <div className="feature-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="left-footer">
          <ShieldCheck size={12} color="#4a4642" strokeWidth={1.5} />
          <span>Systemizer v1.0 · Session-secured · Role-based access</span>
        </div>
      </div>

      {/* RIGHT — scrollable */}
      <div className="right-panel">
        <div className="form-box">
          <h2 className="form-title">{isSignUp ? 'Create Account' : 'Sign in'}</h2>
          <p className="form-sub">
            {isSignUp ? 'Set up your agency command center' : 'Access your agency command center'}
          </p>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="field-wrap">
                <label className="field-label">Full Name</label>
                <input type="text" className="field-input" placeholder="Alex Founder"
                  value={name} onChange={e => setName(e.target.value)} required id="signup-name" />
              </div>
            )}

            <div className="field-wrap">
              <label className="field-label">Email Address</label>
              <input type="email" className="field-input" placeholder="you@agency.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required id="login-email" autoComplete="email" />
            </div>

            <div className="field-wrap">
              <label className="field-label">Password</label>
              <div className="pw-wrap">
                <input type={showPw ? 'text' : 'password'} className="field-input"
                  style={{ paddingRight: 44 }} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required id="login-password" autoComplete="current-password" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}
            {success && <div className="success-box">{success}</div>}

            <button type="submit" disabled={loading} className="submit-btn" id="login-submit">
              {loading
                ? <><div className="spinner-sm" /> Processing…</>
                : <>{isSignUp ? 'Create Account' : 'Sign In'}<ArrowRight size={14} strokeWidth={2} /></>
              }
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <button className="toggle-btn"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}>
              {isSignUp
                ? <><LogIn size={13} /> Already have an account? Sign In</>
                : <><UserPlus size={13} /> Register Founder Account</>
              }
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}