// Routing Middleware da Vercel: serve o HTML proprio da Mentoria (dist/mentoria.html)
// somente na RAIZ do host mentoria.wgalmeida.com.br.
// Motivo: rewrite por host em vercel.json NAO vence o dist/index.html estatico da raiz
// (provado em producao no PR 176). O middleware roda antes do cache e do arquivo estatico.
// Sem dependencia nova: usa o mesmo contrato de cabecalhos de @vercel/functions (next/rewrite).
// Falha aberta: qualquer erro ou host diferente segue o fluxo normal, nunca derruba o site.
export const MENTORIA_HOST = 'mentoria.wgalmeida.com.br';

export const config = { matcher: ['/'] };

const seguir = () => new Response(null, { headers: { 'x-middleware-next': '1' } });
const reescrever = (destino) =>
  new Response(null, { headers: { 'x-middleware-rewrite': String(destino) } });

export default function middleware(request) {
  try {
    const host = (request.headers.get('host') || '').toLowerCase().split(':')[0];
    if (host !== MENTORIA_HOST) return seguir();
    const url = new URL(request.url);
    url.pathname = '/mentoria.html';
    return reescrever(url);
  } catch {
    return seguir();
  }
}
