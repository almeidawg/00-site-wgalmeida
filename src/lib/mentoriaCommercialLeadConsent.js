/**
 * Contract for a FUTURE independent Mentoria commercial lead consent service.
 *
 * The existing 'wg_mentoria_consent_v1' cookie/localStorage choice controls
 * Meta advertising measurement ONLY, and must not be used as lead opt-in.
 * This file makes no network calls, reads no personal conversations and
 * neither stores nor transmits contact details by itself.
 */
export const MENTORIA_LEAD_PURPOSE = 'mentoria_commercial_contact'

const PHONE = /^55\d{10,11}$/
const DIGEST = /^[a-f0-9]{64}$/
const VERSION = /^[A-Za-z0-9][A-Za-z0-9_.-]{2,39}$/
const CHALLENGE = /^[A-Za-z][A-Za-z0-9_-]{15,95}$/
const CODE = /^\d{4,10}$/

export function normalizeMentoriaLeadPhone(value) {
  if (typeof value !== 'string' || value.length > 50) return null
  const digits = value.replace(/[ ()+-]/g, '')
  return PHONE.test(digits) ? digits : null
}

export function validateMentoriaLeadNotice(notice) {
  if (!notice || typeof notice !== 'object' || Array.isArray(notice)) return false
  if (notice.purpose !== MENTORIA_LEAD_PURPOSE) return false
  if (typeof notice.text !== 'string' || notice.text.trim().length < 80 || notice.text.length > 3000) return false
  if (typeof notice.version !== 'string' || !VERSION.test(notice.version)) return false
  if (typeof notice.sha256 !== 'string' || !DIGEST.test(notice.sha256)) return false
  if (notice.privacyPath !== '/privacidade') return false
  return true
}

/**
 * UX readiness is NOT an authorization boundary. The actual backend MUST
 * independently verify the approved notice digest, lead interaction, session,
 * CSRF, challenge expiry, provider OTP and revocation.
 */
export function isMentoriaLeadOptInReady({ enabled, notice, requestChallenge, confirmConsent } = {}) {
  return enabled === true && validateMentoriaLeadNotice(notice) &&
    typeof requestChallenge === 'function' && typeof confirmConsent === 'function'
}

export function isMentoriaChallengePending(response) {
  return Boolean(response && typeof response === 'object' && !Array.isArray(response) &&
    response.status === 'pending' &&
    typeof response.challengeId === 'string' && CHALLENGE.test(response.challengeId))
}

export function isMentoriaCode(value) {
  return typeof value === 'string' && CODE.test(value)
}

export function isMentoriaConsentAccepted(response) {
  // Display feedback only: a browser-visible response is NOT evidence of
  // independently verified consent or authorization to write to the CRM.
  return Boolean(response && typeof response === 'object' && !Array.isArray(response) &&
    response.status === 'accepted')
}
