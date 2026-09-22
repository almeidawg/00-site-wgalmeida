import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
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

class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback
  }

  observe() {
    this.callback([{ isIntersecting: true }])
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
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
    await i18n.changeLanguage('pt-BR')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete globalThis.__blogLeadTurnstileProps
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

  it('usa o idioma ativo do blog no fluxo de captacao', async () => {
    await i18n.changeLanguage('en')

    render(<BlogLeadCapture article={{ ...article, category: 'engineering' }} placement="post_content" />)

    expect(screen.getByText('Want to assess feasibility, cost or execution?')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Your data will be used to respond to this request and measure the commercial source of the contact.')).toBeInTheDocument()
  })
})
