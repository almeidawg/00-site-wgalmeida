import { describe, expect, it } from 'vitest';
import {
  STYLE_MATERIAL_MAPPING,
  STYLE_DECOR_MAPPING,
  buildStyleEditorialSearchPlan,
} from '@/lib/styleEditorialSearchProfile';

const migratedStyles = ['industrial', 'minimalismo', 'japandi', 'moderno', 'classico', 'tropical'];

const migratedEvidence = {
  industrial: {
    material: 'Cimento Queimado Platinum',
    decor: 'Mesa de Jantar em Madeira de Demolição',
  },
  minimalismo: {
    material: 'Mármore Branco Paraná',
    decor: 'Sofá Modular de Linho Cru',
  },
  japandi: {
    material: 'Madeira Carvalho Light',
    decor: 'Mobiliário de Linhas Baixas',
  },
  moderno: {
    material: 'Painéis em Nogueira',
    decor: 'Poltrona Charles Eames',
  },
  classico: {
    material: 'Mármore Carrara',
    decor: 'Vasos de Murano',
  },
  tropical: {
    material: 'Pedra Moledo Aparente',
    decor: 'Móveis em Rattan e Vime',
  },
};

describe('migração da curadoria legada para o perfil editorial canônico', () => {
  it('preserva os termos prioritários existentes e incorpora o vocabulário legado', () => {
    expect(STYLE_MATERIAL_MAPPING.industrial[0]).toBe('Tijolinho Aparente');
    expect(STYLE_DECOR_MAPPING.industrial[0]).toBe('Sofá de Couro Conhaque');

    for (const slug of migratedStyles) {
      expect(STYLE_MATERIAL_MAPPING[slug]).toContain(migratedEvidence[slug].material);
      expect(STYLE_DECOR_MAPPING[slug]).toContain(migratedEvidence[slug].decor);
    }
  });

  it('gera planos determinísticos para acabamentos e decoração', () => {
    const style = { slug: 'japandi', title: 'Japandi', excerpt: '', tags: [] };

    const finishesA = buildStyleEditorialSearchPlan(style, 'finishes');
    const finishesB = buildStyleEditorialSearchPlan(style, 'finishes');
    const decorA = buildStyleEditorialSearchPlan(style, 'decor');
    const decorB = buildStyleEditorialSearchPlan(style, 'decor');

    expect(finishesA).toEqual(finishesB);
    expect(decorA).toEqual(decorB);
    expect(finishesA.searchTerms).toContain('Madeira Carvalho Light');
    expect(decorA.searchTerms).toContain('Mobiliário de Linhas Baixas');
  });
});
