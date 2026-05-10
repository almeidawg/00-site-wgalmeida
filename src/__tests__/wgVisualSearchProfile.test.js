import { describe, expect, it } from 'vitest';

import { buildWgEditorialSearchPlan } from '@/lib/wgVisualSearchProfile';

describe('buildWgEditorialSearchPlan', () => {
  it('classifies architect roundups as person-led editorial instead of construction', () => {
    const plan = buildWgEditorialSearchPlan({
      title: 'Arquitetos Brasileiros Famosos: 7 Nomes, Obras e Lições para Projetos Atuais',
      slug: 'arquitetos-brasileiros-famosos-legado',
      category: 'arquitetura',
      tags: ['arquitetos brasileiros', 'Oscar Niemeyer', 'Paulo Mendes da Rocha', 'história da arquitetura'],
    });

    expect(plan.hero.intent).toBe('person');
    expect(plan.hero.entityType).toBe('person');
    expect(plan.hero.mainQuery).toContain('architect portrait');
    expect(plan.card.mainQuery).toContain('iconic architecture');
  });

  it('keeps international city editorials tied to skyline/landmark architecture', () => {
    const plan = buildWgEditorialSearchPlan({
      title: 'Arquitetura de Barcelona: Gaudí, Eixample e Lições para Projetos Contemporâneos',
      slug: 'arquitetura-barcelona-espanha',
      category: 'arquitetura internacional',
      tags: ['barcelona', 'gaudi', 'arquitetura espanhola'],
    });

    expect(plan.hero.entityType).toBe('city');
    expect(plan.hero.mainQuery).toBe('barcelona skyline architecture');
    expect(plan.card.mainQuery).toBe('barcelona landmark architecture detail');
  });
});
