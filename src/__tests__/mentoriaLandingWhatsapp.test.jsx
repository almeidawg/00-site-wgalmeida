import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'

vi.mock('@/components/SEO', () => ({ default: () => null }))
vi.mock('@/lib/analytics', () => ({ trackCtaClick: vi.fn(), trackEvent: vi.fn(), trackWhatsappClick: vi.fn() }))

import MentoriaConstrucaoLanding from '@/pages/MentoriaConstrucaoLanding'
import { trackEvent } from '@/lib/analytics'

afterEach(() => { cleanup(); vi.clearAllMocks(); window.history.replaceState({}, '', '/') })

const decoded = (href) => decodeURIComponent(href.split('?text=')[1] || '')
const waLinks = (container) => [...container.querySelectorAll('a[href*="wa.me"]')]

describe('Landing da mentoria: apresentação sem "piloto" e WhatsApp direto', () => {
  it('a mensagem pronta e o texto visível não chamam o programa de piloto', () => {
    const { container } = render(<MentoriaConstrucaoLanding />)
    const links = waLinks(container)
    expect(links.length).toBeGreaterThan(0)
    for (const a of links) expect(decoded(a.getAttribute('href'))).not.toMatch(/piloto/i)
    // "Piloto supervisionado" segue como etapa do conteúdo (semana 7); só o nome do programa muda.
    const visible = container.textContent.replace(/piloto supervisionado/gi, '')
    expect(visible).not.toMatch(/piloto/i)
  })

  it('oferece um CTA direto de WhatsApp no painel, sem exigir prioridade, preservando a origem (UTM)', () => {
    window.history.replaceState({}, '', '/?utm_source=meta&utm_medium=paid_social&utm_campaign=mentoria_individual_piloto_2026_10&utm_content=criativo01_operacao_v3')
    const { container } = render(<MentoriaConstrucaoLanding />)
    const direct = container.querySelector('.mcl-convert__direct a')
    expect(direct).toBeTruthy()
    expect(direct.getAttribute('target')).toBe('_blank')
    expect(direct.getAttribute('rel')).toContain('noopener')
    const text = decoded(direct.getAttribute('href'))
    expect(direct.getAttribute('href')).toContain('wa.me/')
    expect(text).toContain('Mentoria Estratégica Individual do Grupo WG Almeida')
    expect(text).not.toContain('Minha prioridade')
    expect(text).toContain('content=criativo01_operacao_v3')
    expect(text).toContain('campaign=mentoria_individual_2026_10')
    expect(text).not.toMatch(/piloto/i)
    fireEvent.click(direct)
    expect(trackEvent).toHaveBeenCalledWith('mentoria_lead_intent', expect.objectContaining({ source: 'qualificacao_direto' }))
  })
})
