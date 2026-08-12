import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('MoodboardLeadModal Turnstile contract', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    delete window.turnstile;
  });

  it('requires the configured widget token and forwards it to /api/contact', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'site-key-test');
    vi.doMock('@/contexts/MoodboardContext', () => ({
      useMoodboard: () => ({
        projectName: 'Projeto Turnstile',
        getMoodboardData: () => ({ styles: [{ name: 'Japandi' }] }),
        buildShareUrl: () => 'http://localhost/moodboard/share?v=turnstile',
      }),
    }));

    window.turnstile = {
      render: vi.fn((_container, options) => {
        options.callback('turnstile-token-test');
        return 'widget-test-1';
      }),
      remove: vi.fn(),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const { default: MoodboardLeadModal } = await import('@/components/moodboard/MoodboardLeadModal');
    render(<MoodboardLeadModal isOpen onClose={vi.fn()} />);

    await waitFor(() => expect(window.turnstile.render).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByRole('textbox', { name: 'Seu nome completo' }), { target: { value: 'QA Turnstile' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Seu melhor e-mail' }), { target: { value: 'turnstile@example.test' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'WhatsApp com DDD' }), { target: { value: '11988887777' } });
    fireEvent.click(screen.getByRole('button', { name: /Receber Dossiê Gratuito/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.turnstileToken).toBe('turnstile-token-test');
    expect(body.context).toBe('moodboard-studio-v2');
  });
});
