import { describe, it, expect, vi } from 'vitest'
import { createHmac } from 'node:crypto'
import {
  verifyMentoriaBridgeSignature, parseVerifiedMentoriaReceipt,
  ingestMentoriaWhatsAppReceipt,
} from '../../api/_mentoriaInboundAdapter.js'
const secret = 'synthetic-qa-secret-do-not-use-in-production-2026'
const cfg = {
  tenantSlug: 'wg-almeida',
  tenantId: '11111111-1111-4111-8111-111111111111',
  orgId: '22222222-2222-4222-8222-222222222222',
  channelId: 'wg_mentoria_channel_001',
}
const now = Date.parse('2026-10-18T21:00:00Z')
const payload = (changes = {}) => ({
  schemaVersion: 1, audience: 'wg-mentoria-inbound-v1',
  event: 'message.received', direction: 'inbound', providerVerified: true,
  channelId: cfg.channelId,
  providerMessageId: 'message_00000001',
  senderRef: 'sender_internal_001',
  correlationRef: 'cta_correlation_01',
  occurredAt: '2026-10-18T20:59:00Z',
  signedAt: '2026-10-18T21:00:00Z',
  ...changes,
})
function signed(input = payload()) {
  const rawBody = Buffer.from(JSON.stringify(input), 'utf8')
  const signature = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')
  return {rawBody, signature}
}
function ports(overrides = {}) {
  return {
    reserveReceipt: vi.fn().mockResolvedValue({ state: 'reserved' }),
    findOrCreateContact: vi.fn().mockResolvedValue({ id: '33333333-3333-4333-8333-333333333333', orgId: cfg.orgId, tenantId: cfg.tenantId }),
    recordInteraction: vi.fn().mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444', orgId: cfg.orgId, tenantId: cfg.tenantId }),
    completeReceipt: vi.fn().mockResolvedValue({ ok: true }),
    markNeedsReview: vi.fn().mockResolvedValue({ ok: true }),
    ...overrides,
  }
}
const command = (p = ports(), input = signed(), tenantConfig = cfg) => ({
  ...input, secret, now, ports: p, tenantConfig,
})

describe('signed internal WhatsApp bridge -> WGEasy CRM adapter (offline)', () => {
  it('verifies authentic raw bytes and rejects tampering and short secrets', () => {
    const {rawBody, signature} = signed()
    expect(verifyMentoriaBridgeSignature(rawBody, signature, secret)).toBe(true)
    const changed = Buffer.from(rawBody)
    changed[20] = changed[20] ^ 1
    expect(() => verifyMentoriaBridgeSignature(changed, signature, secret)).toThrow('MENTORIA_BRIDGE_SIGNATURE_INVALID')
    expect(() => verifyMentoriaBridgeSignature(rawBody, signature, 'short')).toThrow('MENTORIA_BRIDGE_SECRET_NOT_CONFIGURED')
  })
  it('rejects stale signatures, wrong channel, unverifiable provider and extra PII', () => {
    const stale = signed(payload({signedAt: '2026-10-18T19:00:00Z'}))
    expect(() => parseVerifiedMentoriaReceipt(stale.rawBody, stale.signature, secret, {now,allowedChannelId:cfg.channelId})).toThrow('MENTORIA_BRIDGE_STALE_SIGNATURE')
    const other = signed(payload({channelId: 'tenant_other_channel'}))
    expect(() => parseVerifiedMentoriaReceipt(other.rawBody, other.signature, secret, {now,allowedChannelId:cfg.channelId})).toThrow('MENTORIA_BRIDGE_WRONG_CHANNEL')
    const fake = signed(payload({providerVerified:false}))
    expect(() => parseVerifiedMentoriaReceipt(fake.rawBody, fake.signature, secret, {now,allowedChannelId:cfg.channelId})).toThrow('MENTORIA_BRIDGE_UNVERIFIED_PROVIDER')
    const pii = signed(payload({phone: '5511999999999'}))
    expect(() => parseVerifiedMentoriaReceipt(pii.rawBody, pii.signature, secret, {now,allowedChannelId:cfg.channelId})).toThrow('MENTORIA_BRIDGE_UNEXPECTED_FIELD')
  })
  it('rejects invalid tenant BEFORE reservation', async () => {
    const p = ports()
    await expect(ingestMentoriaWhatsAppReceipt(command(p, signed(), {...cfg, tenantId: 'client-other'}))).rejects.toThrow('MENTORIA_BRIDGE_TENANT_NOT_RESOLVED')
    expect(p.reserveReceipt).not.toHaveBeenCalled()
  })
  it('writes a verified inbound interaction, not automatic promotion', async () => {
    const p = ports()
    const result = await ingestMentoriaWhatsAppReceipt(command(p))
    expect(result.state).toBe('recorded')
    expect(result.event.eventType).toBe('conversation_received')
    expect(result.event.confirmedBusinessEvent).toBe(true)
    expect(JSON.stringify(result)).not.toContain('sender_internal_001')
    expect(p.recordInteraction).toHaveBeenCalledWith(expect.objectContaining({
      source:'whatsapp', direction:'inbound', pessoaId:'33333333-3333-4333-8333-333333333333',
    }))
    expect(p.completeReceipt).toHaveBeenCalledOnce()
  })
  it('refuses a cross-tenant CRM contact and sends partial operation to manual review', async () => {
    const p = ports({findOrCreateContact:vi.fn().mockResolvedValue({
      id:'33333333-3333-4333-8333-333333333333',
      orgId:'99999999-9999-4999-8999-999999999999',tenantId:cfg.tenantId,
    })})
    await expect(ingestMentoriaWhatsAppReceipt(command(p))).rejects.toThrow('MENTORIA_BRIDGE_CRM_CROSS_TENANT')
    expect(p.recordInteraction).not.toHaveBeenCalled()
    expect(p.markNeedsReview).toHaveBeenCalledOnce()
  })
  it('does not write twice on completed or processing receipt', async () => {
    for (const [s,out] of [['completed','duplicate'],['processing','pending_review']]) {
      const p=ports({reserveReceipt:vi.fn().mockResolvedValue({state:s})})
      expect((await ingestMentoriaWhatsAppReceipt(command(p))).state).toBe(out)
      expect(p.findOrCreateContact).not.toHaveBeenCalled()
      expect(p.completeReceipt).not.toHaveBeenCalled()
    }
  })
  it('freezes failures without blind retry and refuses to hide failure if ledger broken', async () => {
    const p=ports({recordInteraction:vi.fn().mockRejectedValue(new Error('qa_downstream_unavailable'))})
    await expect(ingestMentoriaWhatsAppReceipt(command(p))).rejects.toThrow('qa_downstream_unavailable')
    expect(p.markNeedsReview).toHaveBeenCalledWith(expect.objectContaining({reasonCode:'PARTIAL_FAILURE'}))
    expect(p.completeReceipt).not.toHaveBeenCalled()
    const lost=ports({recordInteraction:vi.fn().mockRejectedValue(new Error('qa_fail')),markNeedsReview:vi.fn().mockRejectedValue(new Error('qa_ledger_fail'))})
    await expect(ingestMentoriaWhatsAppReceipt(command(lost))).rejects.toThrow('MENTORIA_BRIDGE_MANUAL_RECONCILIATION_REQUIRED')
  })
  it('rejects payload exceeding 16KiB and invalid raw JSON', () => {
    const big=Buffer.alloc(16*1024+1, 'x')
    expect(() => verifyMentoriaBridgeSignature(big,'sha256='+'a'.repeat(64),secret)).toThrow('MENTORIA_BRIDGE_BODY_SIZE_INVALID')
    const invalid=Buffer.from('{broken-json')
    const sig='sha256='+createHmac('sha256',secret).update(invalid).digest('hex')
    expect(() => parseVerifiedMentoriaReceipt(invalid,sig,secret,{now,allowedChannelId:cfg.channelId})).toThrow('MENTORIA_BRIDGE_INVALID_JSON')
  })
  it('requires all ports to implement the durable CRM contract', async () => {
    const p=ports()
    delete p.completeReceipt
    await expect(ingestMentoriaWhatsAppReceipt(command(p))).rejects.toThrow('MENTORIA_BRIDGE_PORT_MISSING')
  })
  it('rejects a raw telephone masquerading as an opaque sender reference', () => {
    const receipt = signed(payload({ senderRef:'5511999999999' }))
    expect(() => parseVerifiedMentoriaReceipt(receipt.rawBody,receipt.signature,secret,{
      now, allowedChannelId:cfg.channelId,
    })).toThrow('MENTORIA_BRIDGE_SENDER_NOT_PSEUDONYMOUS')
  })
  it('does not claim a confirmed lead when durable completion is not proven', async () => {
    const p=ports({completeReceipt:vi.fn().mockResolvedValue({ok:false})})
    await expect(ingestMentoriaWhatsAppReceipt(command(p))).rejects.toThrow('MENTORIA_BRIDGE_DURABLE_COMPLETION_NOT_CONFIRMED')
    expect(p.markNeedsReview).toHaveBeenCalledOnce()
  })
  it('uses atomic reservation to serialize parallel duplicate provider retries', async () => {
    const receipts = new Map()
    const p=ports({
      reserveReceipt:vi.fn(async ({idempotencyKey})=>{
        if(receipts.has(idempotencyKey)) return {state:receipts.get(idempotencyKey)}
        receipts.set(idempotencyKey,'processing')
        return {state:'reserved'}
      }),
      completeReceipt:vi.fn(async ({idempotencyKey})=>{
        receipts.set(idempotencyKey,'completed')
        return {ok:true}
      }),
    })
    const input=signed()
    const results=await Promise.all([
      ingestMentoriaWhatsAppReceipt(command(p,input)),
      ingestMentoriaWhatsAppReceipt(command(p,input)),
    ])
    expect(results.map(x=>x.state).sort()).toEqual(['pending_review','recorded'])
    expect(p.recordInteraction).toHaveBeenCalledTimes(1)
    expect(p.completeReceipt).toHaveBeenCalledTimes(1)
  })
})