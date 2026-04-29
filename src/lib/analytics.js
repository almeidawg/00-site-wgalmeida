import { track } from '@vercel/analytics'

const canUseWindow = () => typeof window !== 'undefined'

const limitValue = (value) => String(value ?? '').slice(0, 255)

const vercelPayload = (payload = {}) => ({
  context: limitValue(payload.cta_context || payload.context || payload.page_path || 'site'),
  target: limitValue(payload.cta_id || payload.demo_id || payload.depth || payload.cta_destination || payload.target || ''),
})

export function pushDataLayerEvent(eventName, payload = {}) {
  if (!canUseWindow()) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: eventName,
    ...payload,
  })
}

export function trackEvent(eventName, payload = {}) {
  pushDataLayerEvent(eventName, payload)

  try {
    track(eventName, vercelPayload(payload))
  } catch {
    // Analytics nunca deve bloquear fluxo comercial.
  }
}

export function trackCtaClick({
  ctaId,
  ctaLabel,
  ctaContext,
  ctaDestination,
}) {
  trackEvent('cta_click', {
    cta_id: ctaId || 'unknown_cta',
    cta_label: ctaLabel || 'unknown_label',
    cta_context: ctaContext || 'unknown_context',
    cta_destination: ctaDestination || '',
    page_path: canUseWindow() ? window.location.pathname : '',
  })
}

export function trackFormSubmit({ formId, status, context }) {
  trackEvent('form_submit', {
    form_id: formId || 'contact',
    status: status || 'unknown',
    context: context || 'site',
    page_path: canUseWindow() ? window.location.pathname : '',
  })
}

export function trackWhatsappClick({ context, target }) {
  trackEvent('whatsapp_click', {
    context: context || 'site',
    target: target || 'primary',
    page_path: canUseWindow() ? window.location.pathname : '',
  })
}

export function trackDemoInteraction({ demoId, action }) {
  trackEvent('demo_interaction', {
    demo_id: demoId || 'unknown_demo',
    action: action || 'interact',
    page_path: canUseWindow() ? window.location.pathname : '',
  })
}

export function trackScrollDepth({ depth, context }) {
  trackEvent('scroll_depth', {
    depth: String(depth),
    context: context || 'site',
    page_path: canUseWindow() ? window.location.pathname : '',
  })
}
