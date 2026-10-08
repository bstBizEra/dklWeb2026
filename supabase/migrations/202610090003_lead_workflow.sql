-- DKLA-004: accountable lead assignment and guarded status changes.
alter table public.leads
  add column next_action text,
  add column due_at timestamptz,
  add column outcome_evidence text,
  add column status_reason text;

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  request_id uuid not null default gen_random_uuid(),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index audit_entity_time on public.audit_events (organization_id, entity_type, entity_id, occurred_at desc);

create table public.lead_actions (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  idempotency_key text not null,
  request_hash text not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  primary key (organization_id, actor_user_id, idempotency_key)
);

alter table public.audit_events enable row level security;
alter table public.audit_events force row level security;
alter table public.lead_actions enable row level security;
alter table public.lead_actions force row level security;
revoke all on public.audit_events, public.lead_actions from anon, authenticated;
grant select on public.audit_events to authenticated;
create policy staff_read_audit on public.audit_events for select to authenticated
  using (exists (
    select 1 from public.staff_memberships m
    where m.organization_id = audit_events.organization_id
      and m.user_id = (select auth.uid()) and m.active
      and m.role in ('admin', 'sales_manager')
  ));

create function public.apply_lead_change(
  p_lead_id uuid,
  p_expected_version integer,
  p_idempotency_key text,
  p_target_status text,
  p_assignee uuid,
  p_next_action text,
  p_due_at timestamptz,
  p_reason text,
  p_evidence text
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  actor public.staff_memberships%rowtype;
  lead_row public.leads%rowtype;
  previous public.lead_actions%rowtype;
  fingerprint text;
  result jsonb;
  next_status text;
  next_assignee uuid;
  v_next_action text;
  next_due timestamptz;
begin
  if (select auth.uid()) is null or length(p_idempotency_key) not between 8 and 128 then
    return jsonb_build_object('kind', 'denied');
  end if;
  select * into lead_row from public.leads where id = p_lead_id;
  if not found then return jsonb_build_object('kind', 'not_found'); end if;
  select * into actor from public.staff_memberships
    where organization_id = lead_row.organization_id and user_id = (select auth.uid()) and active;
  if not found or not (
    actor.role in ('admin', 'sales_manager')
    or (actor.role = 'sales' and lead_row.assigned_to = actor.id)
  ) then return jsonb_build_object('kind', 'not_found'); end if;

  fingerprint := md5(jsonb_build_object(
    'lead', p_lead_id, 'version', p_expected_version, 'status', p_target_status,
    'assignee', p_assignee, 'next_action', p_next_action, 'due', p_due_at,
    'reason', p_reason, 'evidence', p_evidence
  )::text);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor.user_id::text || p_idempotency_key, 0));
  select * into previous from public.lead_actions
    where organization_id = lead_row.organization_id and actor_user_id = actor.user_id
      and idempotency_key = p_idempotency_key;
  if found then
    if previous.request_hash = fingerprint then return previous.response; end if;
    return jsonb_build_object('kind', 'conflict');
  end if;

  select * into lead_row from public.leads where id = p_lead_id for update;
  if lead_row.version <> p_expected_version then return jsonb_build_object('kind', 'stale'); end if;
  if p_assignee is not null and p_assignee <> coalesce(lead_row.assigned_to, '00000000-0000-0000-0000-000000000000'::uuid) then
    if actor.role not in ('admin', 'sales_manager') or not exists (
      select 1 from public.staff_memberships m
      where m.id = p_assignee and m.organization_id = lead_row.organization_id
        and m.active and m.role in ('sales', 'sales_manager')
    ) then return jsonb_build_object('kind', 'denied'); end if;
  end if;
  next_status := coalesce(p_target_status, lead_row.status);
  next_assignee := coalesce(p_assignee, lead_row.assigned_to);
  v_next_action := coalesce(nullif(btrim(p_next_action), ''), lead_row.next_action);
  next_due := coalesce(p_due_at, lead_row.due_at);
  if next_status <> lead_row.status and not (
    (lead_row.status = 'NEW' and next_status = 'CONTACTED') or
    (lead_row.status = 'CONTACTED' and next_status in ('QUALIFYING','LOST')) or
    (lead_row.status = 'QUALIFYING' and next_status in ('QUOTATION_PREPARING','LOST')) or
    (lead_row.status = 'QUOTATION_SENT' and next_status = 'FOLLOW_UP') or
    (lead_row.status = 'FOLLOW_UP' and next_status in ('WON','LOST')) or
    (lead_row.status in ('WON','LOST') and next_status = 'CLOSED')
  ) then return jsonb_build_object('kind', 'invalid_transition'); end if;
  if next_status <> 'NEW' and next_status <> 'CLOSED' and (
    next_assignee is null or v_next_action is null or next_due is null
  ) then return jsonb_build_object('kind', 'missing_follow_up'); end if;
  if next_status = 'LOST' and coalesce(nullif(btrim(p_reason), ''), lead_row.status_reason) is null then
    return jsonb_build_object('kind', 'missing_reason');
  end if;
  if next_status = 'WON' and coalesce(nullif(btrim(p_evidence), ''), lead_row.outcome_evidence) is null then
    return jsonb_build_object('kind', 'missing_evidence');
  end if;

  update public.leads set
    status = next_status, assigned_to = next_assignee, next_action = v_next_action,
    due_at = next_due, status_reason = coalesce(nullif(btrim(p_reason), ''), status_reason),
    outcome_evidence = coalesce(nullif(btrim(p_evidence), ''), outcome_evidence),
    version = version + 1, updated_at = now()
    where id = lead_row.id
    returning * into lead_row;
  insert into public.audit_events(organization_id, actor_user_id, action, entity_type, entity_id, metadata)
    values (lead_row.organization_id, actor.user_id, 'lead.change', 'lead', lead_row.id,
      jsonb_build_object('status', lead_row.status, 'version', lead_row.version));
  result := jsonb_build_object('kind', 'updated', 'id', lead_row.id, 'version', lead_row.version, 'status', lead_row.status);
  insert into public.lead_actions(organization_id, actor_user_id, idempotency_key, request_hash, response)
    values (lead_row.organization_id, actor.user_id, p_idempotency_key, fingerprint, result);
  return result;
end;
$$;

revoke all on function public.apply_lead_change(uuid,integer,text,text,uuid,text,timestamptz,text,text) from public, anon;
grant execute on function public.apply_lead_change(uuid,integer,text,text,uuid,text,timestamptz,text,text) to authenticated;
