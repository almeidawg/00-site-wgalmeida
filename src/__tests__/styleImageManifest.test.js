import { beforeEach, describe, expect, it } from 'vitest';
import { getStyleImageAsset, getStyleImageUrl } from '@/data/styleImageManifest';

describe('style image manifest delivery', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('uses the committed local WEBP as the canonical public asset', () => {
    const asset = getStyleImageAsset({ slug: 'minimalismo', variant: 'hero' });

    expect(asset.kind).toBe('local');
    expect(asset.src).toBe('/images/estilos/minimalismo.webp');
    expect(asset.remoteFallback).toContain('images.unsplash.com');
    expect(getStyleImageUrl({ slug: 'minimalismo', variant: 'card' })).toBe('/images/estilos/minimalismo.webp');
  });
});
