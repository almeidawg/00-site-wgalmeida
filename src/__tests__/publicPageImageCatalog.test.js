import { beforeEach, describe, expect, it } from 'vitest';

import { getPublicPageImageAsset } from '@/data/publicPageImageCatalog';

const PUBLISHED_UPLOADS_KEY = 'wg_blog_editorial_published_uploads_v1';
const PUBLISHED_UNSPLASH_KEY = 'wg_blog_editorial_published_unsplash_v1';

describe('public page image catalog', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('uses published admin uploads before static page fallbacks', () => {
    window.localStorage.setItem(PUBLISHED_UPLOADS_KEY, JSON.stringify({
      buildtech: {
        hero: {
          src: 'https://res.cloudinary.com/demo/image/upload/editorial/pages/buildtech/hero.webp',
          alt: 'BuildTech dashboard atualizado',
        },
      },
    }));

    const asset = getPublicPageImageAsset('buildtech');

    expect(asset.src).toBe('https://res.cloudinary.com/demo/image/upload/editorial/pages/buildtech/hero.webp');
    expect(asset.alt).toBe('BuildTech dashboard atualizado');
  });

  it('uses published admin unsplash selections for page heroes', () => {
    window.localStorage.setItem(PUBLISHED_UNSPLASH_KEY, JSON.stringify({
      buildtech: {
        hero: {
          id: 'abc123',
          alt: 'Tecnologia de obra publicada pelo Admin',
        },
      },
    }));

    const asset = getPublicPageImageAsset('buildtech');

    expect(asset.source).toBe('unsplash');
    expect(asset.src).toContain('https://unsplash.com/photos/abc123/download');
    expect(asset.alt).toBe('Tecnologia de obra publicada pelo Admin');
  });
});
