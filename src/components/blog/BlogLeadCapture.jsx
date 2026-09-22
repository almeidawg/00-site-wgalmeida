import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/components/TurnstileWidget'
import { trackEvent } from '@/lib/analytics'

const getOffer = (article = {}) => {
  const topic = String(article.category || article.editorialThemeId || '').toLowerCase()

  if (topic.includes('arquitet')) return {
    eyebrow: 'Próximo passo do projeto',
    title: 'Quer transformar esta referência em um briefing objetivo?',
    description: 'Deixe seu contato e o contexto desta leitura segue junto para a equipe.',
    cta: 'Quero avançar meu projeto',
  }

  if (topic.includes('engenhar')) return {
    eyebrow: 'Diagnóstico inicial',
    title: 'Quer avaliar viabilidade, custo ou execução?',
    description: 'Envie seu contato sem repetir tudo o que você acabou de pesquisar.',
    cta: 'Quero uma avaliação inicial',
  }

  if (topic.includes('marcen')) return {
    eyebrow: 'Avaliação do ambiente',
    title: 'Quer levar esta referência para o seu espaço?',
    description: 'Deixe seu contato e use este artigo como ponto de partida.',
    cta: 'Quero avaliar meu ambiente',
  }

  return {
    eyebrow: 'Continue a conversa',
    title: 'Quer aplicar esta leitura ao seu projeto ou operação?',
    description: 'Deixe seu contato. O artigo e a origem da visita seguem junto com o lead.',
    cta: 'Quero conversar com a WG',
  }
}

export default function BlogLeadCapture({ article, placement = 'article_end' }) {
  const sectionRef = useRef(null)
  const startedRef = useRef(false)
  const viewedRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', website: '' })

  const offer = getOffer(article)
  const slug = article?.slug || 'unknown'
  const context = `blog:${slug}:lead_capture:${placement}:A`

  useEffect(() => {
    const target = sectionRef.current
    if (!target || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver((entries) => {
      if (!viewedRef.current && entries.some((entry) => entry.isIntersecting)) {
        viewedRef.current = true
        trackEvent('conversion_funnel', {
          action: 'cta_view',
          source: 'blog_lead_capture',
          context,
          page_path: window.location.pathname,
        })
      }
    }, { threshold: 0.35 })

    observer.observe(target)
    return () => observer.disconnect()
  }, [context])

  const markStarted = () => {
    if (startedRef.current) return
    startedRef.current = true
    trackEvent('conversion_funnel', {
      action: 'form_start',
      source: 'blog_lead_capture',
      context,
      page_path: window.location.pathname,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (TURNSTILE_SITE_KEY && !turnstileToken) {
        throw new Error('Confirme a verificação anti-spam antes de enviar.')
      }

      const params = new URLSearchParams(window.location.search)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Lead do blog: ${article?.title || slug}`,
          message: `Quero conversar com a WG a partir do artigo "${article?.title || slug}". Posição de captação: ${placement}.`,
          website: form.website,
          turnstileToken,
          utm_source: params.get('utm_source') || 'blog',
          utm_medium: params.get('utm_medium') || 'organic',
          utm_campaign: params.get('utm_campaign') || null,
          context,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Não foi possível registrar seu contato.')

      trackEvent('conversion_funnel', {
        action: 'lead_accepted',
        source: 'blog_lead_capture',
        context,
        target: payload.outcome || 'accepted',
        page_path: window.location.pathname,
      })

      setSuccess(true)
      setForm({ name: '', email: '', phone: '', website: '' })
      setTurnstileToken('')
      if (window.turnstile) window.turnstile.reset()
    } catch (submitError) {
      trackEvent('conversion_funnel', {
        action: 'submit_error',
        source: 'blog_lead_capture',
        context,
        target: 'contact_api',
        page_path: window.location.pathname,
      })
      setError(submitError.message || 'Não foi possível registrar seu contato.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      data-conversion-lab="blog-lead-capture"
      data-placement={placement}
      className="mt-10 rounded-[28px] border border-[#E5E5E5] bg-[#FBFAF7] p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-2 text-[11px] font-light uppercase tracking-[0.18em] text-wg-orange">{offer.eyebrow}</p>
          <h2 className="font-playfair text-2xl font-light leading-tight text-wg-black md:text-3xl">{offer.title}</h2>
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-wg-gray">{offer.description}</p>
          <p className="mt-3 text-xs font-light leading-relaxed text-wg-gray/80">
            Seus dados serão usados para responder a esta solicitação e medir a origem comercial do contato.
          </p>
        </div>

        {success ? (
          <output className="block rounded-2xl border border-[#DDE8DF] bg-white p-5">
            <CheckCircle2 className="mb-3 h-6 w-6 text-wg-green" />
            <p className="font-medium text-wg-black">Contato recebido.</p>
            <p className="mt-1 text-sm font-light text-wg-gray">A origem deste artigo foi registrada junto com a solicitação.</p>
          </output>
        ) : (
          <form onSubmit={handleSubmit} onFocus={markStarted} className="grid gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-4 md:p-5">
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
              className="hidden"
              tabIndex="-1"
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-light text-wg-gray">
                <span>Nome</span>
                <input required name="name" autoComplete="name" value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="h-11 rounded-xl border border-[#DDD8CF] px-3 text-sm text-wg-black outline-none focus:border-wg-orange" />
              </label>
              <label className="grid gap-1 text-xs font-light text-wg-gray">
                <span>E-mail</span>
                <input required type="email" name="email" autoComplete="email" value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="h-11 rounded-xl border border-[#DDD8CF] px-3 text-sm text-wg-black outline-none focus:border-wg-orange" />
              </label>
            </div>

            <label className="grid gap-1 text-xs font-light text-wg-gray">
              <span>WhatsApp <span className="sr-only">(opcional)</span></span>
              <input type="tel" name="phone" autoComplete="tel" placeholder="Opcional" value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value.slice(0, 24) }))}
                className="h-11 rounded-xl border border-[#DDD8CF] px-3 text-sm text-wg-black outline-none focus:border-wg-orange" />
            </label>

            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken('')}
              disabled={loading}
              label="Verificação anti-spam"
            />

            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}

            <button type="submit" disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-wg-black px-5 text-xs font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {offer.cta}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}