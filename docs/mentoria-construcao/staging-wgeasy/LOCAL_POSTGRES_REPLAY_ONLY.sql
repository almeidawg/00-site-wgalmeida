-- Second PostgreSQL connection, same isolated ephemeral DB; synthetic only.
do $$
declare n integer; inserted_id uuid;
begin
  insert into wg_mentoria_private.inbound_receipts(
    tenant_id, org_id, channel_id, source_event_digest, retention_expires_at
  ) values (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    'synthetic_channel_A_001', repeat('a',64), now()+interval '1 day'
  )
  on conflict (tenant_id, channel_id, source_event_digest) do nothing
  returning id into inserted_id;
  if inserted_id is not null then raise exception 'REPLAY_WRITTEN'; end if;
  select count(*) into n from wg_mentoria_private.inbound_receipts;
  if n <> 2 then raise exception 'UNEXPECTED_COUNT_%', n; end if;
end $$;
