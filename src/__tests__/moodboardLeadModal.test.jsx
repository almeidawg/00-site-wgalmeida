import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MoodboardLeadModal from '@/components/moodboard/MoodboardLeadModal';

vi.mock('@/contexts/MoodboardContext', () => ({
  useMoodboard: () => ({
    projectName: 'Projeto Laboratório',
    getMoodboardData: () => ({ styles: [{ name: 'Boho' }] }),
    buildShareUrl: () => 'http://localhost/moodboard/share?v=mock',
  }),
}));

const fillForm = () => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Seu nome completo' }), { target: { value: 'QA WG' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Seu melhor e-mail' }), { target: { value: 'qa@example.test' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'WhatsApp com DDD' }), { target: { value: '11999999999' } });
};

describe('MoodboardLeadModal submission safety', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the form open and shows an alert when the contact endpoint fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<MoodboardLeadModal isOpen onClose={vi.fn()} />);
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /Receber Dossiê Gratuito/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível enviar seus dados agora');
    expect(screen.getByRole('button', { name: /Receber Dossiê Gratuito/i })).toBeInTheDocument();
    expect(screen.queryByText('Dossiê Enviado!')).not.toBeInTheDocument();
  });

  it('prevents double submission while the first request is pending', async () => {
    let resolveRequest;
    const pending = new Promise((resolve) => { resolveRequest = resolve; });
    const fetchMock = vi.fn().mockReturnValue(pending);
    vi.stubGlobal('fetch', fetchMock);
    render(<MoodboardLeadModal isOpen onClose={vi.fn()} />);
    fillForm();

    const submitButton = screen.getByRole('button', { name: /Receber Dossiê Gratuito/i });
    fireEvent.click(submitButton);

    await waitFor(() => expect(submitButton).toBeDisabled());
    fireEvent.click(submitButton);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveRequest({ ok: false, status: 503 });
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('moves to the generating state only after a successful HTTP response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    render(<MoodboardLeadModal isOpen onClose={vi.fn()} />);
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /Receber Dossiê Gratuito/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
    const submittedBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(submittedBody).toMatchObject({
      name: 'QA WG',
      email: 'qa@example.test',
      phone: '11999999999',
      context: 'moodboard-studio-v2',
    });
    expect(submittedBody.message).toContain('Projeto Laboratório');
    expect(submittedBody.message).toContain('Boho');

    await waitFor(() => {
      expect(screen.getByText('Gerando sua Experiência')).toBeInTheDocument();
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
