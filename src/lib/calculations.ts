// ============================================================
// Agency OS — Calculation Engine (Per SRS Section 8)
// ============================================================

// ---------------------------------------------------------------
// 8.1 Inbound — Meta Ads & Google Ads
// ---------------------------------------------------------------
export interface InboundInputs {
  budgetUsd: number
  cpc: number
  convRatio: number        // 0-100 (%)
  apptRatio: number        // 0-100 (%)
  showUpRatio: number      // 0-100 (%)
  closeRatio: number       // 0-100 (%)
  followupRatio: number    // 0-100 (%)
  avgTicketSize: number
  upsellRatio: number      // 0-100 (%)
  upsellValue: number
}

export interface InboundCalcResult {
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
  pipelineDeals: number
  pipelineWorth: number
  grossPL: number
}

export function calcInbound(i: InboundInputs): InboundCalcResult {
  const clicks = i.cpc > 0 ? i.budgetUsd / i.cpc : 0
  const leads = clicks * (i.convRatio / 100)
  const appointments = leads * (i.apptRatio / 100)
  const showUp = appointments * (i.showUpRatio / 100)
  const closings = showUp * (i.closeRatio / 100)
  const followupClosings = closings * (i.followupRatio / 100)
  const totalClosings = closings + followupClosings
  const totalSales = totalClosings * i.avgTicketSize
  const upsells = totalClosings * (i.upsellRatio / 100)
  const upsellRevenue = upsells * i.upsellValue
  const tRecurring = totalSales + upsellRevenue
  const costPerLead = leads > 0 ? i.budgetUsd / leads : 0
  const costPerAppointment = appointments > 0 ? i.budgetUsd / appointments : 0
  const cac = totalClosings > 0 ? i.budgetUsd / totalClosings : 0
  const roas = i.budgetUsd > 0 ? tRecurring / i.budgetUsd : 0
  const pipelineDeals = leads * (1 - i.apptRatio / 100)
  const pipelineWorth = pipelineDeals * i.avgTicketSize
  const grossPL = tRecurring - i.budgetUsd

  return {
    clicks: round2(clicks),
    leads: round2(leads),
    appointments: round2(appointments),
    showUp: round2(showUp),
    closings: round2(closings),
    followupClosings: round2(followupClosings),
    totalClosings: round2(totalClosings),
    totalSales: round2(totalSales),
    upsells: round2(upsells),
    upsellRevenue: round2(upsellRevenue),
    tRecurring: round2(tRecurring),
    costPerLead: round2(costPerLead),
    costPerAppointment: round2(costPerAppointment),
    cac: round2(cac),
    roas: round2(roas),
    pipelineDeals: round2(pipelineDeals),
    pipelineWorth: round2(pipelineWorth),
    grossPL: round2(grossPL),
  }
}

// ---------------------------------------------------------------
// 8.2 Outbound — Cold Call
// ---------------------------------------------------------------
export interface ColdCallInputs {
  dials: number
  connRatio: number        // 0-100 (%)
  intRatio: number         // 0-100 (%)
  apptRatio: number        // 0-100 (%)
  showUpRatio: number      // 0-100 (%)
  closeRatio: number       // 0-100 (%)
  followupRatio: number    // 0-100 (%)
  avgTicketSize: number
  upsellRatio: number      // 0-100 (%)
  upsellValue: number
  // Costs
  listing: number
  sdr: number
  closer: number
  tools: number
  other: number
  training: number
}

export interface OutboundCalcResult {
  step1: number // connect / openRate / connection
  step2: number // interested / responseRate / responseRate
  step3?: number // positiveRespond (email/DM)
  appointments: number
  showUp: number
  closings: number
  followupClosings: number
  totalClosings: number
  totalSales: number
  upsells: number
  upsellRevenue: number
  tRecurring: number
  totalEstCost: number
  grossPL: number
}

export function calcColdCall(i: ColdCallInputs): OutboundCalcResult {
  const connect = i.dials * (i.connRatio / 100)
  const interested = connect * (i.intRatio / 100)
  const appointments = interested * (i.apptRatio / 100)
  const showUp = appointments * (i.showUpRatio / 100)
  const closings = showUp * (i.closeRatio / 100)
  const followupClosings = closings * (i.followupRatio / 100)
  const totalClosings = closings + followupClosings
  const totalSales = totalClosings * i.avgTicketSize
  const upsells = totalClosings * (i.upsellRatio / 100)
  const upsellRevenue = upsells * i.upsellValue
  const tRecurring = totalSales + upsellRevenue
  const totalEstCost = i.listing + i.sdr + i.closer + i.tools + i.other + i.training
  const grossPL = tRecurring - totalEstCost

  return {
    step1: round2(connect),
    step2: round2(interested),
    appointments: round2(appointments),
    showUp: round2(showUp),
    closings: round2(closings),
    followupClosings: round2(followupClosings),
    totalClosings: round2(totalClosings),
    totalSales: round2(totalSales),
    upsells: round2(upsells),
    upsellRevenue: round2(upsellRevenue),
    tRecurring: round2(tRecurring),
    totalEstCost: round2(totalEstCost),
    grossPL: round2(grossPL),
  }
}

// ---------------------------------------------------------------
// 8.3 Outbound — Cold Email
// ---------------------------------------------------------------
export interface ColdEmailInputs {
  outbound: number
  openRatio: number        // 0-100 (%)
  responseRatio: number    // 0-100 (%)
  positiveRatio: number    // 0-100 (%)
  apptRatio: number        // 0-100 (%)
  showUpRatio: number      // 0-100 (%)
  closeRatio: number       // 0-100 (%)
  followupRatio: number    // 0-100 (%) default 25%
  avgTicketSize: number
  upsellRatio: number
  upsellValue: number
  listing: number
  sdr: number
  closer: number
  tools: number
  other: number
  training: number
}

export function calcColdEmail(i: ColdEmailInputs): OutboundCalcResult {
  const openRate = i.outbound * (i.openRatio / 100)
  const responseRate = openRate * (i.responseRatio / 100)
  const positiveRespond = responseRate * (i.positiveRatio / 100)
  const appointments = positiveRespond * (i.apptRatio / 100)
  const showUp = appointments * (i.showUpRatio / 100)
  const closings = showUp * (i.closeRatio / 100)
  const followupClosings = closings * (i.followupRatio / 100)
  const totalClosings = closings + followupClosings
  const totalSales = totalClosings * i.avgTicketSize
  const upsells = totalClosings * (i.upsellRatio / 100)
  const upsellRevenue = upsells * i.upsellValue
  const tRecurring = totalSales + upsellRevenue
  const totalEstCost = i.listing + i.sdr + i.closer + i.tools + i.other + i.training
  const grossPL = tRecurring - totalEstCost

  return {
    step1: round2(openRate),
    step2: round2(responseRate),
    step3: round2(positiveRespond),
    appointments: round2(appointments),
    showUp: round2(showUp),
    closings: round2(closings),
    followupClosings: round2(followupClosings),
    totalClosings: round2(totalClosings),
    totalSales: round2(totalSales),
    upsells: round2(upsells),
    upsellRevenue: round2(upsellRevenue),
    tRecurring: round2(tRecurring),
    totalEstCost: round2(totalEstCost),
    grossPL: round2(grossPL),
  }
}

// ---------------------------------------------------------------
// 8.4 Outbound — Cold Social DM
// ---------------------------------------------------------------
export interface ColdDMInputs {
  outbound: number
  connectRatio: number     // 0-100 (%)
  responseRatio: number    // 0-100 (%)
  positiveRatio: number    // 0-100 (%)
  apptRatio: number        // 0-100 (%)
  showUpRatio: number      // 0-100 (%)
  closeRatio: number       // 0-100 (%)
  followupRatio: number    // 0-100 (%) 0-25%
  avgTicketSize: number
  upsellRatio: number
  upsellValue: number
  listing: number
  sdr: number
  closer: number
  tools: number
  other: number
  training: number
}

export function calcColdDM(i: ColdDMInputs): OutboundCalcResult {
  const connection = i.outbound * (i.connectRatio / 100)
  const responseRate = connection * (i.responseRatio / 100)
  const positiveRespond = responseRate * (i.positiveRatio / 100)
  const appointments = positiveRespond * (i.apptRatio / 100)
  const showUp = appointments * (i.showUpRatio / 100)
  const closings = showUp * (i.closeRatio / 100)
  const followupClosings = closings * (i.followupRatio / 100)
  const totalClosings = closings + followupClosings
  const totalSales = totalClosings * i.avgTicketSize
  const upsells = totalClosings * (i.upsellRatio / 100)
  const upsellRevenue = upsells * i.upsellValue
  const tRecurring = totalSales + upsellRevenue
  const totalEstCost = i.listing + i.sdr + i.closer + i.tools + i.other + i.training
  const grossPL = tRecurring - totalEstCost

  return {
    step1: round2(connection),
    step2: round2(responseRate),
    step3: round2(positiveRespond),
    appointments: round2(appointments),
    showUp: round2(showUp),
    closings: round2(closings),
    followupClosings: round2(followupClosings),
    totalClosings: round2(totalClosings),
    totalSales: round2(totalSales),
    upsells: round2(upsells),
    upsellRevenue: round2(upsellRevenue),
    tRecurring: round2(tRecurring),
    totalEstCost: round2(totalEstCost),
    grossPL: round2(grossPL),
  }
}

// ---------------------------------------------------------------
// 8.5 ROI Heatmap Formulas
// ---------------------------------------------------------------
// Heatmap A: Budget vs Conv. Ratio → Leads
// Leads = (Budget / CPC) × Conv. Ratio
export function heatmapALeads(budget: number, cpc: number, convRatio: number): number {
  if (cpc <= 0) return 0
  return round2((budget / cpc) * (convRatio / 100))
}

// Heatmap B: CPC vs Budget → Clicks
// Clicks = Budget / CPC
export function heatmapBClicks(budget: number, cpc: number): number {
  if (cpc <= 0) return 0
  return round2(budget / cpc)
}

// Generate heatmap A data
export function generateHeatmapA(cpc: number = 2, avgTicketSize: number = 1000) {
  const budgets = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 14500]
  const convRatios = [0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50]

  return budgets.map(budget => ({
    budget,
    data: convRatios.map(conv => {
      const leads = heatmapALeads(budget, cpc, conv)
      const estimatedRevenue = leads * avgTicketSize
      return { conv, leads, estimatedRevenue }
    }),
  }))
}

// Generate heatmap B data
export function generateHeatmapB() {
  const budgets = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 14500]
  const cpcs = [0.50, 1.00, 1.50, 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, 12.00, 15.00]

  return budgets.map(budget => ({
    budget,
    data: cpcs.map(cpc => ({
      cpc,
      clicks: heatmapBClicks(budget, cpc),
    })),
  }))
}

// ---------------------------------------------------------------
// Outbound Tier Defaults (SRS Table 8)
// ---------------------------------------------------------------
export interface TierDefaults {
  listing: number
  sdr: number
  closer: number
  tools: number
  other: number
  training: number
}

export const OUTBOUND_DEFAULTS: Record<string, Record<'S' | 'M' | 'L', TierDefaults>> = {
  'Cold Call': {
    S: { listing: 200, sdr: 300, closer: 500, tools: 300, other: 300, training: 0 },
    M: { listing: 400, sdr: 800, closer: 500, tools: 600, other: 300, training: 0 },
    L: { listing: 400, sdr: 3000, closer: 1500, tools: 2000, other: 300, training: 500 },
  },
  'Cold Email': {
    S: { listing: 200, sdr: 300, closer: 500, tools: 300, other: 300, training: 0 },
    M: { listing: 400, sdr: 500, closer: 500, tools: 600, other: 300, training: 0 },
    L: { listing: 400, sdr: 400, closer: 1500, tools: 2500, other: 300, training: 500 },
  },
  'Cold Social DM': {
    S: { listing: 200, sdr: 300, closer: 500, tools: 100, other: 300, training: 0 },
    M: { listing: 400, sdr: 800, closer: 500, tools: 200, other: 300, training: 0 },
    L: { listing: 400, sdr: 3000, closer: 1500, tools: 500, other: 300, training: 500 },
  },
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function safeDiv(a: number, b: number): number {
  return b === 0 ? 0 : round2(a / b)
}
