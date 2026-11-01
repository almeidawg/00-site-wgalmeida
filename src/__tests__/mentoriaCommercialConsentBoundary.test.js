import { describe, it, expect, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { createMentoriaCommercialConsentBoundary } from '../../api/_mentoriaCommercialConsentBoundary.js'

const ORIGIN = 'https://mentoria.wgalmeida.com.br'
const CSRF = 'synthetic_CSRF_TOKEN_abcdefghijklmnopqrstuvwxyz12345'
const sessionId = 'lead_session_abcdefgh1234567890'
const NOTICE = 'Texto integral fictício de aviso comercial, estritamente para testes. Não constitui autorização jurídica aprovada e nunca deve ser exibido em produção.'
const digest = createHash('sha256').update(NOTICE).digest('hex')
const CHALLENGE = 'Challenge_abcdefghij123456789'
const phone = '5511987654321'
const shared = {
  purpose: 'mentoria_commercial_contact',
  consentDecision: 'agree',
  noticeVersion: 'synthetic-v1',
  noticeDigest: digest,
}
const start = { action: 'begin', leadPhone: phone, ...shared }
const confirm = { action: 'confirm', challengeId: CHALLENGE, code: '123456', ...shared }
const req = (overrides = {}) => ({
  method: 'POST',
  headers: {
    origin: ORIGIN,
    host: 'mentoria.wgalmeida.com.br',
    'x-forwarded-proto': 'https',
    'sec-fetch-site': 'same-origin',
    'content-type': 'application/json',
    'x-mentoria-csrf': CSRF,
    ...overrides,
  },
})
const body = (value) => Buffer.from(JSON.stringify(value), 'utf8')
const fixture = (overrides = {}) => {
  const ports = {
    enabled: true,
    expectedOrigin: ORIGIN,
    approvedNoticeText: NOTICE,
    approvedNoticeVersion: 'synthetic-v1',
    authenticateLeadSession: vi.fn(async () => ({
      principalId: sessionId, expiresAtMs: 1_800_000_060_000, csrfToken: CSRF,
    })),
    beginChallenge: vi.fn(async () => ({ status: 'pending', challengeId: CHALLENGE })),
    confirmChallenge: vi.fn(async () => ({ status: 'accepted' })),
    now: () => 1_800_000_000_000,
    ...overrides,
  }
  return { ports, gate: createMentoriaCommercialConsentBoundary(ports) }
}

describe('Mentoria server-side consent boundary (NOT MOUNTED)', () => {
  it('denies by default: no session, notice, ports or explicit server enablement', async () => {
    expect(await createMentoriaCommercialConsentBoundary()({ request: req(), rawBody: body(start) }))
      .toEqual({ httpStatus: 503, payload: { status: 'unavailable' } })
    for (const overrides of [
      { enabled: false }, { approvedNoticeText: 'short' }, { approvedNoticeVersion: 'x' },
      { expectedOrigin: 'http://mentoria.wgalmeida.com.br' },
      { expectedOrigin: 'https://mentoria.wgalmeida.com.br/path' },
      { expectedOrigin: 'https://localhost' },
      { expectedOrigin: 'https://preview.vercel.app' },
      { authenticateLeadSession: null }, { confirmChallenge: undefined },
    ]) {
      const { gate, ports } = fixture(overrides)
      expect(await gate({ request: req(), rawBody: body(start) })).toEqual({
        httpStatus: 503, payload: { status: 'unavailable' },
      })
      expect(ports.beginChallenge).not.toHaveBeenCalled()
    }
  })

  it('permits pending challenge only with verified session, CSRF and exact approved notice', async () => {
    const { gate, ports } = fixture()
    const result = await gate({ request: req(), rawBody: body(start) })
    expect(result).toEqual({ httpStatus: 200, payload: { status: 'pending', challengeId: CHALLENGE } })
    expect(ports.beginChallenge).toHaveBeenCalledOnce()
    expect(ports.beginChallenge).toHaveBeenCalledWith({
      sessionId, leadPhone: phone, purpose: 'mentoria_commercial_contact',
      noticeVersion: 'synthetic-v1', noticeDigest: digest,
    })
  })

  it('rejects localhost, preview and cross-origin headers unlike shared requestGuard', async () => {
    for (const headers of [
      { origin: 'https://preview.vercel.app' },
      { origin: 'https://mentoria.wgalmeida.com.br.evil.test' },
      { origin: undefined }, { host: 'evil.test' },
      { host: 'wgalmeida.com.br' }, { 'x-forwarded-proto': 'http' },
      { 'x-forwarded-proto': undefined }, { 'sec-fetch-site': 'cross-site' },
      { 'sec-fetch-site': undefined }, { 'content-type': 'application/x-www-form-urlencoded' },
      { 'content-type': 'text/plain' }, { 'x-mentoria-csrf': undefined },
    ]) {
      const { gate, ports } = fixture()
      const response = await gate({ request: req(headers), rawBody: body(start) })
      expect(response.httpStatus).toBe(403)
      expect(ports.authenticateLeadSession).not.toHaveBeenCalled()
      expect(ports.beginChallenge).not.toHaveBeenCalled()
    }
  })

  it('requires POST and a canonical JSON body with no hidden duplicate keys', async () => {
    const variants = [
      { request: { ...req(), method: 'GET' }, rawBody: body(start), status: 403 },
      { request: req(), rawBody: JSON.stringify(start), status: 400 },
      { request: req(), rawBody: Buffer.from(' { "action": "begin" }'), status: 400 },
      { request: req(), rawBody: Buffer.from('{}'), status: 400 },
      { request: req(), rawBody: Buffer.from('{"action":"begin","action":"confirm"}'), status: 400 },
      { request: req(), rawBody: Buffer.alloc(1025, 'x'), status: 400 },
      { request: req(), rawBody: Buffer.from(''), status: 400 },
    ]
    for (const { request, rawBody, status } of variants) {
      const { gate, ports } = fixture()
      expect((await gate({ request, rawBody })).httpStatus).toBe(status)
      expect(ports.authenticateLeadSession).not.toHaveBeenCalled()
    }
  })

  it('strictly rejects extra keys, media, PII fields and unapproved policy', async () => {
    const variants = [
      { ...start, chat: 'private data' },
      { ...start, name: 'unknown' },
      { ...start, otp: '123456' },
      { ...start, leadPhone: '123@lid' },
      { ...start, consentDecision: 'decline' },
      { ...start, purpose: 'marketing_all' },
      { ...start, noticeDigest: '0'.repeat(64) },
      { ...start, noticeVersion: 'other-v1' },
      { ...confirm, leadPhone: phone },
      { ...confirm, code: 'fake' },
      { ...confirm, challengeId: 'short' },
    ]
    for (const value of variants) {
      const { gate, ports } = fixture()
      expect((await gate({ request: req(), rawBody: body(value) })).httpStatus).not.toBe(200)
      expect(ports.authenticateLeadSession).not.toHaveBeenCalled()
    }
  })

  it('does not authenticate via body; authentication callback failure is sanitized', async () => {
    const { gate, ports } = fixture({
      authenticateLeadSession: vi.fn(async () => { throw Error('secret value + phone 5511987654321') }),
    })
    expect(await gate({ request: req(), rawBody: body({ ...start }) }))
      .toEqual({ httpStatus: 403, payload: { status: 'denied' } })
    expect(ports.beginChallenge).not.toHaveBeenCalled()
  })

  it('checks an independently authenticated server session and expiry', async () => {
    for (const returned of [
      null,
      { principalId: sessionId, expiresAtMs: 1_799_999_999_999, csrfToken: CSRF },
      { principalId: 'bad', expiresAtMs: 1_800_000_060_000, csrfToken: CSRF },
      { principalId: sessionId, expiresAtMs: 1_800_000_060_000, csrfToken: 'short' },
    ]) {
      const { gate, ports } = fixture({ authenticateLeadSession: vi.fn(async () => returned) })
      expect((await gate({ request: req(), rawBody: body(start) })).httpStatus).toBe(403)
      expect(ports.beginChallenge).not.toHaveBeenCalled()
    }
  })

  it('checks CSRF token in constant time with server-returned token', async () => {
    const { gate, ports } = fixture()
    expect((await gate({ request: req({ 'x-mentoria-csrf': 'a'.repeat(CSRF.length) }), rawBody: body(start) })).httpStatus).toBe(403)
    expect(ports.beginChallenge).not.toHaveBeenCalled()
  })

  it('does not mistake a pending Twilio check or a CRM write for consent', async () => {
    for (const result of [
      { status: 'pending' }, { status: 'approved' },
      { status: 'accepted', phone }, null,
    ]) {
      const { gate } = fixture({ confirmChallenge: vi.fn(async () => result) })
      const response = await gate({ request: req(), rawBody: body(confirm) })
      // Response stays intentionally narrow; even if port returns extra PII,
      // approved receipt or CRM fields are NEVER exposed.
      if (result?.status === 'accepted') expect(response).toEqual({ httpStatus: 200, payload: { status: 'accepted' } })
      else expect(response).toEqual({ httpStatus: 403, payload: { status: 'denied' } })
      expect(JSON.stringify(response)).not.toContain(phone)
    }
  })

  it('only forwards scoped confirm fields and never the raw request or cookies', async () => {
    const { gate, ports } = fixture()
    expect(await gate({ request: req(), rawBody: body(confirm) })).toEqual({
      httpStatus: 200, payload: { status: 'accepted' },
    })
    expect(ports.confirmChallenge).toHaveBeenCalledWith({
      sessionId, challengeId: CHALLENGE, code: '123456',
      purpose: 'mentoria_commercial_contact', noticeVersion: 'synthetic-v1',
      noticeDigest: digest,
    })
  })

  it('does not expose provider error, secret or PII in any failure payload', async () => {
    const { gate } = fixture({
      beginChallenge: vi.fn(async () => { throw Error('Provider +55 11 98765-4321 password synthetic') }),
    })
    const response = await gate({ request: req(), rawBody: body(start) })
    expect(response).toEqual({ httpStatus: 403, payload: { status: 'denied' } })
    expect(JSON.stringify(response)).not.toMatch(/551198|98765|password/i)
  })

  it('rejects malformed returned challenge identifiers and non-boolean trusted auth', async () => {
    const { gate } = fixture({ beginChallenge: vi.fn(async () => ({ status: 'pending', challengeId: '123@lid' })) })
    expect((await gate({ request: req(), rawBody: body(start) })).httpStatus).toBe(403)
  })
})
