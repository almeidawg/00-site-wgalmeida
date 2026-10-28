import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BlogLeadCapture from '@/components/blog/BlogLeadCapture'
import i18n from '@/i18n'
import { trackEvent } from '@/lib/analytics'

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('@/components/TurnstileWidget', () => ({
  TURNSTILE_SITE_KEY: 'test-site-key',
  default: (props) => {
    globalThis.__blogLeadTurnstileProps = props
    return <div data-testid="turnstile-widget" />
  },
}))

let observerIsIntersecting = true

class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback
  }

  observe() {
    this.callback([{ isIntersecting: observerIsIntersecting }])
  }

  disconnect() {}
}
const article = {
  slug: 'como-calcular-custo-de-obra',
  title: 'Como calcular custo de obra',
  category: 'engenharia',
}

describe('BlogLeadCapture', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    globalThis.__blogLeadTurnstileProps = null
    observerIsIntersecting = true
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
    await i18n.changeLanguage('pt-BR')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete globalThis.__blogLeadTurnstileProps
    delete window.turnstile
  })

  it('adia Turnstile ate a captura entrar em viewport ou receber foco', () => {
    observerIsIntersecting = false

    render(<BlogLeadCapture article={article} placement="post_content" />)

    expect(screen.queryByTestId('turnstile-widget')).not.toBeInTheDocument()

    fireEvent.focus(screen.getByLabelText('Nome'))

    expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument()
  })

  it('mantem callbacks do Turnstile estaveis durante atualizacoes do formulario', () => {
    render(<BlogLeadCapture article={article} placement="post_content" />)

    const firstExpire = globalThis.__blogLeadTurnstileProps.onExpire
    const firstVerify = globalThis.__blogLeadTurnstileProps.onVerify

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'William' } })

    expect(globalThis.__blogLeadTurnstileProps.onExpire).toBe(firstExpire)
    expect(globalThis.__blogLeadTurnstileProps.onVerify).toBe(firstVerify)
  })

  it('reinicia os guards do funil quando o artigo muda sem recarregar a pagina', () => {
    const { rerender } = render(<BlogLeadCapture article={article} placement="post_content" />)

    fireEvent.focus(screen.getByLabelText('Nome'))

    const nextArticle = {
      ...article,
      slug: 'custo-reforma-apartamento-alto-padrao-sp',
      title: 'Custo de reforma de apartamento',
    }
    rerender(<BlogLeadCapture article={nextArticle} placement="post_content" />)
    fireEvent.focus(screen.getByLabelText('Nome'))

    const formStarts = trackEvent.mock.calls
      .filter(([eventName, payload]) => eventName === 'conversion_funnel' && payload.action === 'form_start')
      .map(([, payload]) => payload.context)

    expect(formStarts).toEqual([
      'blog:como-calcular-custo-de-obra:lead_capture:post_content:A',
      'blog:custo-reforma-apartamento-alto-padrao-sp:lead_capture:post_content:A',
    ])
  })

  it('submits blog capture through /api/contact and shows success only when accepted', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, outcome: 'saved' }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<BlogLeadCapture article={article} placement="post_content" />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'QA Blog' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'qa-blog@example.invalid' } })
    act(() => { globalThis.__blogLeadTurnstileProps.onVerify('synthetic-token') })
    fireEvent.submit(document.querySelector('[data-conversion-lab="blog-lead-capture"] form'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body)
    expect(body).toMatchObject({
      name: 'QA Blog',
      email: 'qa-blog@example.invalid',
      context: 'blog:como-calcular-custo-de-obra:lead_capture:post_content:A',
      utm_source: 'blog',
      turnstileToken: 'synthetic-token',
    })
    await waitFor(() => expect(trackEvent).toHaveBeenCalledWith('conversion_funnel',
      expect.objectContaining({ action: 'lead_accepted', context: body.context, target: 'saved' })))
    expect(screen.getByText(i18n.t('blogPage.leadCapture.successTitle'))).toBeInTheDocument()
  })

  it('keeps the blog form open after persistence failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({ error: 'test error' }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<BlogLeadCapture article={article} placement="post_content" />)
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'QA Blog' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'qa-blog@example.invalid' } })
    act(() => { globalThis.__blogLeadTurnstileProps.onVerify('synthetic-token') })
    fireEvent.submit(document.querySelector('[data-conversion-lab="blog-lead-capture"] form'))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(document.querySelector('[data-conversion-lab="blog-lead-capture"] form')).toBeInTheDocument()
    expect(trackEvent).toHaveBeenCalledWith('conversion_funnel', expect.objectContaining({ action: 'submit_error' }))
  })

  it('does not misclassify accepted lead when Turnstile reset throws', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, outcome: 'saved' }) })
    vi.stubGlobal('fetch', fetchMock)
    window.turnstile = { reset: vi.fn(() => { throw new Error('synthetic reset failure') }) }

    render(<BlogLeadCapture article={article} placement="post_content" />)
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'QA Blog' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'qa-blog@example.invalid' } })
    act(() => { globalThis.__blogLeadTurnstileProps.onVerify('synthetic-token') })
    fireEvent.submit(document.querySelector('[data-conversion-lab="blog-lead-capture"] form'))

    await waitFor(() => expect(screen.getByText(i18n.t('blogPage.leadCapture.successTitle'))).toBeInTheDocument())
    expect(window.turnstile.reset).toHaveBeenCalledTimes(1)
    expect(trackEvent).toHaveBeenCalledWith('conversion_funnel',
      expect.objectContaining({ action: 'lead_accepted', target: 'saved' }))
    expect(trackEvent).not.toHaveBeenCalledWith('conversion_funnel',
      expect.objectContaining({ action: 'submit_error' }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('usa o idioma ativo do blog no fluxo de captacao', async () => {
    await i18n.changeLanguage('en')

    render(<BlogLeadCapture article={{ ...article, category: 'engineering' }} placement="post_content" />)

    expect(screen.getByText('Want to assess feasibility, cost or execution?')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Your data will be used to respond to this request and measure the commercial source of the contact.')).toBeInTheDocument()
  })
})