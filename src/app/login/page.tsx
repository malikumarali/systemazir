'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Zap, TrendingUp, Target, BarChart3, ShieldCheck } from 'lucide-react'

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
    const email = role === 'founder' ? 'founder@agencyos.com' : 'team@agencyos.com'
    setEmail(email)
    setPassword('demo123')
    const result = await login(email, 'demo123')
    if (!result.error) {
      router.replace(role === 'founder' ? '/dashboard' : '/leads')
    }
  }

  return (
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_top_left,rgba(79,124,255,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,77,77,0.12),transparent_24%),#040814]">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-red-500 shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">Agency OS</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Finally know where your{' '}
              <span className="gradient-text">best clients come from.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Track ROI, niche profitability, and lead sources in one unified operating system built for modern agencies.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Target, label: 'Lead Source Tracker', desc: 'Tag every deal to its acquisition channel' },
              { icon: TrendingUp, label: 'Revenue vs Spend', desc: 'Real ROI after team costs and ad spend' },
              { icon: BarChart3, label: 'Niche Ranking', desc: 'Know which niche generates the most profit' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 p-4 rounded-2xl glass">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/10 border border-blue-500/20">
                  <Icon className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{label}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Agency OS Prototype v1.0 · Built for founders who want clarity
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-red-500">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">Agency OS</span>
          </div>

          <div className="panel rounded-[28px] p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Welcome back</h2>
              <p className="text-slate-400 text-sm">Sign in to your agency command center</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@agencyos.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  id="login-email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    id="login-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100 transition-colors"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                id="login-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/70">
              <p className="text-slate-500 text-xs text-center mb-3">Quick demo access</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => quickLogin('founder')}
                  className="p-3 rounded-xl text-center transition-all hover:border-blue-500/50 border border-blue-500/20 bg-blue-500/10"
                  id="demo-founder-login"
                >
                  <div className="text-blue-300 font-semibold text-sm">Founder</div>
                  <div className="text-slate-500 text-xs mt-0.5">Full access</div>
                </button>
                <button
                  onClick={() => quickLogin('team')}
                  className="p-3 rounded-xl text-center transition-all hover:border-red-500/40 border border-red-500/20 bg-red-500/10"
                  id="demo-team-login"
                >
                  <div className="text-red-300 font-semibold text-sm">Team Member</div>
                  <div className="text-slate-500 text-xs mt-0.5">Input only</div>
                </button>
              </div>
              <p className="text-slate-600 text-xs text-center mt-3">Password: demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
