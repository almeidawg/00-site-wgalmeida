import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(resolve(process.cwd(), 'src/pages/Blog.jsx'), 'utf8')

describe('Blog listing accessibility and deferred media contract', () => {
  it('uses a level-two heading for the featured article following the page title', () => {
    expect(source).toMatch(/<h2 className="mb-4 text-2xl[^"]*">\s*\{article\.title\}\s*<\/h2>/)
  })

  it('defers decoding and loading of article card images', () => {
    const cardImages = source.match(/src=\{article\.image \|\| '\/images\/blog\/placeholder\.webp'\}[\s\S]{0,120}?loading="lazy"[\s\S]{0,70}?decoding="async"/g) || []
    expect(cardImages).toHaveLength(5)
  })
})
