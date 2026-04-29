# WG BuildTech P1 Hardening - 2026-04-29

## Escopo

P1 pos go-live aplicado sobre a base atual, sem migracao para Next e sem reescrita estrutural.

## Implementado

- Cloudflare Turnstile preparado no formulario de contato com carregamento sob demanda do script oficial e validacao server-side em `/api/contact`.
- `/api/contact` endurecido com CORS controlado, limite de payload, honeypot, rate limit por IP/e-mail, cache disabled e mitigacao basica de replay de token.
- Eventos de conversao adicionados para `cta_click`, `form_submit`, `whatsapp_click`, `demo_interaction` e `scroll_depth`.
- Vercel Analytics e Speed Insights adicionados ao bootstrap React.
- Observabilidade leve adicionada com `/api/health`, `/api/client-error` e `npm run monitor:synthetic`.
- Secao BuildTech reforcada com demos vivas mais realistas, dados mascarados, CTA "Converse com a Liz agora" e schema `ItemList`/`FAQPage`.
- Acessibilidade BuildTech revisada: ordem de headings, rotulo do range e contraste em textos pequenos.

## Variaveis pendentes

Turnstile ainda depende de configurar no Vercel:

- `VITE_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

Enquanto a site key nao existir, o formulario preserva fallback legado. Quando as duas chaves forem publicadas, o fluxo passa por `/api/contact` com Siteverify.

## Lighthouse

Baseline publico antes do deploy P1, em `https://wgalmeida.com.br/buildtech`:

| Perfil | Performance | Accessibility | Best Practices | SEO | Observacao |
| --- | ---: | ---: | ---: | ---: | --- |
| Desktop | 96 | 90 | 96 | 100 | A11y abaixo por contraste, heading order e label do range. |
| Mobile | 67 | 90 | 96 | 100 | Gargalo em TBT 1070 ms e LCP 3.5 s. |

Preview local construido apos correcoes P1, em `http://127.0.0.1:4173/buildtech`:

| Perfil | Performance | Accessibility | Best Practices | SEO | Observacao |
| --- | ---: | ---: | ---: | ---: | --- |
| Desktop | 91 | 96 | 92 | 100 | Best Practices local penalizado por contexto localhost. |
| Mobile | 56 | 96 | 92 | 100 | Localhost/preview sem CDN/Brotli real; gargalo segue em hidratacao SPA. |

Producao final apos merge do PR #46, em `https://wgalmeida.com.br/buildtech`:

| Perfil | Performance | Accessibility | Best Practices | SEO | Observacao |
| --- | ---: | ---: | ---: | ---: | --- |
| Desktop | 81 | 96 | 96 | 100 | A11y e SEO dentro da meta; performance afetada por TBT 410 ms em execucao isolada. |
| Mobile | 55 | 96 | 96 | 100 | A11y/SEO/BP dentro da meta; performance abaixo por TBT 1710 ms e LCP 4.7 s. |

## Validacoes executadas

- `npm run lint`
- `npm run test:run` - 8 arquivos, 52 testes aprovados
- `npm run build`
- `npm run check:imports`
- `npm run audit:structural`
- `npm run audit:consistency:strict`
- `npm run seo:validate`
- `npm audit --omit=dev` - 0 vulnerabilidades
- Browser audit desktop/mobile em `/buildtech`
- Browser audit desktop/mobile em `/contato?context=buildtech`
- Synthetic check em producao: rotas P0 200; `/api/health` 404 esperado antes do deploy P1.
- Synthetic check pos-deploy P1 em producao: `/api/health`, `/buildtech`, `/buildtech/solucoes.html`, `/buildtech/metodo.html`, `/buildtech/contato.html`, `/clientes/umauma` e `/contato?context=buildtech` com HTTP 200.
- Browser audit final de producao desktop/mobile em `https://wgalmeida.com.br/buildtech`: OK.

## Plano para scores abaixo da meta

- Mobile Performance: reduzir TBT do shell SPA carregado em todas as rotas, avaliando lazy load de `NextBestActionPanel`, divisao de contexto comercial, reducao de manifesto editorial no chunk inicial e preload seletivo do hero BuildTech.
- LCP mobile: validar imagem hero com CDN final apos deploy, `fetchpriority=high`, dimensoes estaveis e compressao WebP/AVIF especifica para mobile.
- Best Practices local: reexecutar somente no dominio publico apos deploy, porque localhost nao representa headers HTTPS/CSP/CDN finais.

## Recomendacao

P1 esta apto para PR e deploy controlado. Go-live permanece mantido. O unico hold funcional e Turnstile completo ate as duas variaveis existirem em Vercel.

## Resultado pos-deploy

PR #46 mergeado em producao. Recomendacao atual: `production hardened parcial`.

Go-live mantido para P0/P1 funcional, SEO, acessibilidade, seguranca basica, observabilidade e conversao. Hold apenas para:

- ativacao real das chaves Turnstile no Vercel;
- P2 de performance mobile focado em reducao de hidratacao do shell SPA.
