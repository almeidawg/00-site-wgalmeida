// Executa contra SOMENTE o container efemero, sem rede/portas nem dados reais.
// Exige que o setup e a migracao PROPOSTA tenham sido aplicados previamente.
// IDs exclusivamente ficticios. Remove todos os registros no finally.
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import assert from 'node:assert/strict'
const run = promisify(execFile)
const CONTAINER = 'wg-mentoria-pg-qa-20261020'
const TENANT = '11111111-1111-4111-8111-111111111111'
const ORG = '22222222-2222-4222-8222-222222222222'
const CHANNEL = 'synthetic_concurrent_channel'
const HASH = 'd'.repeat(64)
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
const sql = async (query) => {
  const { stdout } = await run('docker', [
    'exec', CONTAINER, 'psql', '-U', 'postgres', '-d', 'mentoria_qa',
    '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-c', query,
  ], { timeout: 18000, windowsHide: true, maxBuffer: 1024 * 1024 })
  return stdout.trim()
}
let checks = 0
try {
  const network = await run('docker', [
    'inspect', CONTAINER, '--format',
    '{{.HostConfig.NetworkMode}}|{{json .HostConfig.PortBindings}}',
  ], { timeout: 15000, windowsHide: true })
  assert.equal(network.stdout.trim(), 'none|{}')
  checks++
  await sql(`insert into public.saas_tenants(id,org_id) values ('${TENANT}','${ORG}') on conflict do nothing`)
  const insert = `insert into wg_mentoria_private.inbound_receipts(tenant_id,org_id,channel_id,source_event_digest,retention_expires_at) values('${TENANT}','${ORG}','${CHANNEL}','${HASH}',now()+interval '1 day') on conflict(tenant_id,channel_id,source_event_digest) do nothing returning id`
  const result = await Promise.all([sql(insert), sql(insert)])
  assert.equal(result.filter(Boolean).length, 1, 'Unique index allowed two winners')
  assert.ok(result.find(Boolean).split(/\r?\n/).some(line => uuid.test(line.trim())), 'Expected one synthetic UUID in SQL output: '+JSON.stringify(result.map(v=>({length:v.length,firstLine:v.split(/\r?\n/)[0]?.slice(0,75)}))))
  assert.equal(await sql(`select count(*) from wg_mentoria_private.inbound_receipts where tenant_id='${TENANT}' and channel_id='${CHANNEL}' and source_event_digest='${HASH}'`), '1')
  checks++

  for (const role of ['anon', 'authenticated']) {
    await assert.rejects(async () => sql(`set role ${role};select count(*) from wg_mentoria_private.inbound_receipts`), (err) => /permission denied/i.test(String(err.stderr)))
    checks++
  }
  // No raw data IDs or credentials are logged.
  console.log('POSTGRES_17_CONCURRENT_STAGING_PASS', JSON.stringify({ checks, duplicatePrevented: true, publicDenied: true, network: 'none', externalWrites: 0 }))
} finally {
  await sql(`delete from wg_mentoria_private.inbound_receipts where tenant_id='${TENANT}' and channel_id='${CHANNEL}' and source_event_digest='${HASH}'`)
  await sql(`delete from public.saas_tenants where id='${TENANT}'`)
  assert.equal(await sql('select count(*) from wg_mentoria_private.inbound_receipts'), '0', 'Receipts remain after cleanup')
  assert.equal(await sql('select count(*) from public.saas_tenants'), '0', 'Tenant fixtures remain after cleanup')
  console.log('LOCAL_FIXTURE_CLEANUP_PASS', JSON.stringify({ rowsRemaining: 0 }))
}
