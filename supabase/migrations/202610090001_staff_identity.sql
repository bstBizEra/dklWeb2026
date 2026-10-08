-- DKLA-002: staff identity. Seed organizations and memberships through an
-- audited administrator process after Auth users exist; no account is created
-- by this migration.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique,
  default_language text not null default 'lo' check (default_language in ('lo', 'en')),
  created_at timestamptz not null default now()
);

create table public.staff_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  role text not null check (role in ('admin', 'sales_manager', 'sales', 'operations', 'support')),
  can_approve_quotes boolean not null default false,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (organization_id, id)
);

create index staff_memberships_user_active on public.staff_memberships (user_id, organization_id) where active;

alter table public.organizations enable row level security;
alter table public.organizations force row level security;
alter table public.staff_memberships enable row level security;
alter table public.staff_memberships force row level security;

revoke all on public.organizations, public.staff_memberships from anon, authenticated;
grant select on public.staff_memberships to authenticated;

create policy staff_read_own_membership on public.staff_memberships
  for select to authenticated
  using (active and user_id = (select auth.uid()));

-- Organization and membership changes use a separate audited admin process.
-- A signed-in user cannot assign themselves a role or approval authority.
