import { describe, expect, it } from 'vitest';
import { stripImageForStorage, stripStyleForStorage } from '@/contexts/MoodboardContext';

describe('moodboard persistence payload', () => {
  it('keeps only the style fields required to restore the studio', () => {
    const sanitized = stripStyleForStorage({
      slug: 'boho',
      id: 'boho',
      name: 'Boho',
      title: 'Estilo Boho',
      colors: ['#ffffff'],
      tags: ['acolhedor'],
      content: 'conteúdo editorial muito extenso que não deve ir para o localStorage',
      internalNotes: 'não persistir',
    });

    expect(sanitized).toMatchObject({
      slug: 'boho',
      id: 'boho',
      name: 'Boho',
      title: 'Estilo Boho',
      colors: ['#ffffff'],
      tags: ['acolhedor'],
    });
    expect(sanitized).not.toHaveProperty('content');
    expect(sanitized).not.toHaveProperty('internalNotes');
  });

  it('removes embedded image payloads from the compact fallback', () => {
    const sanitized = stripImageForStorage({
      id: 'image-1',
      name: 'Referência',
      url: 'data:image/png;base64,AAA',
      thumb: 'blob:https://example.test/id',
      source: 'upload',
      type: 'local',
    });

    expect(sanitized.url).toBe('');
    expect(sanitized.thumb).toBe('');
  });
});
