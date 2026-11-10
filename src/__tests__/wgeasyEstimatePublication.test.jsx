import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { canPublishWGEasyEstimate } from '@/lib/estimatePublicationGate';
import WGEasyEstimateCalculator from '@/components/WGEasyEstimateCalculator';

const approved = {
  ok: true,
  area: 80,
  referenceDate: '2026-11-01',
  perSquareMeter: { minimum: 1500, likely: 1750, maximum: 2000 },
  total: { minimum: 120000, likely: 140000, maximum: 160000 },
  publication: {
    status: 'homologated',
    approvalReference: 'fixture-approval',
    calibrationReference: 'fixture-calibration',
    scopeVersion: 'fixture-scope',
    unit: 'BRL/m2',
    sourceProjectRef: 'xkvuhixxpfonfcwrvknm',
    approvedAt: '2026-11-01T12:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
  },
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('WGEasy public estimate publication gate', () => {
  const asOf = new Date('2026-11-09T15:00:00Z');

  it('só libera uma composição com prova de homologação, validade e escala coerente', () => {
    expect(canPublishWGEasyEstimate(approved, asOf)).toBe(true);
    expect(canPublishWGEasyEstimate({ ...approved, publication: undefined }, asOf)).toBe(false);
    expect(canPublishWGEasyEstimate({ ...approved, publication: { ...approved.publication, sourceProjectRef: 'ayhcldffqadlbfjhkrmg' } }, asOf)).toBe(false);
    expect(canPublishWGEasyEstimate({ ...approved, total: { minimum: 160000, likely: 140000, maximum: 120000 } }, asOf)).toBe(false);
    expect(canPublishWGEasyEstimate({ ...approved, publication: { ...approved.publication, validUntil: '2026-11-01' } }, asOf)).toBe(false);
  });

  it('não mostra preço apenas porque API respondeu 200 com faixas legadas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        area: 80,
        standard: { label: 'Equilibrado' },
        region: { label: 'São Paulo' },
        referenceDate: '2026-06-01',
        total: { minimum: 384000, likely: 480000, maximum: 576000 },
      }),
    }));
    render(<WGEasyEstimateCalculator />);
    fireEvent.click(screen.getByRole('button', { name: /Calcular faixa estimada/i }));
    await waitFor(() => expect(screen.getByText(/sem homologação vigente/i)).toBeInTheDocument());
    expect(screen.queryByText(/R\\$ 384\\.000/)).not.toBeInTheDocument();
  });
});
