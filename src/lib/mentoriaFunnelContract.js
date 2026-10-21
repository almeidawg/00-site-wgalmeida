/**
 * Contrato PURO de eventos da Mentoria WG. Nao publica eventos, nao acessa CRM,
 * nao autentica webhooks e nao realiza mutacoes externas.
 * O adapter servidor DEVE verificar identidade/autorizacao antes de chamar
 * createMentoriaFunnelEvent com verifiedUpstream:true.
 */
// Slug de tenant do CONTRATO, não é o UUID de saas_tenants do WGEasy.
// O futuro adapter backend deve resolver slug -> UUID com identidade autenticada.
export const MENTORIA_TENANT = 'wg-almeida'
export const MENTORIA_PRODUCT = 'mentoria-construcao'

export const MENTORIA_EVENT_SOURCES = Object.freeze({
  page_view: 'site',
  video_start: 'site',
  video_complete: 'site',
  whatsapp_intent: 'site',
  conversation_received: 'whatsapp_provider',
  lead_qualified: 'crm',
  meeting_confirmed: 'calendar',
  proposal_issued: 'proposals',
  contract_signed: 'contracts',
  payment_confirmed: 'payments',
  onboarding_completed: 'mentoria',
})

const PUBLIC_EVENTS = new Set(['page_view', 'video_start', 'video_complete', 'whatsapp_intent'])
const CONFIRMED_JOURNEY = Object.freeze([
  'conversation_received', 'lead_qualified', 'meeting_confirmed',
  'proposal_issued', 'contract_signed', 'payment_confirmed',
  'onboarding_completed',
])
const ATTRIBUTION = Object.freeze(['utm_source','utm_medium','utm_campaign','utm_content'])
const OPAQUE = /^[A-Za-z0-9_-]{8,100}$/
const UTM_VALUE = /^[A-Za-z0-9_.:-]{1,100}$/
const EVIDENCE = /^[a-z_]+:[A-Za-z0-9._-]{6,100}$/
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/
const KEYS = new Set([
  'schemaVersion', 'tenantId', 'productId', 'eventType', 'sourceSystem',
  'correlationId', 'sourceEventId', 'occurredAt', 'evidenceRef', 'attribution',
])
function ensure(condition, code) { if (!condition) throw new Error('MENTORIA_EVENT_' + code) }
function validUtc(value) {
  return typeof value === 'string' && ISO_UTC.test(value) && !Number.isNaN(Date.parse(value))
}
function sanitizeAttribution(value) {
  if (value === undefined) return {}
  ensure(value && typeof value === 'object' && !Array.isArray(value), 'INVALID_ATTRIBUTION')
  for (const [key, v] of Object.entries(value)) {
    ensure(ATTRIBUTION.includes(key), 'ATTRIBUTION_FIELD_NOT_ALLOWED')
    ensure(typeof v === 'string' && UTM_VALUE.test(v), 'ATTRIBUTION_VALUE_NOT_ALLOWED')
  }
  return Object.fromEntries(ATTRIBUTION.filter(k => k in value).map(k => [k, value[k]]))
}

/**
 * verifiedUpstream apenas identifica etapa de auditoria: NAO autentica por si.
 * Somente um endpoint backend autenticado e validado deve marcar true.
 */
export function createMentoriaFunnelEvent(input, { verifiedUpstream = false } = {}) {
  ensure(input && typeof input === 'object' && !Array.isArray(input), 'INVALID_INPUT')
  for (const key of Object.keys(input)) ensure(KEYS.has(key), 'FIELD_NOT_ALLOWED')
  ensure(input.schemaVersion === 1, 'INVALID_SCHEMA')
  ensure(input.tenantId === MENTORIA_TENANT && input.productId === MENTORIA_PRODUCT, 'WRONG_TENANT')
  ensure(Object.hasOwn(MENTORIA_EVENT_SOURCES, input.eventType), 'INVALID_TYPE')
  ensure(input.sourceSystem === MENTORIA_EVENT_SOURCES[input.eventType], 'INVALID_SOURCE')
  ensure(typeof input.correlationId === 'string' && OPAQUE.test(input.correlationId), 'INVALID_CORRELATION')
  ensure(typeof input.sourceEventId === 'string' && OPAQUE.test(input.sourceEventId), 'INVALID_SOURCE_ID')
  ensure(validUtc(input.occurredAt), 'INVALID_DATE')
  const publicEvent = PUBLIC_EVENTS.has(input.eventType)
  if (!publicEvent) {
    ensure(verifiedUpstream === true, 'UPSTREAM_NOT_VERIFIED')
    ensure(typeof input.evidenceRef === 'string' && EVIDENCE.test(input.evidenceRef), 'MISSING_EVIDENCE')
  } else {
    ensure(input.evidenceRef === undefined, 'PUBLIC_EVENT_WITH_EVIDENCE')
  }
  const attribution = sanitizeAttribution(input.attribution)
  const event = {
    schemaVersion: 1, tenantId: MENTORIA_TENANT, productId: MENTORIA_PRODUCT,
    eventType: input.eventType, sourceSystem: input.sourceSystem,
    correlationId: input.correlationId, sourceEventId: input.sourceEventId,
    occurredAt: input.occurredAt, attribution,
    ...(publicEvent ? {} : { evidenceRef: input.evidenceRef }),
  }
  return Object.freeze({
    ...event,
    attribution: Object.freeze(attribution),
    idempotencyKey: [event.tenantId, event.sourceSystem, event.eventType, event.sourceEventId].join(':'),
    confirmedBusinessEvent: !publicEvent,
  })
}

/**
 * Projecao local pura: conteudo de anuncio/CTA nunca transforma contato em lead.
 * Aceita SOMENTE eventos previamente normalizados/validados no adaptador.
 * Nao grava nada, nao dispara comunicacoes e nao autoriza faturamento.
 */
export function evaluateMentoriaJourney(events) {
  ensure(Array.isArray(events), 'INVALID_JOURNEY')
  const first = events[0]?.correlationId
  const seen = new Set()
  const types = new Set()
  const duplicates = []
  for (const event of events) {
    ensure(event?.tenantId === MENTORIA_TENANT && event?.productId === MENTORIA_PRODUCT, 'WRONG_TENANT')
    ensure(typeof event.correlationId === 'string' && event.correlationId === first, 'MIXED_CORRELATION')
    ensure(typeof event.idempotencyKey === 'string', 'INVALID_NORMALIZED_EVENT')
    if (seen.has(event.idempotencyKey)) { duplicates.push(event.idempotencyKey); continue }
    seen.add(event.idempotencyKey)
    if (CONFIRMED_JOURNEY.includes(event.eventType)) {
      ensure(event.confirmedBusinessEvent === true && typeof event.evidenceRef === 'string', 'UNVERIFIED_JOURNEY_EVENT')
      types.add(event.eventType)
    }
  }
  let lastContinuous = null
  for (const stage of CONFIRMED_JOURNEY) {
    if (!types.has(stage)) break
    lastContinuous = stage
  }
  const highest = [...CONFIRMED_JOURNEY].reverse().find(s => types.has(s)) || null
  const gaps = highest
    ? CONFIRMED_JOURNEY.slice(0, CONFIRMED_JOURNEY.indexOf(highest) + 1).filter(s => !types.has(s))
    : []
  return Object.freeze({
    correlationId: first || null,
    leadConfirmed: types.has('conversation_received'),
    lastContinuousStage: lastContinuous,
    highestObservedStage: highest,
    gaps,
    duplicateKeys: duplicates,
    businessJourneyComplete: lastContinuous === 'onboarding_completed',
  })
}
