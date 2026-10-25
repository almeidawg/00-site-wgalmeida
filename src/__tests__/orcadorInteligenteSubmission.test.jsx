import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useTranslation: () => ({ t: (key) => key }) }
})

vi.mock('@/providers/ContextProvider', () => ({
  useWGContext: () => ({ context: { origem: 'qa-preview' } }),
}))

vi.mock('@/lib/motion-lite', () => {
  const MotionDiv = ({ children, initial, animate, exit, transition, whileHover, whileTap, ...props }) => (
    <div {...props}>{children}</div>
  )
  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }) => <>{children}</>,
  }
})

vi.mock('@/components/TurnstileWidget', () => ({
  TURNSTILE_SITE_KEY: 'synthetic-qa-site-key',
  default: ({ onVerify }) => (
    <button type="button" data-testid="orcador-turnstile-qa" onClick={() => onVerify('synthetic-token')}>
      Verificar teste
    </button>
  ),
}))

import OrcadorInteligente from '@/components/OrcadorInteligente'

const renderContactStep = () => {
  const view = render(
    <MemoryRouter>
      <OrcadorInteligente sourceContext="orcamento-site-qa" />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: /Apartamento de Alto Padrão/i }))
  fireEvent.click(screen.getByRole('button', { name: /Apenas Projeto de Interiores/i }))
  fireEvent.change(screen.getByPlaceholderText('Ex: 120'), { target: { value: '80' } })
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Normal (3 a 6 meses)' } })
  fireEvent.click(screen.getByRole('button', { name: /Gerar Estimativa/i }))
  act(() => { vi.advanceTimersByTime(2000) })
  vi.useRealTimers()
  fireEvent.change(screen.getByPlaceholderText('Nome Completo'), { target: { value: 'QA Orçamento' } })
  fireEvent.change(screen.getByPlaceholderText('Melhor E-mail'), { target: { value: 'qa-orcador@example.invalid' } })
  fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), { target: { value: '11999999999' } })
  return view
}

describe('OrcadorInteligente canonical contact submission', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('uses sequential level-two headings throughout the estimate wizard', () => {
    render(
      <MemoryRouter>
        <OrcadorInteligente sourceContext="orcamento-site-qa" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Qual o perfil do ativo?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Apartamento de Alto Padrão/i }))
    expect(screen.getByRole('heading', { level: 2, name: 'Qual escopo técnico?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Apenas Projeto de Interiores/i }))
    expect(screen.getByRole('heading', { level: 2, name: 'Dimensões e Cronograma' })).toBeInTheDocument()
  })

  it('requires Turnstile verification before calling /api/contact', () => {
    renderContactStep()
    fireEvent.click(screen.getByRole('button', { name: /Receber Proposta Técnica/i }))
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.getByText('Conclua a verificação anti-spam antes de enviar.')).toBeInTheDocument()
  })

  it('sends the synthetic payload to the canonical endpoint once and confirms success', async () => {
    fetch.mockResolvedValue({ ok: true, status: 200 })
    renderContactStep()
    fireEvent.click(screen.getByTestId('orcador-turnstile-qa'))
    fireEvent.click(screen.getByRole('button', { name: /Receber Proposta Técnica/i }))

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' })
    const body = JSON.parse(options.body)
    expect(body).toMatchObject({
      name: 'QA Orçamento',
      email: 'qa-orcador@example.invalid',
      subject: 'Solicitação técnica: Apenas Projeto de Interiores',
      context: 'orcamento-site-qa',
      turnstileToken: 'synthetic-token',
    })
    expect(body.message).toContain('Metragem: 80m²')
    await waitFor(() => expect(screen.getByText('Oportunidade Destravada!')).toBeInTheDocument())
  })

  it('does not display success when the backend rejects persistence', async () => {
    fetch.mockResolvedValue({ ok: false, status: 502 })
    renderContactStep()
    fireEvent.click(screen.getByTestId('orcador-turnstile-qa'))
    fireEvent.click(screen.getByRole('button', { name: /Receber Proposta Técnica/i }))

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByText(/Nao foi possivel enviar agora/i)).toBeInTheDocument())
    expect(screen.queryByText('Oportunidade Destravada!')).not.toBeInTheDocument()
  })
})
