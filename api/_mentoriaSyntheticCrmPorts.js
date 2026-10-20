/**
 * In-memory, per-process CRM ports for synthetic staging rehearsal ONLY.
 * No storage SDK, network, disk access, WhatsApp send, external credentials
 * or telemetry. Nothing here is an authorization or RLS implementation.
 * The durable WGEasy ports MUST be built and reviewed separately.
 */
import { randomUUID } from 'node:crypto'

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
const STATES = new Set(['recordInteraction', 'findOrCreateContact', 'completeReceipt', 'markNeedsReview'])
const ensure = (condition, code) => { if (!condition) throw new Error('MENTORIA_SYNTHETIC_' + code) }

/**
 * This factory intentionally requires the exact fake scoped config and has
 * no way to return raw sender references, names or message content.
 */
export function createMentoriaSyntheticCrmPorts({ tenantConfig, testOnly = false } = {}) {
  ensure(testOnly === true, 'TEST_ONLY_REQUIRED')
  ensure(tenantConfig?.tenantSlug === 'wg-almeida' && UUID.test(tenantConfig.tenantId) && UUID.test(tenantConfig.orgId) && tenantConfig.channelId, 'TENANT_INVALID')
  const receipts = new Map()
  const people = new Map()
  const interactions = new Map()
  let oneShotFailure = null
  const requireScope = (params) => ensure(params?.tenantId === tenantConfig.tenantId && params?.orgId === tenantConfig.orgId, 'CROSS_TENANT_DENIED')
  const maybeFail = (operation) => {
    if (oneShotFailure !== operation) return
    oneShotFailure = null
    throw new Error('MENTORIA_SYNTHETIC_INJECTED_FAILURE')
  }
  const safeRecord = (record) => ({ id: record.id, tenantId: record.tenantId, orgId: record.orgId })

  const ports = Object.freeze({
    async reserveReceipt({ idempotencyKey, tenantId, orgId }) {
      requireScope({ tenantId, orgId })
      ensure(typeof idempotencyKey === 'string' && idempotencyKey.startsWith('mentoria-wa:' + tenantId + ':'), 'BAD_RESERVATION_KEY')
      const existing = receipts.get(idempotencyKey)
      if (existing) return { state: existing.state === 'completed' ? 'completed' : 'processing' }
      // Reserve synchronously BEFORE returning the promise; two concurrent
      // invocations cannot both claim the same in-memory receipt.
      receipts.set(idempotencyKey, { state: 'reserved', tenantId, orgId })
      return { state: 'reserved' }
    },
    async findOrCreateContact({ tenantId, orgId, senderRef, source }) {
      requireScope({ tenantId, orgId })
      ensure(source === 'whatsapp' && typeof senderRef === 'string' && senderRef.startsWith('sender_') && senderRef.length <= 128, 'FAKE_SENDER_REQUIRED')
      maybeFail('findOrCreateContact')
      const key = tenantId + ':' + orgId + ':' + senderRef
      if (!people.has(key)) people.set(key, { id: randomUUID(), tenantId, orgId })
      return safeRecord(people.get(key))
    },
    async recordInteraction({ tenantId, orgId, pessoaId, source, sourceRef, channel, direction, occurredAt }) {
      requireScope({ tenantId, orgId })
      ensure(source === 'whatsapp' && channel === 'whatsapp' && direction === 'inbound', 'INVALID_INTERACTION')
      ensure(typeof sourceRef === 'string' && /^[a-f0-9]{64}$/.test(sourceRef), 'INVALID_SOURCE_REF')
      ensure([...people.values()].some(p => p.id === pessoaId && p.tenantId === tenantId && p.orgId === orgId), 'CONTACT_NOT_OWNED')
      ensure(!Number.isNaN(Date.parse(occurredAt)), 'INVALID_TIMESTAMP')
      maybeFail('recordInteraction')
      const key = tenantId + ':whatsapp:' + sourceRef
      if (!interactions.has(key)) interactions.set(key, { id: randomUUID(), pessoaId, tenantId, orgId })
      return safeRecord(interactions.get(key))
    },
    async completeReceipt({ idempotencyKey, pessoaId, interactionId, tenantId, orgId }) {
      requireScope({ tenantId, orgId })
      maybeFail('completeReceipt')
      const receipt = receipts.get(idempotencyKey)
      ensure(receipt?.state === 'reserved', 'RECEIPT_NOT_RESERVED')
      ensure([...people.values()].some(p => p.id === pessoaId && p.tenantId === tenantId && p.orgId === orgId), 'CONTACT_NOT_OWNED')
      ensure([...interactions.values()].some(i => i.id === interactionId && i.pessoaId === pessoaId && i.tenantId === tenantId), 'INTERACTION_NOT_OWNED')
      receipt.state = 'completed'
      return { ok: true }
    },
    async markNeedsReview({ idempotencyKey, tenantId, orgId, reasonCode }) {
      requireScope({ tenantId, orgId })
      maybeFail('markNeedsReview')
      ensure(reasonCode === 'PARTIAL_FAILURE', 'INVALID_REVIEW_REASON')
      const receipt = receipts.get(idempotencyKey)
      ensure(receipt && receipt.state !== 'completed', 'RECEIPT_NOT_REVIEWABLE')
      receipt.state = 'needs_review'
      return { ok: true }
    },
  })

  return Object.freeze({
    ports,
    // Failure injection is only available in explicit test mode.
    failNext(operation) {
      ensure(STATES.has(operation), 'INVALID_INJECTION')
      oneShotFailure = operation
    },
    snapshot() {
      const states = [...receipts.values()].reduce((acc, receipt) => { acc[receipt.state] = (acc[receipt.state] || 0) + 1; return acc }, {})
      return Object.freeze({ simulated: true, persistent: false, externalWrites: 0, sentMessages: 0,
        receipts: receipts.size, contacts: people.size, interactions: interactions.size, receiptStates: Object.freeze(states) })
    },
    discard() {
      receipts.clear(); people.clear(); interactions.clear(); oneShotFailure = null
      return { simulated: true, retainedRecords: 0 }
    },
  })
}
