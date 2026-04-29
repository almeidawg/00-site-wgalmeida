# BuildTech P2 - Performance e Turnstile

Data: 2026-04-29
Branch: `p2/buildtech-performance-turnstile-20260429`
Escopo: pos go-live, sem reescrita de arquitetura e sem migracao para Next.

## Objetivo

Reduzir custo inicial da rota `/buildtech`, preparar ativacao controlada do Turnstile server-side e manter a vitrine viva estavel em desktop/mobile.

## Alteracoes aplicadas

- Shell SPA:
  - `Footer`, `ContextTracker`, `NextBestActionPanel`, Vercel Analytics, Speed Insights, Toaster e `web-vitals` foram movidos para carregamento ocioso/deferido.
  - O CTA mobile do header deixou de importar o componente global `Button`, reduzindo dependencias no caminho inicial.
- Hero BuildTech:
  - `PROCESSOS.webp` foi convertido para WebP real.
  - Criadas variantes `PROCESSOS-640.webp`, `PROCESSOS-960.webp` e `PROCESSOS-1200.webp`.
  - Adicionado `srcset` responsivo e preload por rota para `/buildtech`, `/buildtech/solucoes.html` e `/buildtech/metodo.html`.
- Contato/Turnstile:
  - `/api/contact` passou a suportar ativacao progressiva com `CONTACT_TURNSTILE_REQUIRED`.
  - Sem `TURNSTILE_SECRET_KEY` e com `CONTACT_TURNSTILE_REQUIRED=false`, o endpoint mantem fallback operacional com honeypot, CORS, validacao server-side e rate limit.
  - Com `CONTACT_TURNSTILE_REQUIRED=true` e sem secret, o endpoint falha explicitamente para evitar falsa sensacao de protecao.
  - Adicionados testes unitarios para os dois modos.

## Evidencias locais

Comando principal:

```powershell
npm run verify:deploy
```

Resultado:

- ESLint: OK.
- Check imports: OK.
- Audit estrutural: OK.
- Audit consistency: OK.
- Audit consistency strict: OK.
- Vitest: 9 arquivos, 54 testes OK.
- Audit public claims strict: OK.
- Build Vite + SEO routes: OK.
- SEO audit + validate dist: OK.
- `npm audit --omit=dev`: 0 vulnerabilidades.

Rotas locais em preview `127.0.0.1:4175`:

- `/buildtech`: HTTP 200.
- `/buildtech/solucoes.html`: HTTP 200.
- `/buildtech/metodo.html`: HTTP 200.
- `/contato?context=buildtech`: HTTP 200.

Browser audit:

- `buildtech-p2-desktop`: OK.
- `buildtech-p2-mobile`: OK, viewport 390x844, H1 `WG Build.tech`, CTA `Converse com a Liz agora`, demos e range `Area operacional impactada` renderizados.
- `contact-p2-desktop`: OK.
- `contact-p2-mobile`: OK, formulario renderizado com campos obrigatorios e CTA `Enviar contato`.

## Bundle e assets

Entrada SPA antes de P2:

- `index-DyaXNasJ.js`: 336.99 KB bruto, 102.87 KB gzip, 77.64 KB brotli.

Entrada SPA apos P2:

- `index-q-JjrjNG.js`: 291.80 KB bruto, 90.61 KB gzip, 67.54 KB brotli.

Delta aproximado:

- -45.19 KB bruto.
- -12.26 KB gzip.
- -10.10 KB brotli.

Hero:

- `PROCESSOS.webp`: 93.97 KB para 42.81 KB.
- `PROCESSOS-640.webp`: 17.8 KB.
- `PROCESSOS-960.webp`: 30.1 KB.
- `PROCESSOS-1200.webp`: 40.6 KB.

## Lighthouse local

Preview local `http://127.0.0.1:4175/buildtech`.

Desktop:

- Performance: 94.
- Accessibility: 96.
- Best Practices: 92.
- SEO: 100.
- FCP: 0.6 s.
- LCP: 1.1 s.
- TBT: 170 ms.
- CLS: 0.
- Speed Index: 0.9 s.

Mobile:

- Performance: 59.
- Accessibility: 96.
- Best Practices: 92.
- SEO: 100.
- FCP: 2.7 s.
- LCP: 5.1 s.
- TBT: 720 ms.
- CLS: 0.021.
- Speed Index: 2.7 s.

Observacao: o Lighthouse CLI no Windows gerou JSONs validos, mas retornou `EPERM` ao limpar diretorios temporarios do Chrome. Esse erro e ruido de ferramenta, nao falha da pagina.

## Riscos residuais

- Performance mobile ainda abaixo da meta 90. O P2 reduziu TBT e bundle inicial, mas a SPA ainda hidrata uma base ampla de contexto, i18n, CSS global e fallback SEO.
- Best Practices local 92 deve ser reavaliado em producao, onde HTTPS/HSTS/CSP reais podem alterar score.
- Turnstile completo ainda depende de configurar no Vercel:
  - `VITE_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `CONTACT_TURNSTILE_REQUIRED=true`
- A ativacao de Turnstile deve ser acompanhada de validacao de CSP para `https://challenges.cloudflare.com`.

## Recomendacao

P2 esta apto para PR e deploy controlado.

Go-live: manter.
Production hardened: parcial. A camada de contato fica mais segura e observavel, mas performance mobile exige P3 focado em divisao do shell SPA, CSS critico e estrategia de hidratacao.
