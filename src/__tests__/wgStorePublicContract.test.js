import { describe, expect, it } from 'vitest';
import { normalizePublicOffer } from '@/api/wgStorePublicApi';

const offer = {
  id: 'aaaaaaaa-bbbb-4444-8888-cccccccccccc',
  org_id: 'bbbbbbbb-bbbb-4444-8888-cccccccccccc',
  sku: 'PROD-01', title: 'Produto teste', description: 'Produto validado',
  category: 'Casa', mode: 'affiliate', supplier_name: 'Fornecedor Teste',
  image_url: 'https://example.com/img.jpg', currency: 'USD',
  price_minor: 1999, countries: ['US'], offer_url: 'https://example.com/offer',
  commission_minor: 1234, secret_token: 'REDACTED',
};

describe('WG Store public view adapter', () => {
  it('normaliza oferta sem carregar comissao, custos ou campos privados', () => {
    const result = normalizePublicOffer(offer);
    expect(result.variants[0].price_in_cents).toBe(1999);
    expect(result.variants[0].inventory_quantity).toBe(0);
    expect(result.purchasable).toBe(false);
    expect(result.external_link).toBe(offer.offer_url);
    expect(JSON.stringify(result)).not.toContain('commission_minor');
    expect(JSON.stringify(result)).not.toContain('secret_token');
  });
  it('bloqueia redirecionamento quando URL externa nao e HTTPS', () => {
    const result = normalizePublicOffer({ ...offer, offer_url: 'javascript:alert(1)' });
    expect(result.external_link).toBeNull();
  });
  it('nao disponibiliza checkout local para venda direta', () => {
    const result = normalizePublicOffer({ ...offer, mode: 'direct' });
    expect(result.external_link).toBeNull();
    expect(result.purchasable).toBe(false);
  });
  it('distingue euro de real sem converter valores silenciosamente', () => {
    const result = normalizePublicOffer({ ...offer, currency: 'EUR', price_minor: 1050 });
    expect(result.currency).toBe('EUR');
    expect(result.variants[0].price_formatted).toContain('10,50');
  });
});
