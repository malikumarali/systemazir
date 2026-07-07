-- ============================================================
-- Agency OS — Complete Supabase Database Schema (PostgreSQL)
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Drop existing tables if they exist (to ensure a clean slate)
DROP TABLE IF EXISTS outbound_entries CASCADE;
DROP TABLE IF EXISTS inbound_entries CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'team_member' CHECK (role IN ('founder', 'team_member')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function to automatically create a profile row on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'team_member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Settings Table
CREATE TABLE settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 280,
  currency_display TEXT NOT NULL DEFAULT 'Both' CHECK (currency_display IN ('USD', 'PKR', 'Both')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leads Table
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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

-- 5. Inbound Entries Table (Meta / Google Ads Funnels)
CREATE TABLE inbound_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('Meta Ads', 'Google Ads')),
  month TEXT NOT NULL, -- YYYY-MM
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
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 280,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Outbound Entries Table (Cold Call / Email / DM)
CREATE TABLE outbound_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('Cold Call', 'Cold Email', 'Cold Social DM')),
  month TEXT NOT NULL, -- YYYY-MM
  tier TEXT NOT NULL CHECK (tier IN ('S', 'M', 'L')),
  outbound INTEGER NOT NULL,
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
  listing DECIMAL(10,2) DEFAULT 0,
  sdr DECIMAL(10,2) DEFAULT 0,
  closer DECIMAL(10,2) DEFAULT 0,
  tools DECIMAL(10,2) DEFAULT 0,
  other_cost DECIMAL(10,2) DEFAULT 0,
  training DECIMAL(10,2) DEFAULT 0,
  total_est_cost DECIMAL(12,2),
  gross_pl DECIMAL(12,2),
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 280,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_entries ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies

-- Profiles Policies
CREATE POLICY "Allow view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Settings Policies (Founders only)
CREATE POLICY "Allow founders to manage settings" ON public.settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );

-- Leads Policies (Founders see all; Team members see only their own)
CREATE POLICY "Allow select leads" ON public.leads
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'))
    OR (auth.uid() = user_id)
  );

CREATE POLICY "Allow insert leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update leads" ON public.leads
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );

CREATE POLICY "Allow delete leads" ON public.leads
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );

-- Inbound entries Policies (Founders see all; Team members see only their own)
CREATE POLICY "Allow select inbound" ON public.inbound_entries
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'))
    OR (auth.uid() = user_id)
  );

CREATE POLICY "Allow insert inbound" ON public.inbound_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update inbound" ON public.inbound_entries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );

CREATE POLICY "Allow delete inbound" ON public.inbound_entries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );

-- Outbound entries Policies (Founders see all; Team members see only their own)
CREATE POLICY "Allow select outbound" ON public.outbound_entries
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'))
    OR (auth.uid() = user_id)
  );

CREATE POLICY "Allow insert outbound" ON public.outbound_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update outbound" ON public.outbound_entries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );

CREATE POLICY "Allow delete outbound" ON public.outbound_entries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_source ON public.leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_niche ON public.leads(niche);
CREATE INDEX IF NOT EXISTS idx_leads_deal_status ON public.leads(deal_status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_date ON public.leads(lead_date);
CREATE INDEX IF NOT EXISTS idx_inbound_user_id ON public.inbound_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_inbound_channel ON public.inbound_entries(channel);
CREATE INDEX IF NOT EXISTS idx_inbound_month ON public.inbound_entries(month);
CREATE INDEX IF NOT EXISTS idx_outbound_user_id ON public.outbound_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_outbound_channel ON public.outbound_entries(channel);
CREATE INDEX IF NOT EXISTS idx_outbound_month ON public.outbound_entries(month);
