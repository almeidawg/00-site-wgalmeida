import { describe, expect, it } from 'vitest'
import { sanitizeTurnstileConfigValue } from '../components/TurnstileWidget.jsx'

describe('Turnstile config sanitization', () => {
  it('remove BOM e espacos sem alterar a chave valida', () => {
    expect(sanitizeTurnstileConfigValue('\uFEFF\uFEFF 0x4AAAA-test-key \r\n')).toBe('0x4AAAA-test-key')
  })

  it('retorna vazio para configuracao ausente', () => {
    expect(sanitizeTurnstileConfigValue(undefined)).toBe('')
  })
})
