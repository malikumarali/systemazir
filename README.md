# Agency OS

> **The only project management tool that answers: Where do our best clients come from, which niche generates the most profit, and what is our real ROI?**

## Quick Start

### 1. Install Node.js

Download and install Node.js LTS from [nodejs.org](https://nodejs.org). Then restart your terminal.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment (Optional — for Supabase)

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
copy .env.local.example .env.local
```

Then edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Without Supabase credentials**, the app runs in **Demo Mode** with local in-memory state. All features work — data just resets on page refresh.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Founder | `founder@agencyos.com` | `demo123` |
| Team Member | `team@agencyos.com` | `demo123` |

Or just click the **Quick Demo Access** buttons on the login page.

---

## Modules

### Module 1 — Lead Source Tracker
- Tag every deal/client to its acquisition channel
- Sortable, filterable table (by source, niche, status, date)
- Founder: full CRUD · Team Member: add only
- Excel/CSV upload with field mapping

### Module 2 — Expense & Revenue Matrix

**Inbound (Meta Ads / Google Ads)**
- Live-calculating funnel: Budget → CPC → Clicks → Conv. Ratio → Leads → ... → Gross P/L
- All auto-calculated fields update in real-time as you type
- Default values per channel (editable)

**Outbound (Cold Call / Cold Email / Cold Social DM)**
- Tier selector (S/M/L) auto-populates cost defaults
- Channel-specific funnel fields per SRS specification
- Live Gross P/L = T. Recurring − Total Est. Cost

### Module 3 — Analytics Dashboard (Founder only)

**ROI Matrix (Heatmaps)**
- Heatmap A: Budget × Conv. Ratio → Leads (with hover tooltips showing exact count + estimated revenue)
- Heatmap B: Budget × CPC → Clicks
- Red (low) → Green (high) color scale
- Configurable CPC and Avg. Ticket Size

**Revenue vs Spend**
- Grouped bar + line combo chart per channel
- T. Recurring (green) and Total Cost (red) bars
- Gross P/L line (blue) and ROAS on secondary axis
- Data table with exact USD + PKR values

**Niche Ranking**
- Cards sorted by Gross P/L descending (default)
- Re-sort by: Revenue, Client Count, Avg. Deal Value
- Per card: client count, revenue, cost, P/L, avg deal, top source

---

## Currency Support

- All monetary fields accept **USD** as primary input
- **PKR** equivalent calculated live at configured exchange rate
- Default: **1 USD = 280 PKR**
- Override in Settings → Exchange Rate
- Display toggle: USD / PKR / Both (top-right of every page)

---

## Database Setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and paste the contents of `supabase/schema.sql`
3. Add your project URL and anon key to `.env.local`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Excel Parsing | SheetJS (xlsx) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                  # Authenticated app pages
│   │   ├── dashboard/          # Analytics dashboard
│   │   ├── leads/              # Lead Source Tracker
│   │   ├── matrix/             # Revenue Matrix
│   │   │   ├── inbound/        # Meta/Google Ads
│   │   │   └── outbound/       # Cold Call/Email/DM
│   │   └── settings/           # Exchange rate, team
│   └── login/                  # Authentication
├── components/
│   ├── layout/                 # Sidebar, Header
│   └── shared/                 # ExcelUpload
├── context/                    # Auth, Settings, Data
└── lib/                        # Types, Calculations, Currency
supabase/
└── schema.sql                  # PostgreSQL schema
```

---

## Roadmap (from SRS)

| Phase | Feature |
|-------|---------|
| ✅ Prototype | Lead Source Tracker |
| ✅ Prototype | Expense & Revenue Matrix |
| ✅ Prototype | Analytics Dashboard (3 Views) |
| ✅ Prototype | Dual Currency (USD + PKR) |
| ✅ Prototype | Live form calculations |
| ✅ Prototype | Founder + Team Member roles |
| ✅ Prototype | Excel/CSV upload |
| 🔜 MVP | Team hierarchy & org chart |
| 🔜 MVP | Client onboarding flow |
| 🔜 MVP | NPS/feedback collection |
| 🔜 MVP | Full P&L financial reporting |
