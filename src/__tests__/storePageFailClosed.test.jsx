import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal()),
  useTranslation: () => ({ t: (key, options) => options?.defaultValue || key }),
}));
vi.mock('@/components/SEO', () => ({ default: () => null }));
vi.mock('@/components/SafeImage', () => ({ default: () => null }));
vi.mock('@/components/ProductsList', () => ({
  default: () => <div data-testid="configured-store-products">Vitrine pública simulada</div>,
}));
vi.mock('@/lib/motion-lite', () => ({
  motion: {
    div: ({ children, initial, animate, transition, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, initial, animate, transition, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, initial, animate, transition, ...props }) => <p {...props}>{children}</p>,
  },
}));

import Store from '@/pages/Store';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('Store page public-catalogue release gate', () => {
  it('shows a safe pending state without mounting product catalogue when configuration is absent', () => {
    vi.stubEnv('VITE_WG_STORE_OFFERS_ENABLED', 'false');
    render(<Store />);
    expect(screen.getByRole('status')).toHaveTextContent('Vitrine em preparação');
    expect(screen.getByRole('link', { name: 'Solicitar proposta' })).toHaveAttribute('href', '/solicite-proposta');
    expect(screen.queryByTestId('configured-store-products')).not.toBeInTheDocument();
  });

  it('renders affiliate catalogue only after complete public configuration is supplied', async () => {
    vi.stubEnv('VITE_WG_STORE_OFFERS_ENABLED', 'true');
    vi.stubEnv('VITE_WG_STORE_PUBLIC_SUPABASE_URL', 'https://catalogue.example.org');
    vi.stubEnv('VITE_WG_STORE_PUBLIC_ANON_KEY', 'sb_publishable_synthetic');
    vi.stubEnv('VITE_WG_STORE_PUBLIC_ORG_ID', '123e4567-e89b-42d3-a456-426614174000');
    render(<Store />);
    expect(await screen.findByTestId('configured-store-products')).toBeInTheDocument();
    expect(screen.queryByText('Vitrine em preparação')).not.toBeInTheDocument();
  });
});
