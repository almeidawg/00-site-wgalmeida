import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { readFileSync } from 'node:fs'
import {
  MENTORIA_ORIGIN, canonicalForSiteHost, mentoriaContactCanonical, mentoriaContactPath,
} from '@/lib/mentoriaDomain'
import MentoriaContato from '@/pages/MentoriaContato'

vi.mock('@/components/SEO', () => ({ default: () => null }))
afterEach(() => { cleanup(); delete window.__MENTORIA_LAB__; vi.unstubAllGlobals() })

const renderForm = (url = '/mentoria-construcao/contato?prioridade=ia') =>
  render(<MemoryRouter initialEntries={[url]}><MentoriaContato /></MemoryRouter>)

const completeForm = () => {
  fireEvent.change(screen.getByLabelText('Seu nome *'), { target: { value: 'Pessoa Sintética QA' } })
  fireEvent.change(screen.getByLabelText('Nome da empresa *'), { target: { value: 'Construtora Exemplo' } })
  fireEvent.change(screen.getByLabelText('E-mail profissional *'), { target: { value: 'qa@example.test' } })
  fireEvent.change(screen.getByLabelText('WhatsApp com DDD *'), { target: { value: '11999990000' } })
  fireEvent.change(screen.getByLabelText('Área de atuação *'), { target: { value: 'Reformas e manutenção' } })
  fireEvent.change(screen.getByLabelText('Conte um pouco do principal desafio *'), { target: { value: 'Preciso organizar atendimento, obras e prioridades do negócio.' } })
  fireEvent.click(screen.getByRole('checkbox', { name: /Li a Política de Privacidade/ }))
}

describe('Página de formulário exclusiva da Mentoria Construção', () => {
  it('roteia contato da mentoria sem alterar o contato geral do site institucional', () => {
    expect(mentoriaContactPath('wgalmeida.com.br')).toBe('/mentoria-construcao/contato')
    expect(mentoriaContactPath('mentoria.wgalmeida.com.br')).toBe('/contato')
    expect(mentoriaContactCanonical('wgalmeida.com.br')).toBe('https://wgalmeida.com.br/mentoria-construcao/contato')
    expect(mentoriaContactCanonical('mentoria.wgalmeida.com.br')).toBe(MENTORIA_ORIGIN + '/contato')
    expect(canonicalForSiteHost('mentoria.wgalmeida.com.br', '/contato')).toBe(MENTORIA_ORIGIN + '/contato')
    expect(canonicalForSiteHost('wgalmeida.com.br','/contato')).toBe('https://wgalmeida.com.br/contato')
    const app = readFileSync('src/App.jsx', 'utf8')
    expect(app).toContain("location.pathname === '/mentoria-construcao/contato'")
    expect(app).toContain("isMentoriaDomain && location.pathname === '/contato'")
    expect(app).toContain('<MentoriaContato />')
  })

  it('exibe um formulário de diagnóstico distinto e herda prioridade escolhida no CTA', () => {
    const { container } = renderForm()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Sua empresa tem desafios únicos.')
    expect(container.querySelectorAll('form')).toHaveLength(1)
    expect(screen.getByLabelText('Qual é sua prioridade hoje? *').value).toBe('ia')
    expect(screen.getByLabelText('Nome da empresa *')).toBeTruthy()
    expect(screen.getByLabelText('Área de atuação *')).toBeTruthy()
    expect(screen.getByLabelText('Conte um pouco do principal desafio *')).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: /Li a Política de Privacidade/ }).required).toBe(true)
    expect(container.querySelector('a[href*="wgalmeida.com.br/privacidade"]')).toBeTruthy()
    expect(screen.getByText(/recebimento desativado até a homologação/)).toBeTruthy()
  })

  it('permanece fail-closed fora do laboratório e nunca chama a API institucional', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderForm()
    completeForm()
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar conversa inicial' }))
    await screen.findByRole('alert')
    expect(screen.getByRole('alert').textContent).toContain('ainda está em homologação')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envia payload específico para API sintética quando o laboratório está ativo', async () => {
    window.__MENTORIA_LAB__ = true
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ simulated: true, id: 'lab-synthetic-not-persisted' }) })
    vi.stubGlobal('fetch', fetchMock)
    renderForm('/mentoria-construcao/contato?prioridade=sistema&utm_source=qa_mentoria')
    completeForm()
    fireEvent.click(screen.getByRole('button', { name: 'Testar envio do formulário' }))
    await waitFor(() => expect(screen.getByText('Validação concluída')).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, request] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/mentoria-interest')
    const payload = JSON.parse(request.body)
    expect(payload).toMatchObject({
      context: 'mentoria_construcao',
      program: 'individual_8_weeks_8x90_minutes',
      priority: 'sistema',
      company: 'Construtora Exemplo',
      email: 'qa@example.test',
      privacyConsent: true,
      utm_source: 'qa_mentoria',
    })
    expect(screen.getByText(/Nenhum dado real foi registrado/)).toBeTruthy()
  })

  it('recusa resposta sem confirmação sintética e preserva dados para correção', async () => {
    window.__MENTORIA_LAB__ = true
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }))
    renderForm()
    completeForm()
    fireEvent.click(screen.getByRole('button', { name: 'Testar envio do formulário' }))
    await screen.findByRole('alert')
    expect(screen.getByRole('alert').textContent).toContain('não confirmou o recebimento simulado')
    expect(screen.getByLabelText('Nome da empresa *').value).toBe('Construtora Exemplo')
  })
})
