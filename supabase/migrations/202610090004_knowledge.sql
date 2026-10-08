-- DKLA-006: verified, staff-scoped knowledge. No material is seeded here.
create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  title text not null check (char_length(title) between 2 and 200),
  source_uri text not null,
  source_revision text not null,
  content_hash text not null,
  content_text text not null,
  language text not null check (language in ('lo','en','mixed')),
  business_line text,
  verification_status text not null default 'DRAFT' check (verification_status in ('DRAFT','VERIFIED','RETIRED')),
  verified_by uuid,
  verified_at timestamptz,
  review_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, source_uri, source_revision),
  foreign key (organization_id, verified_by) references public.staff_memberships(organization_id, id) on delete restrict,
  check (verification_status <> 'VERIFIED' or (verified_by is not null and verified_at is not null and review_due_at is not null))
);
create index knowledge_verified_org on public.knowledge_sources (organization_id, verification_status, review_due_at);
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_sources force row level security;
revoke all on public.knowledge_sources from anon, authenticated;
grant select on public.knowledge_sources to authenticated;

create policy staff_read_current_knowledge on public.knowledge_sources
  for select to authenticated
  using (
    verification_status = 'VERIFIED' and review_due_at > now()
    and exists (
      select 1 from public.staff_memberships m
      where m.organization_id = knowledge_sources.organization_id
        and m.user_id = (select auth.uid()) and m.active
    )
  );

-- ponytail: substring scan is adequate for a small approved source set; add
-- a language-aware search index when the approved corpus is large enough.
create function public.search_verified_knowledge(p_organization_id uuid, p_query text, p_limit integer default 5)
returns table(id uuid, title text, source_uri text, source_revision text, language text, excerpt text)
language sql stable security invoker set search_path = ''
as $$
  select k.id, k.title, k.source_uri, k.source_revision, k.language,
    substring(k.content_text from greatest(1, strpos(lower(k.content_text), lower(p_query)) - 100) for 500)
  from public.knowledge_sources k
  where k.organization_id = p_organization_id
    and char_length(p_query) between 2 and 200
    and strpos(lower(k.content_text), lower(p_query)) > 0
  order by k.verified_at desc, k.id
  limit least(greatest(p_limit, 1), 10);
$$;
revoke all on function public.search_verified_knowledge(uuid,text,integer) from public, anon;
grant execute on function public.search_verified_knowledge(uuid,text,integer) to authenticated;
