import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/data/blogCms.generated.js', () => ({
  default: {
    generatedAt: '2026-05-10T00:00:00.000Z',
    source: 'vitest',
    taxonomies: {
      authors: ['Grupo WG Almeida'],
      categories: ['arquitetura'],
      tags: ['legacy'],
    },
    posts: {
      'post-cms-publicado': {
        slug: 'post-cms-publicado',
        title: 'Post publicado apenas pelo CMS',
        excerpt: 'Resumo publicado pelo CMS.',
        summary: 'Resumo publicado pelo CMS.',
        author: 'Grupo WG Almeida',
        category: 'arquitetura',
        tags: ['legacy'],
        seoTitle: 'Post publicado apenas pelo CMS',
        metaDescription: 'Resumo publicado pelo CMS.',
        date: '2026-05-10',
        readTime: '6 min',
        featured: false,
        status: 'published',
        templateId: 'legacy-architects-master-v1',
        content: '## Introdução\n\nConteúdo do CMS.',
        coverAlt: 'Post publicado apenas pelo CMS',
        gallery: [],
        faq: [],
        cta: { label: 'CTA', href: '/solicite-proposta', helper: '' },
        relatedSlugs: [],
        moodboard: {
          projectName: 'Post publicado apenas pelo CMS',
          clientName: 'Leitor WG Almeida',
          palette: ['#F5F0E8'],
          styleSlugs: ['japandi'],
          referenceImages: [],
          note: '',
        },
        publishedAt: '2026-05-10T00:00:00.000Z',
        updatedAt: '2026-05-10T00:00:00.000Z',
      },
    },
  },
}));

import { buildBlogMoodboardShareUrl, mergeArticlesWithCms } from '@/data/blogCms';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const helperModulePath = path.join(repoRoot, 'api', '_blogCms.js');
const originalCwd = process.cwd();

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(async () => {
  process.chdir(originalCwd);
});

describe('blog CMS helpers', () => {
  it('adds CMS-only published posts to the merged public list', () => {
    const baseArticles = [
      {
        slug: 'post-base',
        title: 'Post Base',
        excerpt: 'Resumo base.',
        summary: 'Resumo base.',
        author: 'Grupo WG Almeida',
        category: 'arquitetura',
        tags: ['base'],
        seoTitle: 'Post Base',
        metaDescription: 'Resumo base.',
        date: '2026-05-01',
        readTime: '5 min',
        featured: true,
        status: 'published',
        templateId: 'legacy-architects-master-v1',
        content: '## Introdução\n\nBase.',
      },
    ];

    const merged = mergeArticlesWithCms(baseArticles);

    expect(merged.map((article) => article.slug)).toContain('post-base');
    expect(merged.map((article) => article.slug)).toContain('post-cms-publicado');
  });

  it('builds a public moodboard share URL from article metadata', () => {
    const shareUrl = buildBlogMoodboardShareUrl({
      slug: 'post-share',
      title: 'Post Share',
      moodboard: {
        projectName: 'Post Share',
        clientName: 'Cliente WG',
        palette: ['#F5F0E8'],
        styleSlugs: ['japandi'],
        referenceImages: [{ url: 'https://example.com/ref.webp', title: 'Referência' }],
      },
    });

    expect(shareUrl).toContain('/moodboard/share?v=');
  });
});

describe('syncBlogCms', () => {
  it('writes published CMS posts to the generated module', async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'wg-blog-cms-'));
    const dataDir = path.join(tempRoot, 'src', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      path.join(dataDir, 'blogCms.generated.js'),
      'const BLOG_CMS_GENERATED = { generatedAt: "", source: "test", taxonomies: { authors: [], categories: [], tags: [] }, posts: {} };\nexport default BLOG_CMS_GENERATED;\n',
      'utf8'
    );

    process.chdir(tempRoot);

    const helper = await import(`${pathToFileURL(helperModulePath).href}?test=${Date.now()}`);
    const result = await helper.syncBlogCms({
      posts: {
        'novo-post': {
          slug: 'novo-post',
          title: 'Novo Post',
          excerpt: 'Resumo do novo post.',
          category: 'arquitetura',
          tags: ['novo'],
          status: 'published',
          content: '## Introdução\n\nConteúdo novo.',
        },
      },
      taxonomies: {
        authors: ['Grupo WG Almeida'],
        categories: ['arquitetura'],
        tags: ['novo'],
      },
      source: 'vitest-blog-cms',
    });

    expect(result.ok).toBe(true);
    expect(result.posts.count).toBe(1);

    const output = await fs.readFile(path.join(dataDir, 'blogCms.generated.js'), 'utf8');
    expect(output).toContain('"novo-post"');
    expect(output).toContain('"title": "Novo Post"');
    expect(output).toContain('"source": "vitest-blog-cms"');
  });
});
