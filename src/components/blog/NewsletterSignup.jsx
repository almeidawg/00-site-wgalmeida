import { useCallback, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/components/TurnstileWidget'
import { trackEvent } from '@/lib/analytics'
import { useTranslation } from 'react-i18next'

const NEWSLETTER_CONTEXT = 'blog:newsletter'

export default function NewsletterSignup() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  const handleTurnstileVerify = useCallback((token) => setTurnstileToken(token), [])
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(''), [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)

    try {
      if (TURNSTILE_SITE_KEY && !turnstileToken) {
        throw new Error(t('blogPage.leadCapture.antiSpamRequired'))
      }

      const params = new URLSearchParams(window.location.search)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: t('blogPage.newsletter.leadName'),
          email,
          subject: t('blogPage.newsletter.leadSubject'),
          message: t('blogPage.newsletter.leadMessage'),
          website,
          turnstileToken: turnstileToken || null,
          utm_source: params.get('utm_source') || 'blog',
          utm_medium: params.get('utm_medium') || 'newsletter',
          utm_campaign: params.get('utm_campaign') || null,
          context: NEWSLETTER_CONTEXT,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? t('blogPage.leadCapture.antiSpamRequired')
            : t('blogPage.newsletter.submitError')
        )
      }

      trackEvent('conversion_funnel', {
        action: 'lead_accepted',
        source: 'blog_newsletter',
        context: NEWSLETTER_CONTEXT,
        target: payload.outcome || 'accepted',
        page_path: window.location.pathname,
      })
      setSuccess(true)
      setEmail('')
    } catch (submitError) {
      trackEvent('conversion_funnel', {
        action: 'submit_error',
        source: 'blog_newsletter',
        context: NEWSLETTER_CONTEXT,
        target: 'contact_api',
        page_path: window.location.pathname,
      })
      setError(submitError.message || t('blogPage.newsletter.submitError'))
    } finally {
      setTurnstileToken('')
      try {
        window.turnstile?.reset?.()
      } catch {
        // reset do widget e opcional; o token ja foi descartado acima
      }
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div role="status" className="mx-auto flex max-w-md items-center justify-center gap-3 text-left text-white">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-wg-orange" />
        <p className="font-light">{t('blogPage.newsletter.successMessage')}</p>
      </div>
    )
  }

  return (
    <form className="mx-auto flex max-w-md flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-label={t('blogPage.newsletter.placeholder')}
          placeholder={t('blogPage.newsletter.placeholder')}
          className="min-h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-light outline-none transition-all focus:border-wg-orange/50"
        />
        <button type="submit" disabled={loading} className="wg-btn-pill-primary min-h-11 whitespace-nowrap px-8 disabled:opacity-60">
          {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : t('blogPage.newsletter.button')}
        </button>
      </div>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <TurnstileWidget
        onVerify={handleTurnstileVerify}
        onExpire={handleTurnstileExpire}
        disabled={loading}
        label={t('blogPage.leadCapture.antiSpamLabel')}
      />
      {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
    </form>
  )
}
