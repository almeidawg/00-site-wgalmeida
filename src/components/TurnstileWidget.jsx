import { useEffect, useRef } from 'react'

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

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !containerRef.current || disabled) return undefined

    let cancelled = false

    const render = () => {
      if (cancelled || !window.turnstile || !containerRef.current || widgetIdRef.current) return

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        action: 'contact_form',
        cData: 'wg_contact',
        callback: onVerify,
        'expired-callback': onExpire,
        'error-callback': onExpire,
      })
    }

    loadTurnstileScript().then(render).catch(onExpire)
    window.addEventListener('wg:turnstile-ready', render, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('wg:turnstile-ready', render)
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [disabled, onExpire, onVerify])

  if (!TURNSTILE_SITE_KEY) return null

  return <div ref={containerRef} className="min-h-[65px]" aria-label={label} />
}

export default TurnstileWidget
