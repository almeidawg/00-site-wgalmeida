import { useId, useRef, useState } from 'react'
import {
  MENTORIA_LEAD_PURPOSE,
  normalizeMentoriaLeadPhone,
  isMentoriaLeadOptInReady,
  isMentoriaChallengePending,
  isMentoriaCode,
  isMentoriaConsentAccepted,
} from '@/lib/mentoriaCommercialLeadConsent'

/**
 * NOT MOUNTED. Future separate commercial opt-in form: never replace or
 * intercept the founder's public WhatsApp CTA. Disabled/invisible until
 * a legally approved notice and a vetted server integration are supplied.
 *
 * requestChallenge({ action:'begin', leadPhone, consentDecision:'agree',
 *                   purpose, noticeVersion, noticeDigest })
 *   => {status:'pending',challengeId:'...'}
 * confirmConsent({ action:'confirm', challengeId, code, consentDecision, purpose, noticeVersion,
 *                  noticeDigest }) => {status:'accepted'}
 *
 * These callbacks must use an audited backend. It must derive session and
 * CSRF from trusted state; browser-supplied claims are NOT proof of consent,
 * phone ownership, or permission to insert into WGEasy.
 */
export default function MentoriaCommercialLeadOptInForm({
  enabled = false,
  notice,
  requestChallenge,
  confirmConsent,
}) {
  const prefix = useId()
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [code, setCode] = useState('')
  const [challengeId, setChallengeId] = useState(null)
  const [stage, setStage] = useState('request')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const submitting = useRef(false)

  const ready = isMentoriaLeadOptInReady({ enabled, notice, requestChallenge, confirmConsent })
  if (!ready) return null

  const clearSensitive = () => {
    setPhone('')
    setCode('')
    setAgreed(false)
    setChallengeId(null)
  }

  const request = async (event) => {
    event.preventDefault()
    const normalized = normalizeMentoriaLeadPhone(phone)
    if (submitting.current || stage !== 'request' || !agreed || !normalized) return
    submitting.current = true
    setBusy(true)
    setFeedback('')
    try {
      const response = await requestChallenge({
        action: 'begin',
        leadPhone: normalized,
        consentDecision: 'agree',
        purpose: MENTORIA_LEAD_PURPOSE,
        noticeVersion: notice.version,
        noticeDigest: notice.sha256,
      })
      if (!isMentoriaChallengePending(response)) throw new Error('unverified')
      setChallengeId(response.challengeId)
      // Remove phone from component state. The backend MUST persist challenge
      // to phone binding and verify purpose/notice independently.
      setPhone('')
      setStage('verify')
    } catch {
      setFeedback('Não foi possível solicitar a verificação. Tente novamente mais tarde.')
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  const confirm = async (event) => {
    event.preventDefault()
    if (submitting.current || stage !== 'verify' || !challengeId || !isMentoriaCode(code)) return
    submitting.current = true
    setBusy(true)
    setFeedback('')
    try {
      const response = await confirmConsent({
        action: 'confirm',
        challengeId,
        code,
        consentDecision: 'agree',
        purpose: MENTORIA_LEAD_PURPOSE,
        noticeVersion: notice.version,
        noticeDigest: notice.sha256,
      })
      if (!isMentoriaConsentAccepted(response)) throw new Error('not-accepted')
      clearSensitive()
      setStage('done')
      setFeedback('Solicitação recebida para análise. Nenhum cadastro em CRM é confirmado por esta tela.')
    } catch {
      // Never display provider errors, telephone numbers or identifiers.
      setFeedback('Não foi possível confirmar a solicitação. Confira o código ou tente novamente mais tarde.')
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  const cancel = () => {
    if (submitting.current) return
    clearSensitive()
    setFeedback('')
    setStage('request')
  }

  return (
    <section aria-label="Solicitar contato comercial com consentimento" className="mcl-commercial-opt-in">
      <h3>Solicitar contato sobre a mentoria</h3>
      <p>{notice.text}</p>
      <p>Leia a <a href={notice.privacyPath}>Política de privacidade</a> antes de decidir.</p>

      {stage === 'request' && (
        <form onSubmit={request}>
          <label htmlFor={prefix + '-phone'}>Telefone com DDD e código do Brasil (55)</label>
          <input
            id={prefix + '-phone'}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="55DDXXXXXXXXX"
            maxLength={50}
            disabled={busy}
            required
          />
          <label htmlFor={prefix + '-agree'}>
            <input
              id={prefix + '-agree'}
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              disabled={busy}
            />
            Li o aviso e autorizo o contato comercial para a finalidade informada.
          </label>
          <button type="submit" disabled={busy || !agreed || !normalizeMentoriaLeadPhone(phone)}>
            Solicitar código de confirmação
          </button>
        </form>
      )}

      {stage === 'verify' && (
        <form onSubmit={confirm}>
          <label htmlFor={prefix + '-code'}>Código enviado para o telefone informado</label>
          <input
            id={prefix + '-code'}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={10}
            disabled={busy}
            required
          />
          <button type="submit" disabled={busy || !isMentoriaCode(code)}>
            Confirmar solicitação
          </button>
          <button type="button" onClick={cancel} disabled={busy}>Cancelar</button>
        </form>
      )}
      {feedback && <p role="status" aria-live="polite">{feedback}</p>}
    </section>
  )
}
