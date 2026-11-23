import { describe, expect, it } from 'vitest';
import { getSafeLoginReturnPath } from '@/utils/loginReturnPath';

describe('getSafeLoginReturnPath', () => {
  it.each([
    '/',
    '/admin',
    '/admin/configuracoes',
    '/solicite-proposta',
    '/produto/123',
    '/blog/arquitetura',
  ])('allows the same-origin pathname %s', (pathname) => {
    expect(getSafeLoginReturnPath(pathname)).toBe(pathname);
  });

  it.each([
    undefined,
    null,
    '',
    'admin',
    'https://attacker.invalid',
    'javascript:alert(1)',
    '//attacker.invalid',
    '/\\\\attacker.invalid',
    '/admin\\evil',
    '/%2f%2fattacker.invalid',
    '/%5c%5cattacker.invalid',
    '/%0aattacker.invalid',
    '/admin?next=https://attacker.invalid',
    '/admin#fragment',
    '/admin\nother',
    '/' + 'a'.repeat(2048),
  ])('rejects untrusted or malformed return target %s', (pathname) => {
    expect(getSafeLoginReturnPath(pathname)).toBe('/');
  });
});
