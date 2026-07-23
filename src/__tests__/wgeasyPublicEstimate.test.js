import { describe, expect, it } from 'vitest'
import { calculatePublicEstimate } from '../../api/wgeasy-public-estimate.js'

describe('WG Easy public estimate contract', () => {
  it('calculates minimum, likely and maximum from the canonical range', () => {
    expect(calculatePublicEstimate({
      area: 80,
      standard: 'equilibrado',
      priceRange: { range_m2_min: 4800, range_m2_med: 6000, range_m2_max: 7200 },
      regionalFactor: 1,
    })).toEqual({
      perSquareMeter: { minimum: 4800, likely: 6000, maximum: 7200 },
      total: { minimum: 384000, likely: 480000, maximum: 576000 },
    })
  })

  it('rejects invalid areas instead of emitting a misleading price', () => {
    expect(() => calculatePublicEstimate({
      area: -1,
      standard: 'equilibrado',
      priceRange: { range_m2_min: 4800, range_m2_med: 6000, range_m2_max: 7200 },
    })).toThrow('AREA_INVALIDA')
  })
})
