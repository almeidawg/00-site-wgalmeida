import { describe, expect, it, vi } from 'vitest'
import { createHash, createHmac, generateKeyPairSync, randomBytes, sign } from 'node:crypto'
import { createMentoriaCommercialReceiptVerifier } from '../../api/_mentoriaCommercialReceiptVerifier.js'

const NOW = 1_800_000_000_000
const NOTICE = 'Este é um aviso comercial inteiramente sintético para testes locais do contrato da Mentoria. Não corresponde a aceite jurídico nem pode ser publicado.'
const DIGEST = createHash('sha256').update(NOTICE, 'utf8').digest('hex')
const PRINCIPAL = 'Principal_abcdefghijklmnop'
const CHALLENGE = 'Challenge_abcdefghijklmnop'
const RECEIPT = 'Receipt_abcdefghijklmnop'
const CLAIM_KEYS = [
  'receiptId', 'principalId', 'challengeId', 'phoneFingerprint',
  'issuer', 'keyId', 'purpose', 'noticeVersion', 'noticeDigest',
  'otpVerifiedAtMs', 'consentRecordedAtMs',
]
const mockPhoneFingerprint = createHmac('sha256', randomBytes(32))
  .update('synthetic-phone-not-real')
  .digest('hex')

function ledgerRecord(patch = {}) {
  return {
    state: 'active',
    receiptId: RECEIPT,
    principalId: PRINCIPAL,
    challengeId: CHALLENGE,
    phoneFingerprint: mockPhoneFingerprint,
    purpose: 'mentoria_commercial_contact',
    noticeVersion: 'synthetic-v1',
    noticeDigest: DIGEST,
    otpVerifiedAtMs: NOW - 120_000,
    consentRecordedAtMs: NOW - 30_000,
    ...patch,
  }
}

function fixture(overrides = {}) {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const claims = {
    receiptId: RECEIPT,
    principalId: PRINCIPAL,
    challengeId: CHALLENGE,
    phoneFingerprint: mockPhoneFingerprint,
    issuer: 'wg.mentoria.consent',
    keyId: 'synthetic-2026-v1',
    purpose: 'mentoria_commercial_contact',
    noticeVersion: 'synthetic-v1',
    noticeDigest: DIGEST,
    otpVerifiedAtMs: NOW - 120_000,
    consentRecordedAtMs: NOW - 30_000,
  }
  const readConsentStatus = vi.fn(async () => ledgerRecord())
  const deps = {
    enabled: true,
    approvedNoticeText: NOTICE,
    approvedNoticeVersion: 'synthetic-v1',
    expectedIssuer: 'wg.mentoria.consent',
    expectedKeyId: 'synthetic-2026-v1',
    publicKey,
    readConsentStatus,
    now: () => NOW,
    ...overrides,
  }
  const signatureOf = (record) => {
    const canonical = Object.fromEntries(CLAIM_KEYS.map((key) => [key, record[key]]))
    return sign(null, Buffer.from(JSON.stringify(canonical), 'utf8'), privateKey).toString('base64url')
  }
  const receipt = { claims, signature: signatureOf(claims) }
  return {
    claims, receipt, readConsentStatus, signatureOf,
    gate: createMentoriaCommercialReceiptVerifier(deps),
  }
}

describe('Mentoria commercial receipt verifier (private, NOT MOUNTED)', () => {
  it('fails closed without explicit activation, trusted key, status port or legal notice', async () => {
    const variants = [
      { enabled: false }, { publicKey: null },
      { approvedNoticeText: 'too short' }, { approvedNoticeVersion: 'x' },
      { expectedIssuer: 'bad' }, { expectedKeyId: 'x' },
      { readConsentStatus: undefined }, { now: undefined },
    ]
    for (const patch of variants) {
      const f = fixture(patch)
      expect(await f.gate({ receipt: f.receipt, authenticatedPrincipalId: PRINCIPAL }))
        .toEqual({ status: 'unavailable' })
    }
    const { receipt } = fixture()
    expect(await createMentoriaCommercialReceiptVerifier()({
      receipt, authenticatedPrincipalId: PRINCIPAL,
    })).toEqual({ status: 'unavailable' })
  })

  it('verifies a synthetic Ed25519 proof with matching authoritative active status', async () => {
    const { gate, receipt, readConsentStatus } = fixture()
    expect(await gate({ receipt, authenticatedPrincipalId: PRINCIPAL }))
      .toEqual({ status: 'verified' })
    expect(readConsentStatus).toHaveBeenCalledWith({
      receiptId: RECEIPT, principalId: PRINCIPAL, challengeId: CHALLENGE, noticeDigest: DIGEST,
    })
    expect(JSON.stringify(receipt)).not.toContain('synthetic-phone-not-real')
  })

  it('rejects already revoked, missing and pending receipts, even with a valid signature', async () => {
    for (const state of ['revoked', 'pending', 'consumed', 'expired', null]) {
      const readConsentStatus = vi.fn(async () =>
        state === null ? null : ledgerRecord({ state }))
      const f = fixture({ readConsentStatus })
      expect(await f.gate({ receipt: f.receipt, authenticatedPrincipalId: PRINCIPAL }))
        .toEqual({ status: 'denied' })
      expect(readConsentStatus).toHaveBeenCalledOnce()
    }
  })

  it('rejects current subject mismatch before a status-store lookup', async () => {
    const f = fixture()
    expect(await f.gate({ receipt: f.receipt, authenticatedPrincipalId: 'Different_abcdefghijklmnop' }))
      .toEqual({ status: 'denied' })
    expect(f.readConsentStatus).not.toHaveBeenCalled()
  })

  it('rejects modified notice digest, purpose or issuer even when re-signed in a synthetic fixture', async () => {
    for (const patch of [
      { purpose: 'meta_pixel' }, { noticeDigest: '0'.repeat(64) },
      { issuer: 'unauthorized.issuer' }, { keyId: 'other-key-v1' },
      { noticeVersion: 'unauthorized-v1' },
    ]) {
      const f = fixture()
      const altered = { ...f.claims, ...patch }
      expect(await f.gate({ receipt: { claims: altered, signature: f.signatureOf(altered) },
        authenticatedPrincipalId: PRINCIPAL })).toEqual({ status: 'denied' })
      expect(f.readConsentStatus).not.toHaveBeenCalled()
    }
  })

  it('rejects signature tampering and extra noncanonical fields before touching the datastore', async () => {
    const f = fixture()
    for (const receipt of [
      { ...f.receipt, signature: 'a'.repeat(86) },
      { ...f.receipt, signature: 'not_base64' },
      { ...f.receipt, signature: f.receipt.signature + '=' },
      { ...f.receipt, surprise: true },
      { ...f.receipt, claims: { ...f.claims, leadPhone: 'synthetic' } },
      { ...f.receipt, claims: { ...f.claims, challengeId: 'Challenge_different12345678' } },
      { ...f.receipt, claims: { ...f.claims, phoneFingerprint: '0'.repeat(64) } },
    ]) {
      expect(await f.gate({ receipt, authenticatedPrincipalId: PRINCIPAL }))
        .toEqual({ status: 'denied' })
    }
    expect(f.readConsentStatus).not.toHaveBeenCalled()
  })

  it('rejects impossible, stale-to-consent and future-dated OTP evidence', async () => {
    const variants = [
      { otpVerifiedAtMs: NOW + 100 },
      { consentRecordedAtMs: NOW + 1 },
      { otpVerifiedAtMs: NOW - 400_000, consentRecordedAtMs: NOW - 1 },
      { otpVerifiedAtMs: NOW - 10, consentRecordedAtMs: NOW - 20 },
      { otpVerifiedAtMs: 'invalid' }, { consentRecordedAtMs: 0 },
    ]
    for (const patch of variants) {
      const f = fixture()
      const claims = { ...f.claims, ...patch }
      expect(await f.gate({ receipt: { claims, signature: f.signatureOf(claims) },
        authenticatedPrincipalId: PRINCIPAL })).toEqual({ status: 'denied' })
      expect(f.readConsentStatus).not.toHaveBeenCalled()
    }
  })

  it('rejects status records for a different subject, receipt or policy version', async () => {
    for (const patch of [
      { receiptId: 'OtherReceipt_abcdefghijklmnop' },
      { principalId: 'OtherPrincipal_abcdefghijklmnop' },
      { noticeDigest: '0'.repeat(64) },
      { challengeId: 'DifferentChallenge_abcdefghijklmnop' },
      { phoneFingerprint: '0'.repeat(64) },
      { otpVerifiedAtMs: NOW - 100_000 },
      { consentRecordedAtMs: NOW - 35_000 },
      { noticeVersion: 'different-v1' },
      { purpose: 'meta_pixel' },
      { extraField: 'untrusted' },
    ]) {
      const f = fixture({ readConsentStatus: vi.fn(async () => ledgerRecord(patch)) })
      expect(await f.gate({ receipt: f.receipt, authenticatedPrincipalId: PRINCIPAL }))
        .toEqual({ status: 'denied' })
    }
  })

  it('denies even correctly signed OTP claims that diverge from the authoritative ledger', async () => {
    for (const patch of [
      { challengeId: 'DifferentChallenge_abcdefghijklmnop' },
      { phoneFingerprint: '0'.repeat(64) },
      { otpVerifiedAtMs: NOW - 90_000 },
      { consentRecordedAtMs: NOW - 60_000 },
    ]) {
      const f = fixture()
      const claims = { ...f.claims, ...patch }
      expect(await f.gate({
        receipt: { claims, signature: f.signatureOf(claims) },
        authenticatedPrincipalId: PRINCIPAL,
      })).toEqual({ status: 'denied' })
      expect(f.readConsentStatus).toHaveBeenCalledOnce()
    }
  })

  it('rejects incomplete ledger rows that only claim an active consent status', async () => {
    const f = fixture({ readConsentStatus: vi.fn(async () => ({
      state: 'active', receiptId: RECEIPT, principalId: PRINCIPAL, noticeDigest: DIGEST,
    })) })
    expect(await f.gate({ receipt: f.receipt, authenticatedPrincipalId: PRINCIPAL }))
      .toEqual({ status: 'denied' })
  })

  it('fails closed on stale status stores, invalid verification keys and provider exceptions', async () => {
    const offline = fixture({ readConsentStatus: vi.fn(async () => { throw Error('upstream secret PRIVATE') }) })
    expect(await offline.gate({ receipt: offline.receipt, authenticatedPrincipalId: PRINCIPAL }))
      .toEqual({ status: 'denied' })
    const invalidKey = fixture({ publicKey: 'invalid-PEM' })
    expect(await invalidKey.gate({ receipt: invalidKey.receipt, authenticatedPrincipalId: PRINCIPAL }))
      .toEqual({ status: 'unavailable' })
    const ecdsaKey = generateKeyPairSync('ec', { namedCurve: 'prime256v1' }).publicKey
    const wrongAlgorithm = fixture({ publicKey: ecdsaKey })
    expect(await wrongAlgorithm.gate({
      receipt: wrongAlgorithm.receipt, authenticatedPrincipalId: PRINCIPAL,
    })).toEqual({ status: 'unavailable' })
  })

  it('rejects unauthenticated and malformed principal identifiers without querying the store', async () => {
    const f = fixture()
    for (const principal of [undefined, null, '', 'bad', 'not/valid@principal', 123]) {
      expect(await f.gate({ receipt: f.receipt, authenticatedPrincipalId: principal }))
        .toEqual({ status: 'denied' })
    }
    expect(f.readConsentStatus).not.toHaveBeenCalled()
  })
})
