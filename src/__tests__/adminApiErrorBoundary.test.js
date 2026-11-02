import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/_adminAuth.js', () => ({
  requireAdmin: vi.fn(async () => ({ ok: true })),
}));

const SENTINEL = 'PRIVATE_UPSTREAM_DATABASE_DETAIL_QA_ONLY';

const makeRes = () => {
  const res = {
    statusCode: 200,
    payload: undefined,
    setHeader: vi.fn(),
    status: vi.fn((status) => {
      res.statusCode = status;
      return res;
    }),
    json: vi.fn((payload) => {
      res.payload = payload;
      return res;
    }),
  };
  return res;
};

const requestBody = {
  GET: undefined,
  POST: { nome: 'Campanha QA', landing_page_id: 'landing-qa', id: 'person-qa', tipo: 'contato' },
  PATCH: { id: 'person-qa', status: 'atendido', tipo: 'contato' },
  DELETE: { id: 'campaign-qa' },
};

const upstreamResponse = (status) => ({
  ok: false,
  status,
  json: async () => ({ message: SENTINEL, error: SENTINEL }),
  text: async () => SENTINEL,
});

const expectSanitized = (res, status, message) => {
  expect(res.statusCode).toBe(status);
  expect(res.payload).toEqual({ error: message });
  expect(JSON.stringify(res.payload)).not.toContain(SENTINEL);
};

describe('Admin API public error boundary', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.invalid');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'synthetic-admin-api-test');
    vi.stubEnv('WG_LEADS_MACHINE_ENABLED', 'true');
    vi.stubEnv('WG_LEADS_MACHINE_TOKEN', 'qa-machine-token-012345678901234567890');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'synthetic-anon');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([
    ['GET', 503, 502, 'Falha ao carregar campanhas.'],
    ['POST', 400, 400, 'Falha ao criar campanha.'],
    ['PATCH', 503, 502, 'Falha ao atualizar campanha.'],
    ['DELETE', 503, 502, 'Falha ao excluir campanha.'],
  ])('campaigns %s hides upstream failure body', async (method, upstreamStatus, status, message) => {
    globalThis.fetch.mockResolvedValue(upstreamResponse(upstreamStatus));
    const { default: handler } = await import('../../api/campaigns.js');
    const res = makeRes();

    await handler({ method, headers: {}, body: requestBody[method] }, res);

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    expectSanitized(res, status, message);
  });

  it.each([
    ['GET', undefined, 503, 502, 'Falha ao carregar contatos.'],
    ['POST', requestBody.POST, 400, 400, 'Falha ao promover contato.'],
    ['PATCH', requestBody.PATCH, 503, 502, 'Falha ao atualizar lifecycle.'],
  ])('leads %s hides upstream failure body', async (method, body, upstreamStatus, status, message) => {
    globalThis.fetch.mockResolvedValue(upstreamResponse(upstreamStatus));
    const { default: handler } = await import('../../api/leads.js');
    const res = makeRes();

    await handler({
      method,
      headers: { authorization: 'Bearer qa-machine-token-012345678901234567890' },
      body,
    }, res);

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    expectSanitized(res, status, message);
  });

  it('campaigns does not reveal internal configuration names', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    vi.resetModules();
    const { default: handler } = await import('../../api/campaigns.js');
    const res = makeRes();

    await handler({ method: 'GET', headers: {} }, res);

    expectSanitized(res, 500, 'Serviço de campanhas indisponível.');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('campaigns hides thrown network error details', async () => {
    globalThis.fetch.mockRejectedValue(new Error(SENTINEL));
    const { default: handler } = await import('../../api/campaigns.js');
    const res = makeRes();

    await handler({ method: 'GET', headers: {} }, res);

    expectSanitized(res, 502, 'Falha ao carregar campanhas.');
  });

  it('campaigns rejects malformed JSON with a safe client response', async () => {
    const { default: handler } = await import('../../api/campaigns.js');
    const res = makeRes();

    await handler({ method: 'POST', headers: {}, body: '{"invalid":' }, res);

    expectSanitized(res, 400, 'Payload JSON inválido.');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
