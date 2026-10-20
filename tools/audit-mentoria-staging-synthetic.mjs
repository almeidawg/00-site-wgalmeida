/**
 * Deterministic, OFFLINE staging rehearsal. No provider, database, network,
 * browser payload or real-person data. The upstream flag is simulated and
 * intentionally does NOT prove that a WhatsApp message was ever delivered.
 */
import { createHmac } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'
import { ingestMentoriaWhatsAppReceipt } from '../api/_mentoriaInboundAdapter.js'
import { createMentoriaSyntheticCrmPorts } from '../api/_mentoriaSyntheticCrmPorts.js'

const at = '2026-10-19T19:00:00Z'
const now = Date.parse(at)
const TEST_SECRET = Buffer.alloc(40, 0x55).toString('hex') // ONLY synthetic local test material
const tenantA = Object.freeze({ tenantSlug: 'wg-almeida', tenantId: '11111111-1111-4111-8111-111111111111', orgId: '22222222-2222-4222-8222-222222222222', channelId: 'synthetic_channel_A_001' })
const tenantB = Object.freeze({ tenantSlug: 'wg-almeida', tenantId: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaaa', orgId: 'bbbbb001-bbbb-4bbb-8bbb-bbbbbbbbbbbb', channelId: 'synthetic_channel_B_001' })
const envelope = (tenant, msg) => ({
  schemaVersion: 1, audience: 'wg-mentoria-inbound-v1',
  event: 'message.received', direction: 'inbound', providerVerified: true,
  channelId: tenant.channelId, providerMessageId: msg,
  senderRef: 'sender_synthetic_001', correlationRef: 'correlation_synthetic_001',
  occurredAt: at, signedAt: at,
})
const sign = (input, tamper = false) => {
  const rawBody = Buffer.from(JSON.stringify(input), 'utf8')
  const signature = 'sha256=' + createHmac('sha256', TEST_SECRET).update(tamper ? Buffer.from('invalid') : rawBody).digest('hex')
  return { rawBody, signature }
}
const ingest = (tenantConfig, simulation, payload, tamper = false) =>
  ingestMentoriaWhatsAppReceipt({ ...sign(payload, tamper), secret: TEST_SECRET, tenantConfig, ports: simulation.ports, now })
const forbidden = (code, value) => {
  assert.equal(String(value).includes(code), true, 'Expected fixed code ' + code)
}

/**
 * Returns ONLY aggregate counters and code-based results. All memory gets
 * discarded in finally; no records or tokens written to persistent storage.
 */
export async function runSyntheticMentoriaCrmRehearsal() {
  const simA = createMentoriaSyntheticCrmPorts({ tenantConfig: tenantA, testOnly: true })
  const simB = createMentoriaSyntheticCrmPorts({ tenantConfig: tenantB, testOnly: true })
  let steps = 0
  try {
    const initial = await ingest(tenantA, simA, envelope(tenantA, 'synthetic_message_0001'))
    assert.equal(initial.state, 'recorded')
    assert.equal(initial.event.eventType, 'conversation_received')
    assert.equal(initial.event.confirmedBusinessEvent, true)
    assert.equal(simA.snapshot().interactions, 1)
    steps++

    const replay = await ingest(tenantA, simA, envelope(tenantA, 'synthetic_message_0001'))
    assert.equal(replay.state, 'duplicate')
    assert.equal(simA.snapshot().interactions, 1)
    steps++

    const concurrent = await Promise.all([ingest(tenantA, simA, envelope(tenantA, 'synthetic_message_0002')), ingest(tenantA, simA, envelope(tenantA, 'synthetic_message_0002'))])
    assert.deepEqual(concurrent.map(x => x.state).sort(), ['pending_review', 'recorded'])
    assert.equal(simA.snapshot().interactions, 2)
    steps++

    const fromTenantB = await ingest(tenantB, simB, envelope(tenantB, 'synthetic_message_0001'))
    assert.equal(fromTenantB.state, 'recorded')
    assert.equal(simA.snapshot().contacts, 1)
    assert.equal(simB.snapshot().contacts, 1)
    steps++

    try {
      await ingest(tenantA, simA, envelope(tenantA, 'synthetic_message_bad'), true)
      assert.fail('Invalid HMAC accepted')
    } catch (error) { forbidden('MENTORIA_BRIDGE_SIGNATURE_INVALID', error) }
    assert.equal(simA.snapshot().interactions, 2)
    steps++

    try {
      await ingest(tenantB, simA, envelope(tenantB, 'synthetic_message_wrong_tenant'))
      assert.fail('Tenant isolation failed')
    } catch (error) { forbidden('MENTORIA_SYNTHETIC_CROSS_TENANT_DENIED', error) }
    assert.equal(simA.snapshot().contacts, 1)
    steps++

    simA.failNext('recordInteraction')
    try {
      await ingest(tenantA, simA, envelope(tenantA, 'synthetic_message_failure_001'))
      assert.fail('Injected write failure not reported')
    } catch (error) { forbidden('MENTORIA_SYNTHETIC_INJECTED_FAILURE', error) }
    assert.equal(simA.snapshot().receiptStates.needs_review, 1)
    assert.equal((await ingest(tenantA, simA, envelope(tenantA, 'synthetic_message_failure_001'))).state, 'pending_review')
    assert.equal(simA.snapshot().interactions, 2)
    steps++

    const stats = { a: simA.snapshot(), b: simB.snapshot() }
    assert.equal(stats.a.externalWrites + stats.b.externalWrites, 0)
    assert.equal(stats.a.sentMessages + stats.b.sentMessages, 0)
    steps++
    // Never serialize the receipts, pseudonymous sender or HMAC material.
    return Object.freeze({ mode: 'synthetic-offline-no-persistence', status: 'PASS', checks: steps,
      a: { receipts: stats.a.receipts, contacts: stats.a.contacts, interactions: stats.a.interactions, needsReview: stats.a.receiptStates.needs_review || 0 },
      b: { receipts: stats.b.receipts, contacts: stats.b.contacts, interactions: stats.b.interactions },
      externalWrites: 0, messagesSent: 0, sourceVerifiedByRealProvider: false })
  } finally {
    const a = simA.discard(), b = simB.discard()
    assert.equal(a.retainedRecords + b.retainedRecords, 0)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runSyntheticMentoriaCrmRehearsal().then(result => {
    console.log('MENTORIA_SYNTHETIC_STAGING', JSON.stringify(result))
  }).catch(error => {
    console.error('MENTORIA_SYNTHETIC_STAGING FAILED', error.message)
    process.exitCode = 1
  })
}
