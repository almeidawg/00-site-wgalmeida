-- Smoke de seguranca NO POSTGRESQL LOCAL SEM REDE, SEM PRODUCAO.
-- Executar com ON_ERROR_STOP=1 e fixture public.saas_tenants isolada.
-- Toda insercao fica na transacao ROLLBACK. Nenhum registro persistido.
begin;

insert into public.saas_tenants(id, org_id) values
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

do $test$
declare
  tenant_a uuid := '11111111-1111-4111-8111-111111111111';
  org_a uuid := '22222222-2222-4222-8222-222222222222';
  tenant_b uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  org_b uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  digest text := repeat('a',64);
  row_id uuid;
  second_id uuid;
  duplicate_id uuid;
  c integer;
begin
  -- 1. Total isolamento de roles sem acesso concedido
  if has_schema_privilege('anon','wg_mentoria_private','USAGE') or
     has_schema_privilege('authenticated','wg_mentoria_private','USAGE') or
     has_table_privilege('anon','wg_mentoria_private.inbound_receipts','SELECT') or
     has_table_privilege('authenticated','wg_mentoria_private.inbound_receipts','INSERT') then
       raise exception 'FAILED_PUBLIC_GRANTS';
  end if;
  raise notice 'PASS 01 grants_publico_negados';

  -- 2. RLS ativado, forçado e funcao de escopo security invoker
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='wg_mentoria_private' and c.relname='inbound_receipts'
      and c.relrowsecurity and c.relforcerowsecurity
  ) or exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='wg_mentoria_private' and p.proname='verify_tenant_org_scope'
    and p.prosecdef
  ) then raise exception 'FAILED_RLS_OR_SECURITY_INVOKER';
  end if;
  raise notice 'PASS 02 rls_force_security_invoker';

  -- 3. Nao permitir PII bruta no contrato da tabela
  if exists (
    select 1 from information_schema.columns
    where table_schema='wg_mentoria_private' and table_name='inbound_receipts'
      and column_name in ('phone','email','name','sender','raw_body','message','payload','message_content','sender_ref')
  ) then raise exception 'FAILED_PII_COLUMN';
  end if;
  raise notice 'PASS 03 sem_colunas_pii';

  -- 4. Reserva atomica por tenant/canal/evento
  insert into wg_mentoria_private.inbound_receipts
    (tenant_id,org_id,channel_id,source_event_digest,retention_expires_at)
    values(tenant_a,org_a,'synthetic_channel_A_001',digest,now()+interval '1 day')
    returning id into row_id;
  if row_id is null then raise exception 'FAILED_FIRST_RESERVATION'; end if;
  insert into wg_mentoria_private.inbound_receipts
    (tenant_id,org_id,channel_id,source_event_digest,retention_expires_at)
    values(tenant_a,org_a,'synthetic_channel_A_001',digest,now()+interval '1 day')
    on conflict (tenant_id,channel_id,source_event_digest) do nothing
    returning id into duplicate_id;
  if duplicate_id is not null then raise exception 'FAILED_DUPLICATE_DEDUP'; end if;
  select count(*) into c from wg_mentoria_private.inbound_receipts
    where tenant_id=tenant_a and channel_id='synthetic_channel_A_001' and source_event_digest=digest;
  if c <> 1 then raise exception 'FAILED_UNIQUE_COUNT'; end if;
  raise notice 'PASS 04 unicidade_receipt_replay';

  -- 5. Mesmo digest de outro tenant preserva segregacao
  insert into wg_mentoria_private.inbound_receipts
    (tenant_id,org_id,channel_id,source_event_digest,retention_expires_at)
    values(tenant_b,org_b,'synthetic_channel_A_001',digest,now()+interval '1 day')
    returning id into second_id;
  if second_id is null or second_id=row_id then raise exception 'FAILED_TENANT_SEPARATION'; end if;
  raise notice 'PASS 05 dois_tenants_isolados';

  -- 6. Tenant valido com org errada rejeitado pelo trigger
  begin
    insert into wg_mentoria_private.inbound_receipts
      (tenant_id,org_id,channel_id,source_event_digest,retention_expires_at)
      values(tenant_a,org_b,'synthetic_channel_B_001',repeat('b',64),now()+interval '1 day');
    raise exception 'FAILED_CROSS_TENANT_ACCEPTED';
  exception when check_violation then
    if sqlerrm not like '%MENTORIA_TENANT_ORG_SCOPE_DENIED%' then raise; end if;
  end;
  raise notice 'PASS 06 org_cruzada_bloqueada';

  -- 7. Referencia desconhecida a tenant nao autoriza gravacao
  begin
    insert into wg_mentoria_private.inbound_receipts
      (tenant_id,org_id,channel_id,source_event_digest,retention_expires_at)
      values('cccccccc-cccc-4ccc-8ccc-cccccccccccc',org_a,'synthetic_channel_A_001',repeat('c',64),now()+interval '1 day');
    raise exception 'FAILED_UNKNOWN_TENANT_ACCEPTED';
  exception when foreign_key_violation or check_violation then null;
  end;
  raise notice 'PASS 07 tenant_inexistente_negado';

  -- 8. Campos de canal, hash e retencao nao podem ser malformados
  begin
    insert into wg_mentoria_private.inbound_receipts
      (tenant_id,org_id,channel_id,source_event_digest,retention_expires_at)
      values(tenant_a,org_a,'x',repeat('x',64),now()-interval '1 day');
    raise exception 'FAILED_INVALID_DATA_ACCEPTED';
  exception when check_violation then null;
  end;
  raise notice 'PASS 08 valores_invalidos_negados';

  -- 9. Confirmacao exige completed_at e review_code nulo
  begin
    update wg_mentoria_private.inbound_receipts
      set state='completed' where id=row_id;
    raise exception 'FAILED_BAD_COMPLETION_ACCEPTED';
  exception when check_violation then null;
  end;
  raise notice 'PASS 09 completude_coerente';

  -- 10. Nao pode reabrir receipt terminal apos confirmacao
  update wg_mentoria_private.inbound_receipts
    set state='completed', completed_at=now() where id=row_id;
  begin
    update wg_mentoria_private.inbound_receipts
      set state='reserved', completed_at=null where id=row_id;
    raise exception 'FAILED_COMPLETED_RECEIPT_REOPENED';
  exception when check_violation then null;
  end;
  raise notice 'PASS 10 transicao_terminal_irreversivel';

  -- 11. Nao permite adulterar escopo e digest depois da reserva
  begin
    update wg_mentoria_private.inbound_receipts
      set source_event_digest=repeat('d',64) where id=row_id;
    raise exception 'FAILED_RECEIPT_IDENTITY_MUTABLE';
  exception when check_violation then null;
  end;
  raise notice 'PASS 11 imutabilidade_identidade';

end $test$;
rollback;

select 'PASS 12 rollback_sem_dados' as teste
where (select count(*) from wg_mentoria_private.inbound_receipts)=0
and (select count(*) from public.saas_tenants)=0;
