import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: mocks.from }),
}));

import { normalizePublicOffer, loadPublicOffers, loadPublicOffer } from '@/api/wgStorePublicApi';

const org = 'bbbbbbbb-bbbb-4444-8888-cccccccccccc';
const sample = {
  id: 'aaaaaaaa-bbbb-4444-8888-cccccccccccc',
  org_id: org,
  sku: 'SYNTHETIC-01',
  title: 'Produto sintético',
  category: 'Casa e Jardim',
  mode: 'affiliate',
  currency: 'USD',
  price_minor: 1599,
  countries: ['US'],
  offer_url: 'https://partner.example/approved',
  image_url: 'https://partner.example/image.jpg',
};
const makeQuery = (data = []) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data, error: null }),
  maybeSingle: vi.fn().mockResolvedValue({ data: data[0] || null, error: null }),
});

beforeEach(() => {
  vi.stubEnv('VITE_WG_STORE_PUBLIC_SUPABASE_URL', 'https://synthetic.supabase.co');
  vi.stubEnv('VITE_WG_STORE_PUBLIC_ANON_KEY', 'public-synthetic-key-not-production');
  vi.stubEnv('VITE_WG_STORE_PUBLIC_ORG_ID', org);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('WG Store MVP afiliado, somente vitrine e links verificados', () => {
  it('consulta somente modo affiliate da organizacao na listagem', async () => {
    const query = makeQuery([sample]);
    mocks.from.mockReturnValue(query);
    const result = await loadPublicOffers();
    expect(mocks.from).toHaveBeenCalledWith('wg_store_public_offers');
    expect(query.eq).toHaveBeenCalledWith('org_id', org);
    expect(query.eq).toHaveBeenCalledWith('mode', 'affiliate');
    expect(result.products).toHaveLength(1);
    expect(result.products[0].purchasable).toBe(false);
  });

  it('nao permite abrir detalhe de oferta direta ou dropshipping pela API publica', async () => {
    const query = makeQuery([sample]);
    mocks.from.mockReturnValue(query);
    const result = await loadPublicOffer(sample.id);
    expect(query.eq).toHaveBeenCalledWith('id', sample.id);
    expect(query.eq).toHaveBeenCalledWith('mode', 'affiliate');
    expect(result.mode).toBe('affiliate');
    expect(result.external_link).toBe(sample.offer_url);
  });

  it('descarta linhas de outro tenant, checkout direto, URLs e precos invalidos na lista', async () => {
    const entries = [
      sample,
      { ...sample, org_id: 'dddddddd-dddd-4444-8888-cccccccccccc' },
      { ...sample, mode: 'direct' },
      { ...sample, mode: 'dropshipping' },
      { ...sample, offer_url: 'https://127.0.0.1/private' },
      { ...sample, offer_url: 'https://[::1]/local' },
      { ...sample, currency: 'INVALID' },
      { ...sample, price_minor: Infinity },
      { ...sample, price_minor: 12.5 },
      { ...sample, title: null },
    ];
    const query = makeQuery(entries);
    mocks.from.mockReturnValue(query);
    const result = await loadPublicOffers();
    expect(result.count).toBe(1);
    expect(result.products).toHaveLength(1);
    expect(result.products[0].external_link).toBe(sample.offer_url);
    expect(result.products[0].purchasable).toBe(false);
  });

  it('falha fechado se a origem retornar linha nao afiliada, outro tenant ou id divergente', async () => {
    for (const invalid of [
      { ...sample, mode: 'direct' },
      { ...sample, mode: 'dropshipping' },
      { ...sample, org_id: 'dddddddd-dddd-4444-8888-cccccccccccc' },
      { ...sample, id: 'dddddddd-dddd-4444-8888-cccccccccccc' },
      { ...sample, offer_url: 'https://172.16.0.1/offer' },
      { ...sample, currency: 'FAKE' },
    ]) {
      mocks.from.mockReturnValue(makeQuery([invalid]));
      await expect(loadPublicOffer(sample.id)).rejects.toThrow('Oferta publica nao encontrada.');
    }
  });

  it('nao tenta outra fonte quando a resposta publica e malformada', async () => {
    mocks.from.mockReturnValue(makeQuery({ unexpected: 'data' }));
    await expect(loadPublicOffers()).rejects.toThrow('Resposta publica invalida');
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });

  it('bloqueia links malformados, credenciais embutidas e destino localhost', () => {
    for (const bad of [
      'http://partner.example/offer',
      'javascript:alert(1)',
      'https://user:pass@partner.example/offer',
      'https://localhost/offer',
      'https://127.0.0.1/offer',
      'https://10.0.0.1/offer',
      'https://partner.example/offer with space',
      'https://',
    ]) {
      const result = normalizePublicOffer({ ...sample, offer_url: bad });
      expect(result.external_link, bad).toBeNull();
      expect(result.purchasable).toBe(false);
    }
  });

  it('pode exibir um link HTTPS sintetico sem expor comissao ou habilitar checkout', () => {
    const result = normalizePublicOffer({
      ...sample, commission_minor: 300, internal_margin: 199, secret: 'REDACTED',
    });
    expect(result.external_link).toBe(sample.offer_url);
    expect(result.purchasable).toBe(false);
    expect(result.variants[0].inventory_quantity).toBe(0);
    expect(JSON.stringify(result)).not.toContain('commission_minor');
    expect(JSON.stringify(result)).not.toContain('internal_margin');
    expect(JSON.stringify(result)).not.toContain('REDACTED');
  });
});
