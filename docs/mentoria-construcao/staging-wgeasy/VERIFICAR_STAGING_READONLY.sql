-- SELECT-ONLY GATE. Execute on confirmed isolated Supabase branch AFTER
-- a reviewed migration, never on project xkvuhixxpfonfcwrvknm (main).
select
  current_database() as database_name,
  n.nspname as schema_name,
  c.relname as receipt_table,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  not has_schema_privilege('anon', n.oid, 'USAGE') as anon_schema_denied,
  not has_schema_privilege('authenticated', n.oid, 'USAGE') as authenticated_schema_denied,
  not has_table_privilege('anon', c.oid, 'SELECT, INSERT, UPDATE, DELETE') as anon_table_denied,
  not has_table_privilege('authenticated', c.oid, 'SELECT, INSERT, UPDATE, DELETE') as authenticated_table_denied,
  exists (
    select 1 from pg_index i
    join pg_class idx on idx.oid = i.indexrelid
    where i.indrelid = c.oid and i.indisunique
    and idx.relname = 'uq_mentoria_receipt_tenant_channel_digest'
  ) as scoped_unique_index_exists,
  not exists (
    select 1 from pg_policy p where p.polrelid = c.oid
  ) as no_public_policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'wg_mentoria_private'
  and c.relname = 'inbound_receipts'
  and c.relkind = 'r';

-- Expected one row with all boolean checks true; empty result means
-- migration did NOT apply. This query does not prove service-role RBAC,
-- tenant-org identity, concurrent writes, expiry cleanup or a real provider.
