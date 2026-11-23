import { describe, expect, it } from 'vitest';
import { getSafeProductDetailPath } from '@/utils/productDetailPath';

describe('getSafeProductDetailPath', () => {
  it.each([
    ['123', '/product/123'],
    [123, '/product/123'],
    ['prod_123', '/product/prod_123'],
    ['b8460312-6efb-42b0-b2dc-30e3b47e2c5e', '/product/b8460312-6efb-42b0-b2dc-30e3b47e2c5e'],
    ['são-paulo', '/product/s%C3%A3o-paulo'],
  ])('allows a valid single product ID %#', (value, expected) => {
    expect(getSafeProductDetailPath(value)).toBe(expected);
  });

  it.each([
    undefined,
    null,
    '',
    ' ',
    '.',
    '..',
    '../..//outside.invalid',
    '\\outside.invalid',
    '/outside.invalid',
    'https://outside.invalid',
    'item/other',
    'item?next=outside.invalid',
    'item#frag',
    '%2f%2foutside.invalid',
    ' item ',
    'item\nnext',
    Number.POSITIVE_INFINITY,
    Number.NaN,
    'a'.repeat(161),
    {},
  ])('falls back to the store for a malformed catalog ID %#', (value) => {
    expect(getSafeProductDetailPath(value)).toBe('/store');
  });

  it('keeps all accepted destinations on the same origin in browser URL resolution', () => {
    const origin = 'https://wgalmeida.com.br';
    for (const value of ['123', 'prod_123', 'são-paulo']) {
      const path = getSafeProductDetailPath(value);
      expect(new URL(path, origin).origin).toBe(origin);
      expect(path.startsWith('/product/')).toBe(true);
    }
  });
});
