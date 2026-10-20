import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import assert from 'node:assert/strict'

const file = join(dirname(fileURLToPath(import.meta.url)), 'PROPOSTA_receipts_staging_v1.sql')
const original = readFileSync(file, 'utf8')
const sql = original.toLowerCase().replace(/--[^\n]*/g, '')
const checks = [
  ['transaction wrapped', () => assert.match(sql, /\bbegin\s*;[\s\S]*\bcommit\s*;/)],
  ['private schema', () => assert.match(sql, /create schema if not exists wg_mentoria_private/)],
  ['private table only', () => {
    const matches = [...sql.matchAll(/\bcreate\s+table\s+if\s+not\s+exists\s+([^\s(]+)/g)].map(x=>x[1])
    assert.deepEqual(matches, ['wg_mentoria_private.inbound_receipts'])
    assert.doesNotMatch(sql, /alter\s+table\s+public\./)
  }],
  ['no public access', () => {
    assert.match(sql, /revoke all on schema wg_mentoria_private from public/)
    assert.match(sql, /revoke all on wg_mentoria_private\.inbound_receipts from anon/)
    assert.match(sql, /revoke all on wg_mentoria_private\.inbound_receipts from authenticated/)
    assert.doesNotMatch(sql, /\bgrant\s+(select|insert|update|delete|all)/)
  }],
  ['rls strict by default', () => {
    assert.match(sql, /alter table wg_mentoria_private\.inbound_receipts enable row level security/)
    assert.match(sql, /alter table wg_mentoria_private\.inbound_receipts force row level security/)
    assert.doesNotMatch(sql, /create\s+policy/)
    assert.doesNotMatch(sql, /security\s+definer/)
  }],
  ['scoped unique receipt key', () => {
    assert.match(sql, /create unique index if not exists uq_mentoria_receipt_tenant_channel_digest/)
    assert.match(sql, /\(tenant_id, channel_id, source_event_digest\)/)
    assert.match(sql, /source_event_digest\s+text\s+not\s+null/)
  }],
  ['tenant & org separate', () => {
    assert.match(sql, /tenant_id\s+uuid\s+not\s+null\s+references\s+public\.saas_tenants\(id\)/)
    assert.match(sql, /org_id\s+uuid\s+not\s+null/)
  }],
  ['tenant-org trigger rejects cross-scope association', () => {
    assert.match(sql, /create or replace function wg_mentoria_private\.verify_tenant_org_scope\(\)/)
    assert.match(sql, /security invoker/)
    assert.match(sql, /t\.id = new\.tenant_id and t\.org_id = new\.org_id/)
    assert.match(sql, /create trigger trg_mentoria_receipt_scope/)
    assert.match(sql, /revoke all on function wg_mentoria_private\.verify_tenant_org_scope\(\) from public/)
  }],
  ['fail-closed states', () => {
    for(const s of ['reserved','completed','needs_review']) assert.ok(sql.includes("'"+s+"'"))
    assert.match(sql, /receipt_complete_when_confirmed/)
  }],
  ['no PII content columns or executable network', () => {
    assert.doesNotMatch(sql, /\b(phone|email|message_body|payload_raw|message_text|sender_phone|sender_name|raw_body)\s+(text|varchar|jsonb|bytea|uuid)/)
    assert.doesNotMatch(sql, /\b(http_post|net\.http_post|pg_read_file|copy\s+.+\s+program|dblink)\b/)
  }],
]
for (const [name, fn] of checks) {
  fn()
  console.log('PASS', name)
}
console.log('STAGING_MIGRATION_STATIC_GATE',checks.length+'/'+checks.length,
  'PASS. IMPORTANT: static-only; SQL execution, RLS integration, durability, cost authorization NOT tested.')
