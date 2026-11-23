import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(resolve(process.cwd(), 'src/pages/Blog.jsx'), 'utf8')

describe('Blog listing accessibility and deferred media contract', () => {
  it('keeps feature headings semantic after reusing the lead article layout', () => {
    expect(source).toMatch(/const Heading = isLead \? 'h3' : 'h2'/)
    expect(source).toMatch(/<Heading className="mb-4 text-2xl[^"]*">\s*\{article\.title\}\s*<\/Heading>/)
    expect(source).toContain("renderFeatureCard(leadArticle, 'lead', true)")
    expect(source).toContain('renderFeatureCard(row.lead, row.id)')
  })

  it('uses one deferred image implementation across all four card layouts', () => {
    expect(source).toMatch(/const ArticleCardCover = \(\{ article, imageClassName, gradient = false \}\) =>/)
    expect(source).toMatch(/src=\{article\.image \|\| '\/images\/blog\/placeholder\.webp'\}[\s\S]{0,120}?loading="lazy"[\s\S]{0,70}?decoding="async"/)
    expect(source.match(/<ArticleCardCover\b/g) || []).toHaveLength(4)
    expect(source).toContain('onError={handleArticleImageError}')
  })
})
