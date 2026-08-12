const ALLOWED_OUTCOMES = new Set(['saved', 'duplicate', 'rejected', 'ignored'])
const ALLOWED_PROMOTIONS = new Set([
  'promotion_skipped',
  'promotion_queued',
  'promotion_completed',
  'promotion_already_done',
  'promotion_failed',
])
const ALLOWED_REASONS = new Set([
  'accepted',
  'duplicate',
  'honeypot',
  'invalid_payload',
  'rate_limited',
  'turnstile_not_configured',
  'turnstile_missing',
  'turnstile_replay',
  'turnstile_failed',
  'persist_failed',
  'persistence_not_configured',
  'payload_too_large',
  'unexpected_error',
  'origin_rejected',
])

export const normalizeConversionContext = (value) => {
  const context = String(value || '').trim().toLowerCase()
  if (context === 'moodboard-studio-v2' || context === 'moodboard') return 'moodboard'
  if (context === 'buildtech') return 'buildtech'
  if (context === 'contact' || context === 'site-contact') return 'contact'
  return 'other'
}

const normalize = (value, allowed, fallback) => allowed.has(value) ? value : fallback

export const buildConversionEvent = ({
  requestId,
  outcome,
  reason,
  promotion = 'promotion_skipped',
  context = 'other',
  statusCode,
  durationMs,
}) => ({
  schema: 'wg.conversion.v1',
  event: 'contact_result',
  requestId: String(requestId || ''),
  outcome: normalize(outcome, ALLOWED_OUTCOMES, 'rejected'),
  reason: normalize(reason, ALLOWED_REASONS, 'unexpected_error'),
  promotion: normalize(promotion, ALLOWED_PROMOTIONS, 'promotion_skipped'),
  context: normalizeConversionContext(context),
  statusCode: Number.isInteger(statusCode) ? statusCode : 500,
  durationMs: Math.max(0, Math.round(Number(durationMs) || 0)),
})

export const emitConversionEvent = (fields) => {
  const event = buildConversionEvent(fields)
  console.info('[wg-conversion]', JSON.stringify(event))
  return event
}
