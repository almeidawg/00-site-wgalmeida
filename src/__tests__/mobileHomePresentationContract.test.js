import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (name) => readFileSync(resolve(process.cwd(), 'src', name), 'utf8')
const home = source('pages/Home.jsx')
const liz = source('components/LizAssistant.jsx')
const color = source('components/home/HomeColorTransformer.jsx')

describe('Mobile home presentation and commercial UX contract', () => {
  it('keeps a single Instagram-style project gallery on the home', () => {
    expect(home.match(/<ProjectGallery\s*\/>/g)).toHaveLength(1)
    expect(home).not.toMatch(/InstagramGallery|instagramRef|instagramVisible/)
    expect(home).toContain('aria-label="Galeria de projetos"')
  })

  it('keeps Liz collapsed until explicit visitor interaction', () => {
    expect(liz).toContain('useState(false)')
    expect(liz).not.toMatch(/hasPrompted|setHasPrompted|Prompt Bubble|Auto-prompt/)
    expect(liz).toContain('aria-expanded={isOpen}')
    expect(liz).toContain('id="liz-assistant-panel"')
    expect(liz).toContain('env(safe-area-inset-bottom)')
  })

  it('keeps mobile recoloring useful without Cloudinary and supports touch and keyboard', () => {
    expect(color).toContain("CLOUDINARY_CLOUD_NAME === 'demo'")
    expect(color).toContain('previewFilter: ')
    expect(color).toContain('style={!imageData?.publicId ? { filter: selectedPalette.previewFilter } : undefined}')
    expect(color).toContain("defaultValue: 'Prévia ilustrativa'")
    expect(color).toContain("touchAction: 'none'")
    expect(color).toContain('onPointerDown=')
    expect(color).toContain('onKeyDown=')
    expect(color).toContain('aria-pressed={selectedPalette.id === palette.id}')
  })
})
