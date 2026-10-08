import { afterEach, describe, expect, it, vi } from 'vitest'

describe('i18n console hygiene', () => {
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
