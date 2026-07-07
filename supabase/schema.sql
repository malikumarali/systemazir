-- ============================================================
-- Agency OS — Supabase Schema (PostgreSQL)
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------
-- Users / Profiles table (extends Supabase auth.users)
-- ---------------------------------------------------------------
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'team_member' CHECK (role IN ('founder', 'team_member')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'team_member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------
-- Settings table
-- ---------------------------------------------------------------
CREATE TABLE settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 280,
  currency_display TEXT NOT NULL DEFAULT 'Both' CHECK (currency_display IN ('USD', 'PKR', 'Both')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- Leads table (Module 1)
-- ---------------------------------------------------------------
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  lead_source TEXT NOT NULL CHECK (lead_source IN ('Meta Ads', 'Google Ads', 'Cold Call', 'Cold Email', 'Cold Social DM', 'Referral', 'Other')),
  niche TEXT NOT NULL,
  lead_date DATE NOT NULL,
  deal_status TEXT NOT NULL CHECK (deal_status IN ('Prospect', 'Qualified', 'Appointment Set', 'Closed Won', 'Closed Lost', 'Churned')),
  deal_value_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
  deal_value_pkr INTEGER NOT NULL DEFAULT 0,
  monthly_retainer DECIMAL(12,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 280,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- Inbound entries table (Module 2 — Meta Ads / Google Ads)
-- ---------------------------------------------------------------
CREATE TABLE inbound_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('Meta Ads', 'Google Ads')),
  month TEXT NOT NULL, -- YYYY-MM format
  -- Inputs
  budget_usd DECIMAL(12,2) NOT NULL,
  cpc DECIMAL(8,4) NOT NULL,
  conv_ratio DECIMAL(6,4) NOT NULL,
  appt_ratio DECIMAL(6,4) NOT NULL,
  show_up_ratio DECIMAL(6,4) NOT NULL,
  close_ratio DECIMAL(6,4) NOT NULL,
  followup_ratio DECIMAL(6,4) NOT NULL,
  avg_ticket_size DECIMAL(12,2) NOT NULL,
  upsell_ratio DECIMAL(6,4) NOT NULL,
  upsell_value DECIMAL(12,2) NOT NULL,
  -- Calculated outputs (stored for historical accuracy)
  clicks DECIMAL(12,2),
  leads DECIMAL(12,2),
  appointments DECIMAL(12,2),
  show_up DECIMAL(12,2),
  closings DECIMAL(12,2),
  followup_closings DECIMAL(12,2),
  total_closings DECIMAL(12,2),
  total_sales DECIMAL(12,2),
  upsells DECIMAL(12,2),
  upsell_revenue DECIMAL(12,2),
  t_recurring DECIMAL(12,2),
  cost_per_lead DECIMAL(12,2),
  cost_per_appointment DECIMAL(12,2),
  cac DECIMAL(12,2),
  roas DECIMAL(8,4),
  pipeline_deals DECIMAL(12,2),
  pipeline_worth DECIMAL(12,2),
  gross_pl DECIMAL(12,2),
  -- Currency
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 280,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- Outbound entries table (Module 2 — Cold Call / Email / DM)
-- ---------------------------------------------------------------
CREATE TABLE outbound_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('Cold Call', 'Cold Email', 'Cold Social DM')),
  month TEXT NOT NULL, -- YYYY-MM format
  tier TEXT NOT NULL CHECK (tier IN ('S', 'M', 'L')),
  -- Funnel inputs
  outbound INTEGER NOT NULL, -- dials, emails, or DMs sent
  conn_ratio DECIMAL(6,4),
  int_ratio DECIMAL(6,4),
  open_ratio DECIMAL(6,4),
  response_ratio DECIMAL(6,4),
  positive_ratio DECIMAL(6,4),
  connect_ratio DECIMAL(6,4),
  appt_ratio DECIMAL(6,4) NOT NULL,
  show_up_ratio DECIMAL(6,4) NOT NULL,
  close_ratio DECIMAL(6,4) NOT NULL,
  followup_ratio DECIMAL(6,4) NOT NULL,
  avg_ticket_size DECIMAL(12,2) NOT NULL,
  upsell_ratio DECIMAL(6,4) NOT NULL,
  upsell_value DECIMAL(12,2) NOT NULL,
  -- Calculated funnel outputs
  step1 DECIMAL(12,2),
  step2 DECIMAL(12,2),
  step3 DECIMAL(12,2),
  appointments DECIMAL(12,2),
  show_up DECIMAL(12,2),
  closings DECIMAL(12,2),
  followup_closings DECIMAL(12,2),
  total_closings DECIMAL(12,2),
  total_sales DECIMAL(12,2),
  upsells DECIMAL(12,2),
  upsell_revenue DECIMAL(12,2),
  t_recurring DECIMAL(12,2),
  -- Costs (editable per SRS Table 8)
  listing DECIMAL(10,2) DEFAULT 0,
  sdr DECIMAL(10,2) DEFAULT 0,
  closer DECIMAL(10,2) DEFAULT 0,
  tools DECIMAL(10,2) DEFAULT 0,
  other_cost DECIMAL(10,2) DEFAULT 0,
  training DECIMAL(10,2) DEFAULT 0,
  total_est_cost DECIMAL(12,2),
  gross_pl DECIMAL(12,2),
  -- Currency
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 280,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- ---------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_entries ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Settings: Founders only
CREATE POLICY "Founder can manage settings" ON settings USING (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'founder'
  )
);

-- Leads: All authenticated users can insert; founders can update/delete
CREATE POLICY "Authenticated users can insert leads" ON leads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view leads" ON leads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Founders can update leads" ON leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'founder')
);
CREATE POLICY "Founders can delete leads" ON leads FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'founder')
);

-- Matrix entries: All authenticated users can insert; founders can update/delete
CREATE POLICY "Auth users can insert inbound" ON inbound_entries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can view inbound" ON inbound_entries FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users can insert outbound" ON outbound_entries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can view outbound" ON outbound_entries FOR SELECT USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------
-- Indexes for performance
-- ---------------------------------------------------------------
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_lead_source ON leads(lead_source);
CREATE INDEX idx_leads_niche ON leads(niche);
CREATE INDEX idx_leads_deal_status ON leads(deal_status);
CREATE INDEX idx_leads_lead_date ON leads(lead_date);
CREATE INDEX idx_inbound_user_id ON inbound_entries(user_id);
CREATE INDEX idx_inbound_channel ON inbound_entries(channel);
CREATE INDEX idx_inbound_month ON inbound_entries(month);
CREATE INDEX idx_outbound_user_id ON outbound_entries(user_id);
CREATE INDEX idx_outbound_channel ON outbound_entries(channel);
CREATE INDEX idx_outbound_month ON outbound_entries(month);
