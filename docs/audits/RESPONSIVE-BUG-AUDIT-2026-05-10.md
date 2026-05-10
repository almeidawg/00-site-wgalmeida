# Responsive Bug Audit - 2026-05-10

## Escopo

Bloco de auditoria responsiva do ecossistema com foco nos pontos publicos e operacionais acessiveis sem sessao real:

- Site institucional WG Almeida
- Moodboard Studio
- Revista de estilos
- Estilos derivados
- Blog
- WGEasy login
- Liz publica/login
- ObraEasy rotas publicas

Auditoria automatizada executada em 14 rotas x 13 viewports, totalizando 182 validacoes.

## Tabela mestre de bugs

| ID | Sistema | Rota/Modulo | Problema | Categoria | Severidade | Impacto | Status |
|---|---|---|---|---|---|---|---|
| RSP-001 | Site/Moodboard | `/moodboard` | Abas da sidebar ficavam sobrepostas ou escondidas em 320px | Responsividade/UX | P1 | Dificultava navegacao mobile real | Corrigido e validado localmente |
| RSP-002 | WGEasy/Liz | `/sistema/login`, `/liz` | Card de suporte assistido quebrava leitura em 320px | Responsividade/UX | P1 | Prejudicava suporte rastreavel de acesso | Corrigido e validado localmente no repo WGEasy |
| RSP-003 | Site/Moodboard | imagens externas Unsplash | Falhas `net::ERR_BLOCKED_BY_ORB` em imagens externas durante auditoria local | Integracao/midia | P2 | Pode degradar thumbnails/ativos externos em navegadores restritivos | Pendente, tratar em bloco de midia/fallback |
| RSP-004 | Site | React Router | Avisos de future flags do React Router v7 | Tecnico/manutencao | P3 | Nao bloqueia operacao, mas deve entrar no backlog de upgrade | Pendente |

## Evidencias

- Auditoria completa: `.codex/tmp/responsive-ecosystem-audit-20260510/responsive-audit.json`
- Relatorio automatizado: `.codex/tmp/responsive-ecosystem-audit-20260510/responsive-audit.md`
- Validacao local pos-fix: `.codex/tmp/responsive-fixes-local-20260510b/summary.json`
- Print moodboard 320px corrigido: `.codex/tmp/responsive-fixes-local-20260510b/site-moodboard-320.png`
- Prints WGEasy/Liz 320px corrigidos ficam no repo WGEasy/ambiente local de auditoria compartilhado.

## Correcoes aplicadas no site

- `src/components/moodboard/MoodboardStudioLayout.jsx`
  - A navegacao por abas passou a usar `flex-wrap`.
  - Cada aba recebeu base minima responsiva.
  - As cinco opcoes ficam visiveis em 320px sem sobreposicao e sem overflow horizontal.

## Validacao

- `npm run lint`: OK
- `npm run check:imports`: OK
- Playwright local 320px em `/moodboard`: HTTP 200, sem overflow horizontal, abas visiveis.

## Pendencias governadas

- Validacao autenticada real segue pendente fora deste bloco.
- Falhas ORB de imagens Unsplash devem ser tratadas como bloco proprio de midia/fallback.
- `2 high severity vulnerabilities` vistas no build/Vercel seguem em auditoria separada de dependencias.

## Deploy e validacao de producao

- Commit funcional ja presente no branch: `593ae44 fix(ui): improve sidebar tabs responsiveness and truncation`.
- Commit documental: `75a603a docs(site): record responsive bug audit`.
- Deploy Vercel:
  - Inspect: `https://vercel.com/william-almeidas-projects/site-wgalmeida/AtMsmNDJ7ArCZ3Nbcr4Xb8j7fTYx`.
  - Production URL: `https://site-wgalmeida-96mxj6oyi-william-almeidas-projects.vercel.app`.
  - Alias final: `https://wgalmeida.com.br`.
- Validacao real:
  - `https://wgalmeida.com.br/moodboard`: HTTP `200`, sem overflow horizontal em 320px, cinco abas visiveis.
  - `https://site-wgalmeida-96mxj6oyi-william-almeidas-projects.vercel.app/moodboard`: HTTP `200`, sem overflow horizontal em 320px, cinco abas visiveis.
- Evidencia:
  - `.codex/tmp/responsive-prod-validation-20260510/summary.json`.
  - `.codex/tmp/responsive-prod-validation-20260510/site-domain-moodboard-320.png`.

## Modelo de governanca aplicado

1. Identificar bug com evidencia visual ou log.
2. Classificar severidade e categoria.
3. Corrigir somente o escopo afetado.
4. Rodar checks tecnicos do projeto.
5. Revalidar visualmente o breakpoint/fluxo afetado.
6. Registrar evidencia, status e pendencias no documento do projeto e no `RETURN-POINT.md`.
