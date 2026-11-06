import { describe, it, expect } from 'vitest';
import middleware, { config, MENTORIA_HOST } from '../../middleware.js';

const req = (host, url = 'https://x.test/') => ({ url, headers: { get: (k) => (k === 'host' ? host : null) } });
const rw = (r) => r.headers.get('x-middleware-rewrite');
const nx = (r) => r.headers.get('x-middleware-next');

describe('middleware da raiz da mentoria', () => {
  it('so intercepta a raiz', () => {
    expect(config.matcher).toEqual(['/']);
  });
  it('reescreve a raiz do host mentoria para /mentoria.html', () => {
    expect(rw(middleware(req(MENTORIA_HOST, `https://${MENTORIA_HOST}/`)))).toBe(`https://${MENTORIA_HOST}/mentoria.html`);
  });
  it('aceita host com porta e caixa diferente', () => {
    expect(rw(middleware(req('Mentoria.WGAlmeida.com.br:443', `https://${MENTORIA_HOST}/`)))).toContain('/mentoria.html');
  });
  it('nao toca no site institucional', () => {
    for (const h of ['wgalmeida.com.br', 'www.wgalmeida.com.br']) {
      const r = middleware(req(h));
      expect(nx(r)).toBe('1');
      expect(rw(r)).toBeNull();
    }
  });
  it('falha aberta quando a requisicao e invalida', () => {
    expect(nx(middleware({ url: 'x', headers: { get: () => MENTORIA_HOST } }))).toBe('1');
  });
});
