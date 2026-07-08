'use client'

import { useState, useEffect } from 'react'
import { useData } from '@/context/DataContext'
import { useSettings } from '@/context/SettingsContext'
import { useAuth } from '@/context/AuthContext'
import { InboundEntry, InboundChannel } from '@/lib/types'
import { calcInbound, InboundInputs } from '@/lib/calculations'
import { formatCurrency, usdToPkr, formatUsd, formatPkr, getPLColorClass } from '@/lib/currency'
import { Save, RefreshCw, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import ExcelUpload from '@/components/shared/ExcelUpload'
import clsx from 'clsx'

const INBOUND_DEFAULTS: Record<InboundChannel, Partial<InboundInputs>> = {
  'Meta Ads': {
    cpc: 1.5,
    convRatio: 1.5,
    apptRatio: 20,
    showUpRatio: 50,
    closeRatio: 50,
    followupRatio: 60,
    avgTicketSize: 1000,
    upsellRatio: 50,
    upsellValue: 1500,
  },
  'Google Ads': {
    cpc: 3.0,
    convRatio: 2.0,
    apptRatio: 20,
    showUpRatio: 50,
    closeRatio: 50,
    followupRatio: 60,
    avgTicketSize: 1000,
    upsellRatio: 30,
    upsellValue: 1500,
  },
}

function initForm(channel: InboundChannel) {
  const d = INBOUND_DEFAULTS[channel]
  return {
    channel,
    month: new Date().toISOString().slice(0, 7),
    budgetUsd: '',
    cpc: d.cpc?.toString() || '',
    convRatio: d.convRatio?.toString() || '',
    apptRatio: d.apptRatio?.toString() || '',
    showUpRatio: d.showUpRatio?.toString() || '',
    closeRatio: d.closeRatio?.toString() || '',
    followupRatio: d.followupRatio?.toString() || '',
    avgTicketSize: d.avgTicketSize?.toString() || '',
    upsellRatio: d.upsellRatio?.toString() || '',
    upsellValue: d.upsellValue?.toString() || '',
  }
}

export default function InboundMatrixPage() {
  const { inboundEntries, addInbound } = useData()
  const { settings } = useSettings()
  const { user } = useAuth()
  const [channel, setChannel] = useState<InboundChannel>('Meta Ads')
  const [form, setForm] = useState(initForm('Meta Ads'))
  const [calc, setCalc] = useState<ReturnType<typeof calcInbound> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const n = parseFloat
    const inputs: InboundInputs = {
      budgetUsd: n(form.budgetUsd) || 0,
      cpc: n(form.cpc) || 0,
      convRatio: n(form.convRatio) || 0,
      apptRatio: n(form.apptRatio) || 0,
      showUpRatio: n(form.showUpRatio) || 0,
      closeRatio: n(form.closeRatio) || 0,
      followupRatio: n(form.followupRatio) || 0,
      avgTicketSize: n(form.avgTicketSize) || 0,
      upsellRatio: n(form.upsellRatio) || 0,
      upsellValue: n(form.upsellValue) || 0,
    }
    setCalc(calcInbound(inputs))
  }, [form])

  const handleChannelChange = (ch: InboundChannel) => {
    setChannel(ch)
    setForm(initForm(ch))
  }

  const handleSave = () => {
    if (!calc || !form.budgetUsd) return
    setSaving(true)
    const n = parseFloat

    const entry: InboundEntry = {
      id: `inb-${Date.now()}`,
      userId: user?.id || '',
      channel,
      month: form.month,
      budgetUsd: n(form.budgetUsd),
      cpc: n(form.cpc),
      convRatio: n(form.convRatio),
      apptRatio: n(form.apptRatio),
      showUpRatio: n(form.showUpRatio),
      closeRatio: n(form.closeRatio),
      followupRatio: n(form.followupRatio),
      avgTicketSize: n(form.avgTicketSize),
      upsellRatio: n(form.upsellRatio),
      upsellValue: n(form.upsellValue),
      ...calc,
      exchangeRate: settings.exchangeRate,
      createdAt: new Date().toISOString(),
    }

    addInbound(entry)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleUploadData = (data: Record<string, string>) => {
    setForm(prev => ({
      ...prev,
      budgetUsd: data.budgetUsd || data['Budget (USD)'] || prev.budgetUsd,
      cpc: data.cpc || data['CPC'] || prev.cpc,
      convRatio: data.convRatio || data['Conv. Ratio (%)'] || prev.convRatio,
      avgTicketSize: data.avgTicketSize || data['Avg. Ticket Size (USD)'] || prev.avgTicketSize,
    }))
  }

  const f = (v: number) => formatCurrency(v, settings.currencyDisplay, settings.exchangeRate)
  const fUsd = (v: number) => formatUsd(v)

  const InputRow = ({
    label, fieldKey, isAuto = false, suffix = '', prefix = '$',
    hint = '', required = false
  }: {
    label: string
    fieldKey: string
    isAuto?: boolean
    suffix?: string
    prefix?: string
    hint?: string
    required?: boolean
  }) => {
    const autoValue = calc ? (calc as unknown as Record<string, number>)[fieldKey] ?? 0 : 0
    const formValue = (form as unknown as Record<string, string>)[fieldKey] ?? ''

    return (
      <div className="grid grid-cols-2 gap-3 items-center py-2 border-b border-gray-200/40">
        <label className="text-gray-700 text-sm flex items-center gap-1">
          {label}
          {required && <span className="text-red-400">*</span>}
          {isAuto && (
            <span className="badge badge-blue text-[10px] ml-1">Auto</span>
          )}
        </label>
        <div className="relative">
          {isAuto ? (
            <div className="input-auto">
              {prefix && <span className="text-gray-500 mr-1">{prefix}</span>}
              {autoValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              {suffix && <span className="text-gray-500 ml-1">{suffix}</span>}
            </div>
          ) : (
            <div className={`input-prefix-wrap ${suffix ? 'has-suffix' : ''}`}>
              {prefix && (
                <span className="prefix-symbol">{prefix}</span>
              )}
              <input
                type="number"
                className="input-field"
                value={formValue}
                onChange={e => setForm(p => ({ ...p, [fieldKey]: e.target.value }))}
                min="0"
                step="any"
                id={`inbound-${fieldKey}`}
              />
              {suffix && (
                <span className="suffix-symbol">{suffix}</span>
              )}
            </div>
          )}
          {hint && (
            <p className="text-gray-600 text-xs mt-0.5">{hint}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inbound Channel Matrix</h2>
          <p className="text-gray-400 text-sm mt-1">Meta Ads & Google Ads ROI calculator</p>
        </div>
        <ExcelUpload
          onData={handleUploadData}
          expectedFields={['budgetUsd', 'cpc', 'convRatio', 'avgTicketSize']}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Form */}
        <div className="xl:col-span-3 glass rounded-2xl p-6 space-y-4">
          {/* Channel + Month */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Channel</label>
              <div className="flex gap-2">
                {(['Meta Ads', 'Google Ads'] as InboundChannel[]).map(ch => (
                  <button
                    key={ch}
                    onClick={() => handleChannelChange(ch)}
                    className={clsx(
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                      channel === ch
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:text-gray-900'
                    )}
                    style={channel !== ch ? { background: '#f3f4f6', border: '1px solid rgba(0, 0, 0, 0.12)' } : {}}
                    id={`channel-${ch.replace(' ', '-').toLowerCase()}`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Month</label>
              <input
                type="month"
                className="input-field"
                value={form.month}
                onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
                id="inbound-month"
              />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-0">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Ad Spend & Traffic</div>
            <InputRow label="Budget (USD)" fieldKey="budgetUsd" required hint="Total monthly ad budget" />
            <InputRow label="CPC" fieldKey="cpc" hint={`Default: $${INBOUND_DEFAULTS[channel].cpc}`} />
            <InputRow label="Clicks" fieldKey="clicks" isAuto />
            <InputRow label="Conv. Ratio (%)" fieldKey="convRatio" prefix="" suffix="%" hint="% of clicks that become leads" />
            <InputRow label="Leads" fieldKey="leads" isAuto prefix="" />

            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-4 mb-2">Funnel</div>
            <InputRow label="Appt. Ratio (%)" fieldKey="apptRatio" prefix="" suffix="%" />
            <InputRow label="Appointments" fieldKey="appointments" isAuto prefix="" />
            <InputRow label="Show Up Ratio (%)" fieldKey="showUpRatio" prefix="" suffix="%" />
            <InputRow label="Show Up" fieldKey="showUp" isAuto prefix="" />
            <InputRow label="Close Ratio (%)" fieldKey="closeRatio" prefix="" suffix="%" />
            <InputRow label="Closings" fieldKey="closings" isAuto prefix="" />
            <InputRow label="Followup Ratio (%)" fieldKey="followupRatio" prefix="" suffix="%" />
            <InputRow label="Followup Closings" fieldKey="followupClosings" isAuto prefix="" />
            <InputRow label="Total Closings" fieldKey="totalClosings" isAuto prefix="" />

            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-4 mb-2">Revenue</div>
            <InputRow label="Avg. Ticket Size" fieldKey="avgTicketSize" />
            <InputRow label="Total Sales" fieldKey="totalSales" isAuto />
            <InputRow label="Upsell Ratio (%)" fieldKey="upsellRatio" prefix="" suffix="%" />
            <InputRow label="Upsell Value" fieldKey="upsellValue" />
            <InputRow label="Upsell Revenue" fieldKey="upsellRevenue" isAuto />
            <InputRow label="T. Recurring" fieldKey="tRecurring" isAuto />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.budgetUsd}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all mt-4',
              saved ? 'bg-emerald-600' : 'hover:opacity-90 disabled:opacity-40'
            )}
            style={!saved ? { background: 'linear-gradient(135deg, #ef4444, #b91c1c)' } : {}}
            id="save-inbound-btn"
          >
            {saved ? <><RefreshCw className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Entry</>}
          </button>
        </div>

        {/* Live Results Panel */}
        <div className="xl:col-span-2 space-y-4">
          {calc && (
            <>
              {/* Key metrics */}
              <div className="glass rounded-2xl p-5 space-y-3">
                <h3 className="text-gray-900 font-semibold text-sm">📊 Live Results</h3>
                {[
                  { label: 'T. Recurring', value: f(calc.tRecurring), highlight: true },
                  { label: 'Gross P/L', value: `${calc.grossPL >= 0 ? '+' : ''}${f(calc.grossPL)}`, isPL: true, plVal: calc.grossPL },
                  { label: 'ROAS', value: `${calc.roas.toFixed(2)}x` },
                  { label: 'CAC', value: fUsd(calc.cac) },
                  { label: 'Cost Per Lead', value: fUsd(calc.costPerLead) },
                  { label: 'Cost Per Appt.', value: fUsd(calc.costPerAppointment) },
                  { label: 'Pipeline Worth', value: f(calc.pipelineWorth) },
                ].map(({ label, value, highlight, isPL, plVal }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">{label}</span>
                    <span className={clsx(
                      'font-semibold text-sm',
                      highlight ? 'text-gray-900' : isPL ? getPLColorClass(plVal!) : 'text-gray-800'
                    )}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* PKR breakdown */}
              <div className="glass rounded-xl p-4">
                <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">PKR Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">T. Recurring</span>
                    <span className="text-gray-900 text-xs font-medium">
                      PKR {usdToPkr(calc.tRecurring, settings.exchangeRate).toLocaleString('en-PK')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Ad Spend</span>
                    <span className="text-red-400 text-xs font-medium">
                      PKR {usdToPkr(parseFloat(form.budgetUsd) || 0, settings.exchangeRate).toLocaleString('en-PK')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-400 text-xs font-semibold">Gross P/L</span>
                    <span className={clsx('text-xs font-bold', getPLColorClass(calc.grossPL))}>
                      PKR {usdToPkr(Math.abs(calc.grossPL), settings.exchangeRate).toLocaleString('en-PK')}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* History */}
      <div className="glass rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 text-left"
          onClick={() => setShowHistory(!showHistory)}
          id="inbound-history-toggle"
        >
          <span className="text-gray-900 font-semibold">Saved Entries ({inboundEntries.length})</span>
          {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showHistory && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  {['Channel', 'Month', 'Budget', 'Leads', 'Closings', 'T. Recurring', 'ROAS', 'Gross P/L'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inboundEntries.map(e => (
                  <tr key={e.id} className="table-row-hover" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <td className="px-4 py-3 text-gray-900 text-sm font-medium">{e.channel}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{e.month}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{formatUsd(e.budgetUsd)}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{e.leads.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{e.totalClosings.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold text-sm">{formatUsd(e.tRecurring)}</td>
                    <td className="px-4 py-3 text-red-600 text-sm">{e.roas.toFixed(2)}x</td>
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