import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchUnsplashImages, searchUnsplashPage } from '@/lib/unsplash';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Unsplash pagination client contract', () => {
  it('forwards page/perPage and preserves pagination metadata', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => ({
        page: 3,
        perPage: 7,
        total: 42,
        totalPages: 6,
        photos: [{
          id: 'photo-3',
          alt: 'Sala contemporânea',
          photographer: 'WG QA',
          urls: { regular: 'https://images.example/photo-3.jpg' },
        }],
      }),
    });

    const result = await searchUnsplashPage({
      query: 'living room',
      orientation: 'portrait',
      perPage: 7,
      page: 3,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestUrl).toContain('query=living+room');
    expect(requestUrl).toContain('orientation=portrait');
    expect(requestUrl).toContain('per_page=7');
    expect(requestUrl).toContain('page=3');
    expect(result).toMatchObject({ page: 3, perPage: 7, total: 42, totalPages: 6 });
    expect(result.images).toHaveLength(1);
    expect(result.images[0].id).toBe('photo-3');
  });

  it('keeps searchUnsplashImages backward-compatible and clamps invalid pagination inputs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => ({
        photos: [{ id: 'photo-1', urls: { regular: 'https://images.example/photo-1.jpg' } }],
      }),
    });

    const images = await searchUnsplashImages({ query: 'kitchen', perPage: 999, page: 0 });

    const requestUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestUrl).toContain('per_page=20');
    expect(requestUrl).toContain('page=1');
    expect(Array.isArray(images)).toBe(true);
    expect(images).toHaveLength(1);
    expect(images[0].id).toBe('photo-1');
  });
});
