import { beforeEach, describe, expect, it } from 'vitest'
import {
  decorateProductUrl,
  ensureEcosystemContext,
  WG_JOURNEY_KEY,
  WG_PARTNER_KEY,
} from '@/lib/ecosystemContext'

describe('ecosystem context', () => {
  beforeEach(() => window.localStorage.clear())

  it('preserva parceiro legado e jornada canonica', () => {
    const context = ensureEcosystemContext(
      '?ref=corretor-42&wg_journey=journey-42',
      window.localStorage,
    )

    expect(context).toMatchObject({
      partner: 'corretor-42',
      journey: 'journey-42',
    })
    expect(window.localStorage.getItem(WG_PARTNER_KEY)).toBe('corretor-42')
    expect(window.localStorage.getItem(WG_JOURNEY_KEY)).toBe('journey-42')
  })

  it('decora somente destinos canonicos do ecossistema', () => {
    const context = {
      partner: 'corretor-42',
      journey: 'journey-42',
      campaign: 'lancamento',
    }
    const decorated = new URL(
      decorateProductUrl('https://obraeasy.wgalmeida.com.br/evf4', context),
    )

    expect(decorated.searchParams.get('wg_partner')).toBe('corretor-42')
    expect(decorated.searchParams.get('ref')).toBe('corretor-42')
    expect(decorated.searchParams.get('wg_journey')).toBe('journey-42')
    expect(decorated.searchParams.get('wg_source')).toBe('site-wg')
    expect(decorated.searchParams.get('wg_campaign')).toBe('lancamento')
    expect(decorateProductUrl('https://example.com', context)).toBe('https://example.com')
  })
})
