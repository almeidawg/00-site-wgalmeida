import { describe, expect, it } from 'vitest';
import { buildWgImageSearchPayload } from '@/lib/wgVisualSearchProfile';

describe('WG editorial visual search routing', () => {
  it('keeps construction articles in construction even when trend/technology terms are present', () => {
    const result = buildWgImageSearchPayload(
      'Construção Civil 2026: 12 Tendências automação tecnologia para reduzir prazo e custo',
      { category: 'construção civil', slot: 'hero' }
    );

    expect(result.intent).toBe('construction');
    expect(result.entityType).toBe('');
  });

  it('does not treat a generic article about hiring an architect as a person profile', () => {
    const result = buildWgImageSearchPayload(
      'Vale a pena contratar arquiteto no modelo turn key?',
      { category: 'arquitetura', slot: 'hero' }
    );

    expect(result.entityType).toBe('');
    expect(result.intent).toBe('architecture');
    expect(result.mainQuery).not.toContain('portrait');
  });

  it('still recognizes named architect references as person/editorial-reference content', () => {
    const result = buildWgImageSearchPayload(
      'Oscar Niemeyer: obras e legado da arquitetura brasileira',
      { category: 'arquitetura', slot: 'hero' }
    );

    expect(result.entityType).toBe('person');
    expect(result.mainQuery).toContain('architect portrait');
  });

  it('keeps broad decor trend articles broad instead of collapsing to one room mentioned in the title', () => {
    const result = buildWgImageSearchPayload(
      'Tendências de Decoração 2026: ideias para sala, quarto e cozinha',
      { category: 'decoração', slot: 'hero' }
    );

    expect(result.intent).toBe('decor');
  });
});
