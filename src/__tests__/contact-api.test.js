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

describe('/api/contact Turnstile mode', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-test');
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    vi.stubEnv('CONTACT_TURNSTILE_REQUIRED', 'false');
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 201,
      json: async () => ({ success: true }),
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
    expect(JSON.parse(res.body)).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain('/rest/v1/contacts');
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
