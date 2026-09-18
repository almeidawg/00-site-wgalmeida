import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/providers/ContextProvider', () => ({ useWGContext: () => ({ context: {} }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));
vi.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }));
vi.mock('@/lib/motion-lite', () => ({
  AnimatePresence: ({ children }) => children,
  motion: { div: ({ children, initial, animate, exit, transition, ...props }) => <div {...props}>{children}</div> },
}));

const openFinalStep = async () => {
  const { default: Orcador } = await import('@/components/OrcadorInteligente');
  const view = render(<Orcador />);
  fireEvent.click(screen.getByRole('button', { name: 'Apartamento de Alto Padrão' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apenas Projeto de Interiores' }));
  fireEvent.change(screen.getByPlaceholderText('Ex: 120'), { target: { value: '120' } });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Normal (3 a 6 meses)' } });
  fireEvent.click(screen.getByRole('button', { name: /Gerar Estimativa/ }));
  const name = await screen.findByPlaceholderText('Nome Completo', {}, { timeout: 3000 });
  fireEvent.change(name, { target: { value: 'Fixture WG' } });
  fireEvent.change(screen.getByPlaceholderText('Melhor E-mail'), { target: { value: 'fixture@example.invalid' } });
  fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), { target: { value: '11999999999' } });
  return view;
};

describe('Orcador contact anti-spam contract', () => {
  let widgetOptions;
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'fixture-site-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    window.turnstile = {
      render: vi.fn((_container, options) => { widgetOptions = options; return 'fixture-widget'; }),
      remove: vi.fn(),
      reset: vi.fn(),
    };
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete window.turnstile;
  });

  it('blocks submission until verification and sends the token with contact_form action', async () => {
    const view = await openFinalStep();
    fireEvent.submit(view.container.querySelector('form'));
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText(/Conclua a verificação anti-spam/)).toBeInTheDocument();
    expect(window.turnstile.render).toHaveBeenCalledTimes(1);
    expect(widgetOptions.action).toBe('contact_form');
    act(() => widgetOptions.callback('fixture-token'));
    fireEvent.submit(view.container.querySelector('form'));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ context: 'orcamento', turnstileToken: 'fixture-token' });
  });

  it('clears expired tokens and renews verification after a failed request', async () => {
    fetch.mockResolvedValue({ ok: false, status: 502 });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = await openFinalStep();
    await waitFor(() => expect(window.turnstile.render).toHaveBeenCalledTimes(1));
    act(() => widgetOptions.callback('expired-token'));
    act(() => widgetOptions['expired-callback']());
    fireEvent.submit(view.container.querySelector('form'));
    expect(fetch).not.toHaveBeenCalled();
    act(() => widgetOptions.callback('first-token'));
    fireEvent.submit(view.container.querySelector('form'));
    await waitFor(() => expect(screen.getByText(/Nao foi possivel enviar agora/)).toBeInTheDocument());
    fireEvent.submit(view.container.querySelector('form'));
    expect(fetch).toHaveBeenCalledTimes(1);
    act(() => widgetOptions.callback('fresh-token'));
    fireEvent.submit(view.container.querySelector('form'));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetch.mock.calls[1][1].body).turnstileToken).toBe('fresh-token');
  });

  it('preserves optional mode when the public site key is absent', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
    const view = await openFinalStep();
    fireEvent.submit(view.container.querySelector('form'));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(window.turnstile.render).not.toHaveBeenCalled();
  });
});
