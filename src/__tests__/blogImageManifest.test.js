import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/data/blogUnsplashManifest.generated.js', () => ({
  BLOG_UNSPLASH_MANIFEST: { slugs: {} },
}));

vi.mock('@/data/blogImageOverrides.generated.js', () => ({
  default: {
    generatedAt: '2026-05-01T00:00:00.000Z',
    source: 'test-generated',
    slugs: {
      'post-teste-regressao': {
        hero: {
          source: 'remote',
          src: 'https://cdn.example.com/new-hero.webp',
          alt: 'Novo hero publicado',
        },
        default: {
          source: 'remote',
          src: 'https://cdn.example.com/new-hero.webp',
          alt: 'Novo hero publicado',
        },
      },
      'projeto-executivo-o-que-e': {
        hero: { source: 'local', src: '/og-engenharia-1200x630.jpg' },
        seo: { source: 'local', src: '/og-engenharia-1200x630.jpg' },
        card: { source: 'local', src: '/images/banners/PROCESSOS.webp' },
        thumb: { source: 'local', src: '/images/banners/PROCESSOS.webp' },
        square: { source: 'local', src: '/images/banners/PROCESSOS.webp' },
        default: { source: 'local', src: '/og-engenharia-1200x630.jpg' },
      },
    },
  },
}));

vi.mock('@/data/blogImageOverrides.canonical.js', () => ({
  default: {
    generatedAt: '2026-04-16T00:00:00.000Z',
    source: 'test-canonical',
    slugs: {
      'post-teste-regressao': {
        hero: {
          source: 'local',
          src: '/images/blog/post-teste-regressao/hero-antigo.webp',
          alt: 'Hero antigo',
        },
        default: {
          source: 'local',
          src: '/images/blog/post-teste-regressao/hero-antigo.webp',
          alt: 'Hero antigo',
        },
      },
    },
  },
}));

import { getBlogImageAsset } from '@/data/blogImageManifest';

describe('blog image manifest precedence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('prefers generated overrides over canonical legacy overrides', () => {
    const asset = getBlogImageAsset({
      slug: 'post-teste-regressao',
      variant: 'hero',
      allowCategoryFallback: false,
    });

    expect(asset.src).toBe('https://cdn.example.com/new-hero.webp');
    expect(asset.alt).toBe('Novo hero publicado');
  });

  it('preserves a string Cloudinary fallback after generic generated slots are sanitized', () => {
    const asset = getBlogImageAsset({
      slug: 'projeto-executivo-o-que-e',
      variant: 'hero',
      allowCategoryFallback: false,
    });

    expect(asset.source).toBe('cloudinary');
    expect(asset.publicId).toBe('editorial/blog/projeto-executivo');
    expect(asset.src).toContain('/editorial/blog/projeto-executivo');
    expect(asset.src).not.toContain('/og-engenharia-1200x630.jpg');
  });

  it('treats canonical legacy entries as fallback when a curated manifest exists', () => {
    const asset = getBlogImageAsset({
      slug: 'arquitetos-brasileiros-famosos-legado',
      variant: 'hero',
      allowCategoryFallback: false,
    });

    expect(asset.src).toBe('https://upload.wikimedia.org/wikipedia/commons/7/70/Oscar_Niemeyer_1968b.jpg');
    expect(asset.source).toBe('remote');
  });
});
