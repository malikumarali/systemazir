'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Lead, InboundEntry, OutboundEntry } from '@/lib/types'
import { useAuth } from './AuthContext'

interface DataContextValue {
  leads: Lead[]
  inboundEntries: InboundEntry[]
  outboundEntries: OutboundEntry[]
  isLoading: boolean
  error: string | null
  addLead: (lead: Lead) => Promise<{ error?: string }>
  updateLead: (id: string, lead: Lead) => Promise<{ error?: string }>
  deleteLead: (id: string) => Promise<{ error?: string }>
  addInbound: (entry: InboundEntry) => Promise<{ error?: string }>
  updateInbound: (id: string, entry: InboundEntry) => Promise<{ error?: string }>
  addOutbound: (entry: OutboundEntry) => Promise<{ error?: string }>
  updateOutbound: (id: string, entry: OutboundEntry) => Promise<{ error?: string }>
  refetchData: () => Promise<void>
  clearData: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

// ---- Mapper Utilities ----

export function mapLeadToFrontend(db: any): Lead {
  return {
    id: db.id,
    userId: db.user_id || db.userId,
    clientName: db.client_name || db.clientName,
    leadSource: db.lead_source || db.leadSource,
    niche: db.niche,
    leadDate: db.lead_date || db.leadDate,
    dealStatus: db.deal_status || db.dealStatus,
    dealValueUsd: Number(db.deal_value_usd || db.dealValueUsd || 0),
    dealValuePkr: Number(db.deal_value_pkr || db.dealValuePkr || 0),
    monthlyRetainer: Number(db.monthly_retainer || db.monthlyRetainer || 0),
    notes: db.notes || '',
    exchangeRate: Number(db.exchange_rate || db.exchangeRate || 280),
    createdAt: db.created_at || db.createdAt,
  }
}

export function mapInboundToFrontend(db: any): InboundEntry {
  return {
    id: db.id,
    userId: db.user_id || db.userId,
    channel: db.channel,
    month: db.month,
    budgetUsd: Number(db.budget_usd || db.budgetUsd || 0),
    cpc: Number(db.cpc || 0),
    convRatio: Number(db.conv_ratio || db.convRatio || 0),
    apptRatio: Number(db.appt_ratio || db.apptRatio || 0),
    showUpRatio: Number(db.show_up_ratio || db.showUpRatio || 0),
    closeRatio: Number(db.close_ratio || db.closeRatio || 0),
    followupRatio: Number(db.followup_ratio || db.followupRatio || 0),
    avgTicketSize: Number(db.avg_ticket_size || db.avgTicketSize || 0),
    upsellRatio: Number(db.upsell_ratio || db.upsellRatio || 0),
    upsellValue: Number(db.upsell_value || db.upsellValue || 0),
    pipelineDeals: Number(db.pipeline_deals || db.pipelineDeals || 0),
    clicks: Number(db.clicks || 0),
    leads: Number(db.leads || 0),
    appointments: Number(db.appointments || 0),
    showUp: Number(db.show_up || db.showUp || 0),
    closings: Number(db.closings || 0),
    followupClosings: Number(db.followup_closings || db.followupClosings || 0),
    totalClosings: Number(db.total_closings || db.totalClosings || 0),
    totalSales: Number(db.total_sales || db.totalSales || 0),
    upsells: Number(db.upsells || 0),
    upsellRevenue: Number(db.upsell_revenue || db.upsellRevenue || 0),
    tRecurring: Number(db.t_recurring || db.tRecurring || 0),
    costPerLead: Number(db.cost_per_lead || db.costPerLead || 0),
    costPerAppointment: Number(db.cost_per_appointment || db.costPerAppointment || 0),
    cac: Number(db.cac || 0),
    roas: Number(db.roas || 0),
    pipelineWorth: Number(db.pipeline_worth || db.pipelineWorth || 0),
    grossPL: Number(db.gross_pl || db.grossPL || 0),
    exchangeRate: Number(db.exchange_rate || db.exchangeRate || 280),
    createdAt: db.created_at || db.createdAt,
  }
}

export function mapOutboundToFrontend(db: any): OutboundEntry {
  return {
    id: db.id,
    userId: db.user_id || db.userId,
    channel: db.channel,
    month: db.month,
    tier: db.tier,
    outbound: Number(db.outbound || 0),
    connRatio: db.conn_ratio !== undefined ? Number(db.conn_ratio) : db.connRatio,
    connect: db.connect_ratio !== undefined ? Number(db.connect_ratio) : db.connect,
    intRatio: db.int_ratio !== undefined ? Number(db.int_ratio) : db.intRatio,
    interested: db.interested !== undefined ? Number(db.interested) : db.interested,
    openRatio: db.open_ratio !== undefined ? Number(db.open_ratio) : db.openRatio,
    openRate: db.open_rate !== undefined ? Number(db.open_rate) : db.openRate,
    responseRatio: db.response_ratio !== undefined ? Number(db.response_ratio) : db.responseRatio,
    responseRate: db.response_rate !== undefined ? Number(db.response_rate) : db.responseRate,
    positiveRatio: db.positive_ratio !== undefined ? Number(db.positive_ratio) : db.positiveRatio,
    positiveRespond: db.positive_respond !== undefined ? Number(db.positive_respond) : db.positiveRespond,
    apptRatio: Number(db.appt_ratio || db.apptRatio || 0),
    appointments: Number(db.appointments || 0),
    showUpRatio: Number(db.show_up_ratio || db.showUpRatio || 0),
    showUp: Number(db.show_up || db.showUp || 0),
    closeRatio: Number(db.close_ratio || db.closeRatio || 0),
    closings: Number(db.closings || 0),
    followupRatio: Number(db.followup_ratio || db.followupRatio || 0),
    followupClosings: Number(db.followup_closings || db.followupClosings || 0),
    totalClosings: Number(db.total_closings || db.totalClosings || 0),
    avgTicketSize: Number(db.avg_ticket_size || db.avgTicketSize || 0),
    totalSales: Number(db.total_sales || db.totalSales || 0),
    upsellRatio: Number(db.upsell_ratio || db.upsellRatio || 0),
    upsellValue: Number(db.upsell_value || db.upsellValue || 0),
    upsells: Number(db.upsells || 0),
    upsellRevenue: Number(db.upsell_revenue || db.upsellRevenue || 0),
    tRecurring: Number(db.t_recurring || db.tRecurring || 0),
    listing: Number(db.listing || 0),
    sdr: Number(db.sdr || 0),
    closer: Number(db.closer || 0),
    tools: Number(db.tools || 0),
    other: db.other_cost !== undefined ? Number(db.other_cost) : db.other,
    training: Number(db.training || 0),
    totalEstCost: Number(db.total_est_cost || db.totalEstCost || 0),
    grossPL: Number(db.gross_pl || db.grossPL || 0),
    exchangeRate: Number(db.exchange_rate || db.exchangeRate || 280),
    createdAt: db.created_at || db.createdAt,
  }
}

const getHeaders = () => {
  const token = localStorage.getItem('agencyos_token')
  const user = localStorage.getItem('agencyos_user')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (user) {
    try {
      const parsed = JSON.parse(user)
      headers['x-demo-user-id'] = parsed.id
    } catch {}
  }
  return headers
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, registerClearData } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [inboundEntries, setInboundEntries] = useState<InboundEntry[]>([])
  const [outboundEntries, setOutboundEntries] = useState<OutboundEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearData = useCallback(() => {
    setLeads([])
    setInboundEntries([])
    setOutboundEntries([])
    setError(null)
  }, [])

  // Register clearData with AuthContext so logout can clear it synchronously
  useEffect(() => {
    registerClearData(clearData)
  }, [clearData, registerClearData])

  const refetchData = useCallback(async () => {
    if (!user) {
      clearData()
      return
    }

    // Immediately clear stale data from previous user before fetching new data
    clearData()
    setIsLoading(true)
    setError(null)
    try {
      const headers = getHeaders()
      
      const [leadsRes, inboundRes, outboundRes] = await Promise.all([
        fetch('/api/leads', { headers }),
        fetch('/api/inbound', { headers }),
        fetch('/api/outbound', { headers })
      ])

      if (!leadsRes.ok || !inboundRes.ok || !outboundRes.ok) {
        throw new Error('Failed to load dynamic data from the server API')
      }

      const leadsJson = await leadsRes.json()
      const inboundJson = await inboundRes.json()
      const outboundJson = await outboundRes.json()

      if (leadsJson.ok && inboundJson.ok && outboundJson.ok) {
        setLeads((leadsJson.data.leads || []).map(mapLeadToFrontend))
        setInboundEntries((inboundJson.data.entries || []).map(mapInboundToFrontend))
        setOutboundEntries((outboundJson.data.entries || []).map(mapOutboundToFrontend))
      } else {
        throw new Error('API returned unsuccessful response')
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, [user, clearData])

  // Fetch data whenever user logs in or out
  useEffect(() => {
    refetchData()
  }, [user, refetchData])

  const addLead = async (lead: Lead) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(lead)
      })
      const json = await res.json()
      if (!res.ok || !json.ok) return { error: json.error || 'Failed to create lead' }
      
      const formatted = mapLeadToFrontend(json.data.lead)
      setLeads(prev => [formatted, ...prev])
      return {}
    } catch (e: any) {
      return { error: e.message || 'Network error' }
    }
  }

  const updateLead = async (id: string, lead: Lead) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(lead)
      })
      const json = await res.json()
      if (!res.ok || !json.ok) return { error: json.error || 'Failed to update lead' }
      
      const formatted = mapLeadToFrontend(json.data.lead)
      setLeads(prev => prev.map(l => (l.id === id ? formatted : l)))
      return {}
    } catch (e: any) {
      return { error: e.message || 'Network error' }
    }
  }

  const deleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      const json = await res.json()
      if (!res.ok || !json.ok) return { error: json.error || 'Failed to delete lead' }
      
      setLeads(prev => prev.filter(l => l.id !== id))
      return {}
    } catch (e: any) {
      return { error: e.message || 'Network error' }
    }
  }

  const addInbound = async (entry: InboundEntry) => {
    try {
      const res = await fetch('/api/inbound', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entry)
      })
      const json = await res.json()
      if (!res.ok || !json.ok) return { error: json.error || 'Failed to create inbound entry' }
      
      const formatted = mapInboundToFrontend(json.data.entry)
      setInboundEntries(prev => [formatted, ...prev])
      return {}
    } catch (e: any) {
      return { error: e.message || 'Network error' }
    }
  }

  const updateInbound = async (id: string, entry: InboundEntry) => {
    try {
      const res = await fetch(`/api/inbound/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(entry)
      })
      const json = await res.json()
      if (!res.ok || !json.ok) return { error: json.error || 'Failed to update inbound entry' }
      
      const formatted = mapInboundToFrontend(json.data.entry)
      setInboundEntries(prev => prev.map(e => (e.id === id ? formatted : e)))
      return {}
    } catch (e: any) {
      return { error: e.message || 'Network error' }
    }
  }

  const addOutbound = async (entry: OutboundEntry) => {
    try {
      const res = await fetch('/api/outbound', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entry)
      })
      const json = await res.json()
      if (!res.ok || !json.ok) return { error: json.error || 'Failed to create outbound entry' }
      
      const formatted = mapOutboundToFrontend(json.data.entry)
      setOutboundEntries(prev => [formatted, ...prev])
      return {}
    } catch (e: any) {
      return { error: e.message || 'Network error' }
    }
  }

  const updateOutbound = async (id: string, entry: OutboundEntry) => {
    try {
      const res = await fetch(`/api/outbound/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(entry)
      })
      const json = await res.json()
      if (!res.ok || !json.ok) return { error: json.error || 'Failed to update outbound entry' }
      
      const formatted = mapOutboundToFrontend(json.data.entry)
      setOutboundEntries(prev => prev.map(e => (e.id === id ? formatted : e)))
      return {}
    } catch (e: any) {
      return { error: e.message || 'Network error' }
    }
  }

  return (
    <DataContext.Provider
      value={{
        leads,
        inboundEntries,
        outboundEntries,
        isLoading,
        error,
        addLead,
        updateLead,
        deleteLead,
        addInbound,
        updateInbound,
        addOutbound,
        updateOutbound,
        refetchData,
        clearData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
