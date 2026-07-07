'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useSettings } from '@/context/SettingsContext'
import { generateHeatmapA, generateHeatmapB } from '@/lib/calculations'
import { formatCurrency, formatUsd, getPLColorClass, usdToPkr } from '@/lib/currency'
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar, Line
} from 'recharts'
import clsx from 'clsx'
import { TrendingUp, DollarSign, BarChart3, ArrowUpDown, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

type DashTab = 'roi' | 'revenue' | 'niche'
type HeatmapTab = 'A' | 'B'
type NicheSort = 'grossPL' | 'totalRevenue' | 'clientCount' | 'avgDealValue'

// Heatmap color interpolation (red → yellow → green)
function heatColor(value: number, min: number, max: number): string {
  if (max === min) return '#374151'
  const ratio = (value - min) / (max - min)
  if (ratio < 0.5) {
    const r = 255
    const g = Math.round(ratio * 2 * 200)
    return `rgb(${r},${g},50)`
  } else {
    const r = Math.round((1 - (ratio - 0.5) * 2) * 200)
    const g = 185
    return `rgb(${r},${g},50)`
  }
}

function textColorForBg(ratio: number): string {
  return ratio > 0.5 ? '#000' : '#fff'
}

export default function DashboardPage() {
  const { isFounder } = useAuth()
  const { leads, inboundEntries, outboundEntries } = useData()
  const { settings } = useSettings()
  const router = useRouter()

  const [tab, setTab] = useState<DashTab>('roi')
  const [heatTab, setHeatTab] = useState<HeatmapTab>('A')
  const [cpcConfig, setCpcConfig] = useState(2)
  const [avgTicket, setAvgTicket] = useState(1000)
  const [nicheSort, setNicheSort] = useState<NicheSort>('grossPL')
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number; value: number; extra?: number } | null>(null)

  const f = (v: number) => formatCurrency(v, settings.currencyDisplay, settings.exchangeRate)

  // ---------------------------------------------------------------
  // ROI Heatmap data (all hooks must be before any conditional return)
  // ---------------------------------------------------------------
  const heatmapAData = useMemo(() => generateHeatmapA(cpcConfig, avgTicket), [cpcConfig, avgTicket])
  const heatmapBData = useMemo(() => generateHeatmapB(), [])

  const heatAValues = heatmapAData.flatMap(r => r.data.map(c => c.leads))
  const heatAMin = Math.min(...heatAValues)
  const heatAMax = Math.max(...heatAValues)

  const heatBValues = heatmapBData.flatMap(r => r.data.map(c => c.clicks))
  const heatBMin = Math.min(...heatBValues)
  const heatBMax = Math.max(...heatBValues)

  // ---------------------------------------------------------------
  // Revenue vs Spend chart data
  // ---------------------------------------------------------------
  const channelData = useMemo(() => {
    const channels: Record<string, { tRecurring: number; totalCost: number; roas?: number }> = {}

    inboundEntries.forEach(e => {
      if (!channels[e.channel]) channels[e.channel] = { tRecurring: 0, totalCost: 0 }
      channels[e.channel].tRecurring += e.tRecurring
      channels[e.channel].totalCost += e.budgetUsd
    })


    outboundEntries.forEach(e => {
      if (!channels[e.channel]) channels[e.channel] = { tRecurring: 0, totalCost: 0 }
      channels[e.channel].tRecurring += e.tRecurring
      channels[e.channel].totalCost += e.totalEstCost
    })

    return Object.entries(channels).map(([channel, data]) => ({
      channel,
      tRecurring: Math.round(data.tRecurring),
      totalCost: Math.round(data.totalCost),
      grossPL: Math.round(data.tRecurring - data.totalCost),
      roas: data.totalCost > 0 ? parseFloat((data.tRecurring / data.totalCost).toFixed(2)) : 0,
    }))
  }, [inboundEntries, outboundEntries])

  // ---------------------------------------------------------------
  // Niche ranking data
  // ---------------------------------------------------------------
  const nicheData = useMemo(() => {
    const niches: Record<string, {
      clientCount: number
      totalRevenue: number
      totalCost: number
      sourceCounts: Record<string, number>
    }> = {}

    leads.forEach(lead => {
      if (!niches[lead.niche]) {
        niches[lead.niche] = { clientCount: 0, totalRevenue: 0, totalCost: 0, sourceCounts: {} }
      }
      niches[lead.niche].clientCount++
      niches[lead.niche].totalRevenue += lead.dealValueUsd
      niches[lead.niche].sourceCounts[lead.leadSource] = (niches[lead.niche].sourceCounts[lead.leadSource] || 0) + 1
    })

    // Add costs from matrix entries
    inboundEntries.forEach(e => {
      // Associate cost proportionally (simplified: add to all niches equally for demo)
    })
    outboundEntries.forEach(e => {})

    return Object.entries(niches).map(([niche, data]) => {
      const topSource = Object.entries(data.sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      const grossPL = data.totalRevenue - data.totalCost
      const avgDealValue = data.clientCount > 0 ? data.totalRevenue / data.clientCount : 0
      return { niche, ...data, topSource, grossPL, avgDealValue }
    })
  }, [leads, inboundEntries, outboundEntries])

  const sortedNiches = useMemo(() => {
    return [...nicheData].sort((a, b) => {
      if (nicheSort === 'clientCount') return b.clientCount - a.clientCount
      if (nicheSort === 'totalRevenue') return b.totalRevenue - a.totalRevenue
      if (nicheSort === 'avgDealValue') return b.avgDealValue - a.avgDealValue
      return b.grossPL - a.grossPL
    })
  }, [nicheData, nicheSort])

  // Summary stats
  const totalRevenue = [...inboundEntries, ...outboundEntries].reduce((s, e) => s + e.tRecurring, 0)
  const totalCost = inboundEntries.reduce((s, e) => s + e.budgetUsd, 0) + outboundEntries.reduce((s, e) => s + e.totalEstCost, 0)
  const totalPL = totalRevenue - totalCost

  // Redirect team members (after all hooks)
  if (!isFounder) {
    router.replace('/leads')
    return null
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass rounded-xl p-3 shadow-2xl text-sm">
        <div className="text-white font-semibold mb-2">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-300">{p.name}:</span>
            <span className="text-white font-medium">{typeof p.value === 'number' ? f(p.value) : p.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total T. Recurring', value: f(totalRevenue), icon: TrendingUp, cls: 'stat-positive' },
          { label: 'Total Spend', value: f(totalCost), icon: DollarSign, cls: 'stat-negative' },
          { label: 'Gross P/L', value: `${totalPL >= 0 ? '+' : ''}${f(totalPL)}`, icon: BarChart3, cls: totalPL >= 0 ? 'stat-positive' : 'stat-negative' },
          { label: 'Active Leads', value: leads.filter(l => !['Closed Lost', 'Churned'].includes(l.dealStatus)).length.toString(), icon: TrendingUp, cls: 'stat-neutral' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={clsx('rounded-xl p-4', cls)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-xs">{label}</span>
            </div>
            <div className={clsx('font-bold text-lg leading-tight', totalPL < 0 && label === 'Gross P/L' ? 'text-red-400' : 'text-white')}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(21, 30, 56, 0.8)' }}>
        {[
          { id: 'roi' as DashTab, label: '🔥 ROI Matrix' },
          { id: 'revenue' as DashTab, label: '📈 Revenue vs Spend' },
          { id: 'niche' as DashTab, label: '🏆 Niche Ranking' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
              tab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            )}
            id={`tab-${id}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* =========================================================
          VIEW 1: ROI Matrix (Heatmaps)
      ========================================================= */}
      {tab === 'roi' && (
        <div className="space-y-5">
          {/* Heatmap selector */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[
                { id: 'A' as HeatmapTab, label: 'Budget × Conv. Ratio → Leads' },
                { id: 'B' as HeatmapTab, label: 'CPC × Budget → Clicks' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setHeatTab(id)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    heatTab === id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  )}
                  style={heatTab !== id ? { background: 'rgba(45, 58, 94, 0.4)', border: '1px solid rgba(45, 58, 94, 0.5)' } : {}}
                  id={`heatmap-tab-${id}`}
                >
                  Heatmap {id}: {label}
                </button>
              ))}
            </div>

            {heatTab === 'A' && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-xs">CPC ($)</label>
                  <input
                    type="number"
                    value={cpcConfig}
                    onChange={e => setCpcConfig(parseFloat(e.target.value) || 2)}
                    className="input-field w-20 text-center"
                    min="0.1"
                    step="0.1"
                    id="heatmap-cpc"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-xs">Avg. Ticket ($)</label>
                  <input
                    type="number"
                    value={avgTicket}
                    onChange={e => setAvgTicket(parseFloat(e.target.value) || 1000)}
                    className="input-field w-24 text-center"
                    min="1"
                    id="heatmap-ticket"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Heatmap A */}
          {heatTab === 'A' && (
            <div className="glass rounded-2xl p-5 overflow-x-auto">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-white font-semibold">Heatmap A: Budget vs Conv. Ratio → Leads</h3>
                <Info className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex gap-3 mb-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgb(255,50,50)' }} /> Low leads</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgb(0,185,50)' }} /> High leads</span>
              </div>
              <div className="min-w-max">
                {/* Header row */}
                <div className="flex gap-1 mb-1">
                  <div className="w-20 text-right text-gray-600 text-xs pr-2 py-1 font-semibold">Budget ↓ / Conv. →</div>
                  {[0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50].map(c => (
                    <div key={c} className="w-14 text-center text-gray-500 text-xs py-1">{c}%</div>
                  ))}
                </div>
                {heatmapAData.map((row, ri) => (
                  <div key={row.budget} className="flex gap-1 mb-1">
                    <div className="w-20 text-right text-gray-400 text-xs pr-2 flex items-center justify-end font-medium">
                      ${(row.budget / 1000).toFixed(1)}K
                    </div>
                    {row.data.map((cell, ci) => {
                      const ratio = heatAMax > heatAMin ? (cell.leads - heatAMin) / (heatAMax - heatAMin) : 0
                      const bg = heatColor(cell.leads, heatAMin, heatAMax)
                      const isHovered = hoverCell?.row === ri && hoverCell?.col === ci
                      return (
                        <div
                          key={ci}
                          className="heatmap-cell w-14 h-8 rounded flex items-center justify-center text-xs font-bold relative"
                          style={{ backgroundColor: bg, color: textColorForBg(ratio) }}
                          onMouseEnter={() => setHoverCell({ row: ri, col: ci, value: cell.leads, extra: cell.estimatedRevenue })}
                          onMouseLeave={() => setHoverCell(null)}
                        >
                          {cell.leads.toFixed(0)}
                          {isHovered && (
                            <div
                              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 p-2 rounded-lg shadow-2xl text-xs whitespace-nowrap"
                              style={{ background: '#0f1629', border: '1px solid rgba(92, 124, 250, 0.4)' }}
                            >
                              <div className="text-white font-semibold">{cell.leads.toFixed(1)} Leads</div>
                              <div className="text-indigo-400">Est. Rev: {formatUsd(cell.estimatedRevenue)}</div>
                              <div className="text-gray-400">Budget: ${row.budget.toLocaleString()} / Conv: {cell.conv}%</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heatmap B */}
          {heatTab === 'B' && (
            <div className="glass rounded-2xl p-5 overflow-x-auto">
              <div className="mb-3">
                <h3 className="text-white font-semibold">Heatmap B: Budget vs CPC → Clicks</h3>
              </div>
              <div className="flex gap-3 mb-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgb(255,50,50)' }} /> Low clicks</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgb(0,185,50)' }} /> High clicks</span>
              </div>
              <div className="min-w-max">
                <div className="flex gap-1 mb-1">
                  <div className="w-20 text-right text-gray-600 text-xs pr-2 py-1 font-semibold">Budget ↓ / CPC →</div>
                  {[0.50, 1.00, 1.50, 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, 12.00, 15.00].map(c => (
                    <div key={c} className="w-12 text-center text-gray-500 text-xs py-1">${c}</div>
                  ))}
                </div>
                {heatmapBData.map((row, ri) => (
                  <div key={row.budget} className="flex gap-1 mb-1">
                    <div className="w-20 text-right text-gray-400 text-xs pr-2 flex items-center justify-end font-medium">
                      ${(row.budget / 1000).toFixed(1)}K
                    </div>
                    {row.data.map((cell, ci) => {
                      const ratio = heatBMax > heatBMin ? (cell.clicks - heatBMin) / (heatBMax - heatBMin) : 0
                      const bg = heatColor(cell.clicks, heatBMin, heatBMax)
                      const isHovered = hoverCell?.row === ri && hoverCell?.col === ci
                      return (
                        <div
                          key={ci}
                          className="heatmap-cell w-12 h-8 rounded flex items-center justify-center text-xs font-bold relative"
                          style={{ backgroundColor: bg, color: textColorForBg(ratio) }}
                          onMouseEnter={() => setHoverCell({ row: ri, col: ci, value: cell.clicks })}
                          onMouseLeave={() => setHoverCell(null)}
                        >
                          {cell.clicks >= 1000 ? `${(cell.clicks / 1000).toFixed(1)}K` : cell.clicks.toFixed(0)}
                          {isHovered && (
                            <div
                              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 p-2 rounded-lg shadow-2xl text-xs whitespace-nowrap"
                              style={{ background: '#0f1629', border: '1px solid rgba(92, 124, 250, 0.4)' }}
                            >
                              <div className="text-white font-semibold">{cell.clicks.toLocaleString()} Clicks</div>
                              <div className="text-gray-400">Budget: ${row.budget.toLocaleString()} / CPC: ${cell.cpc}</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 2: Revenue vs Spend
      ========================================================= */}
      {tab === 'revenue' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-5">Revenue vs Spend by Channel</h3>
            {channelData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No data yet. Add entries in the Revenue Matrix first.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={channelData} margin={{ top: 10, right: 60, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 58, 94, 0.4)" />
                  <XAxis dataKey="channel" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v.toFixed(1)}x`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="tRecurring" name="T. Recurring" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="totalCost" name="Total Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="grossPL" name="Gross P/L" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#f59e0b', r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Data table */}
          {channelData.length > 0 && (
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: 'rgba(45, 58, 94, 0.5)' }}>
                <h4 className="text-white font-semibold text-sm">Exact Values</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(45, 58, 94, 0.5)' }}>
                      {['Channel', 'T. Recurring (USD)', 'T. Recurring (PKR)', 'Total Cost (USD)', 'Total Cost (PKR)', 'Gross P/L', 'ROAS'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {channelData.map(row => (
                      <tr key={row.channel} className="table-row-hover" style={{ borderBottom: '1px solid rgba(45, 58, 94, 0.3)' }}>
                        <td className="px-4 py-3 text-white font-medium text-sm">{row.channel}</td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold text-sm">{formatUsd(row.tRecurring)}</td>
                        <td className="px-4 py-3 text-emerald-400/70 text-sm">PKR {usdToPkr(row.tRecurring, settings.exchangeRate).toLocaleString('en-PK')}</td>
                        <td className="px-4 py-3 text-red-400 font-semibold text-sm">{formatUsd(row.totalCost)}</td>
                        <td className="px-4 py-3 text-red-400/70 text-sm">PKR {usdToPkr(row.totalCost, settings.exchangeRate).toLocaleString('en-PK')}</td>
                        <td className={clsx('px-4 py-3 font-bold text-sm', getPLColorClass(row.grossPL))}>
                          {row.grossPL >= 0 ? '+' : ''}{formatUsd(row.grossPL)}
                        </td>
                        <td className="px-4 py-3 text-amber-400 font-semibold text-sm">{row.roas.toFixed(2)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 3: Niche Ranking
      ========================================================= */}
      {tab === 'niche' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Niche Profitability Ranking</h3>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-xs">Sort by:</span>
              <div className="flex gap-1">
                {[
                  { id: 'grossPL' as NicheSort, label: 'Gross P/L' },
                  { id: 'totalRevenue' as NicheSort, label: 'Revenue' },
                  { id: 'clientCount' as NicheSort, label: 'Clients' },
                  { id: 'avgDealValue' as NicheSort, label: 'Avg. Deal' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setNicheSort(id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      nicheSort === id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                    )}
                    style={nicheSort !== id ? { background: 'rgba(45, 58, 94, 0.4)' } : {}}
                    id={`sort-${id}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {sortedNiches.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No niche data yet. Add leads in the Lead Source Tracker first.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedNiches.map((niche, index) => (
                <div key={niche.niche} className="glass rounded-2xl p-5 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: index === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : index === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : index === 2 ? 'linear-gradient(135deg, #92400e, #78350f)' : 'rgba(45, 58, 94, 0.8)' }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{niche.niche}</h4>
                        <span className="text-gray-500 text-xs">Top source: <span className="text-indigo-400">{niche.topSource}</span></span>
                      </div>
                    </div>
                    <div className={clsx('text-right')}>
                      <div className={clsx('text-xl font-bold', getPLColorClass(niche.grossPL))}>
                        {niche.grossPL >= 0 ? '+' : ''}{f(niche.grossPL)}
                      </div>
                      <div className="text-gray-500 text-xs">Gross P/L</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                      { label: 'Clients', value: niche.clientCount.toString() },
                      { label: 'Total Revenue', value: f(niche.totalRevenue) },
                      { label: 'Total Cost', value: f(niche.totalCost) },
                      { label: 'Avg. Deal Value', value: f(niche.avgDealValue) },
                      { label: 'Top Source', value: niche.topSource },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="text-gray-500 text-xs mb-0.5">{label}</div>
                        <div className="text-white font-semibold text-sm">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Revenue</span>
                      <span>{formatUsd(niche.totalRevenue)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${sortedNiches[0].totalRevenue > 0 ? (niche.totalRevenue / sortedNiches[0].totalRevenue) * 100 : 0}%`,
                          background: 'linear-gradient(90deg, #5c7cfa, #10b981)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
