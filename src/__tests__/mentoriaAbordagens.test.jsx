import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { MENTORIA_ABORDAGENS, MENTORIA_ABORDAGENS_TOTAL, MENTORIA_ABORDAGENS_JORNADAS } from '@/data/mentoriaAbordagens'
import { mentoriaLandingPath, mentoriaApproachesPath, mentoriaApproachesCanonical, canonicalForSiteHost } from '@/lib/mentoriaDomain'

vi.mock('@/components/SEO', () => ({ default: () => null }))
vi.mock('@/components/WGCampaignHeader', () => ({ default: () => <header data-testid="editorial-header"/> }))

import MentoriaAbordagens from '@/pages/MentoriaAbordagens'

afterEach(() => cleanup())

describe('Abordagens da mentoria: editorial, sem orçamento, sem alterar oito semanas', () => {
  it('apresenta 10 frentes e 30 possíveis assuntos, todos distintos e com contexto prático', () => {
    expect(MENTORIA_ABORDAGENS).toHaveLength(10)
    expect(MENTORIA_ABORDAGENS_TOTAL).toBe(30)
    expect(new Set(MENTORIA_ABORDAGENS.map(({ id }) => id)).size).toBe(10)
    expect(MENTORIA_ABORDAGENS_JORNADAS).toHaveLength(3)
    for (const area of MENTORIA_ABORDAGENS) {
      expect(area.titulo.length).toBeGreaterThan(10)
      expect(area.pergunta).toContain('?')
      expect(area.possibilidades).toHaveLength(3)
      expect(area.exemplo.length).toBeGreaterThan(35)
      expect(area.aplicacao.length).toBeGreaterThan(20)
      expect(new Set(area.possibilidades.map(([titulo]) => titulo)).size).toBe(3)
    }
  })
  it('renderiza temas, orienta prioridades, tem exemplos expansíveis e não coleta dados', () => {
    const { container } = render(<MentoriaAbordagens />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Cada empresa tem um desafio.')
    expect(screen.getByText('8 semanas · 8 encontros individuais · 12 horas ao vivo')).toBeTruthy()
    expect(container.querySelectorAll('.mab-area')).toHaveLength(10)
    expect(container.querySelectorAll('.mab-area__details li')).toHaveLength(30)
    expect(container.querySelectorAll('.mab-index a')).toHaveLength(10)
    expect(container.querySelectorAll('input, select, textarea')).toHaveLength(0)
    expect(container.querySelectorAll('form')).toHaveLength(0)
    expect(container.querySelector('a[href*="proposta-modelo"]')).toBeNull()
    const first = container.querySelector('.mab-area')
    const button = within(first).getByRole('button', { name: /Ver um exemplo prático/ })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(first.querySelector('.mab-area__example')?.textContent).toContain('SITUAÇÃO ILUSTRATIVA')
    fireEvent.click(button)
    expect(first.querySelector('.mab-area__example')).toBeNull()
  })
  it('não reutiliza o simulador de preços nem a proposta comercial no conteúdo público', () => {
    const page = readFileSync('src/pages/MentoriaAbordagens.jsx', 'utf8')
    const model = readFileSync('src/data/mentoriaAbordagens.js', 'utf8') + readFileSync('src/data/mentoriaAbordagens.json', 'utf8')
    for (const forbidden of ['WG360_TRAFFIC_POLICY', 'estimateTrafficFee', 'EXAMPLE_PRICES',
      'WG360PaymentChoice', 'buildExampleProposal', 'onClick={copy}', 'type="checkbox"', 'type="number"',
      'unitPrice', 'subtotal', 'R$ 1.500', 'R$ 6.000']) {
      expect(page + model).not.toContain(forbidden)
    }
    expect(page).toContain('noindex')
    expect(page).toContain('A sequência semanal apresentada na página principal permanece igual.')
    expect(page).toContain('Execução técnica, novas integrações e serviços dependem de escopo e contratação específicos.')
  })
  it('mantém intactas as oito semanas planejadas e apenas substitui o CTA de catálogo', () => {
    const landing = readFileSync('src/pages/MentoriaConstrucaoLanding.jsx','utf8')
    const part = landing.split('const pilotWeeks = [')[1].split('\n]')[0]
    const weeks = [...part.matchAll(/week: '\d{2}'/g)].map((m) => m[0])
    expect(weeks).toHaveLength(8)
    for (const title of [
      'Diagnóstico da empresa','Processos e prioridades','Comercial e propostas','IA no dia a dia',
      'Assistentes e conhecimento','IA e sistema de gestão','Piloto supervisionado','Plano de evolução',
    ]) expect(part).toContain(title)
    expect(landing).toContain('Explore os temas que podemos aprofundar na mentoria')
    expect(landing).not.toContain('Conheça as soluções que podemos integrar à sua empresa')
  })
  it('preserva host institucional e serve temas na origem dedicada quando entrar no ar', () => {
    expect(mentoriaLandingPath('mentoria.wgalmeida.com.br')).toBe('/')
    expect(mentoriaLandingPath('wgalmeida.com.br')).toBe('/mentoria-construcao')
    expect(mentoriaApproachesPath('mentoria.wgalmeida.com.br')).toBe('/abordagens')
    expect(mentoriaApproachesPath('wgalmeida.com.br')).toBe('/mentoria-construcao/abordagens')
    expect(mentoriaApproachesCanonical('mentoria.wgalmeida.com.br')).toBe('https://mentoria.wgalmeida.com.br/abordagens')
    expect(canonicalForSiteHost('mentoria.wgalmeida.com.br','/abordagens')).toBe('https://mentoria.wgalmeida.com.br/abordagens')
    expect(canonicalForSiteHost('wgalmeida.com.br','/sobre')).toBe('https://wgalmeida.com.br/sobre')
    const app = readFileSync('src/App.jsx','utf8')
    expect(app).toContain("location.pathname === '/mentoria-construcao/proposta-360'")
    expect(app).toContain("location.pathname === '/mentoria-construcao/abordagens'")
    expect(app).toContain("isMentoriaDomain && location.pathname === '/abordagens'")
    expect(app).toContain('<MentoriaAbordagens />')
  })
})
