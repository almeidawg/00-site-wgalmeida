/**
 * Adapter de LABORATORIO para ponte interna de recebimento WhatsApp.
 *
 * Nao e webhook publico da Meta/Baileys, nao le env e nao acessa banco.
 * A ponte upstream deve verificar realmente o provedor, enviar payload
 * assinado com HMAC e manter seu proprio registro duravel de entregas.
 * Somente um backend autenticado pode criar os ports duraveis de CRM.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { createMentoriaFunnelEvent, MENTORIA_TENANT, MENTORIA_PRODUCT } from '../src/lib/mentoriaFunnelContract.js'

const MAX_BYTES = 16 * 1024
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const IDENTIFIER = /^[A-Za-z0-9:_-]{8,128}$/
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/
const KEYS = new Set([
  'schemaVersion', 'audience', 'event', 'direction', 'providerVerified',
  'channelId', 'providerMessageId', 'senderRef', 'correlationRef',
  'occurredAt', 'signedAt',
])
const required = (ok, code) => { if (!ok) throw new Error('MENTORIA_BRIDGE_' + code) }
const hashId = (value) => createHash('sha256').update(value, 'utf8').digest('hex')
const iso = (value) => typeof value === 'string' && UTC.test(value) && !Number.isNaN(Date.parse(value))
const uuid = (value) => typeof value === 'string' && UUID.test(value)
const expectedPortNames = [
  'reserveReceipt', 'findOrCreateContact', 'recordInteraction',
  'completeReceipt', 'markNeedsReview',
]

/** HMAC sobre BYTES EXATOS do payload; JSON reserializado nao e aceito. */
export function verifyMentoriaBridgeSignature(rawBody, signature, secret) {
  required(Buffer.isBuffer(rawBody), 'RAW_BYTES_REQUIRED')
  required(rawBody.byteLength > 0 && rawBody.byteLength <= MAX_BYTES, 'BODY_SIZE_INVALID')
  required(typeof secret === 'string' && Buffer.byteLength(secret, 'utf8') >= 32, 'SECRET_NOT_CONFIGURED')
  required(typeof signature === 'string' && /^sha256=[a-f0-9]{64}$/i.test(signature), 'SIGNATURE_INVALID')
  const claimed = Buffer.from(signature.slice(7), 'hex')
  const actual = createHmac('sha256', secret).update(rawBody).digest()
  required(claimed.length === actual.length && timingSafeEqual(claimed, actual), 'SIGNATURE_INVALID')
  return true
}

export function parseVerifiedMentoriaReceipt(rawBody, signature, secret, { now = Date.now(), maxSkewMs = 10 * 60 * 1000, allowedChannelId } = {}) {
  verifyMentoriaBridgeSignature(rawBody, signature, secret)
  let p
  try { p = JSON.parse(rawBody.toString('utf8')) } catch { throw new Error('MENTORIA_BRIDGE_INVALID_JSON') }
  required(p && typeof p === 'object' && !Array.isArray(p), 'INVALID_OBJECT')
  for (const key of Object.keys(p)) required(KEYS.has(key), 'UNEXPECTED_FIELD')
  required(p.schemaVersion === 1 && p.audience === 'wg-mentoria-inbound-v1', 'WRONG_AUDIENCE')
  required(p.event === 'message.received' && p.direction === 'inbound' && p.providerVerified === true, 'UNVERIFIED_PROVIDER')
  required(typeof allowedChannelId === 'string' && allowedChannelId.length > 0 && p.channelId === allowedChannelId, 'WRONG_CHANNEL')
  for (const k of ['providerMessageId', 'senderRef', 'correlationRef']) required(typeof p[k] === 'string' && IDENTIFIER.test(p[k]), 'INVALID_' + k.toUpperCase())
  required(iso(p.occurredAt) && iso(p.signedAt), 'INVALID_DATE')
  const n = now instanceof Date ? now.getTime() : now
  required(Number.isFinite(n) && Number.isInteger(maxSkewMs) && maxSkewMs > 0, 'INVALID_CLOCK')
  required(Math.abs(n - Date.parse(p.signedAt)) <= maxSkewMs, 'STALE_SIGNATURE')
  required(Date.parse(p.occurredAt) <= n + 5 * 60 * 1000, 'FUTURE_MESSAGE')
  // Nao retornar texto de mensagem, nome, telefone, IP ou conteudo sensivel.
  required(!/^\d{10,15}$/.test(p.senderRef), 'SENDER_NOT_PSEUDONYMOUS')
  return Object.freeze({
    sourceEventId: hashId(p.channelId + ':' + p.providerMessageId),
    senderRef: p.senderRef, // APENAS em memoria do adapter backend; nunca em telemetria
    correlationId: hashId(p.correlationRef),
    occurredAt: p.occurredAt,
    channelId: p.channelId,
  })
}

function tenantConfigValid(config) {
  return config && config.tenantSlug === MENTORIA_TENANT &&
    uuid(config.tenantId) && uuid(config.orgId) &&
    typeof config.channelId === 'string' && config.channelId.length > 0
}
function checkEntityScope(entity, config) {
  required(entity && uuid(entity.id), 'CRM_ID_INVALID')
  required(entity.orgId === config.orgId && entity.tenantId === config.tenantId, 'CRM_CROSS_TENANT')
}

/**
 * Orquestrador sem rede nem SQL: ports são interfaces duráveis autenticadas.
 * Contratos:
 * - reserveReceipt: atomicamente reserva uma chave unique por tenant/eventId,
 *   retorna {state:'reserved'|'completed'|'processing'}; processing = revisao.
 * - findOrCreateContact: dedup idempotente e escopo tenant/org no backend.
 * - recordInteraction: unique tenant/source/source_ref e retorno {id,orgId,tenantId}.
 * - completeReceipt: confirma gravacao duravel apos persistir interacao.
 * - markNeedsReview: congela qualquer efeito parcial, sem retry cego.
 */
export async function ingestMentoriaWhatsAppReceipt({
  rawBody, signature, secret, tenantConfig, ports, now = Date.now(),
}) {
  required(tenantConfigValid(tenantConfig), 'TENANT_NOT_RESOLVED')
  for (const name of expectedPortNames) required(typeof ports?.[name] === 'function', 'PORT_MISSING')
  const receipt = parseVerifiedMentoriaReceipt(rawBody, signature, secret, {
    now, allowedChannelId: tenantConfig.channelId,
  })
  const key = 'mentoria-wa:' + tenantConfig.tenantId + ':' + receipt.sourceEventId
  const reserved = await ports.reserveReceipt({
    idempotencyKey: key, tenantId: tenantConfig.tenantId, orgId: tenantConfig.orgId,
  })
  required(['reserved', 'completed', 'processing'].includes(reserved?.state), 'RESERVATION_FAILED')
  if (reserved.state !== 'reserved') {
    return { state: reserved.state === 'completed' ? 'duplicate' : 'pending_review', idempotencyKey: key, crmWritten: false }
  }
  try {
    const contact = await ports.findOrCreateContact({
      tenantId: tenantConfig.tenantId, orgId: tenantConfig.orgId,
      senderRef: receipt.senderRef, // somente o adapter de CRM ve identificador privado
      source: 'whatsapp',
    })
    checkEntityScope(contact, tenantConfig)
    const interaction = await ports.recordInteraction({
      tenantId: tenantConfig.tenantId, orgId: tenantConfig.orgId,
      pessoaId: contact.id, source: 'whatsapp',
      sourceRef: receipt.sourceEventId,
      channel: 'whatsapp',
      direction: 'inbound', occurredAt: receipt.occurredAt,
    })
    checkEntityScope(interaction, tenantConfig)
    const completion = await ports.completeReceipt({
      idempotencyKey: key, pessoaId: contact.id, interactionId: interaction.id,
      tenantId: tenantConfig.tenantId, orgId: tenantConfig.orgId,
    })
    required(completion?.ok === true, 'DURABLE_COMPLETION_NOT_CONFIRMED')
    const event = createMentoriaFunnelEvent({
      schemaVersion: 1, tenantId: MENTORIA_TENANT,
      productId: MENTORIA_PRODUCT,
      eventType: 'conversation_received', sourceSystem: 'whatsapp_provider',
      correlationId: receipt.correlationId, sourceEventId: receipt.sourceEventId,
      occurredAt: receipt.occurredAt, evidenceRef: 'receipt:' + receipt.sourceEventId,
    }, { verifiedUpstream: true })
    // Nunca promover contato automaticamente neste bloco;
    // promocao requer contrato do CRM e auditoria dos grants/RLS.
    return {
      state: 'recorded', idempotencyKey: key,
      crmWritten: true, event,
    }
  } catch (error) {
    try {
      await ports.markNeedsReview({
        idempotencyKey: key, tenantId: tenantConfig.tenantId, orgId: tenantConfig.orgId,
        reasonCode: 'PARTIAL_FAILURE',
      })
    } catch { throw new Error('MENTORIA_BRIDGE_MANUAL_RECONCILIATION_REQUIRED') }
    // Nao esconder causa interna no endpoint publico. Caller deve sanitizar.
    throw error
  }
}
