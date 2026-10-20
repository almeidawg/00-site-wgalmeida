-- ONLY synthetic database mentoria_qa in isolated Docker container.
-- Do not execute on WGEasy production or on Supabase parent project.
begin;
do $$
declare
  first_id uuid;
  duplicate_id uuid;
  tenant_b_id uuid;
  invalid_blocked boolean;
  count_first integer;
begin
  insert into wg_mentoria_private.inbound_receipts (
    tenant_id, org_id, channel_id, source_event_digest, retention_expires_at
  ) values (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    'synthetic_channel_A_001', repeat('a',64),
    now() + interval '1 day'
  ) returning id into first_id;
  if first_id is null then raise exception 'FIRST_RESERVATION_FAILED'; end if;

  insert into wg_mentoria_private.inbound_receipts (
    tenant_id, org_id, channel_id, source_event_digest, retention_expires_at
  ) values (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    'synthetic_channel_A_001', repeat('a',64),
    now() + interval '1 day'
  ) on conflict (tenant_id, channel_id, source_event_digest) do nothing
    returning id into duplicate_id;
  if duplicate_id is not null then raise exception 'DUPLICATE_ACCEPTED'; end if;

  -- The same digest is allowed for another valid tenant.
  insert into wg_mentoria_private.inbound_receipts (
    tenant_id, org_id, channel_id, source_event_digest, retention_expires_at
  ) values (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'synthetic_channel_A_001', repeat('a',64),
    now() + interval '1 day'
  ) returning id into tenant_b_id;
  if tenant_b_id is null then raise exception 'VALID_SECOND_TENANT_REJECTED'; end if;

  invalid_blocked := false;
  begin
    insert into wg_mentoria_private.inbound_receipts (
      tenant_id, org_id, channel_id, source_event_digest, retention_expires_at
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', -- deliberately wrong org
      'synthetic_channel_A_001', repeat('b',64),
      now() + interval '1 day'
    );
  exception when check_violation then invalid_blocked := true;
  end;
  if not invalid_blocked then raise exception 'CROSS_TENANT_ORG_ALLOWED'; end if;

  invalid_blocked := false;
  begin
    update wg_mentoria_private.inbound_receipts
      set state='completed' where id = first_id;
  exception when check_violation then invalid_blocked := true;
  end;
  if not invalid_blocked then raise exception 'FALSE_COMPLETION_ALLOWED'; end if;

  invalid_blocked := false;
  begin
    update wg_mentoria_private.inbound_receipts
      set state='needs_review' where id = first_id;
  exception when check_violation then invalid_blocked := true;
  end;
  if not invalid_blocked then raise exception 'REVIEW_WITHOUT_CODE_ALLOWED'; end if;

  update wg_mentoria_private.inbound_receipts
    set state='needs_review', review_code='PARTIAL_FAILURE'
    where id = first_id;
  if (select state from wg_mentoria_private.inbound_receipts where id=first_id) <> 'needs_review' then
    raise exception 'REVIEW_STATE_FAILED';
  end if;

  select count(*) into count_first
  from wg_mentoria_private.inbound_receipts
  where tenant_id='11111111-1111-4111-8111-111111111111'
    and source_event_digest=repeat('a',64);
  if count_first <> 1 then raise exception 'NOT_IDEMPOTENT'; end if;
end $$;
commit;

-- A subsequent psql session will verify durability and replay protection.
