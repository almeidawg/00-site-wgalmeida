import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * PRIVATE, UNMOUNTED backend boundary for a future independent commercial
 * consent service. Do not export this file as an api/ route handler.
 *
 * NOT a session provider, OTP implementation, consent proof or CRM writer.
 * In production, authenticated session/CSRF and atomic durable challenge ports
 * MUST come from an independently audited backend (never from the browser).
 * DO NOT reuse the site's permissive api/_requestGuard.isOriginAllowed.
 */
const PURPOSE = 'mentoria_commercial_contact'
const PHONE = /^55\d{10,11}$/
const CHALLENGE = /^[A-Za-z][A-Za-z0-9_-]{15,95}$/
const PRINCIPAL = /^[A-Za-z][A-Za-z0-9_-]{15,95}$/
const VERSION = /^[A-Za-z0-9][A-Za-z0-9_.-]{2,39}$/
const CODE = /^\d{4,10}$/
const CSRF = /^[A-Za-z0-9_-]{32,256}$/
const MAX_BYTES = 1024

const unavailable = () => ({ httpStatus: 503, payload: { status: 'unavailable' } })
const denied = () => ({ httpStatus: 403, payload: { status: 'denied' } })
const badBody = () => ({ httpStatus: 400, payload: { status: 'invalid_request' } })
const allow = (payload) => ({ httpStatus: 200, payload })

function hasExactFields(value, names) {
  if (!value || Array.isArray(value) || typeof value !== 'object') return false
  const keys = Object.keys(value)
  return keys.length === names.length && keys.every((key) => names.includes(key))
}

function parseCanonicalJson(rawBody) {
  if (!Buffer.isBuffer(rawBody) || rawBody.length === 0 || rawBody.length > MAX_BYTES) return null
  try {
    const source = rawBody.toString('utf8')
    const value = JSON.parse(source)
    // Prevent duplicate JSON keys, hidden payloads and alternate
    // interpretations by downstream parsers: only canonical JSON is allowed.
    if (JSON.stringify(value) !== source) return null
    return value
  } catch { return null }
}

function isValidOrigin(origin) {
  if (typeof origin !== 'string') return false
  try {
    const url = new URL(origin)
    return url.protocol === 'https:' && url.origin === origin &&
      !url.username && !url.password && url.hostname !== 'localhost' &&
      !url.hostname.endsWith('.vercel.app')
  } catch { return false }
}

function checkHeaders(req, origin) {
  if (req?.method !== 'POST' || !req?.headers) return false
  const headers = req.headers
  const expectedHost = new URL(origin).host
  // 'x-forwarded-proto' can only be trusted when a configured reverse proxy
  // strips user-supplied forwarding headers. This module is not that proxy.
  return headers.origin === origin &&
    headers.host === expectedHost &&
    headers['x-forwarded-proto'] === 'https' &&
    headers['sec-fetch-site'] === 'same-origin' &&
    headers['content-type'] === 'application/json' &&
    typeof headers['x-mentoria-csrf'] === 'string' &&
    CSRF.test(headers['x-mentoria-csrf'])
}

function csrfMatches(received, serverToken) {
  if (typeof serverToken !== 'string' || !CSRF.test(serverToken)) return false
  const a = Buffer.from(received, 'utf8')
  const b = Buffer.from(serverToken, 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

function validSession(value, now) {
  return value && typeof value === 'object' &&
    typeof value.principalId === 'string' && PRINCIPAL.test(value.principalId) &&
    typeof value.expiresAtMs === 'number' && Number.isSafeInteger(value.expiresAtMs) &&
    value.expiresAtMs > now &&
    typeof value.csrfToken === 'string' && CSRF.test(value.csrfToken)
}

/**
 * Uses a fixed server-approved notice and exact origin. No caller can supply
 * approved notice text, policy digest or a fake session via the request body.
 * Even configured with providers, this is ONLY a server contract; do not mount
 * until the transport, session/OTP ports and approval gates are implemented.
 */
export function createMentoriaCommercialConsentBoundary(deps = {}) {
  const approvedText = deps.approvedNoticeText
  const digest = typeof approvedText === 'string'
    ? createHash('sha256').update(approvedText, 'utf8').digest('hex') : null
  const configured = deps.enabled === true &&
    isValidOrigin(deps.expectedOrigin) &&
    typeof approvedText === 'string' && approvedText.trim().length >= 80 &&
    approvedText.length <= 3000 &&
    typeof deps.approvedNoticeVersion === 'string' &&
    VERSION.test(deps.approvedNoticeVersion) &&
    typeof deps.authenticateLeadSession === 'function' &&
    typeof deps.beginChallenge === 'function' &&
    typeof deps.confirmChallenge === 'function'

  return async function evaluate({ request, rawBody } = {}) {
    if (!configured) return unavailable()
    if (!checkHeaders(request, deps.expectedOrigin)) return denied()
    const body = parseCanonicalJson(rawBody)
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        !Object.hasOwn(body, 'action')) return badBody()
    const common = body.purpose === PURPOSE &&
      body.consentDecision === 'agree' &&
      body.noticeVersion === deps.approvedNoticeVersion &&
      body.noticeDigest === digest
    if (!common) return denied()

    let action
    if (hasExactFields(body, ['action', 'leadPhone', 'purpose', 'consentDecision', 'noticeVersion', 'noticeDigest']) &&
        body.action === 'begin' && typeof body.leadPhone === 'string' && PHONE.test(body.leadPhone)) {
      action = 'begin'
    } else if (hasExactFields(body, ['action', 'challengeId', 'code', 'purpose', 'consentDecision', 'noticeVersion', 'noticeDigest']) &&
        body.action === 'confirm' && typeof body.challengeId === 'string' &&
        CHALLENGE.test(body.challengeId) && typeof body.code === 'string' && CODE.test(body.code)) {
      action = 'confirm'
    } else {
      return badBody()
    }

    try {
      const now = (deps.now ?? Date.now)()
      if (!Number.isSafeInteger(now) || now <= 0) return denied()
      // authenticateLeadSession MUST independently verify an HttpOnly signed
      // session against a durable backend and return its server-held CSRF token.
      const session = await deps.authenticateLeadSession(request)
      if (!validSession(session, now) ||
          !csrfMatches(request.headers['x-mentoria-csrf'], session.csrfToken)) return denied()
      const context = {
        sessionId: session.principalId,
        purpose: PURPOSE,
        noticeVersion: deps.approvedNoticeVersion,
        noticeDigest: digest,
      }
      if (action === 'begin') {
        // Trusted backend MUST persist session/phone/challenge/SID/notice
        // binding, antiabuse budget and explicit affirmative action atomically.
        const result = await deps.beginChallenge({ ...context, leadPhone: body.leadPhone })
        if (!result || result.status !== 'pending' ||
            typeof result.challengeId !== 'string' || !CHALLENGE.test(result.challengeId)) return denied()
        return allow({ status: 'pending', challengeId: result.challengeId })
      }
      // Trusted backend MUST consume the actual OTP/proof and record signed
      // scoped consent with a revocation lifecycle. This result is NOT CRM access.
      const result = await deps.confirmChallenge({
        ...context, challengeId: body.challengeId, code: body.code,
      })
      return result?.status === 'accepted'
        ? allow({ status: 'accepted' }) : denied()
    } catch {
      // Never return a provider exception: it may include PII or credentials.
      return denied()
    }
  }
}
