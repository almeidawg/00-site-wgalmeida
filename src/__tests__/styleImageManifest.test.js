import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getStyleImageAsset, getStyleImageUrl } from '@/data/styleImageManifest';

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
  });

  it('uses the committed local WEBP as the canonical public asset', () => {
    const asset = getStyleImageAsset({ slug: 'minimalismo', variant: 'hero' });

    expect(asset.kind).toBe('local');
    expect(asset.src).toBe('/images/estilos/minimalismo.webp');
    expect(asset.remoteFallback).toContain('images.unsplash.com');
    expect(getStyleImageUrl({ slug: 'minimalismo', variant: 'card' })).toBe('/images/estilos/minimalismo.webp');
  });
});
