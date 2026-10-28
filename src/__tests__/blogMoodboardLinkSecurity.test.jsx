import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import BlogMoodboardPanel from '@/components/blog/BlogMoodboardPanel'

const renderArticle = (shareUrl) => (
  <MemoryRouter>
    <BlogMoodboardPanel article={{
      moodboard: { palette: ['#ffffff'] },
      moodboardShareUrl: shareUrl,
    }} />
  </MemoryRouter>
)

describe('Blog moodboard navigation safety', () => {
  it.each([
    '//evil.example',
    '/\\evil.example',
    'https://evil.example',
    '/%2fevil.example',
    'javascript:alert(1)',
  ])('does not render a public link to untrusted destination %s', (url) => {
    render(renderArticle(url))
    expect(screen.queryByRole('link', { name: /abrir mood board público/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /abrir estúdio wg/i })).toHaveAttribute('href', '/moodboard')
  })

  it('preserves a valid internal share link', () => {
    render(renderArticle('/moodboard/share?v=synthetic'))
    expect(screen.getByRole('link', { name: /abrir mood board público/i }))
      .toHaveAttribute('href', '/moodboard/share?v=synthetic')
  })
})
