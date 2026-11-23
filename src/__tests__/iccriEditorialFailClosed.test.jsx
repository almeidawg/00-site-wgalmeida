import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/data/editorialThemes', () => ({
  getEditorialTheme: () => ({ calloutClass: 'bg-white', iconClass: 'text-black' }),
}));
vi.mock('@/data/commercialGovernance', () => ({
  getCommercialPackages: () => [{
    key: 'essencial',
    label: 'Essencial',
    rangeLabel: 'R$ 900 a R$ 1.400 por m2',
    timelineBase: '90 a 120 dias',
    timelineTypical: '90 a 120 dias',
    summary: 'Escopo editorial',
    variation: 'Variacoes de escopo',
    includes: [],
    excludes: [],
    idealFor: 'Briefing',
    timelineDependencies: [],
    timelineFactors: [],
  }],
  resolveCommercialProfile: () => ({
    service: {
      id: 'iccri-reforma-civil-sp',
      label: 'ICCRI reforma civil',
      nucleus: 'construcao-obra',
      packages: { essencial: {} },
      variationFactors: [],
      observations: [],
    },
    packageFocus: 'essencial',
    sourceOfTruth: 'Registro editorial desatualizado',
  }),
}));

import CommercialGovernancePanel from '@/components/blog/CommercialGovernancePanel';

describe('ICCRI editorial gate', () => {
  it('não expõe réguas de preço e prazo não reconciliadas como orçamento confiável', () => {
    render(<CommercialGovernancePanel serviceId="iccri-reforma-civil-sp" />);
    expect(screen.queryByText(/R\$ 900/)).not.toBeInTheDocument();
    expect(screen.queryByText(/90 a 120 dias/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/a confirmar após análise técnica/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Referências ICCRI em reconciliação/i)).toBeInTheDocument();
  });
});
