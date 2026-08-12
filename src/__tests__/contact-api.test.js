import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  const module = await import('../../api/contact.js');
  return module.default;
};

const makeReq = (body, headers = {}) => ({
  method: 'POST',
  headers: {
    origin: 'https://wgalmeida.com.br',
    'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 200) + 1}`,
    ...headers,
  },
  body,
});

const makeRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader: vi.fn((key, value) => {
      res.headers[key] = value;
    }),
    end: vi.fn((payload = '') => {
      res.body = payload;
      return res;
    }),
  };
  return res;
};

const validBody = {
  name: 'Cliente Teste',
  email: 'cliente@example.com',
  phone: '+55 11 99999-0000',
  subject: 'BuildTech',
  message: 'Quero falar sobre automacao.',
  context: 'buildtech',
};

const rpcRow = (overrides = {}) => ({
  outcome: 'saved',
  pessoa_id: 'person-test-1',
  interaction_id: 'interaction-test-1',
  promotion_outcome: 'promotion_skipped',
  ...overrides,
});
describe('/api/contact Turnstile mode', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'info').mockImplementation(() => {});
    globalThis.__wgContactRateLimit = new Map();
    globalThis.__wgTurnstileTokenStore = new Map();
    globalThis.__wgContactIdempotency = new Map();
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-test');
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    vi.stubEnv('CONTACT_TURNSTILE_REQUIRED', 'false');
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 201,
      json: async () => ([rpcRow()]),
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('permite fallback com rate limit e honeypot quando Turnstile ainda nao esta configurado', async () => {
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq(validBody), res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject({ ok: true, outcome: 'saved', promotion: 'promotion_skipped' });
    expect(res.headers['X-Request-ID']).toBeDefined();
    expect(res.headers['X-WG-Outcome']).toBe('saved');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain('/rest/v1/rpc/ingest_site_contact_idempotent');
    const metricCall = console.info.mock.calls.find(([prefix]) => prefix === '[wg-conversion]');
    expect(metricCall).toBeDefined();
    const metric = JSON.parse(metricCall[1]);
    expect(metric).toMatchObject({ outcome: 'saved', reason: 'accepted', promotion: 'promotion_skipped', context: 'buildtech', statusCode: 200 });
    expect(metricCall[1]).not.toContain(validBody.name);
    expect(metricCall[1]).not.toContain(validBody.email);
    expect(metricCall[1]).not.toContain(validBody.phone);
    expect(metricCall[1]).not.toContain(validBody.message);
  });

  it('falha explicitamente quando Turnstile e obrigatorio mas a secret esta ausente', async () => {
    vi.stubEnv('CONTACT_TURNSTILE_REQUIRED', 'true');
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq(validBody), res);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({ error: 'TURNSTILE_SECRET_KEY not configured' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('mantem promocao WGEasy desligada por padrao mesmo quando o contato salvo tem id', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 200, json: async () => ([rpcRow()]) }));
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq(validBody), res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).promotion).toBe('promotion_skipped');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain('/rest/v1/rpc/ingest_site_contact_idempotent');
    const rpcBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(rpcBody.p_promote).toBe(false);
  });
  it('retorna 400 para payload invalido sem persistir contato', async () => {
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ ...validBody, email: 'email-invalido' }), res);
    expect(res.statusCode).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
    const metricCall = console.info.mock.calls.find(([prefix]) => prefix === '[wg-conversion]');
    expect(JSON.parse(metricCall[1])).toMatchObject({ outcome: 'rejected', reason: 'invalid_payload', statusCode: 400 });
  });

  it('retorna 502 quando a persistencia falha', async () => {
    global.fetch = vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ ...validBody, email: 'persist-fail@example.com' }, { 'x-forwarded-for': '198.51.100.212' }), res);
    expect(res.statusCode).toBe(502);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('rejeita Turnstile invalido com 403 antes de persistir contato', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'turnstile-secret-test');
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('challenges.cloudflare.com')) {
        return { ok: true, status: 200, json: async () => ({ success: false }) };
      }
      throw new Error('persistencia nao deveria ser chamada');
    });
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ ...validBody, turnstileToken: 'invalid-token-403' }), res);
    expect(res.statusCode).toBe(403);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('bloqueia replay do mesmo token Turnstile', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'turnstile-secret-test');
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('challenges.cloudflare.com')) {
        return { ok: true, status: 200, json: async () => ({ success: true, action: 'contact_form', hostname: 'wgalmeida.com.br' }) };
      }
      return { ok: true, status: 200, json: async () => ([rpcRow()]) };
    });
    const handler = await loadHandler();
    const body = { ...validBody, email: 'replay@example.com', turnstileToken: 'unique-replay-token-20260812' };
    const headers = { 'x-forwarded-for': '198.51.100.210' };
    const first = makeRes();
    const second = makeRes();
    await handler(makeReq(body, headers), first);
    await handler(makeReq(body, headers), second);
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(403);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retorna 429 na nona tentativa equivalente dentro da janela', async () => {
    const handler = await loadHandler();
    const headers = { 'x-forwarded-for': '198.51.100.211' };
    const body = { ...validBody, email: 'ratelimit@example.com' };
    let lastRes;
    for (let attempt = 0; attempt < 9; attempt += 1) {
      lastRes = makeRes();
      await handler(makeReq(body, headers), lastRes);
    }
    expect(lastRes.statusCode).toBe(429);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('promove para WGEasy somente quando o gate explicito esta habilitado', async () => {
    vi.stubEnv('CONTACT_AUTO_PROMOTE_WGEASY', 'true');
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ([rpcRow({ promotion_outcome: 'promotion_completed' })]),
    }));
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq(
      { ...validBody, email: 'promote@example.com' },
      { host: 'wgalmeida.com.br', 'x-forwarded-proto': 'https', 'x-forwarded-for': '198.51.100.213' },
    ), res);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).promotion).toBe('promotion_completed');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain('/rest/v1/rpc/ingest_site_contact_idempotent');
    const rpcBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(rpcBody.p_promote).toBe(true);
  });
  it('deduplica retry identico dentro da janela sem segundo insert', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 200, json: async () => ([rpcRow()]) }));
    const handler = await loadHandler();
    const body = { ...validBody, email: 'idempotent@example.com' };
    const headers = { 'x-forwarded-for': '198.51.100.220' };
    const first = makeRes();
    const second = makeRes();

    await handler(makeReq(body, headers), first);
    await handler(makeReq(body, headers), second);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(JSON.parse(first.body).outcome).toBe('saved');
    expect(JSON.parse(second.body).outcome).toBe('duplicate');
    expect(first.headers['X-WG-Outcome']).toBe('saved');
    expect(second.headers['X-WG-Outcome']).toBe('duplicate');
    expect(first.headers['X-Request-ID']).not.toBe(second.headers['X-Request-ID']);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('deduplica duas requisicoes concorrentes compartilhando a mesma persistencia', async () => {
    let releasePersist;
    const persistGate = new Promise(resolve => { releasePersist = resolve; });
    global.fetch = vi.fn(async () => {
      await persistGate;
      return { ok: true, status: 200, json: async () => ([rpcRow()]) };
    });
    const handler = await loadHandler();
    const body = { ...validBody, email: 'concurrent@example.com' };
    const headers = { 'x-forwarded-for': '198.51.100.221' };
    const first = makeRes();
    const second = makeRes();

    const firstRun = handler(makeReq(body, headers), first);
    await Promise.resolve();
    const secondRun = handler(makeReq(body, headers), second);
    await Promise.resolve();
    releasePersist();
    await Promise.all([firstRun, secondRun]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect([JSON.parse(first.body).outcome, JSON.parse(second.body).outcome].sort()).toEqual(['duplicate', 'saved']);
  });

  it('remove a reserva idempotente quando a persistencia falha e permite retry', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ([rpcRow()]) });
    const handler = await loadHandler();
    const body = { ...validBody, email: 'retry-after-failure@example.com' };
    const headers = { 'x-forwarded-for': '198.51.100.222' };
    const failed = makeRes();
    const retried = makeRes();

    await handler(makeReq(body, headers), failed);
    await handler(makeReq(body, headers), retried);

    expect(failed.statusCode).toBe(502);
    expect(retried.statusCode).toBe(200);
    expect(JSON.parse(retried.body).outcome).toBe('saved');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('aplica headers de rate limit no fluxo aceito', async () => {
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq(validBody), res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['X-RateLimit-Remaining']).toBeDefined();
    expect(res.headers['X-RateLimit-Reset']).toBeDefined();
    expect(res.headers['Retry-After']).toBeDefined();
  });

  it('bloqueia previews Vercel aleatorios quando esta em producao', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    const handler = await loadHandler();
    const res = makeRes();

    await handler(makeReq(validBody, { origin: 'https://preview-nao-autorizado.vercel.app' }), res);

    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body)).toEqual({ error: 'Origem nao autorizada.' });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
