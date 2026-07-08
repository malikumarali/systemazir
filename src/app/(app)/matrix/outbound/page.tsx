'use client'

import { useState, useEffect, useCallback } from 'react'
import { useData } from '@/context/DataContext'
import { useSettings } from '@/context/SettingsContext'
import { useAuth } from '@/context/AuthContext'
import { OutboundEntry, OutboundChannel, OutboundTier } from '@/lib/types'
import {
  calcColdCall, calcColdEmail, calcColdDM,
  OUTBOUND_DEFAULTS, OutboundCalcResult,
} from '@/lib/calculations'
import { formatCurrency, formatUsd, getPLColorClass, usdToPkr } from '@/lib/currency'
import { Save, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

type ChannelForm = {
  month: string
  tier: OutboundTier
  outbound: string
  // Cold Call
  connRatio: string
  intRatio: string
  // Cold Email
  openRatio: string
  responseRatio: string
  positiveRatio: string
  // Cold DM — same as email
  connectRatio: string
  // Shared
  apptRatio: string
  showUpRatio: string
  closeRatio: string
  followupRatio: string
  avgTicketSize: string
  upsellRatio: string
  upsellValue: string
  listing: string
  sdr: string
  closer: string
  tools: string
  other: string
  training: string
}

function getDefaults(channel: OutboundChannel, tier: OutboundTier): Omit<ChannelForm, 'month' | 'tier' | 'outbound'> {
  const costs = OUTBOUND_DEFAULTS[channel][tier]
  return {
    listing: costs.listing.toString(),
    sdr: costs.sdr.toString(),
    closer: costs.closer.toString(),
    tools: costs.tools.toString(),
    other: costs.other.toString(),
    training: costs.training.toString(),
    apptRatio: '30',
    showUpRatio: '50',
    closeRatio: '50',
    followupRatio: channel === 'Cold Call' ? '60' : '25',
    avgTicketSize: '1000',
    upsellRatio: '50',
    upsellValue: '1500',
    connRatio: '15',
    intRatio: '20',
    openRatio: '30',
    responseRatio: '10',
    positiveRatio: '20',
    connectRatio: '15',
  }
}

function initForm(channel: OutboundChannel, tier: OutboundTier = 'M'): ChannelForm {
  return {
    month: new Date().toISOString().slice(0, 7),
    tier,
    outbound: '',
    ...getDefaults(channel, tier),
  }
}

export default function OutboundMatrixPage() {
  const { outboundEntries, addOutbound } = useData()
  const { settings } = useSettings()
  const { user } = useAuth()
  const [channel, setChannel] = useState<OutboundChannel>('Cold Call')
  const [form, setForm] = useState<ChannelForm>(initForm('Cold Call'))
  const [calc, setCalc] = useState<OutboundCalcResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const runCalc = useCallback(() => {
    const n = parseFloat
    const costs = {
      listing: n(form.listing) || 0,
      sdr: n(form.sdr) || 0,
      closer: n(form.closer) || 0,
      tools: n(form.tools) || 0,
      other: n(form.other) || 0,
      training: n(form.training) || 0,
    }
    const shared = {
      apptRatio: n(form.apptRatio) || 0,
      showUpRatio: n(form.showUpRatio) || 0,
      closeRatio: n(form.closeRatio) || 0,
      followupRatio: n(form.followupRatio) || 0,
      avgTicketSize: n(form.avgTicketSize) || 0,
      upsellRatio: n(form.upsellRatio) || 0,
      upsellValue: n(form.upsellValue) || 0,
      ...costs,
    }
    if (channel === 'Cold Call') {
      setCalc(calcColdCall({ dials: n(form.outbound) || 0, connRatio: n(form.connRatio) || 0, intRatio: n(form.intRatio) || 0, ...shared }))
    } else if (channel === 'Cold Email') {
      setCalc(calcColdEmail({ outbound: n(form.outbound) || 0, openRatio: n(form.openRatio) || 0, responseRatio: n(form.responseRatio) || 0, positiveRatio: n(form.positiveRatio) || 0, ...shared }))
    } else {
      setCalc(calcColdDM({ outbound: n(form.outbound) || 0, connectRatio: n(form.connectRatio) || 0, responseRatio: n(form.responseRatio) || 0, positiveRatio: n(form.positiveRatio) || 0, ...shared }))
    }
  }, [form, channel])

  useEffect(() => { runCalc() }, [runCalc])

  const handleChannelChange = (ch: OutboundChannel) => {
    setChannel(ch)
    setForm(initForm(ch, form.tier))
  }

  const handleTierChange = (tier: OutboundTier) => {
    const costs = getDefaults(channel, tier)
    setForm(prev => ({ ...prev, tier, ...costs }))
  }

  const handleSave = () => {
    if (!calc || !form.outbound) return
    setSaving(true)
    const n = parseFloat

    const entry: OutboundEntry = {
      id: `out-${Date.now()}`,
      userId: user?.id || '',
      channel,
      month: form.month,
      tier: form.tier,
      outbound: n(form.outbound),
      connRatio: n(form.connRatio),
      connect: calc.step1,
      intRatio: n(form.intRatio),
      interested: calc.step2,
      openRatio: n(form.openRatio),
      openRate: calc.step1,
      responseRatio: n(form.responseRatio),
      responseRate: calc.step2,
      positiveRatio: n(form.positiveRatio),
      positiveRespond: calc.step3,
      apptRatio: n(form.apptRatio),
      appointments: calc.appointments,
      showUpRatio: n(form.showUpRatio),
      showUp: calc.showUp,
      closeRatio: n(form.closeRatio),
      closings: calc.closings,
      followupRatio: n(form.followupRatio),
      followupClosings: calc.followupClosings,
      totalClosings: calc.totalClosings,
      avgTicketSize: n(form.avgTicketSize),
      totalSales: calc.totalSales,
      upsellRatio: n(form.upsellRatio),
      upsellValue: n(form.upsellValue),
      upsells: calc.upsells,
      upsellRevenue: calc.upsellRevenue,
      tRecurring: calc.tRecurring,
      listing: n(form.listing),
      sdr: n(form.sdr),
      closer: n(form.closer),
      tools: n(form.tools),
      other: n(form.other),
      training: n(form.training),
      totalEstCost: calc.totalEstCost,
      grossPL: calc.grossPL,
      exchangeRate: settings.exchangeRate,
      createdAt: new Date().toISOString(),
    }

    addOutbound(entry)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const f = (v: number) => formatCurrency(v, settings.currencyDisplay, settings.exchangeRate)

  const Row = ({ label, value, isAuto, fieldKey, suffix = '', prefix = '$' }: {
    label: string; value?: string; isAuto?: boolean; fieldKey?: keyof ChannelForm; suffix?: string; prefix?: string
  }) => (
    <div className="grid grid-cols-2 gap-3 items-center py-2 border-b border-gray-200/40">
      <label className="text-gray-700 text-sm">
        {label}
        {isAuto && <span className="badge badge-blue text-[10px] ml-1">Auto</span>}
      </label>
      <div>
        {isAuto || !fieldKey ? (
          <div className="input-auto">
            {prefix && <span className="text-gray-500 mr-1">{prefix}</span>}
            {value}
            {suffix && <span className="text-gray-500 ml-1">{suffix}</span>}
          </div>
        ) : (
          <div className={`input-prefix-wrap ${suffix ? 'has-suffix' : ''}`}>
            {prefix && <span className="prefix-symbol">{prefix}</span>}
            <input
              type="number"
              className="input-field"
              value={form[fieldKey] as string}
              onChange={e => setForm(p => ({ ...p, [fieldKey]: e.target.value }))}
              min="0"
              step="any"
              id={`outbound-${fieldKey}`}
            />
            {suffix && <span className="suffix-symbol">{suffix}</span>}
          </div>
        )}
      </div>
    </div>
  )

  const autoVal = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Outbound Channel Matrix</h2>
        <p className="text-gray-400 text-sm mt-1">Cold Call, Cold Email & Cold Social DM tracker</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 glass rounded-2xl p-6 space-y-5">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Channel */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Channel</label>
              <div className="space-y-1.5">
                {(['Cold Call', 'Cold Email', 'Cold Social DM'] as OutboundChannel[]).map(ch => (
                  <button
                    key={ch}
                    onClick={() => handleChannelChange(ch)}
                    className={clsx(
                      'w-full py-2 px-3 rounded-lg text-xs font-medium transition-all text-left',
                      channel === ch ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-gray-900'
                    )}
                    style={channel !== ch ? { background: '#f3f4f6', border: '1px solid rgba(0, 0, 0, 0.1)' } : {}}
                    id={`channel-${ch.replace(/ /g, '-').toLowerCase()}`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tier (S/M/L)</label>
              <div className="space-y-1.5">
                {(['S', 'M', 'L'] as OutboundTier[]).map(t => (
                  <button
                    key={t}
                    onClick={() => handleTierChange(t)}
                    className={clsx(
                      'w-full py-2 px-3 rounded-lg text-xs font-medium transition-all',
                      form.tier === t ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-gray-900'
                    )}
                    style={form.tier !== t ? { background: '#f3f4f6', border: '1px solid rgba(0, 0, 0, 0.1)' } : {}}
                    id={`tier-${t}`}
                  >
                    {t === 'S' ? 'Small' : t === 'M' ? 'Mid' : 'Large'}
                  </button>
                ))}
              </div>
            </div>

            {/* Month */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Month</label>
              <input type="month" className="input-field" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} id="outbound-month" />
            </div>
          </div>

          {/* Funnel fields */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
              {channel === 'Cold Call' ? 'Dialing Funnel' : channel === 'Cold Email' ? 'Email Funnel' : 'DM Funnel'}
            </div>

            <Row label={channel === 'Cold Call' ? 'Dials' : 'Outbound Sent'} fieldKey="outbound" prefix="" />

            {channel === 'Cold Call' && <>
              <Row label="Conn. Ratio (%)" fieldKey="connRatio" prefix="" suffix="%" />
              <Row label="Connect" isAuto value={autoVal(calc?.step1 || 0)} prefix="" />
              <Row label="Int. Ratio (%)" fieldKey="intRatio" prefix="" suffix="%" />
              <Row label="Interested" isAuto value={autoVal(calc?.step2 || 0)} prefix="" />
            </>}

            {channel === 'Cold Email' && <>
              <Row label="Open Ratio (%)" fieldKey="openRatio" prefix="" suffix="%" />
              <Row label="Open Rate" isAuto value={autoVal(calc?.step1 || 0)} prefix="" />
              <Row label="Response Ratio (%)" fieldKey="responseRatio" prefix="" suffix="%" />
              <Row label="Response Rate" isAuto value={autoVal(calc?.step2 || 0)} prefix="" />
              <Row label="Positive Ratio (%)" fieldKey="positiveRatio" prefix="" suffix="%" />
              <Row label="Positive Respond" isAuto value={autoVal(calc?.step3 || 0)} prefix="" />
            </>}

            {channel === 'Cold Social DM' && <>
              <Row label="Connect Ratio (%)" fieldKey="connectRatio" prefix="" suffix="%" />
              <Row label="Connection" isAuto value={autoVal(calc?.step1 || 0)} prefix="" />
              <Row label="Response Ratio (%)" fieldKey="responseRatio" prefix="" suffix="%" />
              <Row label="Response Rate" isAuto value={autoVal(calc?.step2 || 0)} prefix="" />
              <Row label="Positive Ratio (%)" fieldKey="positiveRatio" prefix="" suffix="%" />
              <Row label="Positive Respond" isAuto value={autoVal(calc?.step3 || 0)} prefix="" />
            </>}

            <Row label="Appt. Ratio (%)" fieldKey="apptRatio" prefix="" suffix="%" />
            <Row label="Appointments" isAuto value={autoVal(calc?.appointments || 0)} prefix="" />
            <Row label="Show Up Ratio (%)" fieldKey="showUpRatio" prefix="" suffix="%" />
            <Row label="Show Up" isAuto value={autoVal(calc?.showUp || 0)} prefix="" />
            <Row label="Close Ratio (%)" fieldKey="closeRatio" prefix="" suffix="%" />
            <Row label="Closings" isAuto value={autoVal(calc?.closings || 0)} prefix="" />
            <Row label="Followup Ratio (%)" fieldKey="followupRatio" prefix="" suffix="%" />
            <Row label="Followup Closings" isAuto value={autoVal(calc?.followupClosings || 0)} prefix="" />
            <Row label="Total Closings" isAuto value={autoVal(calc?.totalClosings || 0)} prefix="" />
            <Row label="Avg. Ticket Size" fieldKey="avgTicketSize" />
            <Row label="Upsell Ratio (%)" fieldKey="upsellRatio" prefix="" suffix="%" />
            <Row label="Upsell Value" fieldKey="upsellValue" />
            <Row label="T. Recurring" isAuto value={formatUsd(calc?.tRecurring || 0)} prefix="" />

            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-4 mb-2">Costs (editable)</div>
            <Row label="Listing" fieldKey="listing" />
            <Row label="SDR / Email / Social SDR" fieldKey="sdr" />
            <Row label="Closer" fieldKey="closer" />
            <Row label="Tools" fieldKey="tools" />
            <Row label="Other" fieldKey="other" />
            <Row label="Training & Dev" fieldKey="training" />
            <Row label="Total Est. Cost" isAuto value={formatUsd(calc?.totalEstCost || 0)} prefix="" />
            <Row label="Gross P/L" isAuto value={`${(calc?.grossPL || 0) >= 0 ? '+' : ''}${formatUsd(calc?.grossPL || 0)}`} prefix="" />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.outbound}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all',
              saved ? 'bg-emerald-600' : 'hover:opacity-90 disabled:opacity-40'
            )}
            style={!saved ? { background: 'linear-gradient(135deg, #ef4444, #b91c1c)' } : {}}
            id="save-outbound-btn"
          >
            {saved ? <><RefreshCw className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Entry</>}
          </button>
        </div>

        {/* Results panel */}
        <div className="xl:col-span-2 space-y-4">
          {calc && (
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-gray-900 font-semibold text-sm">📊 Live Results</h3>
              {[
                { label: 'T. Recurring', value: f(calc.tRecurring) },
                { label: 'Total Est. Cost', value: formatUsd(calc.totalEstCost), color: 'text-red-400' },
                { label: 'Gross P/L', value: `${calc.grossPL >= 0 ? '+' : ''}${f(calc.grossPL)}`, isPL: true, plVal: calc.grossPL },
                { label: 'Total Closings', value: calc.totalClosings.toFixed(2) },
                { label: 'Appointments', value: calc.appointments.toFixed(2) },
              ].map(({ label, value, isPL, plVal, color }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400 text-xs">{label}</span>
                  <span className={clsx('font-semibold text-sm', isPL ? getPLColorClass(plVal!) : color || 'text-gray-800')}>
                    {value}
                  </span>
                </div>
              ))}

              <div className="pt-3 border-t border-gray-200/50">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Cost Breakdown</div>
                {[
                  { label: 'Listing', key: 'listing' },
                  { label: 'SDR', key: 'sdr' },
                  { label: 'Closer', key: 'closer' },
                  { label: 'Tools', key: 'tools' },
                  { label: 'Other', key: 'other' },
                  { label: 'Training', key: 'training' },
                ].map(({ label, key }) => {
                  const v = parseFloat(form[key as keyof ChannelForm] as string) || 0
                  if (!v) return null
                  return (
                    <div key={label} className="flex justify-between py-0.5">
                      <span className="text-gray-500 text-xs">{label}</span>
                      <span className="text-gray-400 text-xs">{formatUsd(v)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="glass rounded-xl overflow-hidden">
        <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setShowHistory(!showHistory)} id="outbound-history-toggle">
          <span className="text-gray-900 font-semibold">Saved Entries ({outboundEntries.length})</span>
          {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showHistory && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  {['Channel', 'Month', 'Tier', 'Outbound', 'Closings', 'T. Recurring', 'Est. Cost', 'Gross P/L'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outboundEntries.map(e => (
                  <tr key={e.id} className="table-row-hover" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <td className="px-4 py-3 text-gray-900 text-sm font-medium">{e.channel}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{e.month}</td>
                    <td className="px-4 py-3"><span className="badge badge-purple">{e.tier}</span></td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{e.outbound.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{e.totalClosings.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold text-sm">{formatUsd(e.tRecurring)}</td>
                    <td className="px-4 py-3 text-red-400 text-sm">{formatUsd(e.totalEstCost)}</td>
                    <td className={clsx('px-4 py-3 text-sm font-semibold', getPLColorClass(e.grossPL))}>
                      {e.grossPL >= 0 ? '+' : ''}{formatUsd(e.grossPL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}