import { describe, expect, it, vi } from 'vitest';
import { buildConversionEvent, emitConversionEvent, normalizeConversionContext } from '../../api/_conversionObservability.js';

describe('conversion observability', () => {
  it('normaliza contextos para categorias sem texto livre', () => {
    expect(normalizeConversionContext('moodboard-studio-v2')).toBe('moodboard');
    expect(normalizeConversionContext('buildtech')).toBe('buildtech');
    expect(normalizeConversionContext('site-contact')).toBe('contact');
    expect(normalizeConversionContext('cliente@example.com')).toBe('other');
  });

  it('gera evento somente com campos allowlisted e sem PII', () => {
    const event = buildConversionEvent({
      requestId: 'request-123',
      outcome: 'saved',
      reason: 'accepted',
      promotion: 'promotion_skipped',
      context: 'moodboard-studio-v2',
      statusCode: 200,
      durationMs: 18.7,
      name: 'Cliente Teste',
      email: 'cliente@example.com',
      phone: '+5511999990000',
      message: 'Mensagem confidencial',
    });

    expect(event).toEqual({
      schema: 'wg.conversion.v1',
      event: 'contact_result',
      requestId: 'request-123',
      outcome: 'saved',
      reason: 'accepted',
      promotion: 'promotion_skipped',
      context: 'moodboard',
      statusCode: 200,
      durationMs: 19,
    });
    expect(JSON.stringify(event)).not.toContain('Cliente Teste');
    expect(JSON.stringify(event)).not.toContain('cliente@example.com');
    expect(JSON.stringify(event)).not.toContain('+5511999990000');
    expect(JSON.stringify(event)).not.toContain('Mensagem confidencial');
  });

  it('emite uma linha JSON estruturada sem payload original', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    emitConversionEvent({
      requestId: 'request-456',
      outcome: 'rejected',
      reason: 'rate_limited',
      context: 'contact',
      statusCode: 429,
      durationMs: 4,
      email: 'nao-deve-aparecer@example.com',
    });

    expect(info).toHaveBeenCalledTimes(1);
    const [prefix, serialized] = info.mock.calls[0];
    expect(prefix).toBe('[wg-conversion]');
    expect(JSON.parse(serialized)).toMatchObject({
      schema: 'wg.conversion.v1',
      outcome: 'rejected',
      reason: 'rate_limited',
      context: 'contact',
      statusCode: 429,
    });
    expect(serialized).not.toContain('nao-deve-aparecer@example.com');
    info.mockRestore();
  });
});
