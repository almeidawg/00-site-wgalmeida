import { afterEach, describe, expect, it, vi } from 'vitest'
import ptBR from '@/i18n/locales/pt-BR.json'
import en from '@/i18n/locales/en.json'
import es from '@/i18n/locales/es.json'

describe('i18n console hygiene', () => {
  it.each([
    ['pt-BR', ptBR],
    ['en', en],
    ['es', es],
  ])('renders the direct-channel kicker without a raw key in %s', (_language, messages) => {
    const label = messages.contactPage?.info?.kicker
    expect(typeof label).toBe('string')
    expect(label.trim().length).toBeGreaterThan(0)
    expect(label).not.toMatch(/contactPage\.info\.kicker/i)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('disables the i18next Locize support notice', async () => {
    vi.resetModules()
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})

    const { default: i18n } = await import('@/i18n/index.js')

    expect(i18n.options.showSupportNotice).toBe(false)
    expect(info.mock.calls.flat().join(' ')).not.toContain('Locize')
  })
})
