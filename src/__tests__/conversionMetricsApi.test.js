import { beforeEach, describe, expect, it, vi } from 'vitest';

const makeRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader: vi.fn((key, value) => { res.headers[key] = value; }),
    status: vi.fn((code) => { res.statusCode = code; return res; }),
    json: vi.fn((body) => { res.body = body; return res; }),
  };
  return res;
};

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe('conversion metrics API', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-test-key';
  });

  it('rejects unauthenticated requests before querying metrics', async () => {
    global.fetch = vi.fn();
    const { default: handler } = await import('../../api/conversion-metrics.js');
    const res = makeRes();
    await handler({ method: 'GET', headers: {}, query: {} }, res);
    expect(res.statusCode).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns aggregate-only metrics without PII fields', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'admin-1', email: 'admin@wgalmeida.com.br' }))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([
        { outcome: 'saved', promotion_outcome: 'promotion_skipped', metadata: { context: 'moodboard-studio-v2' }, created_at: '2026-08-12T10:00:00Z' },
        { outcome: 'saved', promotion_outcome: 'promotion_completed', metadata: { context: 'contact' }, created_at: '2026-08-12T11:00:00Z' },
      ]))
      .mockResolvedValueOnce(jsonResponse([{ promotion_mode: 'formulario', promoted_at: '2026-08-12T11:00:01Z' }]));

    const { default: handler } = await import('../../api/conversion-metrics.js');
    const res = makeRes();
    await handler({ method: 'GET', headers: { authorization: 'Bearer admin-token' }, query: { days: '30' } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.totals).toMatchObject({ persistedSubmissions: 2, saved: 2, promotionCompleted: 1, leadPromotions: 1, saveRate: 1 });
    expect(res.body.byContext).toEqual({ moodboard: 1, contact: 1 });
    expect(res.body.privacy.piiIncluded).toBe(false);
    const serialized = JSON.stringify(res.body).toLowerCase();
    for (const forbidden of ['email', 'telefone', 'phone', 'nome', 'message', 'payload', 'fingerprint', 'request_id']) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});
