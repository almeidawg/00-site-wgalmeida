-- PROPOSTA PARA STAGING ISOLADO, NAO APLICAR AO MAIN/PRODUCAO.
-- A branch deve ter seu proprio project_ref verificado e nenhuma PII copiada.
-- Nao criar policies anon/authenticated, nem expor o schema na Data API.
-- Antes de aplicar, migracao e rollback exigem revisao do backend WGEasy.
-- Este arquivo nao ativa CRM, webhook, provider, formulario ou pagamentos.

begin;

create schema if not exists wg_mentoria_private;
revoke all on schema wg_mentoria_private from public;
revoke all on schema wg_mentoria_private from anon;
revoke all on schema wg_mentoria_private from authenticated;

create table if not exists wg_mentoria_private.inbound_receipts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.saas_tenants(id) on delete restrict,
  org_id uuid not null,
  channel_id text not null check (
    length(channel_id) between 8 and 128 and channel_id ~ '^[A-Za-z0-9:_-]+$'
  ),
  provider text not null default 'whatsapp' check (provider = 'whatsapp'),
  source_event_digest text not null check (
    length(source_event_digest) = 64 and source_event_digest ~ '^[a-f0-9]{64}$'
  ),
  state text not null default 'reserved' check (
    state in ('reserved', 'completed', 'needs_review')
  ),
  review_code text check (
    review_code in ('PARTIAL_FAILURE','TENANT_SCOPE_MISMATCH','INTEGRITY_REVIEW','MANUAL_RECONCILIATION')
  ),
  received_at timestamptz not null default now(),
  completed_at timestamptz,
  retention_expires_at timestamptz not null,
  constraint receipt_complete_when_confirmed check (
    (state = 'completed' and completed_at is not null and review_code is null) or
    (state = 'reserved' and completed_at is null and review_code is null) or
    (state = 'needs_review' and completed_at is null and review_code is not null)
  ),
  constraint retention_after_receipt check (retention_expires_at > received_at)
);
create unique index if not exists uq_mentoria_receipt_tenant_channel_digest
  on wg_mentoria_private.inbound_receipts (tenant_id, channel_id, source_event_digest);
create index if not exists idx_mentoria_receipt_state_expiry
  on wg_mentoria_private.inbound_receipts (state, retention_expires_at);

-- Defense-in-depth: even a privileged writer cannot pair a valid tenant
-- with an unrelated org. SECURITY INVOKER requires the caller to be able to
-- read the canonical tenant table; do not change this to SECURITY DEFINER.
create or replace function wg_mentoria_private.verify_tenant_org_scope()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public, wg_mentoria_private
as $$
begin
  if not exists (
    select 1 from public.saas_tenants as t
    where t.id = new.tenant_id and t.org_id = new.org_id
  ) then
    raise exception 'MENTORIA_TENANT_ORG_SCOPE_DENIED'
      using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function wg_mentoria_private.verify_tenant_org_scope() from public;
revoke all on function wg_mentoria_private.verify_tenant_org_scope() from anon;
revoke all on function wg_mentoria_private.verify_tenant_org_scope() from authenticated;

create trigger trg_mentoria_receipt_scope
  before insert or update of tenant_id, org_id
  on wg_mentoria_private.inbound_receipts
  for each row execute function wg_mentoria_private.verify_tenant_org_scope();

alter table wg_mentoria_private.inbound_receipts enable row level security;
alter table wg_mentoria_private.inbound_receipts force row level security;
revoke all on wg_mentoria_private.inbound_receipts from public;
revoke all on wg_mentoria_private.inbound_receipts from anon;
revoke all on wg_mentoria_private.inbound_receipts from authenticated;

comment on table wg_mentoria_private.inbound_receipts is
  'STAGING CANDIDATE only: scoped hashed WhatsApp receipts, no raw sender/name/phone/content; never public.';
comment on column wg_mentoria_private.inbound_receipts.source_event_digest is
  'SHA256 of verified scoped channel+provider message ID, never raw provider identifier.';

-- No direct SQL service grant here. The authorized backend role, tenant-org
-- verification and transaction contract must be designed/reviewed separately.
-- Unique reservation invariant for its authenticated private transaction:
-- INSERT ... ON CONFLICT (tenant_id, channel_id, source_event_digest)
-- DO NOTHING RETURNING id;
-- 0 returned rows means duplicate/processing; it does NOT authorize retrying
-- CRM writes. Resolve existing receipt state separately, in the SAME scope.
-- The WGEasy backend must independently verify tenant_id -> org_id in
-- saas_tenants, and a person org_id before recording CRM interactions.
-- This receipt table alone does not enforce the latter cross-table invariant.

commit;
