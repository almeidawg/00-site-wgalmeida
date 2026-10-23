import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NewsletterSignup from '@/components/blog/NewsletterSignup'
import i18n from '@/i18n'

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('@/components/TurnstileWidget', () => ({
  TURNSTILE_SITE_KEY: 'test-site-key',
  default: (props) => {
    globalThis.__newsletterTurnstileProps = props
    return <div data-testid="turnstile-widget" />
  },
}))

const submitWithEmail = (email) => {
  fireEvent.change(screen.getByLabelText('Seu melhor e-mail'), { target: { value: email } })
  fireEvent.submit(screen.getByRole('button', { name: 'Assinar' }).closest('form'))
}

describe('NewsletterSignup', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    globalThis.__newsletterTurnstileProps = null
    await i18n.changeLanguage('pt-BR')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete globalThis.__newsletterTurnstileProps
  })

  it('envia o e-mail para /api/contact com contexto blog:newsletter e token Turnstile', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, outcome: 'saved' }) })
    vi.stubGlobal('fetch', fetchMock)

    render(<NewsletterSignup />)
    globalThis.__newsletterTurnstileProps.onVerify('token-ok')
    submitWithEmail('leitor@example.com')

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(url).toBe('/api/contact')
    expect(init.method).toBe('POST')
    expect(body.email).toBe('leitor@example.com')
    expect(body.context).toBe('blog:newsletter')
    expect(body.turnstileToken).toBe('token-ok')
    expect(body.name).toBeTruthy()
    expect(body.message).toBeTruthy()
  })

  it('so mostra sucesso depois que o servidor confirma o cadastro', async () => {
    let resolveFetch
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { resolveFetch = resolve })))

    render(<NewsletterSignup />)
    globalThis.__newsletterTurnstileProps.onVerify('token-ok')
    submitWithEmail('leitor@example.com')

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    resolveFetch({ ok: true, json: async () => ({ ok: true, outcome: 'saved' }) })
    expect(await screen.findByRole('status')).toBeInTheDocument()
  })

  it('mostra erro e nao mostra sucesso quando o servidor recusa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({ error: 'Falha ao registrar contato.' }) }))

    render(<NewsletterSignup />)
    globalThis.__newsletterTurnstileProps.onVerify('token-ok')
    submitWithEmail('leitor@example.com')

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('nao chama a API sem verificacao anti-spam', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<NewsletterSignup />)
    submitWithEmail('leitor@example.com')

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
