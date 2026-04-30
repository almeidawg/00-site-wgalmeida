import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loadLeadsHandler = async () => (await import('../../api/leads.js')).default;
const loadCampaignsHandler = async () => (await import('../../api/campaigns.js')).default;

const makeReq = ({ method = 'GET', headers = {}, body = undefined } = {}) => ({
  method,
  headers,
  body,
});

const makeRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader: vi.fn((key, value) => {
      res.headers[key] = value;
    }),
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((payload) => {
      res.body = payload;
      return res;
    }),
  };
  return res;
};

describe('admin service-role APIs', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-test');
    vi.stubEnv('SUPABASE_ANON_KEY', 'anon-test');
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('bloqueia /api/leads sem Bearer token antes de consultar Supabase', async () => {
    const handler = await loadLeadsHandler();
    const res = makeRes();

    await handler(makeReq(), res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('bloqueia /api/campaigns sem Bearer token antes de consultar Supabase', async () => {
    const handler = await loadCampaignsHandler();
    const res = makeRes();

    await handler(makeReq({ method: 'DELETE', body: { id: 'campaign-1' } }), res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('permite admin autenticado por dominio corporativo em /api/leads', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/auth/v1/user')) {
        return {
          ok: true,
          json: async () => ({
            id: 'user-1',
            email: 'admin@wgalmeida.com.br',
          }),
        };
      }

      if (String(url).includes('/rest/v1/profiles')) {
        return {
          ok: true,
          json: async () => ([]),
        };
      }

      return {
        ok: true,
        json: async () => ([]),
      };
    });

    const handler = await loadLeadsHandler();
    const res = makeRes();

    await handler(makeReq({ headers: { authorization: 'Bearer valid-token' } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ leads: [] });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/v1/user'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-token',
        }),
      })
    );
  });
});
