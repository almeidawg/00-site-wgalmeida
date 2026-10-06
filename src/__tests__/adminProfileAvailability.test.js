import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const makeRes = () => ({
  statusCode: 200, body: null, setHeader: vi.fn(),
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const userResponse = () => ({ ok: true, json: async () => ({ id: 'fixture-user', email: 'fixture@wgalmeida.com.br' }) });
const check = async () => {
  const { requireAdmin } = await import('../../api/_adminAuth.js');
  const res = makeRes();
  const result = await requireAdmin({ headers: { authorization: 'Bearer fixture-user-token' } }, res);
  return { result, res };
};

describe('Admin profile lookup availability', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SUPABASE_URL', 'https://fixture.invalid');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'fixture-service');
    vi.stubEnv('SUPABASE_ANON_KEY', 'fixture-anon');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(userResponse()));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it.each([401, 500])('returns service failure when profile HTTP status is %s', async (status) => {
    fetch.mockResolvedValueOnce({ ok: false, status, json: async () => ({}) });
    const { result, res } = await check();
    expect(result.ok).toBe(false);
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ error: 'Auth service unavailable' });
  });
  it('returns service failure when profile transport fails', async () => {
    fetch.mockRejectedValueOnce(new Error('fixture-network-failure'));
    const { result, res } = await check();
    expect(result.ok).toBe(false);
    expect(res.statusCode).toBe(503);
  });
  it('preserves corporate email policy for a successful empty profile lookup', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    expect((await check()).result.ok).toBe(true);
  });
  it('rejects a profile explicitly marked inactive', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'fixture-user', ativo: false }] });
    const { result, res } = await check();
    expect(result.ok).toBe(false);
    expect(res.statusCode).toBe(403);
  });
});
