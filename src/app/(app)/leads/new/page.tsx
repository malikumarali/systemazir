'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/context/DataContext'
import { useSettings } from '@/context/SettingsContext'
import { useAuth } from '@/context/AuthContext'
import { Lead, LeadSource, DealStatus } from '@/lib/types'
import { usdToPkr } from '@/lib/currency'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import ExcelUpload from '@/components/shared/ExcelUpload'

const LEAD_SOURCES: LeadSource[] = ['Meta Ads', 'Google Ads', 'Cold Call', 'Cold Email', 'Cold Social DM', 'Referral', 'Other']
const DEAL_STATUSES: DealStatus[] = ['Prospect', 'Qualified', 'Appointment Set', 'Closed Won', 'Closed Lost', 'Churned']
const DEFAULT_NICHES = ['eCommerce', 'Real Estate', 'SaaS', 'Coaching', 'Local Business', 'Other']

interface FormData {
  clientName: string
  leadSource: LeadSource
  niche: string
  customNiche: string
  leadDate: string
  dealStatus: DealStatus
  dealValueUsd: string
  monthlyRetainer: string
  notes: string
}

export default function NewLeadPage() {
  const { addLead } = useData()
  const { settings } = useSettings()
  const { user } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState<FormData>({
    clientName: '',
    leadSource: 'Meta Ads',
    niche: 'eCommerce',
    customNiche: '',
    leadDate: new Date().toISOString().split('T')[0],
    dealStatus: 'Prospect',
    dealValueUsd: '',
    monthlyRetainer: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [saving, setSaving] = useState(false)

  const pkrPreview = form.dealValueUsd
    ? usdToPkr(parseFloat(form.dealValueUsd) || 0, settings.exchangeRate)
    : 0

  const validate = (): boolean => {
    const e: Partial<FormData> = {}
    if (!form.clientName.trim()) e.clientName = 'Client name is required'
    if (!form.dealValueUsd || isNaN(parseFloat(form.dealValueUsd))) e.dealValueUsd = 'Valid deal value required'
    if (!form.leadDate) e.leadDate = 'Lead date is required'
    if (form.niche === 'Other' && !form.customNiche.trim()) e.customNiche = 'Please specify the niche'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    const niche = form.niche === 'Other' ? form.customNiche : form.niche
    const dealValueUsd = parseFloat(form.dealValueUsd) || 0

    const lead: Lead = {
      id: `lead-${Date.now()}`,
      userId: user?.id || '',
      clientName: form.clientName.trim(),
      leadSource: form.leadSource,
      niche,
      leadDate: form.leadDate,
      dealStatus: form.dealStatus,
      dealValueUsd,
      dealValuePkr: usdToPkr(dealValueUsd, settings.exchangeRate),
      monthlyRetainer: parseFloat(form.monthlyRetainer) || 0,
      notes: form.notes.trim(),
      exchangeRate: settings.exchangeRate,
      createdAt: new Date().toISOString(),
    }

    addLead(lead)
    setSaving(false)
    router.push('/leads')
  }

  const handleUploadData = (data: Record<string, string>) => {
    setForm(prev => ({
      ...prev,
      clientName: data.clientName || data['Client / Deal Name'] || prev.clientName,
      leadSource: (data.leadSource || data['Lead Source'] || prev.leadSource) as LeadSource,
      niche: data.niche || data['Niche / Industry'] || prev.niche,
      leadDate: data.leadDate || data['Lead Date'] || prev.leadDate,
      dealStatus: (data.dealStatus || data['Deal Status'] || prev.dealStatus) as DealStatus,
      dealValueUsd: data.dealValueUsd || data['Deal Value (USD)'] || prev.dealValueUsd,
      monthlyRetainer: data.monthlyRetainer || data['Monthly Retainer'] || prev.monthlyRetainer,
      notes: data.notes || data['Notes'] || prev.notes,
    }))
  }

  const field = (label: string, required: boolean, children: React.ReactNode, error?: string, hint?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/leads" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </Link>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Add New Lead</h2>
            <p className="text-gray-400 text-sm mt-0.5">Record a new client or deal</p>
          </div>
          <ExcelUpload
            onData={handleUploadData}
            expectedFields={['clientName', 'leadSource', 'niche', 'leadDate', 'dealStatus', 'dealValueUsd']}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {field('Client / Deal Name', true,
              <input
                type="text"
                className={`input-field ${errors.clientName ? 'error' : ''}`}
                placeholder="e.g. ShopMax eCommerce"
                value={form.clientName}
                onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
                id="lead-client-name"
              />, errors.clientName
            )}

            {field('Lead Source', true,
              <select
                className="input-field"
                value={form.leadSource}
                onChange={e => setForm(p => ({ ...p, leadSource: e.target.value as LeadSource }))}
                id="lead-source"
              >
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {field('Niche / Industry', true,
              <select
                className="input-field"
                value={form.niche}
                onChange={e => setForm(p => ({ ...p, niche: e.target.value }))}
                id="lead-niche"
              >
                {DEFAULT_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}

            {form.niche === 'Other' && field('Custom Niche', true,
              <input
                type="text"
                className={`input-field ${errors.customNiche ? 'error' : ''}`}
                placeholder="Enter niche name"
                value={form.customNiche}
                onChange={e => setForm(p => ({ ...p, customNiche: e.target.value }))}
                id="lead-custom-niche"
              />, errors.customNiche
            )}

            {field('Lead Date', true,
              <input
                type="date"
                className={`input-field ${errors.leadDate ? 'error' : ''}`}
                value={form.leadDate}
                onChange={e => setForm(p => ({ ...p, leadDate: e.target.value }))}
                id="lead-date"
              />, errors.leadDate
            )}

            {field('Deal Status', true,
              <select
                className="input-field"
                value={form.dealStatus}
                onChange={e => setForm(p => ({ ...p, dealStatus: e.target.value as DealStatus }))}
                id="lead-status"
              >
                {DEAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {field('Deal Value (USD)', true,
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  className={`input-field pl-7 ${errors.dealValueUsd ? 'error' : ''}`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={form.dealValueUsd}
                  onChange={e => setForm(p => ({ ...p, dealValueUsd: e.target.value }))}
                  id="lead-deal-value"
                />
              </div>,
              errors.dealValueUsd,
              pkrPreview > 0 ? `≈ PKR ${pkrPreview.toLocaleString('en-PK')} at ${settings.exchangeRate} rate` : undefined
            )}

            {field('Monthly Retainer (USD)', false,
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  className="input-field pl-7"
                  placeholder="0 (if applicable)"
                  min="0"
                  step="0.01"
                  value={form.monthlyRetainer}
                  onChange={e => setForm(p => ({ ...p, monthlyRetainer: e.target.value }))}
                  id="lead-retainer"
                />
              </div>
            )}
          </div>

          {field('Notes', false,
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Additional context, next steps, or follow-up notes..."
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              id="lead-notes"
            />
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/leads"
              className="flex-1 py-3 rounded-xl text-gray-300 text-sm font-medium text-center transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(45, 58, 94, 0.6)' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #5c7cfa, #4263eb)' }}
              id="save-lead-btn"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
