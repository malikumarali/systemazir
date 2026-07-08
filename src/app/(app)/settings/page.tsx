'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { useRouter } from 'next/navigation'
import { Settings, DollarSign, Users, Trash2, Plus, Save, CheckCircle } from 'lucide-react'
import { CurrencyDisplay } from '@/lib/types'
import { isSupabaseConfigured } from '@/lib/supabase'

interface TeamMember {
  id: string
  email: string
  name: string
  role: string
  created_at?: string
}

export default function SettingsPage() {
  const { isFounder, user } = useAuth()
  const { settings, updateExchangeRate, updateCurrencyDisplay } = useSettings()
  const router = useRouter()

  const [rateInput, setRateInput] = useState(settings.exchangeRate.toString())
  const [rateSaved, setRateSaved] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('agencyos_token')
    const userObj = localStorage.getItem('agencyos_user')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (userObj) {
      try {
        const parsed = JSON.parse(userObj)
        headers['x-demo-user-id'] = parsed.id
      } catch {}
    }
    return headers
  }, [])

  const fetchTeam = useCallback(async () => {
    setLoadingTeam(true)
    try {
      const res = await fetch('/api/auth/team', {
        headers: getHeaders(),
      })
      const json = await res.json()
      if (res.ok && json.ok) {
        setTeamMembers(json.data.team || [])
      }
    } catch {
      // Fallback
    } finally {
      setLoadingTeam(false)
    }
  }, [getHeaders])

  useEffect(() => {
    if (!isFounder) {
      router.replace('/leads')
      return
    }
    fetchTeam()
  }, [isFounder, router, fetchTeam])

  const handleSaveRate = () => {
    const rate = parseFloat(rateInput)
    if (!isNaN(rate) && rate > 0) {
      updateExchangeRate(rate)
      setRateSaved(true)
      setTimeout(() => setRateSaved(false), 2000)
    }
  }

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')
    setInviteLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          email: inviteEmail,
          password: invitePassword,
          name: inviteName,
          role: 'team_member'
        })
      })
      const json = await res.json()
      setInviteLoading(false)
      if (!res.ok || !json.ok) {
        setInviteError(json.error || 'Failed to create team member')
      } else {
        setInviteSuccess('Team member created successfully!')
        setInviteEmail('')
        setInviteName('')
        setInvitePassword('')
        fetchTeam() // Refresh list
      }
    } catch (err: any) {
      setInviteLoading(false)
      setInviteError(err.message || 'An error occurred')
    }
  }

  if (!isFounder) return null

  const currencyOptions: CurrencyDisplay[] = ['USD', 'PKR', 'Both']

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Configure your Agency OS workspace</p>
      </div>

      {/* Exchange Rate */}
      <div className="panel p-6" style={{ background: 'var(--ink-800)', border: '1px solid var(--ink-600)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: 'var(--sienna-faint)', border: '1px solid rgba(211,47,47,0.2)' }}>
            <DollarSign className="w-5 h-5 text-sienna" />
          </div>
          <div>
            <h3 className="text-white font-semibold font-display">Exchange Rate</h3>
            <p className="text-gray-500 text-xs">USD to PKR conversion rate used across all calculations</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">1 USD = ? PKR</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  className="field pr-16"
                  value={rateInput}
                  onChange={e => setRateInput(e.target.value)}
                  min="1"
                  step="1"
                  id="exchange-rate-input"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">PKR</span>
              </div>
              <button
                onClick={handleSaveRate}
                className="btn btn-primary press-effect"
                id="save-rate-btn"
                style={{ padding: '10px 20px' }}
              >
                {rateSaved ? <><CheckCircle className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save</>}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1.5">Current: 1 USD = {settings.exchangeRate} PKR · Default: 280</p>
          </div>
        </div>
      </div>

      {/* Currency Display */}
      <div className="panel p-6" style={{ background: 'var(--ink-800)', border: '1px solid var(--ink-600)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: 'var(--sienna-faint)', border: '1px solid rgba(211,47,47,0.2)' }}>
            <Settings className="w-5 h-5 text-sienna" />
          </div>
          <div>
            <h3 className="text-white font-semibold font-display">Currency Display</h3>
            <p className="text-gray-500 text-xs">How monetary values are displayed throughout the app</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {currencyOptions.map(opt => (
            <button
              key={opt}
              onClick={() => updateCurrencyDisplay(opt)}
              className="p-4 transition-all text-center"
              style={{
                background: settings.currencyDisplay === opt ? 'var(--sienna)' : 'var(--ink-700)',
                border: settings.currencyDisplay === opt ? '1px solid var(--sienna)' : '1px solid var(--ink-600)',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
              id={`currency-display-${opt.toLowerCase()}`}
            >
              <div className="text-white font-bold text-lg font-display">{opt}</div>
              <div className="text-xs mt-1 text-gray-400">
                {opt === 'USD' ? '$1,500' : opt === 'PKR' ? 'PKR 420,000' : '$1,500 / PKR 420,000'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Team Member Management */}
      <div className="panel p-6" style={{ background: 'var(--ink-800)', border: '1px solid var(--ink-600)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: 'var(--sienna-faint)', border: '1px solid rgba(211,47,47,0.2)' }}>
            <Users className="w-5 h-5 text-sienna" />
          </div>
          <div>
            <h3 className="text-white font-semibold font-display">Team Members</h3>
            <p className="text-gray-500 text-xs">Register and manage team member access</p>
          </div>
        </div>

        {/* Current team members */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Workspace Roster</div>
          
          {/* Founder row */}
          <div className="flex items-center justify-between p-3" style={{ background: 'var(--ink-700)', border: '1px solid var(--ink-600)', borderRadius: '2px' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sienna flex items-center justify-center text-white text-xs font-bold font-display" style={{ borderRadius: '2px' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white text-sm font-medium">{user?.name}</div>
                <div className="text-gray-500 text-xs">{user?.email}</div>
              </div>
            </div>
            <span className="badge badge-sienna">Founder</span>
          </div>

          {/* Team members */}
          {loadingTeam ? (
            <div className="text-center py-4 text-xs text-gray-500">Loading roster…</div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-500">No team members registered yet.</div>
          ) : (
            teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3" style={{ background: 'var(--ink-900)', border: '1px solid var(--ink-600)', borderRadius: '2px' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 flex items-center justify-center text-white text-xs font-bold font-display" style={{ borderRadius: '2px' }}>
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{member.name}</div>
                    <div className="text-gray-500 text-xs">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-gray">Team Member</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Invite/Add form */}
        <form onSubmit={handleAddTeamMember} className="pt-4 border-t" style={{ borderTopColor: 'var(--ink-600)' }}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add Team Member</div>
          
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
              <input
                type="text"
                className="field"
                placeholder="Sam Teammate"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                required
                id="invite-name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                className="field"
                placeholder="teammate@agency.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
                id="invite-email"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Temporary Password (min 8 chars)</label>
              <input
                type="password"
                className="field"
                placeholder="••••••••"
                value={invitePassword}
                onChange={e => setInvitePassword(e.target.value)}
                required
                id="invite-password"
              />
            </div>
          </div>

          {inviteError && (
            <div className="p-3 mb-3 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-sm">
              {inviteError}
            </div>
          )}

          {inviteSuccess && (
            <div className="p-3 mb-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-sm">
              {inviteSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={inviteLoading}
            className="btn btn-primary press-effect w-full py-2.5"
            id="send-invite-btn"
          >
            {inviteLoading ? (
              <div className="spinner" style={{ width: 14, height: 14 }} />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Team Member
              </>
            )}
          </button>
          
          <p className="text-gray-500 text-xs mt-2.5">
            Registered team members can log in using their credentials and will have input-only access.
          </p>
        </form>
      </div>

      {/* System info */}
      <div className="panel p-4" style={{ background: 'var(--ink-800)', border: '1px solid var(--ink-600)' }}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Version</div>
            <div className="text-white font-medium">Production v1.0</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Exchange Rate</div>
            <div className="text-sienna font-medium">1 USD = {settings.exchangeRate} PKR</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Currency Display</div>
            <div className="text-white font-medium">{settings.currencyDisplay}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Database</div>
            <div className="font-medium" style={{ color: isSupabaseConfigured ? '#4a9e6b' : '#d4a85a' }}>
              {isSupabaseConfigured ? 'Live (Supabase DB)' : 'Local (Demo Mode)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
