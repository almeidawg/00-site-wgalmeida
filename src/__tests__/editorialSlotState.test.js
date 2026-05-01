import { describe, expect, it } from 'vitest';

import {
  createCloudinarySlotState,
  createExternalSlotState,
  stripSlotSourceFields,
} from '@/utils/editorialSlotState';

describe('editorial slot state helpers', () => {
  it('drops stale cloudinary identifiers when switching a slot to external source', () => {
    const slot = createExternalSlotState(
      {
        publicId: 'editorial/blog/post/hero',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/editorial/blog/post/hero.webp',
        alt: 'Hero atualizado',
        caption: 'Legenda preservada',
      },
      {
        src: 'https://images.unsplash.com/photo-123',
        source: 'unsplash',
        unsplashPhotoId: 'photo-123',
        pageUrl: 'https://unsplash.com/photos/photo-123',
      },
      '2026-05-01T13:30:00.000Z',
    );

    expect(slot.publicId).toBeUndefined();
    expect(slot.secureUrl).toBeUndefined();
    expect(slot.src).toBe('https://images.unsplash.com/photo-123');
    expect(slot.alt).toBe('Hero atualizado');
    expect(slot.caption).toBe('Legenda preservada');
    expect(slot.unsplashPhotoId).toBe('photo-123');
  });

  it('keeps only metadata when unsplash selection should replace an older upload', () => {
    const slot = stripSlotSourceFields({
      publicId: 'editorial/blog/post/card',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/editorial/blog/post/card.webp',
      src: 'https://legacy.example.com/card.webp',
      alt: 'Card curado',
      caption: 'Texto de apoio',
      sectionTitle: 'Bloco principal',
    });

    expect(slot).toEqual({
      alt: 'Card curado',
      caption: 'Texto de apoio',
      sectionTitle: 'Bloco principal',
    });
  });

  it('drops stale url fields when a fresh cloudinary upload becomes authoritative', () => {
    const slot = createCloudinarySlotState(
      {
        src: 'https://images.unsplash.com/photo-456',
        source: 'unsplash',
        unsplashPhotoId: 'photo-456',
        pageUrl: 'https://unsplash.com/photos/photo-456',
        alt: 'Hero final',
      },
      {
        public_id: 'editorial/blog/post/hero',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/editorial/blog/post/hero.webp',
        original_filename: 'hero-final',
      },
      '2026-05-01T13:30:00.000Z',
    );

    expect(slot.src).toBeUndefined();
    expect(slot.unsplashPhotoId).toBeUndefined();
    expect(slot.pageUrl).toBeUndefined();
    expect(slot.publicId).toBe('editorial/blog/post/hero');
    expect(slot.source).toBe('cloudinary');
    expect(slot.alt).toBe('Hero final');
  });
});
