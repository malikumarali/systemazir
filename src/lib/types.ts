// ============================================================
// Agency OS — Type Definitions
// ============================================================

export type UserRole = 'founder' | 'team_member'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

// ---------------------------------------------------------------
// Lead Source Tracker
// ---------------------------------------------------------------
export type LeadSource =
  | 'Meta Ads'
  | 'Google Ads'
  | 'Cold Call'
  | 'Cold Email'
  | 'Cold Social DM'
  | 'Referral'
  | 'Other'

export type Niche =
  | 'eCommerce'
  | 'Real Estate'
  | 'SaaS'
  | 'Coaching'
  | 'Local Business'
  | 'Other'

export type DealStatus =
  | 'Prospect'
  | 'Qualified'
  | 'Appointment Set'
  | 'Closed Won'
  | 'Closed Lost'
  | 'Churned'

export interface Lead {
  id: string
  userId: string
  clientName: string
  leadSource: LeadSource
  niche: string // can be custom
  leadDate: string // ISO date
  dealStatus: DealStatus
  dealValueUsd: number
  dealValuePkr: number
  monthlyRetainer: number
  notes: string
  exchangeRate: number
  createdAt: string
}

// ---------------------------------------------------------------
// Inbound (Meta Ads / Google Ads) Entry
// ---------------------------------------------------------------
export type InboundChannel = 'Meta Ads' | 'Google Ads'

export interface InboundEntry {
  id: string
  userId: string
  channel: InboundChannel
  month: string // YYYY-MM
  // Inputs
  budgetUsd: number
  cpc: number
  convRatio: number // percentage 0-100
  apptRatio: number
  showUpRatio: number
  closeRatio: number
  followupRatio: number
  avgTicketSize: number
  upsellRatio: number
  upsellValue: number
  pipelineDeals: number
  // Calculated (stored for historical accuracy)
  clicks: number
  leads: number
  appointments: number
  showUp: number
  closings: number
  followupClosings: number
  totalClosings: number
  totalSales: number
  upsells: number
  upsellRevenue: number
  tRecurring: number
  costPerLead: number
  costPerAppointment: number
  cac: number
  roas: number
  pipelineWorth: number
  grossPL: number
  // Currency
  exchangeRate: number
  createdAt: string
}

// ---------------------------------------------------------------
// Outbound Entry (Cold Call / Cold Email / Cold Social DM)
// ---------------------------------------------------------------
export type OutboundChannel = 'Cold Call' | 'Cold Email' | 'Cold Social DM'
export type OutboundTier = 'S' | 'M' | 'L'

export interface OutboundEntry {
  id: string
  userId: string
  channel: OutboundChannel
  month: string // YYYY-MM
  tier: OutboundTier
  // Shared funnel outputs
  outbound: number // dials / emails sent / DMs sent
  // Cold Call specific
  connRatio?: number
  connect?: number
  intRatio?: number
  interested?: number
  // Cold Email specific
  openRatio?: number
  openRate?: number
  responseRatio?: number
  responseRate?: number
  positiveRatio?: number
  positiveRespond?: number
  // Cold Social DM (same as email but different labels)
  // apptRatio → shared
  apptRatio: number
  appointments: number
  showUpRatio: number
  showUp: number
  closeRatio: number
  closings: number
  followupRatio: number
  followupClosings: number
  totalClosings: number
  avgTicketSize: number
  totalSales: number
  upsellRatio: number
  upsellValue: number
  upsells: number
  upsellRevenue: number
  tRecurring: number
  // Costs
  listing: number
  sdr: number
  closer: number
  tools: number
  other: number
  training: number
  totalEstCost: number
  grossPL: number
  exchangeRate: number
  createdAt: string
}

// ---------------------------------------------------------------
// Settings
// ---------------------------------------------------------------
export type CurrencyDisplay = 'USD' | 'PKR' | 'Both'

export interface Settings {
  exchangeRate: number
  currencyDisplay: CurrencyDisplay
}

// ---------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------
export interface ChannelMetrics {
  channel: string
  tRecurring: number
  totalCost: number
  grossPL: number
  roas?: number
}

export interface NicheMetrics {
  niche: string
  clientCount: number
  totalRevenue: number
  totalCost: number
  grossPL: number
  avgDealValue: number
  topLeadSource: string
}
