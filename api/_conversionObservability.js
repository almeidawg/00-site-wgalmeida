const ALLOWED_OUTCOMES = new Set(['saved', 'duplicate', 'rejected', 'ignored'])
const ALLOWED_PROMOTIONS = new Set([
  'promotion_skipped', 'promotion_queued', 'promotion_completed', 'promotion_already_done', 'promotion_failed',
])
const ALLOWED_REASONS = new Set([
  'accepted', 'duplicate', 'honeypot', 'invalid_payload', 'rate_limited',
  'turnstile_not_configured', 'turnstile_missing', 'turnstile_replay', 'turnstile_failed',
  'persist_failed', 'persistence_not_configured', 'payload_too_large', 'unexpected_error', 'origin_rejected',
])

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''

export const normalizeConversionContext = (value) => {
  const context = String(value || '').trim().toLowerCase()
  if (context === 'moodboard-studio-v2' || context === 'moodboard') return 'moodboard'
  if (context === 'buildtech') return 'buildtech'
  if (context === 'contact' || context === 'site-contact') return 'contact'
  return 'other'
}

const normalize = (value, allowed, fallback) => allowed.has(value) ? value : fallback

export const buildConversionEvent = ({ requestId, outcome, reason, promotion = 'promotion_skipped', context = 'other', statusCode, durationMs }) => ({
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

const persistConversionEvent = async (event, persistRequested) => {
  if (!persistRequested) return { persisted: false, status: 'disabled' }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !event.requestId) return { persisted: false, status: 'unconfigured' }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/site_conversion_events?on_conflict=request_id`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify({
      request_id: event.requestId,
      event: event.event,
      outcome: event.outcome,
      reason: event.reason,
      promotion: event.promotion,
      context: event.context,
      status_code: event.statusCode,
      duration_ms: event.durationMs,
    }),
  })
  if (!response.ok) throw new Error(`conversion_telemetry_persist_${response.status}`)
  return { persisted: true, status: 'persisted' }
}

export const emitConversionEvent = async (fields) => {
  const event = buildConversionEvent(fields)
  console.info('[wg-conversion]', JSON.stringify(event))
  try {
    const telemetry = await persistConversionEvent(event, fields.persist === true)
    return { event, telemetry }
  } catch (error) {
    console.warn('[wg-conversion-persist]', error.message)
    return { event, telemetry: { persisted: false, status: 'failed' } }
  }
}
