-- ONLY for ephemeral container wg-mentoria-postgres-qa-20261019;
-- NEVER apply to the actual Supabase project or production.
create role anon nologin;
create role authenticated nologin;
create table public.saas_tenants (
  id uuid primary key,
  org_id uuid not null
);
insert into public.saas_tenants(id,org_id) values
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
