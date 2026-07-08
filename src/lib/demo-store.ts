// ============================================================
// Agency OS — Centralized Demo Store
// A SINGLE shared in-memory store across all API routes.
// Used ONLY when Supabase is not configured (demo mode).
//
// IMPORTANT: This is module-level state — it persists for the
// lifetime of the Node.js server process. On Railway (single
// instance) this works fine for demos. In production with
// Supabase, this file is never used.
// ============================================================

import { Lead, InboundEntry, OutboundEntry, User } from './types'
import { DEMO_LEADS, DEMO_INBOUND, DEMO_OUTBOUND, DEMO_USERS as SEED_USERS } from './mockData'

// These are the single source of truth for all demo API routes
export let demoLeads: Lead[] = [...DEMO_LEADS]
export let demoInbound: InboundEntry[] = [...DEMO_INBOUND]
export let demoOutbound: OutboundEntry[] = [...DEMO_OUTBOUND]

// Mutable user registry — includes seeded demo users + any runtime signups
export let demoUsers: User[] = [...SEED_USERS]

// Mutation helpers (ensure modules all share the same reference)
export const DemoStore = {
  // Users — needed so signup creates isolated accounts
  getUsers: () => demoUsers,
  findUser: (id: string) => demoUsers.find(u => u.id === id),
  findUserByEmail: (email: string) => demoUsers.find(u => u.email === email),
  addUser: (user: User) => { demoUsers = [...demoUsers, user] },

  // Leads — founders see only their OWN leads (not all founders)
  getLeads: () => demoLeads,
  setLeads: (leads: Lead[]) => { demoLeads = leads },
  addLead: (lead: Lead) => { demoLeads = [lead, ...demoLeads] },
  updateLead: (id: string, patch: Partial<Lead>) => {
    demoLeads = demoLeads.map(l => l.id === id ? { ...l, ...patch } : l)
  },
  deleteLead: (id: string) => { demoLeads = demoLeads.filter(l => l.id !== id) },
  deleteLeads: (ids: string[]) => { demoLeads = demoLeads.filter(l => !ids.includes(l.id)) },

  // Inbound
  getInbound: () => demoInbound,
  addInbound: (entry: InboundEntry) => { demoInbound = [entry, ...demoInbound] },
  deleteInbound: (id: string) => { demoInbound = demoInbound.filter(e => e.id !== id) },
  deleteInboundBatch: (ids: string[]) => { demoInbound = demoInbound.filter(e => !ids.includes(e.id)) },

  // Outbound
  getOutbound: () => demoOutbound,
  addOutbound: (entry: OutboundEntry) => { demoOutbound = [entry, ...demoOutbound] },
  deleteOutbound: (id: string) => { demoOutbound = demoOutbound.filter(e => e.id !== id) },
  deleteOutboundBatch: (ids: string[]) => { demoOutbound = demoOutbound.filter(e => !ids.includes(e.id)) },
}
