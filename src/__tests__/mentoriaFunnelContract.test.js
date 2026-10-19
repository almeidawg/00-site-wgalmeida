import { describe, it, expect } from 'vitest'
import {
  MENTORIA_TENANT, MENTORIA_PRODUCT, MENTORIA_EVENT_SOURCES,
  createMentoriaFunnelEvent, evaluateMentoriaJourney,
} from '../lib/mentoriaFunnelContract.js'

const event = (eventType, overrides = {}) => ({
  schemaVersion: 1,
  tenantId: MENTORIA_TENANT,
  productId: MENTORIA_PRODUCT,
  eventType,
  sourceSystem: MENTORIA_EVENT_SOURCES[eventType],
  correlationId: 'test_correlation_001',
  sourceEventId: 'test_event_000001',
  occurredAt: '2026-10-18T20:00:00Z',
  ...(eventType === 'conversation_received' ? { evidenceRef: 'webhook:message_000001' } : {}),
  ...overrides,
})

const confirmed = (type, index) => createMentoriaFunnelEvent(event(type, {
  sourceEventId: 'source_event_' + String(index).padStart(5, '0'),
  evidenceRef: 'receipt:evidence_' + String(index).padStart(5, '0'),
}), { verifiedUpstream: true })

describe('mentoria funnel contract v1 / no phantom leads', () => {
  it('does not count a WhatsApp click as a received conversation', () => {
    const click = createMentoriaFunnelEvent(event('whatsapp_intent', {
      attribution: { utm_source: 'instagram', utm_content: 'ia_01_contexto' },
    }))
    expect(click.confirmedBusinessEvent).toBe(false)
    expect(evaluateMentoriaJourney([click])).toMatchObject({
      leadConfirmed: false, highestObservedStage: null, businessJourneyComplete: false,
    })
  })
  it('refuses to label an unverified WhatsApp message as received', () => {
    expect(() => createMentoriaFunnelEvent(event('conversation_received'))).toThrow('MENTORIA_EVENT_UPSTREAM_NOT_VERIFIED')
  })
  it('requires evidence and the correct source for a confirmed message', () => {
    expect(() => createMentoriaFunnelEvent(event('conversation_received', { evidenceRef: undefined }), { verifiedUpstream: true })).toThrow('MENTORIA_EVENT_MISSING_EVIDENCE')
    expect(() => createMentoriaFunnelEvent(event('conversation_received', { sourceSystem: 'site' }), { verifiedUpstream: true })).toThrow('MENTORIA_EVENT_INVALID_SOURCE')
    expect(evaluateMentoriaJourney([confirmed('conversation_received', 1)]).leadConfirmed).toBe(true)
  })
  it('rejects PII and arbitrary nested attributes at the event boundary', () => {
    expect(() => createMentoriaFunnelEvent(event('page_view', { email: 'cliente@exemplo.test' }))).toThrow('MENTORIA_EVENT_FIELD_NOT_ALLOWED')
    expect(() => createMentoriaFunnelEvent(event('page_view', { attribution: { phone: '11999999999' } }))).toThrow('MENTORIA_EVENT_ATTRIBUTION_FIELD_NOT_ALLOWED')
    expect(() => createMentoriaFunnelEvent(event('page_view', { attribution: { utm_campaign: 'campanha com espacos' } }))).toThrow('MENTORIA_EVENT_ATTRIBUTION_VALUE_NOT_ALLOWED')
  })
  it('rejects events from another tenant/project and mixed correlations', () => {
    expect(() => createMentoriaFunnelEvent(event('page_view', { tenantId: 'cliente-andreia' }))).toThrow('MENTORIA_EVENT_WRONG_TENANT')
    expect(() => createMentoriaFunnelEvent(event('page_view', { correlationId: 'a@example.com' }))).toThrow('MENTORIA_EVENT_INVALID_CORRELATION')
    expect(() => evaluateMentoriaJourney([
      createMentoriaFunnelEvent(event('page_view')),
      createMentoriaFunnelEvent(event('video_start', { correlationId: 'other_correlation_001' })),
    ])).toThrow('MENTORIA_EVENT_MIXED_CORRELATION')
  })
  it('deduplicates retries by sourceEventId and detects missing stages', () => {
    const e = confirmed('conversation_received', 1)
    const payment = confirmed('payment_confirmed', 2)
    const result = evaluateMentoriaJourney([e, e, payment])
    expect(result.duplicateKeys).toEqual([e.idempotencyKey])
    expect(result.lastContinuousStage).toBe('conversation_received')
    expect(result.highestObservedStage).toBe('payment_confirmed')
    expect(result.gaps).toEqual(['lead_qualified', 'meeting_confirmed', 'proposal_issued', 'contract_signed'])
    expect(result.businessJourneyComplete).toBe(false)
  })
  it('requires evidence across every business stage before closing journey', () => {
    const journey = [
      'conversation_received','lead_qualified','meeting_confirmed','proposal_issued',
      'contract_signed','payment_confirmed','onboarding_completed',
    ].map((type, i) => confirmed(type, i))
    expect(evaluateMentoriaJourney(journey)).toMatchObject({
      leadConfirmed: true,
      lastContinuousStage: 'onboarding_completed',
      businessJourneyComplete: true,
      gaps: [],
    })
  })
  it('allows only the declared marketing event sources and UTC timestamps', () => {
    expect(() => createMentoriaFunnelEvent(event('campaign_published'))).toThrow('MENTORIA_EVENT_INVALID_TYPE')
    expect(() => createMentoriaFunnelEvent(event('page_view', { occurredAt: '2026-10-18 20:00:00' }))).toThrow('MENTORIA_EVENT_INVALID_DATE')
    expect(() => createMentoriaFunnelEvent(event('page_view', { evidenceRef: 'any:source_000001' }))).toThrow('MENTORIA_EVENT_PUBLIC_EVENT_WITH_EVIDENCE')
  })
})
