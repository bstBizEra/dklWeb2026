-- DKLA-003: durable, retry-safe public intake. Service role may execute only
-- through the application server; browser clients have no insert grant.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  reference text not null,
  lead_type text not null,
  company_name text not null check (char_length(company_name) between 2 and 120),
  contact_person text not null check (char_length(contact_person) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 40),
  email text,
  category text not null check (char_length(category) between 2 and 120),
  request_text text not null check (char_length(request_text) between 10 and 1200),
  source_page text not null check (char_length(source_page) between 1 and 200),
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','QUALIFYING','QUOTATION_PREPARING','QUOTATION_SENT','FOLLOW_UP','WON','LOST','CLOSED')),
  assigned_to uuid,
  public_submission_key text not null,
  request_hash text not null,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  unique (organization_id, id),
  unique (organization_id, reference),
  unique (organization_id, public_submission_key),
  foreign key (organization_id, assigned_to) references public.staff_memberships(organization_id, id) on delete restrict
);

create index leads_org_status_received on public.leads (organization_id, status, received_at desc, id);
create index leads_org_assignee on public.leads (organization_id, assigned_to, status);

create table public.public_intake_limits (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_hash text not null,
  bucket timestamptz not null,
  attempts integer not null default 0,
  primary key (organization_id, client_hash, bucket)
);

alter table public.leads enable row level security;
alter table public.leads force row level security;
alter table public.public_intake_limits enable row level security;
alter table public.public_intake_limits force row level security;
revoke all on public.leads, public.public_intake_limits from anon, authenticated;
grant select on public.leads to authenticated;

create policy staff_read_scoped_leads on public.leads
  for select to authenticated
  using (exists (
    select 1 from public.staff_memberships m
    where m.organization_id = leads.organization_id
      and m.user_id = (select auth.uid())
      and m.active
      and (m.role in ('admin', 'sales_manager') or (m.role = 'sales' and m.id = leads.assigned_to))
  ));

create function public.submit_public_quote(
  p_organization_id uuid,
  p_submission_key text,
  p_request_hash text,
  p_client_hash text,
  p_payload jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  existing public.leads%rowtype;
  new_id uuid := gen_random_uuid();
  attempts integer;
begin
  if length(p_submission_key) not between 8 and 128
    or p_request_hash !~ '^[a-f0-9]{64}$'
    or p_client_hash !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(p_payload) <> 'object'
    or not exists (select 1 from public.organizations where id = p_organization_id) then
    raise exception 'invalid intake arguments' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || p_submission_key, 0));
  select * into existing from public.leads
    where organization_id = p_organization_id and public_submission_key = p_submission_key;
  if found then
    if existing.request_hash = p_request_hash then
      return jsonb_build_object('kind', 'accepted', 'lead_id', existing.reference);
    end if;
    return jsonb_build_object('kind', 'conflict');
  end if;

  -- ponytail: fixed 10/minute per trusted ingress IP; move to a managed abuse
  -- service when multi-edge attack volume or legitimate shared-IP traffic grows.
  insert into public.public_intake_limits (organization_id, client_hash, bucket, attempts)
    values (p_organization_id, p_client_hash, date_trunc('minute', now()), 1)
    on conflict (organization_id, client_hash, bucket)
    do update set attempts = public.public_intake_limits.attempts + 1
    returning public.public_intake_limits.attempts into attempts;
  if attempts > 10 then return jsonb_build_object('kind', 'rate_limited'); end if;

  insert into public.leads (
    id, organization_id, reference, lead_type, company_name, contact_person,
    phone, email, category, request_text, source_page, public_submission_key, request_hash
  ) values (
    new_id, p_organization_id, 'DKL-' || new_id::text,
    p_payload->>'lead_type', p_payload->>'company_name', p_payload->>'contact_person',
    p_payload->>'phone', nullif(p_payload->>'email', ''), p_payload->>'category',
    p_payload->>'message', p_payload->>'source_page', p_submission_key, p_request_hash
  );
  return jsonb_build_object('kind', 'accepted', 'lead_id', 'DKL-' || new_id::text);
end;
$$;

revoke all on function public.submit_public_quote(uuid, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.submit_public_quote(uuid, text, text, text, jsonb) to service_role;
