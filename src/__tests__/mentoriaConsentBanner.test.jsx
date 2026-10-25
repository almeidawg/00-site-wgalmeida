import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

const config = vi.hoisted(() => ({ id: '1234567890123456' }))
vi.mock('@/lib/metaPixelConfig', () => ({ get META_PIXEL_ID() { return config.id } }))

import MentoriaConsentBanner from '@/components/MentoriaConsentBanner'
import { MENTORIA_CONSENT_KEY } from '@/lib/mentoriaConsent'

const pixelScripts = () => [...document.head.querySelectorAll('script[src*="fbevents"]')]

beforeEach(() => {
  config.id = '1234567890123456'
  window.localStorage.clear()
  window.history.replaceState({}, '', '/mentoria-construcao')
})
afterEach(() => {
  cleanup()
  pixelScripts().forEach((el) => el.remove())
  delete window.fbq
  delete window._fbq
  delete window.__wgMentoriaPixelId
  window.history.replaceState({}, '', '/')
})

describe('banner de consentimento da mentoria', () => {
  it('mantem o link de privacidade com area de toque minima', () => {
    const css = readFileSync('src/pages/mentoria-construcao.css', 'utf8')
    expect(css).toMatch(/\.mcl-consent a\s*\{[^}]*min-height:\s*44px/)
  })

  it('sem pixel configurado nao aparece e nada carrega', () => {
    config.id = ''
    const { container } = render(<MentoriaConsentBanner />)
    expect(container).toBeEmptyDOMElement()
    expect(pixelScripts()).toHaveLength(0)
  })

  it('fora da mentoria nao aparece', () => {
    window.history.replaceState({}, '', '/sobre')
    const { container } = render(<MentoriaConsentBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('sem resposta mostra o aviso e nao carrega o pixel', () => {
    render(<MentoriaConsentBanner />)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('link', { name: /pol.tica de privacidade/i }).getAttribute('href')).toBe('/privacidade')
    expect(pixelScripts()).toHaveLength(0)
  })

  it('aceitar grava o consentimento, carrega o pixel e some', () => {
    render(<MentoriaConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: 'Aceitar' }))
    expect(window.localStorage.getItem(MENTORIA_CONSENT_KEY)).toBe('granted')
    expect(pixelScripts()).toHaveLength(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('recusar grava a recusa, nao carrega o pixel e some', () => {
    render(<MentoriaConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: 'Recusar' }))
    expect(window.localStorage.getItem(MENTORIA_CONSENT_KEY)).toBe('denied')
    expect(pixelScripts()).toHaveLength(0)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('quem ja aceitou antes carrega o pixel sem ver o aviso de novo', () => {
    window.localStorage.setItem(MENTORIA_CONSENT_KEY, 'granted')
    render(<MentoriaConsentBanner />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(pixelScripts()).toHaveLength(1)
  })
})
