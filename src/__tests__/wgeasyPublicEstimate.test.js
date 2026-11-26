import { describe, expect, it } from 'vitest'
import { calculatePublicEstimate, normalizeStandard } from '../../api/wgeasy-public-estimate.js'

const preview = {
  padrao: 'equilibrado',
  padrao_label: 'Equilibrado',
  custo_m2: 5181.28,
  custo_total: 414502.4,
  faixa: { min: 352327.04, max: 476677.76, percentual: 15 },
}

describe('WG Easy public estimate contract (funcao v2)', () => {
  it('maps the canonical v2 preview to minimum, likely and maximum', () => {
    expect(calculatePublicEstimate({ area: 80, preview })).toEqual({
      perSquareMeter: { minimum: 4404, likely: 5181, maximum: 5958 },
      total: { minimum: 352327, likely: 414502, maximum: 476678 },
    })
  })

  it('rejects invalid areas instead of emitting a misleading price', () => {
    expect(() => calculatePublicEstimate({ area: -1, preview })).toThrow('AREA_INVALIDA')
    expect(() => calculatePublicEstimate({ area: 100001, preview })).toThrow('AREA_INVALIDA')
  })

  it('rejects an incomplete or inconsistent preview (no price is invented)', () => {
    expect(() => calculatePublicEstimate({ area: 80, preview: {} })).toThrow('PREVIA_INVALIDA')
    expect(() => calculatePublicEstimate({ area: 80, preview: { ...preview, custo_m2: 0 } })).toThrow('PREVIA_INVALIDA')
    expect(() => calculatePublicEstimate({ area: 80, preview: { ...preview, faixa: { min: 10, max: 5 } } })).toThrow('PREVIA_INVALIDA')
  })

  it('accepts the four canonical levels and normalizes legacy names on input only', () => {
    expect(['essencial', 'equilibrado', 'superior', 'exclusivo'].map(normalizeStandard)).toEqual([
      'essencial', 'equilibrado', 'superior', 'exclusivo',
    ])
    expect(normalizeStandard('basico')).toBe('essencial')
    expect(normalizeStandard('Alto')).toBe('superior')
    expect(normalizeStandard('luxo')).toBe('exclusivo')
    expect(normalizeStandard('inexistente')).toBeNull()
    expect(normalizeStandard('')).toBeNull()
  })
})
