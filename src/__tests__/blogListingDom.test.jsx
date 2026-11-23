import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal()),
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'pt-BR' },
  }),
}));

vi.mock('@/components/SEO', () => ({
  default: () => null,
  schemas: { article: () => ({}) },
}));

vi.mock('@/components/blog/NewsletterSignup', () => ({
  default: () => <div data-testid="newsletter-placeholder" />,
}));

vi.mock('@/data/blogCms', () => ({
  mergeArticlesWithCms: () => [
    { slug: 'casa-teste', title: 'Casa Exemplo', date: '2026-10-29', excerpt: 'Projeto residencial de teste', featured: true, category: 'arquitetura', readTime: '4 min', content: '' },
    { slug: 'interiores-teste', title: 'Interiores Exemplo', date: '2026-10-28', excerpt: 'Decoração de teste', category: 'arquitetura', readTime: '3 min', content: '' },
    { slug: 'engenharia-teste', title: 'Engenharia Exemplo', date: '2026-10-27', excerpt: 'Execução de teste', category: 'engenharia', readTime: '5 min', content: '' },
    { slug: 'marcenaria-teste', title: 'Marcenaria Exemplo', date: '2026-10-26', excerpt: 'Marcenaria de teste', category: 'marcenaria', readTime: '6 min', content: '' },
    { slug: 'arquitetura-dois', title: 'Arquitetura Adicional', date: '2026-10-25', excerpt: 'Outro projeto', category: 'arquitetura', readTime: '5 min', content: '' },
  ],
  getArticleMetrics: () => ({ likes: 0, shares: 0, comments: 0 }),
  registerArticleShare: () => ({ likes: 0, shares: 0, comments: 0 }),
}));

import Blog from '@/pages/Blog';

const renderListing = () => render(
  <MemoryRouter initialEntries={['/blog']}>
    <Routes><Route path="/blog" element={<Blog />} /></Routes>
  </MemoryRouter>
);

describe('Blog listing — DOM behavior with local fixtures', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders editorial cards with deferred media and semantic article links', async () => {
    const view = renderListing();
    expect(await screen.findAllByText('Casa Exemplo')).not.toHaveLength(0);
    expect(await screen.findAllByText('Interiores Exemplo')).not.toHaveLength(0);

    const articleLinks = [...view.container.querySelectorAll('a[href="/blog/interiores-teste"]')];
    expect(articleLinks.length).toBeGreaterThan(0);
    const images = [...view.container.querySelectorAll('img[loading="lazy"][decoding="async"]')];
    expect(images.length).toBeGreaterThan(0);
    expect(images.some((image) => image.alt === 'Interiores Exemplo')).toBe(true);
    expect(screen.getByTestId('newsletter-placeholder')).toBeInTheDocument();
  });

  it('filters the blog by search and displays an empty-state message', async () => {
    renderListing();
    await screen.findAllByText('Interiores Exemplo');

    fireEvent.change(screen.getByRole('textbox', { name: 'common.search' }), {
      target: { value: 'termo-sem-resultados-fixture' },
    });
    await waitFor(() => expect(screen.getByText('blogPage.notFound.title')).toBeInTheDocument());
    expect(screen.queryByText('Interiores Exemplo')).not.toBeInTheDocument();
  });

  it('filters by category without making network submissions', async () => {
    renderListing();
    await screen.findAllByText('Interiores Exemplo');
    fireEvent.click(screen.getByRole('button', { name: 'blog.categories.engineering' }));
    expect(await screen.findAllByText('Engenharia Exemplo')).not.toHaveLength(0);
    expect(screen.queryByText('Marcenaria Exemplo')).not.toBeInTheDocument();
  });
});
