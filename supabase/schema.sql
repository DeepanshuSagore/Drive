-- DriveFlow for HSR Motors - Supabase schema

create table if not exists public.leads (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  vehicle_interest text not null,
  vehicle_category text not null,
  budget integer not null,
  status text not null,
  source_platform text not null,
  assigned_to text not null,
  assigned_initials text not null,
  assigned_color text not null,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  score integer not null,
  priority_band text not null,
  next_action text not null,
  follow_up_at timestamptz,
  trade_in boolean not null default false,
  financing boolean not null default false,
  notes jsonb not null default '[]'::jsonb,
  updated_by text not null default 'System'
);

create table if not exists public.lead_activities (
  id text primary key,
  lead_id text not null references public.leads(id) on delete cascade,
  type text not null,
  description text not null,
  lead_name text not null,
  "user" text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_followups (
  lead_id text primary key references public.leads(id) on delete cascade,
  follow_up_at timestamptz not null,
  next_action text not null,
  created_by text not null,
  updated_at timestamptz not null default now()
);

alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.lead_activities;
alter publication supabase_realtime add table public.lead_followups;
