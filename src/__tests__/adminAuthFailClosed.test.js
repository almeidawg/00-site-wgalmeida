import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const makeResponse = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((payload) => {
      res.body = payload;
      return res;
    }),
    setHeader: vi.fn((key, value) => {
      res.headers[key] = value;
    }),
  };
  return res;
};

const requireAdminForTest = async () => {
  vi.resetModules();
  const { requireAdmin } = await import('../../api/_adminAuth.js');
  return requireAdmin;
};

const request = () => ({
  method: 'GET',
  headers: { authorization: 'Bearer synthetic-user-token' },
});

describe('requireAdmin — authentication provider failures are fail-closed', () => {
  beforeEach(() => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://auth-qa.invalid');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'synthetic-service-role');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'synthetic-anon');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it.each([
    ['corporate staff without admin role', 'staff@wgalmeida.com.br', { id: 'user-qa', role: 'viewer', ativo: true }, false],
    ['inactive corporate admin', 'staff@wgalmeida.com.br', { id: 'user-qa', role: 'admin', ativo: false }, false],
    ['non-matching admin profile', 'staff@wgalmeida.com.br', { id: 'other-user', role: 'admin', ativo: true }, false],
    ['missing profile', 'staff@wgalmeida.com.br', null, false],
    ['corporate active admin', 'staff@wgalmeida.com.br', { id: 'user-qa', role: 'admin', ativo: true }, true],
    ['delegated external active admin', 'consultant@example.test', { id: 'user-qa', role: 'admin', ativo: true }, true],
  ])('requires an explicitly active matching role for %s', async (_description, email, profile, allowed) => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'user-qa', email }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => profile ? [profile] : [],
      });
    const requireAdmin = await requireAdminForTest();
    const res = makeResponse();
    const result = await requireAdmin(request(), res);

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(allowed);
    if (!allowed) {
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: 'Forbidden' });
    } else {
      expect(result.user.id).toBe('user-qa');
      expect(result.profile.role).toBe('admin');
    }
  });

  it('returns a controlled 503 if the auth provider sends invalid JSON', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('SIMULATED_UPSTREAM_PARSING_DETAIL'); },
    });
    const requireAdmin = await requireAdminForTest();
    const res = makeResponse();

    const result = await requireAdmin(request(), res);

    expect(result.ok).toBe(false);
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ error: 'Auth service unavailable' });
    expect(JSON.stringify(res.body)).not.toContain('SIMULATED_UPSTREAM_PARSING_DETAIL');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns 503 if the admin profile service fails', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'user-qa', email: 'staff@wgalmeida.com.br' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ message: 'UPSTREAM_INTERNAL_DETAIL' }),
      });
    const requireAdmin = await requireAdminForTest();
    const res = makeResponse();

    const result = await requireAdmin(request(), res);

    expect(result.ok).toBe(false);
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ error: 'Auth service unavailable' });
    expect(JSON.stringify(res.body)).not.toContain('UPSTREAM_INTERNAL_DETAIL');
  });

  it('continues denying an explicitly inactive corporate profile', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'inactive-qa', email: 'staff@wgalmeida.com.br' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'inactive-qa', role: 'admin', ativo: false }],
      });
    const requireAdmin = await requireAdminForTest();
    const res = makeResponse();

    const result = await requireAdmin(request(), res);

    expect(result.ok).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: 'Forbidden' });
  });

  it('continues denying a non-corporate user without admin role', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'outsider-qa', email: 'outsider@example.test' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });
    const requireAdmin = await requireAdminForTest();
    const res = makeResponse();

    const result = await requireAdmin(request(), res);

    expect(result.ok).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: 'Forbidden' });
  });
});
