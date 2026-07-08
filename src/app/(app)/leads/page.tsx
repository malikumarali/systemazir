'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useSettings } from '@/context/SettingsContext'
import { Lead, LeadSource, DealStatus } from '@/lib/types'
import { formatCurrency, usdToPkr } from '@/lib/currency'
import {
  Plus, Search, Filter, Edit2, Trash2, TrendingUp,
  Target, DollarSign, Users, ArrowUpDown
} from 'lucide-react'
import clsx from 'clsx'

const STATUS_COLORS: Record<DealStatus, string> = {
  'Prospect': 'badge-gray',
  'Qualified': 'badge-blue',
  'Appointment Set': 'badge-yellow',
  'Closed Won': 'badge-green',
  'Closed Lost': 'badge-red',
  'Churned': 'badge-red',
}

const SOURCE_COLORS: Record<string, string> = {
  'Meta Ads': 'badge-blue',
  'Google Ads': 'badge-yellow',
  'Cold Call': 'badge-purple',
  'Cold Email': 'badge-gray',
  'Cold Social DM': 'badge-purple',
  'Referral': 'badge-green',
  'Other': 'badge-gray',
}

type SortField = 'leadDate' | 'dealValueUsd' | 'clientName' | 'dealStatus'
type SortDir = 'asc' | 'desc'

export default function LeadsPage() {
  const { isFounder } = useAuth()
  const { leads, deleteLead } = useData()
  const { settings } = useSettings()
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterNiche, setFilterNiche] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortField, setSortField] = useState<SortField>('leadDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...leads]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.clientName.toLowerCase().includes(q) ||
        l.niche.toLowerCase().includes(q) ||
        l.notes.toLowerCase().includes(q)
      )
    }
    if (filterSource) result = result.filter(l => l.leadSource === filterSource)
    if (filterNiche) result = result.filter(l => l.niche === filterNiche)
    if (filterStatus) result = result.filter(l => l.dealStatus === filterStatus)

    result.sort((a, b) => {
      let av: string | number = a[sortField]
      let bv: string | number = b[sortField]
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })

    return result
  }, [leads, search, filterSource, filterNiche, filterStatus, sortField, sortDir])

  const stats = useMemo(() => {
    const closedWon = leads.filter(l => l.dealStatus === 'Closed Won')
    const totalRevenue = closedWon.reduce((s, l) => s + l.dealValueUsd, 0)
    const avgDeal = closedWon.length > 0 ? totalRevenue / closedWon.length : 0
    return { total: leads.length, closedWon: closedWon.length, totalRevenue, avgDeal }
  }, [leads])

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const uniqueNiches = Array.from(new Set(leads.map(l => l.niche)))
  const sources: LeadSource[] = ['Meta Ads', 'Google Ads', 'Cold Call', 'Cold Email', 'Cold Social DM', 'Referral', 'Other']
  const statuses: DealStatus[] = ['Prospect', 'Qualified', 'Appointment Set', 'Closed Won', 'Closed Lost', 'Churned']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Source Tracker</h2>
          <p className="text-gray-400 text-sm mt-1">
            {leads.length} leads tracked · {stats.closedWon} closed won
          </p>
        </div>
        <Link
          href="/leads/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
          id="add-lead-btn"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Leads',
            value: stats.total.toString(),
            icon: Target,
            cls: 'stat-neutral',
            iconColor: 'text-red-600',
          },
          {
            label: 'Closed Won',
            value: stats.closedWon.toString(),
            icon: TrendingUp,
            cls: 'stat-positive',
            iconColor: 'text-emerald-400',
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue, settings.currencyDisplay, settings.exchangeRate),
            icon: DollarSign,
            cls: 'stat-positive',
            iconColor: 'text-emerald-400',
          },
          {
            label: 'Avg. Deal Value',
            value: formatCurrency(stats.avgDeal, settings.currencyDisplay, settings.exchangeRate),
            icon: Users,
            cls: 'stat-neutral',
            iconColor: 'text-red-600',
          },
        ].map(({ label, value, icon: Icon, cls, iconColor }) => (
          <div key={label} className={clsx('rounded-xl p-4', cls)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={clsx('w-4 h-4', iconColor)} />
              <span className="text-gray-400 text-xs font-medium">{label}</span>
            </div>
            <div className="text-gray-900 font-bold text-lg leading-tight">{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              className="input-field pl-11"
              placeholder="Search clients, niches..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="leads-search"
            />
          </div>
          <select
            className="input-field w-auto min-w-[140px]"
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            id="filter-source"
          >
            <option value="">All Sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="input-field w-auto min-w-[140px]"
            value={filterNiche}
            onChange={e => setFilterNiche(e.target.value)}
            id="filter-niche"
          >
            <option value="">All Niches</option>
            {uniqueNiches.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select
            className="input-field w-auto min-w-[140px]"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            id="filter-status"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                {[
                  { label: 'Client / Deal', field: 'clientName' as SortField },
                  { label: 'Lead Source', field: null },
                  { label: 'Niche', field: null },
                  { label: 'Date', field: 'leadDate' as SortField },
                  { label: 'Status', field: 'dealStatus' as SortField },
                  { label: 'Deal Value', field: 'dealValueUsd' as SortField },
                  ...(isFounder ? [{ label: 'Actions', field: null }] : []),
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    className={clsx(
                      'px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider',
                      field ? 'cursor-pointer hover:text-gray-800' : ''
                    )}
                    onClick={() => field && toggleSort(field)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {field && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isFounder ? 7 : 6} className="px-4 py-12 text-center text-gray-500">
                    No leads found. {search || filterSource || filterNiche || filterStatus
                      ? 'Try clearing filters.'
                      : <Link href="/leads/new" className="text-red-600 hover:underline">Add your first lead →</Link>
                    }
                  </td>
                </tr>
              ) : filtered.map(lead => (
                <tr
                  key={lead.id}
                  className="table-row-hover"
                  style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}
                >
                  <td className="px-4 py-3">
                    <div className="text-gray-900 font-medium text-sm">{lead.clientName}</div>
                    {lead.notes && (
                      <div className="text-gray-500 text-xs mt-0.5 truncate max-w-[200px]">
                        {lead.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge', SOURCE_COLORS[lead.leadSource] || 'badge-gray')}>
                      {lead.leadSource}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700 text-sm">{lead.niche}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">
                      {new Date(lead.leadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge', STATUS_COLORS[lead.dealStatus])}>
                      {lead.dealStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 font-semibold text-sm">
                      {formatCurrency(lead.dealValueUsd, settings.currencyDisplay, settings.exchangeRate)}
                    </div>
                    {lead.monthlyRetainer > 0 && (
                      <div className="text-gray-500 text-xs">
                        +${lead.monthlyRetainer}/mo
                      </div>
                    )}
                  </td>
                  {isFounder && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/leads/${lead.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-500/10 transition-all"
                          id={`edit-lead-${lead.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(lead.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          id={`delete-lead-${lead.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-gray-900 font-bold text-lg mb-2">Delete Lead?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This action cannot be undone. The lead record will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-gray-700 text-sm font-medium transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteLead(deleteId); setDeleteId(null) }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all"
                id="confirm-delete-lead"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
