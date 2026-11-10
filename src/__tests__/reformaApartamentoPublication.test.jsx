import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/SEO', () => ({
  default: () => null,
  schemas: { localBusiness: () => ({ '@type': 'LocalBusiness' }) },
}));
vi.mock('@/components/SmartCTA', () => ({ default: () => null }));
vi.mock('react-router-dom', () => ({
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
}));
vi.mock('@/lib/motion-lite', () => ({
  motion: {
    div: ({ children, initial, animate, whileInView, viewport, transition, ...props }) => <div {...props}>{children}</div>,
  },
}));
vi.mock('@/utils/assetPaths', () => ({ withBasePath: (path) => path }));
vi.mock('@/data/publicPageImageCatalog', () => ({
  getPublicPageImageSrc: (_name, fallback) => fallback,
}));
vi.mock('@/data/company', () => ({ COMPANY: {} }));
vi.mock('@/data/commercialGovernance', () => ({
  getCommercialService: () => ({ sourceOfTruth: 'Registro comercial legado' }),
  getCommercialPackages: () => [{
    key: 'equilibrado',
    label: 'Equilibrado',
    rangeLabel: 'R$ 3.500 a R$ 6.500 por m²',
    includes: ['Execução compatibilizada'],
  }],
}));

import ReformaApartamentoSP from '@/pages/ReformaApartamentoSP';

afterEach(cleanup);

describe('ReformaApartamentoSP — publicação comercial governada', () => {
  it('não apresenta preços ou durações fixas sem validação técnica', () => {
    render(<ReformaApartamentoSP />);

    expect(screen.getByText('Equilibrado')).toBeInTheDocument();
    expect(screen.getByText('Execução compatibilizada')).toBeInTheDocument();
    expect(screen.queryByText(/R\\$ 3\\.500 a R\\$ 6\\.500/)).not.toBeInTheDocument();
    expect(screen.queryByText('12-20 semanas')).not.toBeInTheDocument();
    expect(screen.queryByText('Registro comercial legado')).not.toBeInTheDocument();
    expect(screen.getAllByText(/A confirmar após análise técnica/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Plano executivo compatibilizado/i)).toBeInTheDocument();
  });
});
