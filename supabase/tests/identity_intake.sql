-- Run only in an isolated database after the migrations. The test harness
-- supplies auth.uid() from request.jwt.claim.sub and test-only Auth users.
begin;
grant usage on schema auth to authenticated;
insert into auth.users(id) values
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002');
insert into public.organizations(id,name,slug) values
  ('00000000-0000-0000-0000-000000000001','Test A','test-a'),
  ('00000000-0000-0000-0000-000000000002','Test B','test-b');
insert into public.staff_memberships(id,organization_id,user_id,role,active) values
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','sales',true),
  ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','admin',true);
insert into public.leads(id,organization_id,reference,lead_type,company_name,contact_person,phone,category,request_text,source_page,assigned_to,public_submission_key,request_hash) values
  ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','DKL-A','QUOTE_REQUEST','Company A','Person A','123456','Rental','Warehouse forklift','/','20000000-0000-0000-0000-000000000001','test-key-a','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
  ('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','DKL-B','QUOTE_REQUEST','Company B','Person B','654321','Service','Equipment service','/','20000000-0000-0000-0000-000000000002','test-key-b','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
insert into public.knowledge_sources(organization_id,title,source_uri,source_revision,content_hash,content_text,language,verification_status,verified_by,verified_at,review_due_at) values
  ('00000000-0000-0000-0000-000000000001','Approved A','doc:a','v1','hash-a','Approved forklift rental guidance','en','VERIFIED','20000000-0000-0000-0000-000000000001',now(),now()+interval '1 day'),
  ('00000000-0000-0000-0000-000000000001','Draft A','doc:b','v1','hash-b','Draft forklift price guarantee','en','DRAFT',null,null,null),
  ('00000000-0000-0000-0000-000000000002','Approved B','doc:c','v1','hash-c','Other organization forklift guidance','en','VERIFIED','20000000-0000-0000-0000-000000000002',now(),now()+interval '1 day');

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
do $$ begin
  if (select count(*) from public.staff_memberships) <> 1 then raise exception 'membership isolation failed'; end if;
  if (select count(*) from public.leads) <> 1 then raise exception 'lead isolation failed'; end if;
  if exists(select 1 from public.leads where reference='DKL-B') then raise exception 'cross-org lead visible'; end if;
  if (select count(*) from public.knowledge_sources) <> 1 then raise exception 'knowledge isolation failed'; end if;
  if (select count(*) from public.search_verified_knowledge('00000000-0000-0000-0000-000000000001','forklift',5)) <> 1 then raise exception 'knowledge search failed'; end if;
end $$;
do $$
declare due_time timestamptz := now() + interval '1 day'; first_result jsonb; retry_result jsonb;
begin
  first_result := public.apply_lead_change(
    '30000000-0000-0000-0000-000000000001',1,'action-key-123','CONTACTED',null,
    'Call the customer',due_time,null,null);
  retry_result := public.apply_lead_change(
    '30000000-0000-0000-0000-000000000001',1,'action-key-123','CONTACTED',null,
    'Call the customer',due_time,null,null);
  if first_result->>'kind' <> 'updated' or first_result <> retry_result then raise exception 'lead retry failed'; end if;
  if (public.apply_lead_change('30000000-0000-0000-0000-000000000001',1,'action-key-456','WON',null,null,null,null,null)->>'kind') <> 'stale' then
    raise exception 'stale lead update accepted';
  end if;
  if (public.apply_lead_change('30000000-0000-0000-0000-000000000002',1,'action-key-789','CONTACTED',null,'Call',due_time,null,null)->>'kind') <> 'not_found' then
    raise exception 'cross-org lead action allowed';
  end if;
end $$;
reset role;

set local role service_role;
do $$
declare first_result jsonb; second_result jsonb; conflict_result jsonb;
begin
  first_result := public.submit_public_quote('00000000-0000-0000-0000-000000000001','test-retry-123',repeat('c',64),repeat('d',64),'{"lead_type":"QUOTE_REQUEST","company_name":"Company A","contact_person":"Person A","phone":"123456","category":"Rental","message":"Warehouse forklift","source_page":"/"}'::jsonb);
  second_result := public.submit_public_quote('00000000-0000-0000-0000-000000000001','test-retry-123',repeat('c',64),repeat('d',64),'{"lead_type":"QUOTE_REQUEST","company_name":"Company A","contact_person":"Person A","phone":"123456","category":"Rental","message":"Warehouse forklift","source_page":"/"}'::jsonb);
  conflict_result := public.submit_public_quote('00000000-0000-0000-0000-000000000001','test-retry-123',repeat('e',64),repeat('d',64),'{"lead_type":"QUOTE_REQUEST","company_name":"Company A","contact_person":"Person A","phone":"123456","category":"Rental","message":"Warehouse forklift","source_page":"/"}'::jsonb);
  if first_result->>'kind' <> 'accepted' or first_result->>'lead_id' <> second_result->>'lead_id' or conflict_result->>'kind' <> 'conflict' then
    raise exception 'idempotency failed';
  end if;
end $$;
do $$
declare result jsonb; i integer;
begin
  for i in 1..11 loop
    result := public.submit_public_quote(
      '00000000-0000-0000-0000-000000000001','burst-key-' || i::text,
      repeat('a',64),repeat('f',64),
      '{"lead_type":"QUOTE_REQUEST","company_name":"Company A","contact_person":"Person A","phone":"123456","category":"Rental","message":"Warehouse forklift","source_page":"/"}'::jsonb);
    if (i <= 10 and result->>'kind' <> 'accepted') or (i = 11 and result->>'kind' <> 'rate_limited') then
      raise exception 'public intake rate limit failed at request %', i;
    end if;
  end loop;
end $$;
reset role;
rollback;
