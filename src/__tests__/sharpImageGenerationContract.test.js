import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import sharp from 'sharp'
import { afterEach, describe, expect, it } from 'vitest'

const temporaryDirectories = []
const generator = resolve('tools/generate-style-webp-from-svg.mjs')

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'wg-style-webp-contract-'))
  temporaryDirectories.push(directory)
  return {
    directory,
    run: () => execFileSync(process.execPath, [generator, directory], {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 30_000,
    }),
  }
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('Sharp asset build contract (fixture-only images)', () => {
  it('transforms a synthetic oversized SVG into a bounded WebP', async () => {
    const test = fixture()
    writeFileSync(join(test.directory, 'synthetic.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200">' +
      '<rect width="2400" height="1200" fill="#637d95"/></svg>')

    const output = test.run()
    const file = join(test.directory, 'synthetic.webp')
    const bytes = readFileSync(file)
    const image = await sharp(bytes).metadata()

    expect(output).toContain('webp generated/updated: 1')
    expect(image.format).toBe('webp')
    expect([image.width, image.height]).toEqual([1600, 800])
    expect(bytes.length).toBeGreaterThan(0)

    const secondRun = test.run()
    expect(secondRun).toContain('webp skipped: 1')
    expect(readFileSync(file).equals(bytes)).toBe(true)
  })

  it('preserves source dimensions for an embedded synthetic PNG', async () => {
    const test = fixture()
    const embedded = await sharp({
      create: { width: 320, height: 160, channels: 4, background: '#486e92' },
    }).png().toBuffer()
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160">' +
      '<image href="data:image/png;base64,' + embedded.toString('base64') +
      '" width="320" height="160"/></svg>'
    writeFileSync(join(test.directory, 'embedded.svg'), svg)

    expect(test.run()).toContain('webp generated/updated: 1')
    const image = await sharp(readFileSync(join(test.directory, 'embedded.webp'))).metadata()
    expect(image.format).toBe('webp')
    expect([image.width, image.height]).toEqual([320, 160])
  })
})
