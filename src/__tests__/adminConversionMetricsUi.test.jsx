import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/SupabaseAuthContext', () => ({
  useAuth: () => ({ session: { access_token: 'synthetic-test-session' } }),
}));

import AdminConversionMetrics from '@/pages/AdminConversionMetrics';

const fixture = {
  totals: { events: 12, saved: 9, saveRate: 0.75, duplicate: 2, rejected: 1, promotionCompleted: 3, leadPromotions: 4 },
  byContext: { moodboard: 5, contact: 7 },
  byReason: { saved: 9, duplicate: 2, rejected: 1 },
  daily: [{ date: '2026-10-30', total: 12 }],
};

const mockResponse = (data = fixture) => ({
  ok: true,
  status: 200,
  json: async () => data,
});

describe('AdminConversionMetrics — telemetry without external requests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders simulated conversion metrics and sends the authenticated read request', async () => {
    render(<AdminConversionMetrics />);

    expect(await screen.findByText('Conversão & Observabilidade')).toBeInTheDocument();
    expect(await screen.findAllByText('12')).toHaveLength(2);
    expect(screen.getByText('75% dos eventos')).toBeInTheDocument();
    expect(screen.getByText(/4 no CRM em todas as origens/)).toBeInTheDocument();
    expect(screen.getByText('Origem funcional')).toBeInTheDocument();
    expect(screen.getByText('Volume diário')).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/conversion-metrics?days=30', {
      headers: { Authorization: 'Bearer synthetic-test-session' },
    });
  });

  it('refetches the selected period without changing to a write request', async () => {
    render(<AdminConversionMetrics />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByRole('combobox', { name: 'Período das métricas' }), {
      target: { value: '7' },
    });

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));
    expect(globalThis.fetch.mock.calls[1][0]).toBe('/api/conversion-metrics?days=7');
    expect(globalThis.fetch.mock.calls.every(([url]) => url.startsWith('/api/conversion-metrics?days='))).toBe(true);
  });

  it('shows a backend error and allows an explicit retry', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('Falha simulada'));
    render(<AdminConversionMetrics />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada');
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar métricas' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('handles an empty time range without inventing activity', async () => {
    globalThis.fetch.mockResolvedValue(mockResponse({
      totals: { events: 0, saved: 0 },
      byContext: {},
      byReason: {},
      daily: [],
    }));
    render(<AdminConversionMetrics />);

    expect((await screen.findAllByText('Sem eventos no período.'))).toHaveLength(2);
    expect(screen.getByText('0% dos eventos')).toBeInTheDocument();
  });
});
