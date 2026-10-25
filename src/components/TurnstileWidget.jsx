import { useEffect, useRef, useState } from 'react'
import { COMPANY } from '@/data/companyPublic'

export const sanitizeTurnstileConfigValue = (value) =>
  String(value || '').replace(/^\uFEFF+/, '').trim()

export const TURNSTILE_SITE_KEY = sanitizeTurnstileConfigValue(import.meta.env.VITE_TURNSTILE_SITE_KEY)
let turnstileScriptPromise = null

const loadTurnstileScript = () => {
  if (!TURNSTILE_SITE_KEY || typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) {
    window.dispatchEvent(new Event('wg:turnstile-ready'))
    return Promise.resolve()
  }
  if (turnstileScriptPromise) return turnstileScriptPromise

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('wg-turnstile-script')
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = 'wg-turnstile-script'
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.dispatchEvent(new Event('wg:turnstile-ready'))
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })

  return turnstileScriptPromise
}

const TurnstileWidget = ({ onVerify, onExpire, disabled, label }) => {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [challengeError, setChallengeError] = useState(null)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onVerifyRef.current = onVerify
  }, [onVerify])

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !containerRef.current || disabled) return undefined

    let cancelled = false

    const clearToken = (reason) => {
      onExpireRef.current?.(reason)
    }

    const render = () => {
      if (cancelled || !window.turnstile || !containerRef.current || widgetIdRef.current !== null) return

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        action: 'contact_form',
        cData: 'wg_contact',
        retry: 'auto',
        'refresh-expired': 'auto',
        'refresh-timeout': 'auto',
        callback: (token) => {
          setChallengeError(null)
          onVerifyRef.current?.(token)
        },
        'expired-callback': () => clearToken({ type: 'expired' }),
        'timeout-callback': () => {
          console.warn('[WG Turnstile] challenge timed out')
          clearToken({ type: 'timeout' })
        },
        'error-callback': (errorCode) => {
          console.warn('[WG Turnstile] challenge error', errorCode)
          setChallengeError(String(errorCode || 'unknown'))
          clearToken({ type: 'error', code: errorCode })
          return true
        },
      })
    }

    loadTurnstileScript()
      .then(render)
      .catch((error) => {
        console.warn('[WG Turnstile] script load error', error)
        setChallengeError('script_error')
        clearToken({ type: 'script_error' })
      })

    window.addEventListener('wg:turnstile-ready', render, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('wg:turnstile-ready', render)
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [disabled])

  if (!TURNSTILE_SITE_KEY) return null

  const domainNotAuthorized = challengeError === '110200'
  const previewHost = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')

  return (
    <div>
      <div
        ref={containerRef}
        className={domainNotAuthorized ? 'hidden' : 'min-h-[65px]'}
        aria-label={label}
      />
      {challengeError && (
        <div role="alert" className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-slate-800">
          <p className="font-semibold">Não foi possível concluir a verificação anti-spam.</p>
          <p className="mt-1">
            {domainNotAuthorized
              ? 'Este endereço ainda não está autorizado no Cloudflare. Nenhuma solicitação foi enviada.'
              : 'A verificação está indisponível no momento. Tente novamente mais tarde ou entre em contato diretamente.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {previewHost && domainNotAuthorized && (
              <a href="https://wgalmeida.com.br/contato" className="inline-flex min-h-11 items-center font-semibold text-blue-700 underline">
                Abrir o site oficial
              </a>
            )}
            <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-blue-700 underline">
              Falar pelo WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default TurnstileWidget
