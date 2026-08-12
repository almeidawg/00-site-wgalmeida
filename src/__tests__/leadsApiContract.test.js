import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const makeReq = (method, body = undefined, headers = {}) => ({
  method,
  headers,
  body,
});

const makeRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    payload: undefined,
    setHeader: vi.fn((key, value) => {
      res.headers[key] = value;
    }),
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((payload) => {
      res.payload = payload;
      return res;
    }),
  };
  return res;
};

const loadHandler = async () => {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://qa.invalid');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'qa-service-role');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'qa-anon');
  const mod = await import('../../api/leads.js');
  return mod.default;
};

describe('/api/leads method and auth contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('recognizes POST promotion but still requires admin authentication', async () => {
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq('POST', { id: 'lead-qa', tipo: 'contato' }), res);

    expect(res.statusCode).toBe(401);
    expect(res.payload).toEqual({ error: 'Unauthorized' });
  });

  it('rejects unsupported methods before any mutation path', async () => {
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq('DELETE'), res);

    expect(res.statusCode).toBe(405);
    expect(res.payload).toEqual({ error: 'Method not allowed' });
  });

  it('lists contacts from the canonical pessoas lifecycle', async () => {
    global.fetch = vi.fn(async (url) => ({
      ok: true,
      status: 200,
      json: async () => ([{
        id: 'person-1', nome: 'Ana', email: 'ana@example.test', telefone: '11999990001',
        contact_stage: 'lead_potencial', origem_cadastro: 'site', created_at: '2026-08-12T12:00:00Z',
      }]),
    }));
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq('GET', undefined, { authorization: 'Bearer qa-service-role' }), res);

    expect(res.statusCode).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(String(global.fetch.mock.calls[0][0])).toContain('/rest/v1/pessoas?');
    expect(String(global.fetch.mock.calls[0][0])).not.toContain('contacts');
    expect(res.payload.leads[0]).toMatchObject({ id: 'person-1', status: 'atendido', tipo: 'contato' });
  });

  it('maps PATCH status to contact_stage without allowing conversion by status alone', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 204, json: async () => null }));
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq('PATCH', { id: 'person-2', tipo: 'contato', status: 'atendido' }, { authorization: 'Bearer qa-service-role' }), res);

    expect(res.statusCode).toBe(200);
    expect(String(global.fetch.mock.calls[0][0])).toContain('/rest/v1/pessoas?id=eq.person-2');
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ contact_stage: 'lead_potencial' });

    const rejected = makeRes();
    await handler(makeReq('PATCH', { id: 'person-2', tipo: 'contato', status: 'convertido' }, { authorization: 'Bearer qa-service-role' }), rejected);
    expect(rejected.statusCode).toBe(409);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('promotes a contact only through the governed promotion RPC', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ([{ pessoa_id: 'person-3', oportunidade_id: 'opp-1', promotion_id: 'promotion-1' }]),
    }));
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq('POST', { id: 'person-3', tipo: 'contato' }, { authorization: 'Bearer qa-service-role' }), res);

    expect(res.statusCode).toBe(200);
    expect(String(global.fetch.mock.calls[0][0])).toContain('/rest/v1/rpc/fn_promover_contato_para_lead');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body).toMatchObject({ p_pessoa_id: 'person-3', p_source: 'manual' });
  });
});
