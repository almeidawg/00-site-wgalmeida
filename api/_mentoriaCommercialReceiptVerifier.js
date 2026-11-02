import { createHash, createPublicKey, verify as verifySignature } from 'node:crypto'

/**
 * PRIVATE, UNMOUNTED verifier for a FUTURE commercial consent receipt.
 * This module NEVER issues consent, sends OTPs or writes to a CRM.
 * It requires an independently verified issuer key and a strongly consistent
 * backend revocation lookup. Browser state and Meta consent are not authority.
 *
 * Signers must sign UTF-8 JSON.stringify(claims) in RECEIPT_CLAIMS order.
 * Store-side receipt creation/OTP validation must be atomic and audited.
 */
const PURPOSE = 'mentoria_commercial_contact'
const SHA256 = /^[a-f0-9]{64}$/
const TOKEN = /^[A-Za-z][A-Za-z0-9_-]{15,95}$/
const VERSION = /^[A-Za-z0-9][A-Za-z0-9_.-]{2,39}$/
const ISSUER = /^[a-z][a-z0-9_.:-]{5,99}$/
const KEY_ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{2,99}$/
const FINGERPRINT = /^[a-f0-9]{64}$/ // keyed HMAC of phone, NEVER unsalted SHA-256
const RECEIPT_CLAIMS = [
  'receiptId', 'principalId', 'challengeId', 'phoneFingerprint',
  'issuer', 'keyId', 'purpose', 'noticeVersion', 'noticeDigest',
  'otpVerifiedAtMs', 'consentRecordedAtMs',
]
const MAX_VERIFY_TO_CONSENT_MS = 5 * 60 * 1000
const unavailable = () => ({ status: 'unavailable' })
const denied = () => ({ status: 'denied' })

function exactKeys(value, keys) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === keys.length &&
    Object.keys(value).every((key) => keys.includes(key))
}

function isValidClaims(claims, expected, now) {
  if (!exactKeys(claims, RECEIPT_CLAIMS)) return false
  if (![claims.receiptId, claims.principalId, claims.challengeId].every(
    (value) => typeof value === 'string' && TOKEN.test(value))) return false
  if (typeof claims.phoneFingerprint !== 'string' || !FINGERPRINT.test(claims.phoneFingerprint)) return false
  if (claims.issuer !== expected.issuer || claims.keyId !== expected.keyId ||
      claims.purpose !== PURPOSE || claims.noticeVersion !== expected.noticeVersion ||
      claims.noticeDigest !== expected.noticeDigest ||
      claims.principalId !== expected.principalId) return false
  const verifiedAt = claims.otpVerifiedAtMs
  const recordedAt = claims.consentRecordedAtMs
  return Number.isSafeInteger(verifiedAt) && Number.isSafeInteger(recordedAt) &&
    verifiedAt > 0 && verifiedAt <= recordedAt && recordedAt <= now &&
    recordedAt - verifiedAt <= MAX_VERIFY_TO_CONSENT_MS
}

function signatureBytes(encoded) {
  if (typeof encoded !== 'string' || !/^[A-Za-z0-9_-]{86}$/.test(encoded)) return null
  const raw = Buffer.from(encoded, 'base64url')
  return raw.length === 64 && raw.toString('base64url') === encoded ? raw : null
}

/**
 * Returns only minimal status. Expects a trusted, authoritative server-side
 * principal and an ACTIVE revocation record from a durable datastore.
 * This verifier must never be configured from browser-controlled arguments.
 */
export function createMentoriaCommercialReceiptVerifier(deps = {}) {
  const noticeDigest = typeof deps.approvedNoticeText === 'string'
    ? createHash('sha256').update(deps.approvedNoticeText, 'utf8').digest('hex')
    : null
  let trustedPublicKey
  try {
    trustedPublicKey = deps.publicKey?.type === 'public'
      ? deps.publicKey : createPublicKey(deps.publicKey)
  } catch {
    // Invalid public key leaves the verifier unavailable; no fallback key.
  }
  const configured = deps.enabled === true &&
    trustedPublicKey?.asymmetricKeyType === 'ed25519' &&
    typeof deps.approvedNoticeText === 'string' &&
    deps.approvedNoticeText.trim().length >= 80 && deps.approvedNoticeText.length <= 3000 &&
    typeof deps.approvedNoticeVersion === 'string' && VERSION.test(deps.approvedNoticeVersion) &&
    typeof deps.expectedIssuer === 'string' && ISSUER.test(deps.expectedIssuer) &&
    typeof deps.expectedKeyId === 'string' && KEY_ID.test(deps.expectedKeyId) &&
    deps.publicKey != null && typeof deps.readConsentStatus === 'function' &&
    typeof deps.now === 'function'

  return async function verifyReceipt({ receipt, authenticatedPrincipalId } = {}) {
    if (!configured) return unavailable()
    if (typeof authenticatedPrincipalId !== 'string' || !TOKEN.test(authenticatedPrincipalId)) return denied()
    if (!exactKeys(receipt, ['claims', 'signature'])) return denied()
    const claims = receipt.claims
    const signature = signatureBytes(receipt.signature)
    if (!signature) return denied()
    try {
      const now = deps.now()
      if (!Number.isSafeInteger(now) || now <= 0 || !isValidClaims(claims, {
        issuer: deps.expectedIssuer,
        keyId: deps.expectedKeyId,
        noticeVersion: deps.approvedNoticeVersion,
        noticeDigest,
        principalId: authenticatedPrincipalId,
      }, now)) return denied()

      const signedData = JSON.stringify(Object.fromEntries(RECEIPT_CLAIMS.map((key) => [key, claims[key]])))
      if (!verifySignature(null, Buffer.from(signedData, 'utf8'), trustedPublicKey, signature)) return denied()

      // Never trust a signature alone: revocation and subject binding must be
      // checked against the authoritative store on EVERY verification.
      const record = await deps.readConsentStatus({
        receiptId: claims.receiptId,
        principalId: claims.principalId,
        noticeDigest,
      })
      if (!exactKeys(record, ['state', 'receiptId', 'principalId', 'noticeDigest']) ||
          record.state !== 'active' || record.receiptId !== claims.receiptId ||
          record.principalId !== claims.principalId || record.noticeDigest !== noticeDigest) return denied()
      return { status: 'verified' }
    } catch {
      // Fail-closed on invalid keys, stale stores, or provider errors.
      return denied()
    }
  }
}
