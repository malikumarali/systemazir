'use client'

import Link from 'next/link'
import { TrendingUp, Phone, DollarSign, ArrowRight } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useSettings } from '@/context/SettingsContext'
import { formatCurrency } from '@/lib/currency'

export default function MatrixPage() {
  const { inboundEntries, outboundEntries } = useData()
  const { settings } = useSettings()

  const totalInboundRevenue = inboundEntries.reduce((s, e) => s + e.tRecurring, 0)
  const totalOutboundRevenue = outboundEntries.reduce((s, e) => s + e.tRecurring, 0)
  const totalRevenue = totalInboundRevenue + totalOutboundRevenue

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Expense & Revenue Matrix</h2>
        <p className="text-gray-400 text-sm mt-1">Track all costs and revenues across inbound and outbound channels</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total T. Recurring', value: formatCurrency(totalRevenue, settings.currencyDisplay, settings.exchangeRate), color: 'stat-positive' },
          { label: 'Inbound Revenue', value: formatCurrency(totalInboundRevenue, settings.currencyDisplay, settings.exchangeRate), color: 'stat-neutral' },
          { label: 'Outbound Revenue', value: formatCurrency(totalOutboundRevenue, settings.currencyDisplay, settings.exchangeRate), color: 'stat-neutral' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <div className="text-gray-400 text-xs mb-1">{label}</div>
            <div className="text-gray-900 font-bold text-lg">{value}</div>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/matrix/inbound" className="glass rounded-2xl p-6 card-hover group block">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(92, 124, 250, 0.15)' }}>
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-1">Inbound Channels</h3>
          <p className="text-gray-400 text-sm mb-4">Meta Ads & Google Ads ROI calculator with live calculations</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{inboundEntries.length} entries</span>
            <span className="text-emerald-400 font-medium">
              {formatCurrency(totalInboundRevenue, 'USD', settings.exchangeRate)} T. Recurring
            </span>
          </div>
        </Link>

        <Link href="/matrix/outbound" className="glass rounded-2xl p-6 card-hover group block">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-1">Outbound Channels</h3>
          <p className="text-gray-400 text-sm mb-4">Cold Call, Cold Email & Cold Social DM with tier-based cost defaults</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{outboundEntries.length} entries</span>
            <span className="text-emerald-400 font-medium">
              {formatCurrency(totalOutboundRevenue, 'USD', settings.exchangeRate)} T. Recurring
            </span>
          </div>
        </Link>
      </div>

      {/* Recent entries */}
      {(inboundEntries.length > 0 || outboundEntries.length > 0) && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-gray-900 font-semibold mb-4">Recent Entries</h3>
          <div className="space-y-2">
            {[...inboundEntries, ...outboundEntries]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-200/50 last:border-0">
                  <div>
                    <span className="text-gray-900 text-sm font-medium">{entry.channel}</span>
                    <span className="text-gray-500 text-xs ml-2">{entry.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 text-sm font-semibold">
                      {formatCurrency(entry.tRecurring, settings.currencyDisplay, settings.exchangeRate)}
                    </div>
                    <div className={`text-xs ${entry.grossPL >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      P/L: {entry.grossPL >= 0 ? '+' : ''}{formatCurrency(entry.grossPL, 'USD', settings.exchangeRate)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
