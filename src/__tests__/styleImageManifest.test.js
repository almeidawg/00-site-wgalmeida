import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCloudinaryStyleImage,
  getStyleImageAsset,
  getStyleImageUrl,
  getStyleRemoteFallbackUrl,
  hasStyleRemoteFallback,
} from '@/data/styleImageManifest';

describe('style image manifest delivery', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('preserves the configured base path for committed style assets', () => {
    vi.stubEnv('BASE_URL', '/portal/');

    expect(getStyleImageUrl({ slug: 'minimalismo', variant: 'card' }))
      .toBe('/portal/images/estilos/minimalismo.webp');
    expect(getCloudinaryStyleImage({ slug: 'minimalismo', variant: 'seo' }))
      .toBe('https://wgalmeida.com.br/portal/images/estilos/minimalismo.webp');
  });

  it('uses the committed local WEBP as the canonical public asset', () => {
    const asset = getStyleImageAsset({ slug: 'art-deco', variant: 'hero' });

    expect(asset.kind).toBe('local');
    expect(asset.src).toBe('/images/estilos/art-deco.webp');
    expect(asset.remoteFallback).toContain('images.unsplash.com');
    expect(getStyleImageUrl({ slug: 'art-deco', variant: 'card' })).toBe('/images/estilos/art-deco.webp');
  });

  it('retires broken remote references without affecting local delivery', () => {
    const retiredSlugs = ['cottage', 'industrial', 'mediterraneo', 'mid-century', 'minimalismo', 'neoclassico'];

    for (const slug of retiredSlugs) {
      expect(getStyleRemoteFallbackUrl({ slug })).toBe('');
      expect(hasStyleRemoteFallback(slug)).toBe(false);
      expect(getStyleImageUrl({ slug })).toBe(`/images/estilos/${slug}.webp`);
    }
  });
});
