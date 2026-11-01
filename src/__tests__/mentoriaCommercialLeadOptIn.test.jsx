import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { createMentoriaCommercialConsentBoundary } from '../../api/_mentoriaCommercialConsentBoundary.js'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import MentoriaCommercialLeadOptInForm from '@/components/MentoriaCommercialLeadOptInForm'
import {
  MENTORIA_LEAD_PURPOSE,
  isMentoriaLeadOptInReady,
  normalizeMentoriaLeadPhone,
  validateMentoriaLeadNotice,
} from '@/lib/mentoriaCommercialLeadConsent'
import { MENTORIA_CONSENT_KEY } from '@/lib/mentoriaConsent'

const sampleNoticeText = 'Texto fictício para testes automatizados: informação sobre contato comercial e privacidade. Não é um aviso jurídico aprovado nem deve ser publicado.'
const validNotice = {
  purpose: MENTORIA_LEAD_PURPOSE,
  version: 'synthetic-v1',
  sha256: createHash('sha256').update(sampleNoticeText, 'utf8').digest('hex'),
  privacyPath: '/privacidade',
  text: sampleNoticeText,
}
const challenge = 'Challenge_Synthetic_1234567890'
const ready = (changes = {}) => ({
  enabled: true,
  notice: validNotice,
  requestChallenge: vi.fn(async () => ({ status: 'pending', challengeId: challenge })),
  confirmConsent: vi.fn(async () => ({ status: 'accepted' })),
  ...changes,
})
const getPhone = () => screen.getByLabelText(/telefone com ddd/i)
const getAgree = () => screen.getByRole('checkbox')

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('contrato de consentimento comercial — distinto do Pixel', () => {
  it('não infere opt-in de localStorage do Pixel Meta', () => {
    window.localStorage.setItem(MENTORIA_CONSENT_KEY, 'granted')
    const props = ready({ enabled: false })
    const { container } = render(<MentoriaCommercialLeadOptInForm {...props} />)
    expect(container).toBeEmptyDOMElement()
    expect(props.requestChallenge).not.toHaveBeenCalled()
    expect(props.confirmConsent).not.toHaveBeenCalled()
  })

  it('sem aviso jurídico aprovado, digest, finalidade ou callbacks permanece invisível', () => {
    const cases = [
      { notice: null },
      { notice: { ...validNotice, purpose: 'meta_measurement' } },
      { notice: { ...validNotice, sha256: '' } },
      { notice: { ...validNotice, text: 'Curto' } },
      { notice: { ...validNotice, privacyPath: 'https://attacker.example' } },
      { requestChallenge: null },
      { confirmConsent: undefined },
    ]
    for (const change of cases) {
      const p = ready(change)
      expect(isMentoriaLeadOptInReady(p)).toBe(false)
      const { container, unmount } = render(<MentoriaCommercialLeadOptInForm {...p} />)
      expect(container).toBeEmptyDOMElement()
      unmount()
    }
  })

  it('valida finalidade específica e telefone sem aceitar JID ou extensão arbitrária', () => {
    expect(validateMentoriaLeadNotice(validNotice)).toBe(true)
    expect(normalizeMentoriaLeadPhone('55 (11) 98765-4321')).toBe('5511987654321')
    for (const value of [
      '', '123@lid', '+1 (212) 555-1212',
      '5511987654321@s.whatsapp.net', '5511987654321;ext=1',
      'x'.repeat(51),
    ]) expect(normalizeMentoriaLeadPhone(value)).toBeNull()
  })

  it('mostra a finalidade, política e checkbox desmarcado, sem disparar request', () => {
    const props = ready()
    render(<MentoriaCommercialLeadOptInForm {...props} />)
    expect(screen.getByText(validNotice.text)).toBeTruthy()
    expect(screen.getByRole('link', { name: /política de privacidade/i }).getAttribute('href')).toBe('/privacidade')
    expect(getAgree().checked).toBe(false)
    expect(screen.getByRole('button', { name: /solicitar código/i }).disabled).toBe(true)
    expect(props.requestChallenge).not.toHaveBeenCalled()
  })

  it('exige aceite explícito e número brasileiro válido antes de solicitar desafio', async () => {
    const props = ready()
    render(<MentoriaCommercialLeadOptInForm {...props} />)
    fireEvent.change(getPhone(), { target: { value: '123@lid' } })
    fireEvent.click(getAgree())
    expect(screen.getByRole('button', { name: /solicitar código/i }).disabled).toBe(true)
    expect(props.requestChallenge).not.toHaveBeenCalled()
    fireEvent.change(getPhone(), { target: { value: '55 (11) 98765-4321' } })
    fireEvent.click(screen.getByRole('button', { name: /solicitar código/i }))
    await waitFor(() => expect(props.requestChallenge).toHaveBeenCalledTimes(1))
    expect(props.requestChallenge).toHaveBeenCalledWith({
      action: 'begin',
      leadPhone: '5511987654321',
      consentDecision: 'agree',
      purpose: MENTORIA_LEAD_PURPOSE,
      noticeVersion: validNotice.version,
      noticeDigest: validNotice.sha256,
    })
    await waitFor(() => expect(screen.getByLabelText(/código enviado/i)).toBeTruthy())
    expect(screen.queryByLabelText(/telefone com ddd/i)).toBeNull()
    expect(window.localStorage.getItem(MENTORIA_CONSENT_KEY)).toBeNull()
    expect(props.confirmConsent).not.toHaveBeenCalled()
  })

  it('não prossegue se o backend não emitir desafio válido ou rejeitar', async () => {
    for (const response of [
      null,
      { status: 'approved' },
      { status: 'pending', challengeId: '123@lid' },
      { status: 'pending', challengeId: 'short' },
    ]) {
      const props = ready({ requestChallenge: vi.fn(async () => response) })
      const { unmount } = render(<MentoriaCommercialLeadOptInForm {...props} />)
      fireEvent.change(getPhone(), { target: { value: '5511987654321' } })
      fireEvent.click(getAgree())
      fireEvent.click(screen.getByRole('button', { name: /solicitar código/i }))
      await waitFor(() => expect(screen.getByRole('status')).toBeTruthy())
      expect(screen.queryByLabelText(/código enviado/i)).toBeNull()
      unmount()
    }
  })

  it('confirma somente com código válido e retorna o escopo completo ao backend', async () => {
    const props = ready()
    render(<MentoriaCommercialLeadOptInForm {...props} />)
    fireEvent.change(getPhone(), { target: { value: '5511987654321' } })
    fireEvent.click(getAgree())
    fireEvent.click(screen.getByRole('button', { name: /solicitar código/i }))
    await waitFor(() => expect(screen.getByLabelText(/código enviado/i)).toBeTruthy())
    fireEvent.change(screen.getByLabelText(/código enviado/i), { target: { value: 'invalid' } })
    expect(screen.getByRole('button', { name: /confirmar solicitação/i }).disabled).toBe(true)
    fireEvent.change(screen.getByLabelText(/código enviado/i), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: /confirmar solicitação/i }))
    await waitFor(() => expect(props.confirmConsent).toHaveBeenCalledTimes(1))
    expect(props.confirmConsent).toHaveBeenCalledWith({
      action: 'confirm',
      challengeId: challenge,
      code: '123456',
      consentDecision: 'agree',
      purpose: MENTORIA_LEAD_PURPOSE,
      noticeVersion: validNotice.version,
      noticeDigest: validNotice.sha256,
    })
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/solicitação recebida/i))
    expect(screen.getByRole('status').textContent).toMatch(/nenhum cadastro em crm/i)
    expect(screen.queryByLabelText(/código enviado/i)).toBeNull()
  })

  it('resposta recusada ou erro de verificação não exibe telefone/código/segredos', async () => {
    const props = ready({
      confirmConsent: vi.fn(async () => {
        throw Error('provider exception with 5511987654321 and OTP 123456')
      }),
    })
    render(<MentoriaCommercialLeadOptInForm {...props} />)
    fireEvent.change(getPhone(), { target: { value: '5511987654321' } })
    fireEvent.click(getAgree())
    fireEvent.click(screen.getByRole('button', { name: /solicitar código/i }))
    await waitFor(() => expect(screen.getByLabelText(/código enviado/i)).toBeTruthy())
    fireEvent.change(screen.getByLabelText(/código enviado/i), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: /confirmar solicitação/i }))
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy())
    const message = screen.getByRole('status').textContent
    expect(message).not.toContain('5511987654321')
    expect(message).not.toContain('123456')
    expect(message).toMatch(/não foi possível confirmar/i)
  })

  it('integra o payload exato do formulário com o backend de laboratório, sem rede', async () => {
    const sessionToken = 'synthetic_CSRF_TOKEN_abcdefghijklmnopqrstuvwxyz12345'
    const request = {
      method: 'POST',
      headers: {
        origin: 'https://mentoria.wgalmeida.com.br',
        host: 'mentoria.wgalmeida.com.br',
        'x-forwarded-proto': 'https',
        'sec-fetch-site': 'same-origin',
        'content-type': 'application/json',
        'x-mentoria-csrf': sessionToken,
      },
    }
    const serverBegin = vi.fn(async () => ({ status: 'pending', challengeId: challenge }))
    const serverConfirm = vi.fn(async () => ({ status: 'accepted' }))
    const gate = createMentoriaCommercialConsentBoundary({
      enabled: true,
      expectedOrigin: 'https://mentoria.wgalmeida.com.br',
      approvedNoticeText: sampleNoticeText,
      approvedNoticeVersion: validNotice.version,
      now: () => 1_800_000_000_000,
      authenticateLeadSession: async () => ({
        principalId: 'lead_session_abcdefgh1234567890',
        expiresAtMs: 1_800_000_060_000,
        csrfToken: sessionToken,
      }),
      beginChallenge: serverBegin,
      confirmChallenge: serverConfirm,
    })
    const submitLocally = async (payload) => {
      const response = await gate({
        request,
        rawBody: Buffer.from(JSON.stringify(payload), 'utf8'),
      })
      return response.payload
    }
    const props = ready({
      requestChallenge: vi.fn(submitLocally),
      confirmConsent: vi.fn(submitLocally),
    })
    render(<MentoriaCommercialLeadOptInForm {...props} />)
    fireEvent.change(getPhone(), { target: { value: '5511987654321' } })
    fireEvent.click(getAgree())
    fireEvent.click(screen.getByRole('button', { name: /solicitar código/i }))
    await waitFor(() => expect(screen.getByLabelText(/código enviado/i)).toBeTruthy())
    expect(props.requestChallenge).toHaveBeenCalledOnce()
    expect(props.requestChallenge.mock.calls[0][0].action).toBe('begin')
    expect(serverBegin).toHaveBeenCalledWith(expect.objectContaining({
      leadPhone: '5511987654321',
      noticeDigest: validNotice.sha256,
      purpose: MENTORIA_LEAD_PURPOSE,
    }))
    fireEvent.change(screen.getByLabelText(/código enviado/i), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: /confirmar solicitação/i }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/solicitação recebida/i))
    expect(props.confirmConsent).toHaveBeenCalledOnce()
    expect(props.confirmConsent.mock.calls[0][0].action).toBe('confirm')
    expect(serverConfirm).toHaveBeenCalledWith(expect.objectContaining({
      challengeId: challenge, code: '123456', noticeDigest: validNotice.sha256,
    }))
    expect(screen.getByRole('status').textContent).not.toContain('5511987654321')
    expect(window.localStorage.getItem(MENTORIA_CONSENT_KEY)).toBeNull()
  })

  it('aviso comercial com hash não aprovado pelo backend falha fechado antes de emitir desafio', async () => {
    const begin = vi.fn(async () => ({ status: 'pending', challengeId: challenge }))
    const gate = createMentoriaCommercialConsentBoundary({
      enabled: true,
      expectedOrigin: 'https://mentoria.wgalmeida.com.br',
      approvedNoticeText: sampleNoticeText,
      approvedNoticeVersion: validNotice.version,
      now: () => 1_800_000_000_000,
      authenticateLeadSession: vi.fn(),
      beginChallenge: begin,
      confirmChallenge: vi.fn(),
    })
    const requestChallenge = vi.fn(async (payload) => {
      const response = await gate({
        request: {
          method: 'POST',
          headers: {
            origin: 'https://mentoria.wgalmeida.com.br',
            host: 'mentoria.wgalmeida.com.br',
            'x-forwarded-proto': 'https',
            'sec-fetch-site': 'same-origin',
            'content-type': 'application/json',
            'x-mentoria-csrf': 'synthetic_CSRF_TOKEN_abcdefghijklmnopqrstuvwxyz12345',
          },
        },
        rawBody: Buffer.from(JSON.stringify(payload)),
      })
      return response.payload
    })
    const props = ready({
      notice: { ...validNotice, sha256: 'a'.repeat(64) },
      requestChallenge,
    })
    render(<MentoriaCommercialLeadOptInForm {...props} />)
    fireEvent.change(getPhone(), { target: { value: '5511987654321' } })
    fireEvent.click(getAgree())
    fireEvent.click(screen.getByRole('button', { name: /solicitar código/i }))
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy())
    expect(begin).not.toHaveBeenCalled()
    expect(screen.queryByLabelText(/código enviado/i)).toBeNull()
  })

  it('cancelamento limpa dados locais, não mexe no consentimento do Pixel e não confirma', async () => {
    window.localStorage.setItem(MENTORIA_CONSENT_KEY, 'denied')
    const props = ready()
    render(<MentoriaCommercialLeadOptInForm {...props} />)
    fireEvent.change(getPhone(), { target: { value: '5511987654321' } })
    fireEvent.click(getAgree())
    fireEvent.click(screen.getByRole('button', { name: /solicitar código/i }))
    await waitFor(() => expect(screen.getByLabelText(/código enviado/i)).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(getAgree().checked).toBe(false)
    expect(getPhone().value).toBe('')
    expect(props.confirmConsent).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(MENTORIA_CONSENT_KEY)).toBe('denied')
  })
})
