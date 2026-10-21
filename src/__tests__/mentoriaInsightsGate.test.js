import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  isMentoriaPrelaunchRoute, isMentoriaPrelaunchTrackingBlocked,
} from '@/lib/analytics'

describe('no-tracking de Vercel Insights nas rotas de pre-lancamento', () => {
  it('identifica site da mentoria e rotas compatíveis sem bloquear site institucional', () => {
    expect(isMentoriaPrelaunchTrackingBlocked('mentoria.wgalmeida.com.br')).toBe(true)
    expect(isMentoriaPrelaunchTrackingBlocked('mentoria.wgalmeida.com.br.attacker.test')).toBe(false)
    for (const p of [
      '/mentoria-construcao',
      '/mentoria-construcao/abordagens',
      '/mentoria-construcao/proposta-modelo',
    ]) expect(isMentoriaPrelaunchRoute(p)).toBe(true)
    for (const p of ['/', '/sobre', '/mentoria-construcao-evil', '/contato']) {
      expect(isMentoriaPrelaunchRoute(p)).toBe(false)
    }
  })
  it('o componente global só monta Vercel Analytics / SpeedInsights fora das rotas bloqueadas', () => {
    const code = readFileSync('src/components/DeferredClientEnhancements.jsx', 'utf8')
    expect(code).toContain("isMentoriaPrelaunchTrackingBlocked")
    expect(code).toContain("isMentoriaPrelaunchRoute")
    expect(code).toMatch(/shouldLoadVercelInsights\s*=\s*!isLocalRuntime\(\)\s*&&/)
    expect(code).toMatch(/!isMentoriaPrelaunchTrackingBlocked\(/)
    expect(code).toMatch(/!isMentoriaPrelaunchRoute\(/)
    expect(code).toMatch(/\{shouldLoadVercelInsights &&/)
  })
})
