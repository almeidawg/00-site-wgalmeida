import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('Mentoria: gate de video em preview sem midia licenciada', () => {
  it('mantem o player bloqueado ate aprobacao explicita em ambiente', () => {
    const code = readFileSync('src/pages/MentoriaConstrucaoLanding.jsx', 'utf8')
    const css = readFileSync('src/pages/mentoria-construcao.css', 'utf8')
    expect(code).toContain("const VIDEO_RELEASED = import.meta.env.VITE_MENTORIA_VIDEO_APPROVED === 'true'")
    expect(code).toContain('!VIDEO_RELEASED ? (')
    expect(code).toContain('Vídeo de apresentação em homologação')
    expect(code).toContain('VÍDEO EM HOMOLOGAÇÃO · PRÉVIA PROTEGIDA')
    expect(code).toContain('VIDEO_RELEASED ? (activated ?')
    expect(css).toContain('.mcl-film__cover--hold { cursor:default; }')
  })
})
