import { describe, expect, it } from 'vitest'
import { createMentoriaSyntheticCrmPorts } from '../../api/_mentoriaSyntheticCrmPorts.js'
import { runSyntheticMentoriaCrmRehearsal } from '../../tools/audit-mentoria-staging-synthetic.mjs'

const tenant = Object.freeze({
  tenantSlug: 'wg-almeida', tenantId: '11111111-1111-4111-8111-111111111111',
  orgId: '22222222-2222-4222-8222-222222222222', channelId: 'synthetic_channel_A_001',
})
const otherTenant = { ...tenant, tenantId: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }
const ports = () => createMentoriaSyntheticCrmPorts({ tenantConfig: tenant, testOnly: true })
const key = 'mentoria-wa:' + tenant.tenantId + ':' + 'b'.repeat(64)
const scope = { tenantId: tenant.tenantId, orgId: tenant.orgId }
const reserve = (x) => x.ports.reserveReceipt({ ...scope, idempotencyKey: key })

describe('Mentoria CRM — rehearsal sintético sem provedor/banco real', () => {
  it('fail-closed sem testOnly e com tenant/org inválido', () => {
    expect(() => createMentoriaSyntheticCrmPorts({ tenantConfig: tenant })).toThrow('MENTORIA_SYNTHETIC_TEST_ONLY_REQUIRED')
    expect(() => createMentoriaSyntheticCrmPorts({ tenantConfig: { ...tenant, tenantId: 'slug' }, testOnly: true })).toThrow('MENTORIA_SYNTHETIC_TENANT_INVALID')
  })
  it('reserva só um receipt em chamadas concorrentes antes de efeitos colaterais', async () => {
    const x = ports()
    const states = await Promise.all([reserve(x), reserve(x), reserve(x)])
    expect(states.map(s => s.state)).toEqual(['reserved', 'processing', 'processing'])
    expect(x.snapshot()).toEqual(expect.objectContaining({ receipts: 1, contacts: 0, interactions: 0, externalWrites: 0, persistent: false }))
  })
  it('nunca aceita tenant externo mesmo em ports mock', async () => {
    const x = ports()
    await expect(x.ports.reserveReceipt({ ...scope, tenantId: otherTenant.tenantId, idempotencyKey: key }))
      .rejects.toThrow('MENTORIA_SYNTHETIC_CROSS_TENANT_DENIED')
    await expect(x.ports.findOrCreateContact({ ...scope, orgId: '99999999-9999-4999-8999-999999999999', senderRef:'sender_synthetic_001', source:'whatsapp' }))
      .rejects.toThrow('MENTORIA_SYNTHETIC_CROSS_TENANT_DENIED')
    expect(x.snapshot().contacts).toBe(0)
  })
  it('não aceita telefone real, origem fraudada nem referência fora da allowlist', async () => {
    const x = ports()
    await expect(x.ports.findOrCreateContact({ ...scope, senderRef:'5511999999999', source:'whatsapp' }))
      .rejects.toThrow('MENTORIA_SYNTHETIC_FAKE_SENDER_REQUIRED')
    await expect(x.ports.findOrCreateContact({ ...scope, senderRef:'sender_synthetic_001', source:'contact_form' }))
      .rejects.toThrow('MENTORIA_SYNTHETIC_FAKE_SENDER_REQUIRED')
  })
  it('não aceita gravar interação de pessoa inexistente nem fonte adulterada', async () => {
    const x = ports()
    const params = { ...scope, pessoaId:'33333333-3333-4333-8333-333333333333',source:'whatsapp',sourceRef:'b'.repeat(64),channel:'whatsapp',direction:'inbound',occurredAt:'2026-10-19T19:00:00Z' }
    await expect(x.ports.recordInteraction(params)).rejects.toThrow('MENTORIA_SYNTHETIC_CONTACT_NOT_OWNED')
    await expect(x.ports.recordInteraction({...params, channel:'web'})).rejects.toThrow('MENTORIA_SYNTHETIC_INVALID_INTERACTION')
  })
  it('sem receipt reservado não conclui, nem aceita completude falsa', async () => {
    const x = ports()
    await expect(x.ports.completeReceipt({ ...scope, idempotencyKey:key, pessoaId:'33333333-3333-4333-8333-333333333333', interactionId:'44444444-4444-4444-8444-444444444444' })).rejects.toThrow('MENTORIA_SYNTHETIC_RECEIPT_NOT_RESERVED')
  })
  it('falha parcial congela o receipt em needs_review e a limpeza apaga tudo', async () => {
    const x = ports()
    await reserve(x)
    expect((await x.ports.markNeedsReview({ ...scope, idempotencyKey:key, reasonCode:'PARTIAL_FAILURE' })).ok).toBe(true)
    expect((await reserve(x)).state).toBe('processing')
    expect(x.snapshot().receiptStates.needs_review).toBe(1)
    expect(x.discard()).toEqual({ simulated:true, retainedRecords:0 })
    expect(x.snapshot().receipts).toBe(0)
  })
  it('não permite mecanismos arbitrários de injeção de falha', () => {
    const x=ports()
    expect(() => x.failNext('sendWhatsApp')).toThrow('MENTORIA_SYNTHETIC_INVALID_INJECTION')
  })
  it('executa o funil completo sintético e nunca confirma provider real', async () => {
    const report = await runSyntheticMentoriaCrmRehearsal()
    expect(report).toMatchObject({
      status:'PASS', checks:8, mode:'synthetic-offline-no-persistence',
      externalWrites:0, messagesSent:0, sourceVerifiedByRealProvider:false,
      a:{ receipts:3,contacts:1,interactions:2,needsReview:1 },
      b:{ receipts:1,contacts:1,interactions:1 },
    })
    const serialized = JSON.stringify(report)
    expect(serialized).not.toMatch(/sender_|correlation_|signature|TEST_SECRET|phone|email|rawBody/i)
  })
})
