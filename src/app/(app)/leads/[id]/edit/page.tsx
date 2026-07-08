'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useData } from '@/context/DataContext'
import { useSettings } from '@/context/SettingsContext'
import { useAuth } from '@/context/AuthContext'
import { Lead, LeadSource, DealStatus } from '@/lib/types'
import { usdToPkr } from '@/lib/currency'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const LEAD_SOURCES: LeadSource[] = ['Meta Ads', 'Google Ads', 'Cold Call', 'Cold Email', 'Cold Social DM', 'Referral', 'Other']
const DEAL_STATUSES: DealStatus[] = ['Prospect', 'Qualified', 'Appointment Set', 'Closed Won', 'Closed Lost', 'Churned']
const DEFAULT_NICHES = ['eCommerce', 'Real Estate', 'SaaS', 'Coaching', 'Local Business', 'Other']

export default function EditLeadPage() {
  const params = useParams()
  const { leads, updateLead } = useData()
  const { settings } = useSettings()
  const { isFounder } = useAuth()
  const router = useRouter()

  const lead = leads.find(l => l.id === params.id)

  const [form, setForm] = useState({
    clientName: '',
    leadSource: 'Meta Ads' as LeadSource,
    niche: 'eCommerce',
    customNiche: '',
    leadDate: '',
    dealStatus: 'Prospect' as DealStatus,
    dealValueUsd: '',
    monthlyRetainer: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!isFounder) { router.replace('/leads'); return }
    if (lead) {
      const isCustomNiche = !DEFAULT_NICHES.includes(lead.niche)
      setForm({
        clientName: lead.clientName,
        leadSource: lead.leadSource,
        niche: isCustomNiche ? 'Other' : lead.niche,
        customNiche: isCustomNiche ? lead.niche : '',
        leadDate: lead.leadDate,
        dealStatus: lead.dealStatus,
        dealValueUsd: lead.dealValueUsd.toString(),
        monthlyRetainer: lead.monthlyRetainer.toString(),
        notes: lead.notes,
      })
    }
  }, [lead, isFounder, router])

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Lead not found.</p>
        <Link href="/leads" className="text-red-600 hover:underline text-sm mt-2 inline-block">← Back to leads</Link>
      </div>
    )
  }

  const pkrPreview = form.dealValueUsd ? usdToPkr(parseFloat(form.dealValueUsd) || 0, settings.exchangeRate) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    const niche = form.niche === 'Other' ? form.customNiche : form.niche
    const dealValueUsd = parseFloat(form.dealValueUsd) || 0
    const updated: Lead = {
      ...lead,
      clientName: form.clientName,
      leadSource: form.leadSource,
      niche,
      leadDate: form.leadDate,
      dealStatus: form.dealStatus,
      dealValueUsd,
      dealValuePkr: usdToPkr(dealValueUsd, settings.exchangeRate),
      monthlyRetainer: parseFloat(form.monthlyRetainer) || 0,
      notes: form.notes,
      exchangeRate: settings.exchangeRate,
    }
    const result = await updateLead(lead.id, updated)
    setSaving(false)
    if (result.error) {
      setSaveError(result.error)
      return
    }
    router.push('/leads')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/leads" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors text-sm w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </Link>

      <div className="glass rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Lead</h2>
          <p className="text-gray-400 text-sm mt-0.5">Update {lead.clientName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Client / Deal Name <span className="text-red-400">*</span></label>
              <input type="text" className="input-field" value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} id="edit-client-name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lead Source</label>
              <select className="input-field" value={form.leadSource} onChange={e => setForm(p => ({ ...p, leadSource: e.target.value as LeadSource }))} id="edit-lead-source">
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Niche</label>
              <select className="input-field" value={form.niche} onChange={e => setForm(p => ({ ...p, niche: e.target.value }))} id="edit-niche">
                {DEFAULT_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            {form.niche === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Niche</label>
                <input type="text" className="input-field" value={form.customNiche} onChange={e => setForm(p => ({ ...p, customNiche: e.target.value }))} id="edit-custom-niche" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lead Date</label>
              <input type="date" className="input-field" value={form.leadDate} onChange={e => setForm(p => ({ ...p, leadDate: e.target.value }))} id="edit-lead-date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deal Status</label>
              <select className="input-field" value={form.dealStatus} onChange={e => setForm(p => ({ ...p, dealStatus: e.target.value as DealStatus }))} id="edit-deal-status">
                {DEAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deal Value (USD)</label>
              <div className="input-prefix-wrap">
                <span className="prefix-symbol">$</span>
                <input
                  type="number"
                  className="input-field"
                  value={form.dealValueUsd}
                  onChange={e => setForm(p => ({ ...p, dealValueUsd: e.target.value }))}
                  onFocus={e => e.target.select()}
                  onWheel={e => e.currentTarget.blur()}
                  id="edit-deal-value"
                />
              </div>
              {pkrPreview > 0 && <p className="text-gray-500 text-xs mt-1">≈ PKR {pkrPreview.toLocaleString('en-PK')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Retainer (USD)</label>
              <div className="input-prefix-wrap">
                <span className="prefix-symbol">$</span>
                <input
                  type="number"
                  className="input-field"
                  value={form.monthlyRetainer}
                  onChange={e => setForm(p => ({ ...p, monthlyRetainer: e.target.value }))}
                  onFocus={e => e.target.select()}
                  onWheel={e => e.currentTarget.blur()}
                  id="edit-retainer"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea className="input-field resize-none" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} id="edit-notes" />
          </div>
          <div className="flex gap-3 pt-2">
            <Link href="/leads" className="flex-1 py-3 rounded-xl text-gray-700 text-sm font-medium text-center transition-all hover:bg-white/5" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }} id="update-lead-btn">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Update Lead'}
            </button>
          </div>
          {saveError && (
            <p className="text-red-400 text-sm text-center mt-2">{saveError}</p>
          )}
        </form>
      </div>
    </div>
  )
}