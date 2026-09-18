import { describe, expect, it } from 'vitest';

import {
  buildEditorialImageStrategy,
  getImageSourcePolicy,
  scoreEditorialCandidate,
} from '@/lib/editorialImageIntelligence';

describe('editorial image intelligence', () => {
  it('classifies the architects legacy model as an authorial portrait/architecture system', () => {
    const strategy = buildEditorialImageStrategy({
      slug: 'arquitetos-brasileiros-famosos-legado',
      title: 'Arquitetos Brasileiros Famosos: 12 Nomes, Obras e Lições para Projetos Atuais',
      category: 'arquitetura',
      tags: ['arquitetos', 'brasil', 'legado'],
    });

    expect(strategy.slots.hero.mainQuery).toContain('architect portrait');
    expect(strategy.slots.card.mainQuery).toContain('iconic architecture');
    expect(strategy.visualFamily).toContain('autoral');
  });

  it('keeps Pinterest as reference-only media governance', () => {
    const policy = getImageSourcePolicy('pinterest');

    expect(policy.canPublish).toBe(false);
    expect(policy.status).toBe('reference_only');
  });

  it('scores Unsplash as publishable and keeps candidate attribution fields', () => {
    const scored = scoreEditorialCandidate(
      {
        source: 'unsplash',
        title: 'Modern custom carpentry interior',
        author: 'Jane Doe',
        pageUrl: 'https://unsplash.com/photos/demo',
        downloadLocation: 'https://api.unsplash.com/photos/demo/download',
      },
      {
        slot: 'hero',
        intent: 'carpentry',
        mainQuery: 'custom carpentry interior',
      },
      {
        title: 'Como escolher marcenaria sob medida',
        category: 'marcenaria',
      },
    );

    expect(scored.canPublish).toBe(true);
    expect(scored.licenseStatus).toBe('publishable');
    expect(scored.scores.final).toBeGreaterThan(40);
    expect(scored.selectionStatus).toBe('sugerida');
    expect(scored.downloadLocation).toContain('/download');
  });

  it('does not auto-suggest a publishable but semantically unrelated image', () => {
    const scored = scoreEditorialCandidate(
      {
        source: 'unsplash',
        title: 'Tropical beach sunset with palm trees',
        author: 'Jane Doe',
        pageUrl: 'https://unsplash.com/photos/unrelated',
      },
      {
        slot: 'hero',
        intent: 'carpentry',
        mainQuery: 'custom carpentry interior',
      },
      {
        title: 'Como escolher marcenaria sob medida',
        category: 'marcenaria',
      },
    );

    expect(scored.canPublish).toBe(true);
    expect(scored.scores.final).toBeLessThan(45);
    expect(scored.selectionStatus).toBe('revisao');
  });

  it('keeps candidates without descriptive metadata in editorial review', () => {
    const scored = scoreEditorialCandidate(
      {
        source: 'unsplash',
        author: 'Jane Doe',
        pageUrl: 'https://unsplash.com/photos/no-description',
      },
      {
        slot: 'hero',
        intent: 'architecture',
        mainQuery: 'modern residential architecture',
      },
      {
        title: 'Arquitetura residencial contemporânea',
        category: 'arquitetura',
      },
    );

    expect(scored.alt).toBe('');
    expect(scored.selectionStatus).toBe('revisao');
  });
});