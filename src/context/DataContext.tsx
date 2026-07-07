'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Lead, InboundEntry, OutboundEntry } from '@/lib/types'
import { DEMO_LEADS, DEMO_INBOUND, DEMO_OUTBOUND } from '@/lib/mockData'

interface DataContextValue {
  leads: Lead[]
  inboundEntries: InboundEntry[]
  outboundEntries: OutboundEntry[]
  addLead: (lead: Lead) => void
  updateLead: (id: string, lead: Lead) => void
  deleteLead: (id: string) => void
  addInbound: (entry: InboundEntry) => void
  updateInbound: (id: string, entry: InboundEntry) => void
  addOutbound: (entry: OutboundEntry) => void
  updateOutbound: (id: string, entry: OutboundEntry) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS)
  const [inboundEntries, setInboundEntries] = useState<InboundEntry[]>(DEMO_INBOUND)
  const [outboundEntries, setOutboundEntries] = useState<OutboundEntry[]>(DEMO_OUTBOUND)

  const addLead = (lead: Lead) => setLeads(prev => [lead, ...prev])
  const updateLead = (id: string, lead: Lead) =>
    setLeads(prev => prev.map(l => (l.id === id ? lead : l)))
  const deleteLead = (id: string) => setLeads(prev => prev.filter(l => l.id !== id))

  const addInbound = (entry: InboundEntry) =>
    setInboundEntries(prev => [entry, ...prev])
  const updateInbound = (id: string, entry: InboundEntry) =>
    setInboundEntries(prev => prev.map(e => (e.id === id ? entry : e)))

  const addOutbound = (entry: OutboundEntry) =>
    setOutboundEntries(prev => [entry, ...prev])
  const updateOutbound = (id: string, entry: OutboundEntry) =>
    setOutboundEntries(prev => prev.map(e => (e.id === id ? entry : e)))

  return (
    <DataContext.Provider
      value={{
        leads,
        inboundEntries,
        outboundEntries,
        addLead,
        updateLead,
        deleteLead,
        addInbound,
        updateInbound,
        addOutbound,
        updateOutbound,
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
