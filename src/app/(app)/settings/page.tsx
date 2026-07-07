'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { useRouter } from 'next/navigation'
import { DEMO_USERS } from '@/lib/mockData'
import { Settings, DollarSign, Users, Trash2, Plus, Save, CheckCircle } from 'lucide-react'
import clsx from 'clsx'
import { CurrencyDisplay } from '@/lib/types'

export default function SettingsPage() {
  const { isFounder, user } = useAuth()
  const { settings, updateExchangeRate, updateCurrencyDisplay } = useSettings()
  const router = useRouter()

  const [rateInput, setRateInput] = useState(settings.exchangeRate.toString())
  const [rateSaved, setRateSaved] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [teamMembers] = useState(DEMO_USERS.filter(u => u.role === 'team_member'))

  if (!isFounder) {
    router.replace('/leads')
    return null
  }

  const handleSaveRate = () => {
    const rate = parseFloat(rateInput)
    if (!isNaN(rate) && rate > 0) {
      updateExchangeRate(rate)
      setRateSaved(true)
      setTimeout(() => setRateSaved(false), 2000)
    }
  }

  const currencyOptions: CurrencyDisplay[] = ['USD', 'PKR', 'Both']

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Configure your Agency OS workspace</p>
      </div>

      {/* Exchange Rate */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(92, 124, 250, 0.15)' }}>
            <DollarSign className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Exchange Rate</h3>
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
                  className="input-field pr-16"
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
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all',
                  rateSaved ? 'bg-emerald-600' : 'hover:opacity-90'
                )}
                style={!rateSaved ? { background: 'linear-gradient(135deg, #5c7cfa, #4263eb)' } : {}}
                id="save-rate-btn"
              >
                {rateSaved ? <><CheckCircle className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save</>}
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-1.5">Current: 1 USD = {settings.exchangeRate} PKR · Default: 280</p>
          </div>
        </div>
      </div>

      {/* Currency Display */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <Settings className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Currency Display</h3>
            <p className="text-gray-500 text-xs">How monetary values are displayed throughout the app</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {currencyOptions.map(opt => (
            <button
              key={opt}
              onClick={() => updateCurrencyDisplay(opt)}
              className={clsx(
                'p-4 rounded-xl text-center transition-all',
                settings.currencyDisplay === opt
                  ? 'bg-indigo-600 border-indigo-500'
                  : 'hover:border-indigo-500/50'
              )}
              style={settings.currencyDisplay !== opt ? {
                background: 'rgba(21, 30, 56, 0.8)',
                border: '1px solid rgba(45, 58, 94, 0.6)',
              } : {}}
              id={`currency-display-${opt.toLowerCase()}`}
            >
              <div className="text-white font-bold text-lg">{opt}</div>
              <div className="text-xs mt-1 text-gray-400">
                {opt === 'USD' ? '$1,500' : opt === 'PKR' ? 'PKR 420,000' : '$1,500 / PKR 420,000'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Team Member Management */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Team Members</h3>
            <p className="text-gray-500 text-xs">Invite and manage team member access</p>
          </div>
        </div>

        {/* Current team members */}
        <div className="space-y-2 mb-4">
          {/* Founder row */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(92, 124, 250, 0.08)', border: '1px solid rgba(92, 124, 250, 0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="text-white text-sm font-medium">{user?.name}</div>
                <div className="text-gray-500 text-xs">{user?.email}</div>
              </div>
            </div>
            <span className="badge badge-blue">Founder</span>
          </div>

          {/* Team members */}
          {teamMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(21, 30, 56, 0.6)', border: '1px solid rgba(45, 58, 94, 0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{member.name}</div>
                  <div className="text-gray-500 text-xs">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-purple">Team Member</span>
                <button className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all" id={`revoke-${member.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Invite form */}
        <div className="pt-4 border-t border-gray-800/50">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Invite via Email</label>
          <div className="flex gap-3">
            <input
              type="email"
              className="input-field flex-1"
              placeholder="teammate@agency.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              id="invite-email"
            />
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              id="send-invite-btn"
              onClick={() => {
                if (inviteEmail) {
                  alert(`Invite sent to ${inviteEmail} (Demo mode — connects to Supabase Auth in production)`)
                  setInviteEmail('')
                }
              }}
            >
              <Plus className="w-4 h-4" />
              Invite
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-1.5">
            Team members get input-only access (no dashboard, no settings).
          </p>
        </div>
      </div>

      {/* System info */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Version</div>
            <div className="text-white font-medium">Prototype v1.0</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Exchange Rate</div>
            <div className="text-indigo-400 font-medium">1 USD = {settings.exchangeRate} PKR</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Currency Display</div>
            <div className="text-white font-medium">{settings.currencyDisplay}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Database</div>
            <div className="text-yellow-400 font-medium">Local (Demo Mode)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
