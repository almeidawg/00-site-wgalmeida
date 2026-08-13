import { afterEach, describe, expect, it, vi } from 'vitest';

describe('conversion telemetry persistence', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('persists allowlisted telemetry in production without PII', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-test-key');
    vi.stubEnv('CONVERSION_TELEMETRY_ENABLED', '');
    const fetchMock = vi.fn(async () => ({ ok: true, status: 201 }));
    global.fetch = fetchMock;
    vi.spyOn(console, 'info').mockImplementation(() => {});

    const { emitConversionEvent } = await import('../../api/_conversionObservability.js');
    await emitConversionEvent({
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      outcome: 'rejected',
      reason: 'rate_limited',
      promotion: 'promotion_skipped',
      context: 'moodboard-studio-v2',
      statusCode: 429,
      durationMs: 12,
      name: 'PII Name',
      email: 'pii@example.com',
      message: 'PII Message',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/rest/v1/site_conversion_events?on_conflict=request_id');
    const body = JSON.parse(options.body);
    expect(body).toEqual({
      request_id: '123e4567-e89b-12d3-a456-426614174000',
      event: 'contact_result',
      outcome: 'rejected',
      reason: 'rate_limited',
      promotion: 'promotion_skipped',
      context: 'moodboard',
      status_code: 429,
      duration_ms: 12,
    });
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain('PII Name');
    expect(serialized).not.toContain('pii@example.com');
    expect(serialized).not.toContain('PII Message');
  });

  it('respects the explicit production kill switch', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-test-key');
    vi.stubEnv('CONVERSION_TELEMETRY_ENABLED', 'false');
    const fetchMock = vi.fn();
    global.fetch = fetchMock;
    vi.spyOn(console, 'info').mockImplementation(() => {});

    const { emitConversionEvent } = await import('../../api/_conversionObservability.js');
    await emitConversionEvent({ requestId: '123e4567-e89b-12d3-a456-426614174001', outcome: 'saved', reason: 'accepted', statusCode: 200 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
