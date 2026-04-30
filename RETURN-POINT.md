# RETURN-POINT — site-wgalmeida
**Atualizado:** 30/04/2026

## P1 hardening pos go-live BuildTech — 30/04/2026

### O que foi reforcado

- `api/contact.js`
  - CORS em producao deixou de aceitar previews Vercel aleatorios por padrao.
  - `CONTACT_ALLOWED_ORIGINS` documentado para previews controlados.
  - resposta passa a expor headers de rate limit.
  - Turnstile passa a validar `action=contact_form` e hostname esperado.
- `api/client-error.js`
  - adicionados limite de payload, CORS, OPTIONS, rate limiting e headers anti-indexacao/nosniff.
- `src/pages/Contact.jsx`
  - Turnstile renderizado com `action` e `cData`.
  - links de WhatsApp passam a usar `COMPANY.whatsapp`.
- `src/pages/BuildTech.jsx`
  - vitrine "Experimente ao vivo" evoluida para painel navegavel com dados mascarados de pipeline, agente WhatsApp, KPIs e mapa de oportunidades.
- `src/lib/analytics.js`
  - payload Vercel Analytics ampliado com `action` e `source` para eventos de CTA, formulario, WhatsApp, demo e scroll.
- `tools/synthetic-checks.mjs`
  - monitoramento expandido para robots, sitemaps e rota `/buildtech/clientes/umauma`.
- `src/__tests__/contact-api.test.js`
  - cobertura adicionada para headers de rate limit e bloqueio de preview Vercel aleatorio em producao.

### Validacao local executada

- `npm run verify:fast` OK: 9 arquivos de teste / 56 testes.
- `npm run build` OK.
- `npm run monitor:synthetic` OK em producao:
  - `/api/health`
  - `/robots.txt`
  - `/sitemap.xml`
  - `/sitemap-index.xml`
  - `/buildtech`
  - `/buildtech/solucoes.html`
  - `/buildtech/metodo.html`
  - `/buildtech/contato.html`
  - `/buildtech/clientes/umauma`
  - `/clientes/umauma`
  - `/contato?context=buildtech`
- Browser audit local desktop e mobile OK para `/buildtech`.
- `public/sitemap.xml` e `public/sitemap-index.xml` apareceram apenas como ruido gerado pelo build e foram descartados antes do commit.

### Pendencias P1/P2

- Configurar em Vercel para ativacao completa do fluxo server-side com desafio obrigatorio:
  - `VITE_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `CONTACT_TURNSTILE_REQUIRED=true`
- Rodar Lighthouse em preview/production apos PR, com metas: Performance >90, Accessibility >95, SEO >95, Best Practices >95.
- Substituir amostras mascaradas por screenshots reais aprovados/com dados anonimizados quando houver curadoria comercial final.

## Correcao iPad/mobile: menu sanduiche e video da intro — 30/04/2026

### O que foi corrigido

- `src/components/layout/Header.jsx`
  - menu mobile passa a cobrir tambem tablet/iPad em landscape (`xl:hidden`), eliminando o intervalo onde o sanduiche aparecia sem painel correspondente.
  - painel mobile recebeu `z-index`, altura maxima e scroll interno para evitar bloqueio visual em telas pequenas.
- `src/components/PremiumCinematicIntro.jsx`
  - overlay da intro deixa de capturar toques em mobile/tablet (`pointer-events-none`), liberando o clique no menu.
  - video da intro passa a recalcular perfil por viewport/orientacao com debounce em resize/orientationchange.
  - video chama `load()`/`play()` ao trocar perfil e usa `onCanPlay` para recuperar autoplay quando o asset fica pronto.
  - ruído de qualidade reduzido: PropTypes, chaves estaveis e particulas deterministicas no render.
- `src/utils/cloudinaryMedia.js`
  - perfis landscape de phone/tablet passam a usar 16:9 com dimensoes explicitas, evitando video vertical em aparelho horizontal.
- `src/pages/Home.jsx`
  - removido `fetchPriority` que gerava warning de React no console durante validacao mobile.

### Validacao executada

- PR #53 mesclado em `main`: `e6924a900ffec4607cfa7590ea2c60fb4dac9797`.
- GitHub Actions `CI/CD Pipeline` da `main` OK: run `25148802358`.
- Checks do PR OK: `build-and-test`, `deploy-gate-final`, SonarCloud, GitGuardian, Vercel e Vercel Preview Comments.
- Gates locais OK:
  - `npm run lint`
  - `npm run test:run -- src/__tests__/cloudinaryMedia.test.js`
  - `npm run build`
  - pre-push hook com `check:imports`, `audit:consistency:strict` e build.
- Producao validada em `https://wgalmeida.com.br/` com HTTP 200.
- Browser headless em producao validado para:
  - iPhone portrait: menu abre, links aparecem, video `ar_9:16`, `readyState=4`, sem erros de console.
  - iPhone landscape: menu abre, links aparecem, video `ar_16:9`, `readyState=4`, sem erros de console.
  - iPad portrait: menu abre, links aparecem, video `ar_3:4`, `readyState=4`, sem erros de console.
  - iPad landscape: menu abre, links aparecem, video `ar_16:9`, `readyState=4`, sem erros de console.

### Causa raiz

- A intro cinematografica tinha camada fixa acima do header e ainda interceptava eventos de ponteiro em mobile/tablet.
- O breakpoint do menu deixava um intervalo de tablet/iPad landscape sem painel mobile renderizado.
- O perfil de video landscape para tablet podia selecionar proporcao inadequada, gerando experiencia vertical em orientacao horizontal.

## Reforco de indexacao e interlinking — 30/04/2026

### O que foi corrigido

- `build-seo-routes.mjs`
  - fallback HTML pre-gerado passa a incluir links internos especificos por rota para as 4 URLs com atencao no Search Console.
  - mantidos links centrais para arquitetura, marcenaria, arquitetura corporativa, revista de estilos e blog.
- `src/content/blog/closet-planejado-organizacao-otimizacao.md`
  - adicionados links contextuais para marcenaria planejada, marcenaria sob medida, cozinha planejada e pagina de marcenaria.
- `src/content/estilos/neoclassico.md`
  - adicionados links para estilos classico/mediterraneo, revista de estilos e arquitetura.
- `src/content/estilos/southwest.md`
  - adicionados links para estilos rustico/boho, revista de estilos e arquitetura.
- `public/sitemap.xml` e `public/sitemap-index.xml`
  - `lastmod` atualizado para 2026-04-30 no build de producao.

### URLs priorizadas

- `https://wgalmeida.com.br/blog/closet-planejado-organizacao-otimizacao`
- `https://wgalmeida.com.br/blog/custo-reforma-m2-sao-paulo`
- `https://wgalmeida.com.br/estilos/neoclassico`
- `https://wgalmeida.com.br/estilos/southwest`

### Validacao executada

- PR #54 mesclado em `main`: `d87e6c504c98056b11ab65fa6ee7709471304f9a`.
- GitHub Actions `CI/CD Pipeline` da `main` OK.
- PR checks OK para `build-and-test`, `deploy-gate-final`, Vercel e GitGuardian; SonarCloud seguiu com falha conhecida nao bloqueante.
- Producao validada com HTTP 200 em:
  - `https://wgalmeida.com.br/`
  - `https://wgalmeida.com.br/blog/closet-planejado-organizacao-otimizacao`
  - `https://wgalmeida.com.br/blog/custo-reforma-m2-sao-paulo`
  - `https://wgalmeida.com.br/estilos/neoclassico`
  - `https://wgalmeida.com.br/estilos/southwest`
  - `https://wgalmeida.com.br/sitemap.xml`
  - `https://wgalmeida.com.br/sitemap-index.xml`
- HTML inicial em producao validado com canonical correto e `hrefs` internos novos nas 4 URLs priorizadas.
- `sitemap.xml` em producao validado com `lastmod=2026-04-30` para as 4 URLs priorizadas.

### Submissao Search Console

- Sitemaps submetidos em producao para `sc-domain:wgalmeida.com.br` via ADC/OAuth de `william@wgalmeida.com.br`:
  - `https://wgalmeida.com.br/sitemap.xml`
  - `https://wgalmeida.com.br/sitemap-index.xml`
  - `https://wgalmeida.com.br/video-sitemap.xml`

### Proximo acompanhamento

- Reexecutar `npm run google:indexing:audit -- --concurrency=5` apos novo ciclo de crawl do Google.
- Monitorar se as 3 URLs `URL is unknown to Google` mudam para descoberta/rastreamento.
- Monitorar se a URL de closet resolve o estado `Duplicate, Google chose different canonical than user` apos os novos sinais canonicos e de interlinking.

## Google indexing ops e submissao de sitemap — 29/04/2026

### O que foi corrigido

- `tools/google-indexing-ops.mjs`
  - criado comando operacional para auditoria via URL Inspection API.
  - criado comando para submissao de sitemap via Search Console API usando ADC/OAuth de `william@wgalmeida.com.br`.
- `build-seo-routes.mjs`
  - HTML pre-gerado de blog e estilos passa a incluir preview real do Markdown, reduzindo dependencia de renderizacao client-side para descoberta/indexacao.
  - `sitemap-index.xml` passa a ser atualizado junto do build com `lastmod` atual.
- `public/robots.txt`
  - metadado de atualizacao alinhado para 2026-04-29.
- `docs/audits/GOOGLE-INDEXING-OPS-2026-04-29.md`
  - registrado baseline de indexacao, estados da URL Inspection API e estrategia por classe de problema.

### Baseline Search Console

- URLs no sitemap: 158.
- URLs inspecionadas: 158.
- `Submitted and indexed`: 105.
- `Discovered - currently not indexed`: 44.
- `Crawled - currently not indexed`: 5.
- `URL is unknown to Google`: 3.
- `Duplicate, Google chose different canonical than user`: 1.

### Validacao executada

- Sync Gate `-Stage start`, `-Stage pre-commit` e `-Stage pre-push` OK no repo canonico.
- `npm run google:indexing:audit -- --concurrency=5` OK.
- `npm run build` OK.
- `npm run verify:fast` OK: 9 arquivos de teste / 54 testes OK.
- PR #51 mesclado em `main`: `ddc8be9283ee59fc4b4d364f7c5d4cd57fe4f7ca`.
- GitHub Actions `CI/CD Pipeline` da `main` OK.
- Producao validada em `https://wgalmeida.com.br/` com HTTP 200.
- Producao validada em:
  - `https://wgalmeida.com.br/sitemap.xml` HTTP 200.
  - `https://wgalmeida.com.br/sitemap-index.xml` HTTP 200 com `lastmod` 2026-04-29.
  - `https://wgalmeida.com.br/video-sitemap.xml` HTTP 200.
- HTML inicial em producao validado para:
  - `/blog/custo-reforma-m2-sao-paulo`
  - `/estilos/neoclassico`
  - `/blog/closet-planejado-organizacao-otimizacao`

### Submissao Search Console

- Sitemaps submetidos em producao para `sc-domain:wgalmeida.com.br`:
  - `https://wgalmeida.com.br/sitemap.xml`
  - `https://wgalmeida.com.br/sitemap-index.xml`
  - `https://wgalmeida.com.br/video-sitemap.xml`
- Confirmacao Search Console:
  - `lastSubmitted`: 2026-04-29T23:29:01Z.
  - `lastDownloaded`: 2026-04-29T23:29:02Z / 2026-04-29T23:29:03Z.
  - `warnings`: 0.
  - `errors`: 0.

### Pendencia de acompanhamento

- Reexecutar `npm run google:indexing:audit -- --concurrency=5` apos novo ciclo de crawl do Google.
- Priorizar reforco editorial/interlinking nas URLs `Discovered - currently not indexed` e `Crawled - currently not indexed`.
- A Service Account `search@grupo-wg-284118.iam.gserviceaccount.com` autentica, mas o Search Console nao aceitou adiciona-la como usuario; o fluxo operacional validado e ADC/OAuth com `william@wgalmeida.com.br`.

## Intervencao P0 BuildTech — 29/04/2026

### O que foi corrigido

- `vercel.json`
  - removido proxy geral de `/buildtech` e `/buildtech/:path*` para `wgalmeida-buildtech.vercel.app`, que era a causa direta dos 404s herdados.
  - mantidos os rewrites especificos de EasyFood antes da rota SPA.
  - adicionados rewrites SPA para rotas legadas:
    - `/buildtech/solucoes.html`
    - `/buildtech/metodo.html`
    - `/buildtech/cases.html`
    - `/buildtech/blog.html`
    - `/buildtech/contato.html`
    - `/buildtech/clientes/umauma`
    - `/clientes/umauma`
- `src/App.jsx`
  - rotas legadas BuildTech agora renderizam a pagina canônica ou redirecionam para contato/case.
- `src/pages/BuildTech.jsx`
  - pagina consolidada com secoes `solucoes`, `metodo`, `experimente` e `cases`.
  - adicionada vitrine viva leve com CRM Pipeline, IA WhatsApp Agent, Dashboard KPIs, mapa de projetos, simulador de proposta e Liz demo.
- `src/pages/Contact.jsx` e `api/contact.js`
  - formulario passa a enviar para endpoint server-side `/api/contact` quando `VITE_TURNSTILE_SITE_KEY` estiver configurada.
  - endpoint valida Cloudflare Turnstile via Siteverify e grava em `contacts` no Supabase com service role.
  - enquanto as chaves Turnstile nao existirem no Vercel, o fluxo legado Supabase anon + EmailJS permanece como fallback para nao interromper captacao.
- `.env.example`
  - documentadas `SUPABASE_SERVICE_ROLE_KEY`, `VITE_TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY`.

### Validacao local executada

- Sync Gate `-Stage pre-commit -AllowDirty` OK no repo canonico.
- `npm run lint` OK.
- `npm audit --omit=dev` OK, 0 vulnerabilidades.
- `npm run build` OK.
- Rotas locais com HTTP 200:
  - `/buildtech`
  - `/buildtech/solucoes.html`
  - `/buildtech/metodo.html`
  - `/buildtech/contato.html`
  - `/clientes/umauma`
  - `/buildtech/clientes/umauma`
  - `/contato?context=buildtech`
- Browser audit desktop e mobile gerado em `.codex/tmp/audit-buildtech-*`.

### Pendencia antes de go-live

- Configurar variaveis Turnstile no Vercel para ativar o fluxo server-side completo:
  - `VITE_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
- Quando as chaves Turnstile forem configuradas, abrir PR especifica de CSP adicionando `https://challenges.cloudflare.com` em `frame-src` e validando SonarCloud.
- Validar em producao apos deploy no dominio final `https://wgalmeida.com.br`.

## Fechamento pendencia footer recursos — 29/04/2026

### O que foi corrigido

- `src/components/layout/Footer.jsx`
  - bloco `Recursos` mantido no footer para expor:
    - Blog & Artigos
    - Revista de Estilos
    - Gerador de Moodboard
    - Visualizador de Ambientes
    - Guia de Estilos
  - grid responsivo ajustado para comportar a quinta coluna sem quebrar o layout:
    - `lg:grid-cols-3`
    - `xl:grid-cols-[0.9fr_0.95fr_1fr_1.55fr_1.05fr]`
  - removido deslocamento negativo da coluna de regioes que era especifico do layout anterior.

### Validacao executada

- Sync Gate `-Stage start -AllowDirty` OK no repo canonico.
- `npm run verify:full` OK:
  - lint OK
  - check imports OK
  - audit estrutural OK
  - audit consistency normal e strict OK
  - 8 arquivos de teste / 52 testes OK
  - build Vite OK
  - rotas SEO geradas/validadas OK
- `public/sitemap.xml` apareceu apenas com ruido de `lastmod` gerado pelo build e foi descartado antes do commit conforme regra local.

## Hotfix logo ObraEasy Home — 29/04/2026

### Problema confirmado

- Browser validation em producao detectou 404 em:
  - `https://wgalmeida.com.br/Logos/logo-obraeasy-84.webp`
- O arquivo nao existe em `public/Logos`, mas `src/pages/Home.jsx` referenciava o asset no stack de logos dos nucleos.

### Correcao aplicada

- `src/pages/Home.jsx`
  - remove dependencia do asset inexistente `logo-obraeasy-84.webp`.
  - usa marcador textual compacto `ObraEasy` no mesmo stack.
  - grid de logos ajustado de 3 para 4 itens:
    - mobile: `grid-cols-4`
    - desktop: `md:grid-rows-4`

### Validacao esperada

- Browser validation de producao sem 404 para `logo-obraeasy-84.webp`.

## Auditoria estrutural anti-reincidencia estendida — 29/04/2026

### O que foi saneado

- ref contaminada `origin/main (1)` movida para `.git/codex-quarantine/refs-contaminadas-20260429`
- 13 copias nao versionadas `arquivo (1).*` movidas para `.git/codex-quarantine/worktree-duplicates-20260429`
- `scripts/audit-consistency.mjs` passou a ter fallback Node nativo quando `rg` nao existir

### Guardrail criado

- criado `scripts/audit-structural.mjs`
- `package.json` passou a executar `audit:structural` em:
  - `verify:fast`
  - `verify:full`
  - `verify:deploy`
  - `prepush`
- o audit valida:
  - ausencia de contaminacao em `.git/refs` e `.git/objects`
  - dominios canonicos em `src/data/company.js`
  - hero video via Cloudinary, sem retorno a `/videos/hero/*.mp4`
  - CSP ativa e report-only com `media-src https://res.cloudinary.com`
  - Admin Blog -> paginas publicas usando slot `hero`, override versionado, upload publicado e Unsplash publicado
  - testes regressivos de Cloudinary e catalogo de imagens

### Validacao executada

- `npm run audit:structural` OK
- `npm run verify:fast` OK:
  - lint OK
  - check imports OK
  - audit estrutural OK
  - audit consistency normal e strict OK
  - 8 arquivos de teste / 52 testes OK
- Sync Gate `-Stage start -AllowDirty` OK no repo canonico

## Hotfix hero video e imagens Admin Blog — 25/04/2026

### Problema confirmado

- produção em `https://wgalmeida.com.br` retornava `404` para:
  - `/videos/hero/hero-desktop.mp4`
  - `/videos/hero/hero-mobile.mp4`
- por isso o elemento `<video>` do hero ficava sem metadata carregada em produção
- imagens escolhidas no Admin Blog para páginas públicas ainda dependiam apenas do manifest gerado/commitado, então a seleção publicada no navegador do admin não aparecia imediatamente na página pública

### Correção aplicada

- `src/utils/cloudinaryMedia.js`
  - perfis principais do hero voltaram a usar Cloudinary com transformações responsivas
  - dependência dos MP4 locais legados foi removida; Cloudinary/CDN é a fonte canônica
- `src/data/publicPageImageCatalog.js`
  - páginas públicas passam a ler também as seleções publicadas pelo Admin Blog em `localStorage`
  - prioridade de imagem pública:
    - upload publicado no Admin
    - Unsplash publicado no Admin
    - override gerado/commitado
    - imagem base do catálogo
- `vercel.json`
  - `Content-Security-Policy` e `Content-Security-Policy-Report-Only` passam a declarar `media-src 'self' blob: data: https://res.cloudinary.com`
  - isso libera o vídeo do hero hospedado no Cloudinary em produção
- testes adicionados/atualizados:
  - `src/__tests__/cloudinaryMedia.test.js`
  - `src/__tests__/publicPageImageCatalog.test.js`

### Validação executada

- `npm run lint` OK
- `npm run test:run -- src/__tests__/cloudinaryMedia.test.js src/__tests__/publicPageImageCatalog.test.js src/__tests__/publicPageOverrides.test.js` OK
- `npm run verify:deploy` OK:
  - 8 arquivos de teste
  - 52 testes
  - build Vite
  - geração SEO/OG/sitemap
  - validações de deploy

### Erros, dificuldades e regras preventivas consolidadas

- MP4 local no repo nao garante entrega na Vercel:
  - erro encontrado: `/videos/hero/hero-desktop.mp4` e `/videos/hero/hero-mobile.mp4` retornavam `404` em producao
  - regra: video de hero/asset grande precisa usar CDN canonica, sem fallback local legado, e ser validado por URL publica direta e pelo estado do `<video>` no dominio final
- CDN externa precisa de CSP explicita:
  - erro encontrado: Cloudinary estava no `src`, mas a CSP bloqueava por falta de `media-src`
  - regra: qualquer troca para Cloudinary/CDN exige revisar `media-src`, `img-src`, `connect-src` ou `frame-src` conforme o tipo de asset
- Vercel `Ready` nao encerra validacao:
  - dificuldade encontrada: deploy pronto ainda podia entregar HTML correto com asset bloqueado por CSP
  - regra: sempre validar `https://wgalmeida.com.br` em navegador/headless depois do deploy de producao
- Admin Blog tem contratos diferentes por tipo de conteudo:
  - erro encontrado: paginas publicas dependiam de `hero`, enquanto parte do admin tratava tudo como `cover`
  - regra: validar post, pagina publica e estilo/guia com os slots reais de cada catalogo
- Estado do Admin e estado de visitante nao sao a mesma coisa:
  - erro encontrado: selecao aparecia no Admin, mas pagina publica dependia do override gerado/commitado
  - regra: validar mesmo navegador do admin e tambem visitante sem `localStorage`; para todos os visitantes, garantir manifest/override versionado e deployado
- Lazy loading pode parecer imagem quebrada:
  - dificuldade encontrada: produtos relacionados tinham `naturalWidth = 0` antes de scroll
  - regra: rolar ate a imagem e aguardar carregamento antes de classificar quebra
- Build pode gerar ruido:
  - dificuldade encontrada: `public/sitemap.xml` aparecia modificado sem mudanca semantica
  - regra: revisar `git diff --stat`/diff final e remover artefatos gerados sem valor para o bloco

### Limpeza operacional executada em 25/04/2026

- removida a copia antiga `site-wgalmeida-publish-temp` fora do repo canonico
- removidos builds locais, logs, relatorios temporarios, `.monitor-data`, `tmp` e videos locais legados
- removidos relatorios temporarios que estavam versionados por engano:
  - `blog-editorial-status-2026-04-09.json`
  - `temp_unsplash_priority_batch*_report.json`
  - `temp_unsplash_top10_fill_report.json`
- contrato do hero atualizado para nao referenciar mais `/videos/hero/*.mp4`
- CSP de producao ajustada para permitir `frame-src https://ct.pinterest.com` e remover `report-uri /csp-report` sem endpoint, que gerava 405 em console

### Pendencias operacionais registradas em 25/04/2026

- Google Search Console:
  - validado publicamente: `robots.txt` 200 permitindo crawlers, `sitemap.xml` 200, home com canonical `https://wgalmeida.com.br/` e `robots=index, follow`
  - bloqueio atual: `gcloud` tem conta ativa, mas o token local nao possui escopo Search Console; service account valida encontrada nao tem propriedades do Search Console associadas
  - proxima sessao: autenticar `william@wgalmeida.com.br` com escopo `https://www.googleapis.com/auth/webmasters` ou adicionar a service account valida como proprietaria/usuario da propriedade `https://wgalmeida.com.br/`/`sc-domain:wgalmeida.com.br`, entao consultar URL Inspection API e reenviar `https://wgalmeida.com.br/sitemap.xml`
- Repositorio pai BuildTech:
  - pendente auditoria separada para classificar o que fica e o que e lixo em `site-wgalmeida/Imagens`, `noc-tools` e gitlink `site-wgalmeida/site-wgalmeida`
  - nao limpar em bloco automatico porque o repo pai esta muito sujo com mudancas antigas e sem `origin` configurado; fazer auditoria futura path-scoped antes de qualquer delecao

## Correção SEO, auditoria visual e Admin Blog — 25/04/2026

### Escopo

- screenshots revisados em `C:\Users\Atendimento\Documents\Pictures\Screenshots\site-wg`
- correções priorizadas para SEO, limpeza visual, botões, contornos/cores e fluxo Admin Blog -> imagens públicas
- branch de trabalho limpa criada a partir de `origin/main`:
  - `fix/seo-visual-cleanup-2026-04-24`

### Correções aplicadas

- SEO global em `index.html` e `src/data/seoConfig.js` corrigido com acentos e textos canônicos:
  - São Paulo
  - excelência
  - alto padrão
  - Vila Nova Conceição
  - execução, gestão, mobiliário e Construção Civil
- textos principais da Home revisados para evitar concatenação visual em auditoria:
  - `Do projeto à entrega, sem ruídos.`
  - `Grupo WG Almeida. Onde ideias ganham forma, processos ganham controle e espaços ganham alma.`
- ícones decorativos `Sparkles` removidos de `src` e substituídos por ícones funcionais (`CheckCircle2`, `Palette`, `Wand2`)
- usos visíveis de `text-wg-brown` e `border-yellow` removidos de `src`
- páginas/admin com tons amarelados e marrons neutralizados para cinza/azul de marca
- botões capturados na Home ajustados para `type="button"`, inclusive:
  - Núcleos
  - carrinho
  - menu mobile
  - Pular
  - Ativar som
- estatística base de revestimentos ajustada para `3898`
- `public/sitemap.xml` regenerado com `lastmod` de 2026-04-25

### Correção Admin Blog -> imagens públicas

- causa confirmada:
  - páginas públicas usavam slot fixo `cover` no Admin Blog, mas o catálogo público espera `hero`
  - seleções Unsplash de páginas não entravam no estado efetivo quando não eram posts de blog
  - `api/_editorialOverrides.js` não publicava seleções Unsplash-only para `publicPageImageOverrides.generated.js`
- correção:
  - Admin Blog agora usa `getPrimarySlotNames(record)` para páginas públicas
  - `getEffectiveSlotState` considera Unsplash também para páginas/estilos
  - `buildPageOverrideEntry` serializa seleção Unsplash-only de `hero`
- teste adicionado:
  - `publishes unsplash-only page selections to public page overrides`

### Validação executada

- `npm run lint` OK
- `npm run test:run -- src/__tests__/publicPageOverrides.test.js` OK
- `npm run blog:editorial:status` OK:
  - 78 posts
  - 78 publicados com manifest
  - 0 fallback genérico
- `npm run verify:deploy` OK:
  - lint
  - check-imports
  - audit-consistency normal e strict
  - 7 arquivos de teste / 49 testes
  - audit-public-claims strict
  - build Vite
  - geração SEO/OG
  - sitemap com 158 rotas
  - `seo-audit`
  - `seo-validate-dist`
- auditoria com `wg-browser-audit`:
  - Home desktop: `tmp/audit-home-desktop-final`
  - Home mobile: `tmp/audit-home-mobile`
  - Blog post: `tmp/audit-blog-post`
  - Admin Blog: `tmp/audit-admin-blog-editorial`
- validação direta de imagens do post:
  - hero/card editorial renderizando com `naturalWidth > 0`
  - produtos relacionados carregam após `scrollIntoViewIfNeeded`
  - 0 imagem visível quebrada depois do carregamento lazy

### Observações

- `/admin/blog-editorial` redireciona para `/login` em navegador sem sessão, como esperado; validação do bug de publicação foi feita por teste unitário/API e pelo carregamento público das imagens renderizadas.
- alguns conteúdos antigos de blog ainda têm títulos/textos sem acento nos próprios markdowns e filas editoriais. Isso não bloqueou deploy porque o foco imediato foi SEO global, renderização de imagem e higiene visual, mas é backlog editorial separado.
- commit/PR/produção:
  - commit local: `fix(site): apply SEO visual and editorial image cleanup` no branch `fix/seo-visual-cleanup-2026-04-24`
  - PR principal: `#25` — https://github.com/almeidawg/site-wgalmeida/pull/25
  - merge em `main`: `fec3780ed1d2a5d6b4132a722fa73fd8e58f8f8c`
  - preview Vercel do PR validado antes do merge
  - produção disparada pelo merge em `main`

## Ajuste responsivo do hero video — 23/04/2026

### Problema atacado

- o hero video diferenciava apenas `mobile` e `desktop`
- celular, tablet e desktop não tinham perfis próprios
- vídeos verticais e horizontais ainda caíam no mesmo corte horizontal em parte da experiência
- a intro premium também dependia do contrato antigo

### Correção aplicada

- `src/utils/cloudinaryMedia.js`
  - contrato expandido para perfis:
    - `phonePortrait`
    - `phoneLandscape`
    - `tabletPortrait`
    - `tabletLandscape`
    - `desktopPortrait`
    - `desktopLandscape`
  - seleção centralizada por viewport com `getHeroVideoProfile()` e `selectHeroVideoSrc()`
  - observacao historica: este bloco chegou a apontar para MP4 local em `/videos/hero`, mas essa decisao foi revertida em 25/04/2026
  - estado atual: Cloudinary/CDN e a fonte canonica do hero; MP4 local legado nao deve ser recriado sem decisao explicita
- `src/components/HeroVideo.jsx`
  - troca de `mobile/desktop` simples por seleção orientada por largura + altura do viewport
  - atualização automática em `resize` e `orientationchange`
- `src/components/PremiumCinematicIntro.jsx`
  - mesma lógica aplicada para não deixar a intro usando o contrato antigo
- `src/__tests__/cloudinaryMedia.test.js`
  - testes cobrindo celular/tablet/desktop e vertical/horizontal

### Validação executada

- `npm run lint` OK
- `npm run test:run -- src/__tests__/cloudinaryMedia.test.js` OK
- `npm run build` OK
- preview local + Playwright OK:
  - celular vertical -> perfil Cloudinary vertical
  - tablet vertical -> perfil Cloudinary vertical
  - tablet horizontal -> perfil Cloudinary horizontal
  - desktop horizontal -> perfil Cloudinary horizontal

## Hotfix de header/menu bloqueado — 23/04/2026

### Problema confirmado

- em produção, o botão do menu na faixa intermediária/mobile estava visível
- porém o clique era interceptado por um overlay do hero
- evidência validada com Playwright:
  - `Clique do menu bloqueado por overlay (DIV absolute inset-0)`

### Causa real

- `src/pages/Home.jsx`
  - overlay do hero:
    - `absolute inset-0 z-10 bg-gradient-to-b ...`
  - estava aceitando ponteiro mesmo sendo apenas camada visual

### Correção aplicada

- `src/pages/Home.jsx`
  - overlay do hero passou a usar:
    - `pointer-events-none`

### Impacto esperado

- menu volta a receber clique normalmente
- header deixa de perder interação no topo da home
- bloqueio visual deixa de aparecer na auditoria complementar da Liz

## Auditoria de normalização ponta a ponta — 20/04/2026

### Status do bloco

- normalização de CTAs públicos concluída nas páginas de serviço:
  - `ConstrutoraAltoPadraoSP.jsx`
  - `ConstrutoraBrooklin.jsx`
  - `MarcenariaSobMedidaMorumbi.jsx`
  - `ReformaApartamentoItaim.jsx`
  - `ReformaApartamentoJardins.jsx`
  - `ReformaApartamentoSP.jsx`
- ruído isolado de `public/sitemap.xml` foi descartado e não entrou em commit
- commit aplicado para o bloco:
  - `037a28b` — `refactor(ui): standardize CTA system across service pages`
- nesta rodada, o site permanece estável e sem novo refactor funcional obrigatório
- próximas mudanças no `site-wgalmeida` devem seguir apenas por:
  - governança editorial
  - consistência admin -> publicação
  - higiene de commit/deploy antes de merge e Vercel

### Validação executada

- `npm run lint` OK
- `npm run build` OK
- `npm run verify:deploy` OK

### Leitura de normalização do projeto

- `site-wgalmeida` já está alinhado no eixo de site inteligente, SmartCTA e consistência visual pública
- o próximo padrão transversal aqui não é auth, e sim:
  - governança editorial
  - consistência entre admin e publicação
  - higiene de repositório antes de deploy
- quando houver automação de governança, ela deve entrar como ferramenta separada do runtime do site

### Regra operacional fixada

- `Repo Guardian System v4` fica aprovado como direção de produto interno para auditoria de commit/deploy
- essa ferramenta não deve ser embutida no bundle do site nem misturada ao runtime público
- a adoção correta é em repositório/pacote próprio, consumido por CLI, GitHub Action e gate de PR

## Auditoria visual/editorial — 18/04/2026

- padronização do sistema de botões concluída em `src/components/ui/button.jsx` e `src/index.css`
- classe faltante `wg-btn-pill-outline-dark` criada e validada
- CTAs públicos críticos convergiram para o mesmo padrão de raio, borda, peso e hover
- segunda onda concluída em metadados públicos, schema e sitemap de vídeo para remover português degradado e alinhar experiência visual dos botões outline
- revisão editorial aplicada em páginas públicas com maior exposição:
  - `Architecture.jsx`
  - `Engineering.jsx`
  - `Carpentry.jsx`
  - `ArquiteturaInterioresVilaNovaConceicao.jsx`
  - `ObraTurnKey.jsx`
  - `ICCRI.jsx`
  - `ICCRIParaImobiliarias.jsx`
- camada de SEO textual corrigida em `src/data/seoConfig.js`
- `schemaConfig.js`, `Blog.jsx`, `Testimonials.jsx`, `ObraEasyLanding.jsx` e `public/video-sitemap.xml` revisados para consistência de idioma, localidade e padrão visual
- `public/sitemap.xml` regenerado após a build

### Validação executada

- `npm run lint` OK
- `npm run check:imports` OK
- `npm run audit:consistency:strict` OK
- `npm run build` OK
- preview local em `http://127.0.0.1:3015` OK
- checagem visual automatizada com screenshots em:
  - `C:\Users\Atendimento\site-wgalmeida-audit`
- rotas auditadas no preview:
  - `/`
  - `/arquitetura`
  - `/engenharia`
  - `/marcenaria`
  - `/processo`
  - `/iccri`
  - `/iccri-para-imobiliarias`

### Pendência real após este bloco

- ainda existe massa editorial antiga em outras páginas e conteúdos de blog com português degradado em ASCII (`Sao`, `Indice`, `Construcao`, etc.)
- a próxima rodada certa é continuar essa limpeza nos conteúdos secundários e nos dados estruturados (`schemaConfig`, filas editoriais e blog legado)

## Estado atual

### PRs mergeados em main
| PR | Descrição |
|---|---|
| #14 | Admin editorial UX redesign + moodboard visual guide + add-on experiência visual |
| #15 | Site Inteligente Camadas 1+2 (SmartCTA, ContextProvider, decisionEngine) |
| #16 | Camada 3: hero personalizado, banner retorno, SoliciteProposta introLabel, blog artigos sugeridos |
| #17 | Camada 5: NextBestActionPanel, getNBAScore, inferStage, stage-aware actions, 41 testes, userContext.js |

### PR aberto
| PR | Branch | Descrição |
|---|---|---|
| #18 | feat/auditoria-editorial-region-smartcta | sectionTitle PHASE1 completo + SmartCTA RegionTemplate |

---

## Site Inteligente — Camadas implementadas

### Camada 1 — Site Guiado
`decisionEngine.js` → rota → intenção → CTA dinâmico. SmartCTA em páginas de serviço e artigos do blog.

### Camada 2 — Contexto do Usuário
`ContextProvider.jsx` persiste contexto em localStorage (`wg_context_v1`). `ContextTracker.jsx` acumula paginas[], rastreia signals e infere tipoImovel a cada navegação.

Contexto canônico:
```ts
{
  interesse: 'obra' | 'marcenaria' | 'design' | 'investimento' | null,
  tipoImovel: 'apartamento' | 'casa' | 'corporativo' | 'interiores' | null,
  faixaValor: string | null,
  estagio: 'exploracao' | 'decisao' | 'acao',
  origem: string | null,
  paginas: string[],
  lastPath: string,
  signals: { viewedProposal, usedMoodboard, viewedInvestment, viewedObraEasy, viewedEasyRealState },
  recommendedAction: { label, href, intent, stage, score } | null,
}
```

### Camada 3 — Personalização
- `Home.jsx`: hero copy dinâmico, banner de retorno (≥3 páginas), reordenação de núcleos
- `SoliciteProposta.jsx`: introLabel contextual por intent/context params
- `Blog.jsx`: artigos sugeridos filtrados por intenção

### Camada 4 — Integração com Sistemas
`ACTION_LIBRARY` por estágio: obra→ObraEasy, investimento→EVF4, design→moodboard. SmartCTA suporta links externos com fallback manual.

### Camada 5 — Next Best Action
- `getNBAScore(context, pathname)`: confiança 0–100
- `inferStage(context, pathname)`: exploracao/decisao/acao considerando signals
- `ContextTracker`: promove estagio via `promoteStage` (nunca regride)
- `NextBestActionPanel`: sticky bottom, score≥40, stage badge, dismiss por rota
- 41 testes unitários em `src/__tests__/decisionEngine.test.js`

---

## Blog Editorial — Estado das Imagens

### PHASE1 (layout editorial completo com imagens inline)
Todos os 10 slugs têm `context[]` com `sectionTitle` mapeado para H2 reais (pending PR #18):
como-calcular-custo-de-obra, custo-reforma-m2-sao-paulo, evf-estudo-viabilidade-financeira,
quanto-custa-reforma-apartamento-100m2, quanto-tempo-leva-reforma-completa-alto-padrao,
quanto-valoriza-apartamento-apos-reforma, tabela-precos-reforma-2026-iccri,
custo-marcenaria-planejada, arquitetos-brasileiros-famosos-legado, marcas-luxo-internacionais-moveis-design

### Sync editorial publicado
- `api/editorial-overrides.js` grava `src/data/blogImageOverrides.generated.js` a partir das seleções do admin
- `api/_editorialOverrides.js` consolida a serialização dos uploads do admin para os arquivos publicados de blog e páginas públicas
- `AdminBlogEditorial.jsx` agora detecta disponibilidade do endpoint, sincroniza automaticamente as mudanças e oferece botão manual `Publicar overrides`
- validação local confirmada com teste controlado de escrita/restauração do arquivo de overrides
- painel de busca do admin agora unifica curadoria com `Unsplash` inline e atalhos laterais para `Google Imagens` e `Google Drive`
- cards de resultados foram estreitados e convertidos para trilho horizontal com navegação lateral, acelerando a revisão de mais imagens por slug
- o card do conteúdo agora sinaliza quando a publicação ainda está usando `banner genérico atual`

### Catálogo publicado de páginas públicas
- `src/data/publicPageImageCatalog.js` centraliza imagens principais de páginas públicas institucionais, serviços, landings e produtos
- `src/data/publicPageImageOverrides.generated.js` abre a base de overrides publicados para páginas públicas
- `AdminBlogEditorial.jsx` agora incorpora registros `kind: 'page'`, permitindo filtrar `Páginas` na mesma fila de curadoria
- o upload de páginas públicas agora usa a pasta correta `editorial/pages/<slug>` no Cloudinary
- páginas públicas críticas já passaram a ler do catálogo central: `About`, `AMarca`, `Architecture`, `ArquiteturaCorporativa`, `ArquiteturaInterioresVilaNovaConceicao`, `BuildTech`, `Carpentry`, `ConstrutoraBrooklin`, `Contact`, `EasyLocker`, `EasyRealStateLanding`, `Engineering`, `FAQ`, `ObraEasyLanding`, `ObraTurnKey`, `Process`, `ReformaApartamentoItaim`, `ReformaApartamentoJardins`, `ReformaApartamentoSP`, `RevistaEstilos` e `Testimonials`
- prova controlada confirmou escrita real em `blogImageOverrides.generated.js` e `publicPageImageOverrides.generated.js`, com restauração imediata após o teste

### Próximos candidatos para PHASE1
- `marcas-luxo-nacionais-moveis-decoracao` — tem unsplashManifest entry, falta sectionTitle + PHASE1
- `custo-reforma-apartamento-alto-padrao-sp`
- `reforma-cozinha-planejada-guia-completo`

---

## Arquivos críticos do sistema inteligente

```
src/
  providers/ContextProvider.jsx        — persistência, normalização, DEFAULT_USER_CONTEXT
  components/ContextTracker.jsx        — signals, tipoImovel, estagio automático
  components/SmartCTA.jsx              — CTA primário + secundário + fallback manual + reason
  components/NextBestActionPanel.jsx   — painel sticky bottom Camada 5
  hooks/useNextBestAction.js           — contrato único: action + score + stage
  lib/decisionEngine.js                — ACTION_LIBRARY, inferStage, getNBAScore, inferPropertyType
  lib/userContext.js                   — STAGE_RANK, DEFAULT_USER_CONTEXT, promoteStage
  __tests__/decisionEngine.test.js     — 41 testes unitários (vitest)
  data/blogImageManifest.js            — context[] com sectionTitle para PHASE1
  data/publicPageImageCatalog.js       — catálogo central de imagens publicadas das páginas públicas
  data/publicPageImageOverrides.generated.js — base para overrides publicados de páginas públicas
  pages/regions/RegionTemplate.jsx     — SmartCTA inteligente nas 14 páginas de bairro
  docs/AGENTES-OBRIGATORIOS-SITE-E-MOODBOARD.md — contrato de arquitetura
```

---

## Regras de arquitetura

1. Toda frente nova responde: **"qual é o próximo passo ideal para este usuário neste momento?"**
2. Toda ação recomendada tem fallback manual (`action.manual`)
3. Estagio só promove, nunca regride (`promoteStage`)
4. Score >= 40 para mostrar NextBestActionPanel
5. Nunca depender exclusivamente de IA — sempre oferecer caminho humano

---

## Pendências conhecidas

- **PR #18** aguarda CI → merge → sectionTitle PHASE1 + SmartCTA bairros em produção
- **SVGs de estilos** 4–5MB comprimidos (japandi, boho, glam) — candidatos a WebP/AVIF
- **marcas-luxo-nacionais-moveis-decoracao** ainda não no PHASE1
- **estagio "acao"** pode ser incrementado com trigger no submit do OrcadorInteligente
- **sync editorial em Vite puro** depende de endpoint `/api`; fluxo completo local com API requer ambiente que sirva `api/` ou deploy/Vercel
- **curadoria unificada de imagens para todas as páginas públicas** avançou no catálogo central e na publicação via admin, mas ainda faltam páginas secundárias e módulos internos fora da fila principal

## Auditoria visual — 3ª Onda completa — 19/04/2026

### O que foi corrigido

Fechamento completo da pendência de padronização de botões em páginas públicas secundárias.

**Páginas corrigidas (6 arquivos):**
- `ConstrutoraBrooklin.jsx`
- `ConstrutoraAltoPadraoSP.jsx`
- `MarcenariaSobMedidaMorumbi.jsx`
- `ReformaApartamentoItaim.jsx`
- `ReformaApartamentoJardins.jsx`
- `ReformaApartamentoSP.jsx`

**Padrão antigo removido:**
```jsx
<Link to="/solicite-proposta">
  <Button className="btn-apple">Texto<ArrowRight/></Button>
</Link>
<a href={`tel:${COMPANY.phoneRaw}`} className="btn-hero-outline">...</a>
```

**Padrão novo aplicado (hero CTA):**
```jsx
<Link to="/solicite-proposta" className="btn-apple">
  Texto<ArrowRight/>
</Link>
<Link to="/bairro" className="btn-hero-outline">
  Mais sobre o bairro
</Link>
```

**Padrão novo aplicado (CTA final):**
```jsx
<SmartCTA showSecondary className="justify-center" />
```

**Imports limpos:** removidos `Button`, `Phone`, `Link` (onde não necessário) e `COMPANY` (onde órfão). Restaurados onde ainda usados em schema JSON-LD.

### Validação executada

- `npm run lint` → exit code 0, 0 erros
- `npm run build` → exit code 0, 38s, todas as rotas OK
- Todas as rotas `ok:` no SEO builder

### Estado após esta rodada

- **Shell principal auditado:** ✅ (1ª e 2ª onda)
- **Páginas regionais de bairro (RegionTemplate):** ✅ (já usavam SmartCTA via template)
- **Páginas secundárias/landing específicas:** ✅ (3ª onda — esta rodada)
- **Links textuais do footer:** sem pill (esperado, não é defeito)

### Homogeneidade visual — status CONCLUÍDO

O sistema de botões está 100% homogêneo em todas as landing pages públicas auditadas:
- Tipografia base: "Suisse Intl", Inter, Poppins (peso 350)
- CTAs principais: `btn-apple` com `border-radius: 9999px`
- CTAs outline: `btn-hero-outline` com `border-radius: 9999px`
- Padrão estrutural: `<Link className>` diretamente (sem `<Button>` aninhado)

### Pendências remanescentes

- PR #18 aguarda merge (sectionTitle PHASE1 + SmartCTA bairros)
- 3 slugs de blog faltando PHASE1
- SVGs de estilos grandes (candidatos a WebP/AVIF)

## Editorial image sync — 20/04/2026

### Causa raiz fechada

- `AdminBlogEditorial.jsx` exibia seleções de imagem via `unsplashSelections`, mas o publish para `/api/editorial-overrides` enviava apenas `uploads`
- `api/_editorialOverrides.js` publicava corretamente uploads e URLs diretas, porém ignorava seleções puras do `Unsplash` quando o slot não tinha arquivo enviado
- efeito prático: a imagem parecia selecionada no admin, mas o override publicado do blog continuava sem ativo renderizável no front

### Correção aplicada

- serialização de publish estendida para incluir `unsplashSelections` no sync editorial
- merge de override reforçado para aceitar seleção `Unsplash` como fonte canônica do slot, com `src`, `thumb`, `alt`, `caption`, `source`, `pageUrl` e `downloadLocation`
- preview, snippets do manifesto e status de cobertura do admin passam a considerar slots com seleção `Unsplash` mesmo sem upload
- heurística de busca editorial refinada para respeitar entidade semântica; no slug `arquitetos-brasileiros-famosos-legado` o plano saiu de `construction` para `person`

### Arquivos principais

- `src/pages/AdminBlogEditorial.jsx`
- `api/editorial-overrides.js`
- `api/_editorialOverrides.js`
- `src/lib/wgVisualSearchProfile.js`
- `src/data/blogEditorialQueue.generated.json`
- `blog-editorial-queue-2026-04-09.json`

### Validação executada

- `npm run test:run -- src/__tests__/publicPageOverrides.test.js src/__tests__/wgVisualSearchProfile.test.js` OK
- `npm run blog:editorial:status` OK
- `npm run editorial:health` OK com pendência estrutural antiga ainda aberta em `blogStructuralClosed` e `editorialStructuralClosed`
- `npm run blog:editorial:repetition:audit` OK
- `npm run style:editorial:status` OK
- `npm run verify:deploy` OK

## Google keys e Search Console — 25/04/2026

### Resultado da validação

- Google Search Console / sitemap submit: nenhuma API key simples serve para esta API; ela exige OAuth2 com escopo `webmasters` ou service account autorizada na propriedade do Search Console.
- Gemini: somente a chave marcada como `K5_pai_gemini` respondeu com sucesso na Generative Language API. Modelos validados: `gemini-2.5-flash` e `gemini-flash-latest`.
- Google Custom Search / Cloudinary image search: as chaves `K1` e `K2` foram aceitas pela API do Custom Search e falharam apenas por falta de parametro de mecanismo externo no teste direto. Isso indica que sao as candidatas corretas para `VITE_GOOGLE_IMAGE_SEARCH_API_KEY` no widget Cloudinary.
- `K3` esta bloqueada para Custom Search/Gemini no projeto atual.
- `K4` esta com APIs necessarias desativadas no projeto associado.
- `K5_pai_gemini` funciona para Gemini, mas nao para Custom Search.

### Admin blog / imagens

- O admin blog usa `src/pages/AdminBlogEditorial.jsx` com `window.cloudinary.createUploadWidget`.
- A busca de imagens do Google entra pelo source `image_search` da Cloudinary e pela opcao `googleApiKey`.
- Variavel necessaria no frontend: `VITE_GOOGLE_IMAGE_SEARCH_API_KEY`.
- Essa variavel nao pode ser commitada com valor real; manter apenas em `.env` local e Vercel Environment Variables.

### Contas Google identificadas

- Projeto ativo observado: `site-485315`.
- Service accounts existentes: `ads-138@site-485315.iam.gserviceaccount.com` e `wg-almeida-analytics@site-485315.iam.gserviceaccount.com`.
- Foi identificada uma chave user-managed no service account `ads-138`, mas sem arquivo privado local disponivel.
- A conta local autenticada ainda nao conseguiu usar Search Console porque o token nao tem escopo `https://www.googleapis.com/auth/webmasters`.

### Proximo passo para indexacao

- Refazer login OAuth com escopo Search Console ou adicionar uma service account autorizada na propriedade do Search Console.
- Depois executar `sites.list`, `urlInspection.index.inspect` e `sitemaps.submit` para `https://wgalmeida.com.br/sitemap.xml`.

### Producao validada apos atualizacao

- PR #33 mergeado em `main`: `bb3fcc6 docs(site): record google key validation`.
- Deploy Vercel Production: `dpl_nquZNxGFrEhrdD86ixSKPXfSif6v`.
- Alias publico validado: `https://wgalmeida.com.br`.
- `VITE_GOOGLE_IMAGE_SEARCH_API_KEY` criada em Vercel Production sem valor commitado.
- Rotas validadas com HTTP 200: `/`, `/robots.txt`, `/sitemap.xml`, `/admin/blog-editorial`.
- Bundle publicado do admin: `AdminBlogEditorial-2RlW838_.js`, contendo `image_search`, `googleApiKey`, `searchBySites` e chave compilada.
- Video hero em producao carregou com `readyState=4`, `videoWidth=1920`, `videoHeight=1080`.
- Blog validado: `/blog/arquitetos-brasileiros-famosos-legado`; apos rolagem completa, 13 imagens, 0 quebradas, 0 pendentes, 0 responses de imagem com erro >= 400.
- Auditoria visual renderizada desktop/mobile salva em `.codex/tmp/audit-home-desktop` e `.codex/tmp/audit-home-mobile`.

### OAuth Search Console — secrets validadas

- Client id testado: `312535767112-idrkrdml4pgd9tr4l6d0vpuk8cio8nhi.apps.googleusercontent.com`.
- Secret rotulada `Search`: valida para esse client id. O teste retornou `invalid_grant`, esperado para codigo de autorizacao falso quando client id/secret estao corretos.
- Secret rotulada `eco_wg_google`: invalida para esse client id. O teste retornou `invalid_client`.
- O fluxo Search Console ainda depende de autorizacao humana no navegador para emitir token com escopos `https://www.googleapis.com/auth/webmasters` e `https://www.googleapis.com/auth/cloud-platform`.
- A versao local do `gcloud auth login` nao aceita `--client-id-file` e `--scopes`; usar `gcloud auth application-default login --client-id-file ... --scopes ... --no-browser` ou fluxo OAuth manual.
- Nenhum valor real de secret foi gravado no repositorio.

### Search Console e APIs Google — 25/04/2026

- OAuth ADC concluido com sucesso; credencial salva localmente em `%APPDATA%\gcloud\application_default_credentials.json`.
- Search Console API habilitada em `grupo-wg-284118` / `312535767112`.
- Propriedades Search Console confirmadas com `siteOwner`: `sc-domain:wgalmeida.com.br` e `https://wgalmeida.com.br/`.
- Sitemap enviado para as duas propriedades: `https://wgalmeida.com.br/sitemap.xml`; API retornou `204 NoContent`.
- Listagem Search Console confirmou `https://wgalmeida.com.br/sitemap.xml` com `lastSubmitted=2026-04-25T05:51:21.869Z`, `lastDownloaded=2026-04-25T05:51:22.942Z`, `warnings=0`, `errors=0`, `submitted=158`.
- URL Inspection em `https://wgalmeida.com.br/`: `verdict=PASS`, `coverageState=Submitted and indexed`, `robotsTxtState=ALLOWED`, `indexingState=INDEXING_ALLOWED`, `pageFetchState=SUCCESSFUL`, canonical Google/usuario `https://wgalmeida.com.br/`.
- APIs Google habilitadas no projeto `grupo-wg-284118`: Search Console, Custom Search, PageSpeed, Analytics Data, Places Legacy, Maps, Geocoding, Static Maps, Directions, Distance Matrix, Gemini Generative Language, Indexing, Google Ads, Drive, Docs, Sheets, Gmail, Calendar, Business Profile, Resource Manager, IAM, IAM Credentials, Service Usage, YouTube, YouTube Analytics, Vertex AI e Vision.
- APIs Google habilitadas no projeto `site-485315`: mesmo conjunto acima, incluindo `places.googleapis.com` / Places API New.
- Pendencia: `places.googleapis.com` no projeto `grupo-wg-284118` ficou bloqueada por falta de billing (`UREQ_PROJECT_BILLING_NOT_FOUND`). Usar `site-485315` para Places New ou vincular billing ao projeto `grupo-wg-284118`.
- Proxima rodada: iniciar projeto de analise de posicionamento no Google com relatorios de Search Console, identificar paginas sem indexacao ou com cobertura fraca, corrigir causas tecnicas/SEO e executar auditoria PageSpeed para melhorar pontuacao mobile/desktop.

## Rodada Google SEO e PageSpeed — 25/04/2026

### Ponto de retorno salvo

- Repo canonico validado: `C:\Users\Atendimento\Documents\_GRUPO_WG_ALMEIDA\01_APPS\02_BUILDTECH\04_OPERACIONAL\02_20260310_Projetos\02_20260310_Desenvolvimento\_Grupo_WG_Almeida\site-wgalmeida\site-wgalmeida`.
- Branch: `main`, alinhada com `origin/main` antes da rodada.
- Sync gate `start`: PASS em `2026-04-25T03:43:23`.
- Evidencias locais nao commitadas: `.codex/tmp/google-strategy-20260425/`.
- Relatorio commitavel criado: `docs/GOOGLE-SEO-PAGESPEED-ROUND-2026-04-25.md`.

### Resultado tecnico

- Search Console analisado para `2026-01-24..2026-04-23`.
- Sitemap inspecionado com 158 URLs.
- Cobertura atual: 105 indexadas, 44 descobertas ainda nao indexadas, 5 rastreadas ainda nao indexadas, 3 desconhecidas pelo Google e 1 duplicada por canonical escolhido pelo Google.
- Validacao em producao confirmou `robots.txt`, `sitemap.xml`, `/revista-estilos`, `/estilos/maximalista`, `/blog/closet-planejado-organizacao-otimizacao` e `/blog/onboarding-processo-wg-almeida` com HTTP 200.
- A pagina `closet-planejado-organizacao-otimizacao` tem canonical proprio correto em producao; o alerta do Google vem de crawl antigo de `2026-04-06`.
- PageSpeed rodado em 11 rotas prioritarias, mobile e desktop; SEO 100 em todas as rotas testadas.
- PR #37 mergeado em `main`: `d08ef9e Merge pull request #37 from almeidawg/docs/google-seo-pagespeed-round-20260425`.
- Deploy Vercel Production validado: deployment GitHub `4481413098`, URL Vercel `https://site-wgalmeida-oklvmwo0b-william-almeidas-projects.vercel.app`, commit `d08ef9ece65e6c119fb079671612d9f3df7c0ab4`.
- Dominio publico validado apos merge: `https://wgalmeida.com.br/`, `/sitemap.xml`, `/blog` e `/revista-estilos` com HTTP 200.
- Sitemap reenviado ao Search Console apos a rodada para `https://wgalmeida.com.br/` e `sc-domain:wgalmeida.com.br`; ambas chamadas retornaram `204`.

### Pendencias abertas para a proxima sessao

- Executar P0 do relatorio: recrawl manual das URLs pendentes, reforco de links internos e revisao de snippets com CTR baixo.
- Melhorar PageSpeed mobile da home, blog e paginas de estilos, priorizando LCP e JS inicial.
- Fazer auditoria futura do repo pai para separar o que fica e o que e lixo antigo, conforme orientacao anterior; nao limpar repo pai sem uma rodada dedicada.

## Rodada WGEasy x Site — Conteudo, planos e motores — 25/04/2026

### Ponto de retorno salvo

- Repo canonico validado: `C:\Users\Atendimento\Documents\_GRUPO_WG_ALMEIDA\01_APPS\02_BUILDTECH\04_OPERACIONAL\02_20260310_Projetos\02_20260310_Desenvolvimento\_Grupo_WG_Almeida\site-wgalmeida\site-wgalmeida`.
- Branch de trabalho: `wgeasy-site-sync-audit`.
- Sync gate `start`: PASS em `2026-04-25T04:29:00`.
- Arquivos duplicados antigos nao rastreados permanecem intocados para auditoria futura dedicada do repo pai/site.

### Causa raiz encontrada

- O site mantinha espelhos manuais de planos em `src/data/company.js`.
- Esses espelhos evidenciaram um conflito entre sistemas:
  - site/ObraEasy SSoT/checkout estavam em Pro `R$ 29,90` e Business `R$ 59,90`;
  - base viva WGEasy estava em Pro `R$ 297` e Business `R$ 797`, divergindo da estrategia de escala e do checkout real.
  - EasyRealState mantinha referencias antigas de `R$ 49` e `R$ 149`; base ativa: Solo `R$ 79,90` e Completo `R$ 149,90`.
- A pagina `/obraeasy` misturava planos de parceiro/EasyRealState dentro da grade de planos do ObraEasy.
- Nao foi encontrada evidencia local de estrategia ativa em `R$ 97,90`.

### Correcoes aplicadas

- `saas_planos` no WGEasy: Pro normalizado para `R$ 29,90/mês` e `R$ 299/ano`; Business normalizado para `R$ 59,90/mês` e `R$ 599/ano`.
- `src/data/company.js`: atualizado para refletir a estrategia ativa normalizada.
- `src/pages/ObraEasyLanding.jsx`: grade reduzida para Gratuito, Pro e Business; beneficios alinhados com o SSoT do ObraEasy; JSON-LD passa a usar a lista renderizada.
- `src/pages/EasyRealStateLanding.jsx`: planos publicos ajustados para Calculo Publico, Solo e Completo; JSON-LD atualizado.
- `src/content/blog/evf-estudo-viabilidade-financeira.md`: CTA alinhado para plano pago a partir de `R$ 29,90/mês`.
- `tools/audit-wgeasy-site-sync.mjs`: auditor novo criado para comparar site x WGEasy e bloquear strings antigas.
- `package.json`: scripts `audit:wgeasy:site-sync` e `audit:wgeasy:site-sync:strict` adicionados.
- Relatorio da rodada: `docs/WGEASY-SITE-CONTENT-SYNC-AUDIT-2026-04-25.md`.

### Validacao executada

- `npm run audit:wgeasy:site-sync:strict`: OK; precos publicos e tabelas criticas conferidos contra WGEasy.
- `npm run check:imports`: OK.
- `npm run audit:consistency:strict`: OK.
- `npm run audit:public:claims:strict`: OK.
- `npm run test:run`: OK, 8 arquivos e 52 testes.
- `npm run build`: OK, 158 rotas SEO geradas.
- Browser audit local (`wg-browser-audit`) em `/obraeasy` e `/easy-real-state`, desktop e mobile: OK.
- DOM renderizado validado:
  - `/obraeasy`: contem `R$ 0`, `R$ 29,90`, `R$ 59,90`; nao contem `R$ 297`, `R$ 797` ou `R$ 97,90`.
  - `/easy-real-state`: contem `R$ 0`, `R$ 79,90`, `R$ 149,90`; nao contem `R$ 49`, `R$ 297` ou `R$ 797`.
- `git grep` inicial confirmou que o SSoT ObraEasy e checkouts reais usavam `R$ 29,90` e `R$ 59,90`, enquanto a base WGEasy estava divergente em `R$ 297` e `R$ 797`.
- `git grep` em `src` para `OBRAEASY_PRECOS.solo`, `OBRAEASY_PRECOS.completo`, `EASYREALSTATE_PRECOS.proCorretor` e `EASYREALSTATE_PRECOS.imobiliaria`: sem ocorrencias.
- Pesquisa externa rapida em 2026-04-25 manteve a estrategia defensavel:
  - ObraEasy `R$ 29,90`/`R$ 59,90` fica como entrada agressiva para escala frente a concorrentes de gestao de obras.
  - EasyRealState `R$ 79,90`/`R$ 149,90` fica dentro da faixa de CRM/site imobiliario para corretor e operacao.
  - `R$ 97,90` permanece apenas como hipotese futura; nao foi aplicado porque nao existe fonte ativa em SSoT, checkout ou WGEasy normalizado.
- Sonar PR #39 apontou complexidade no auditor novo e chaves por indice nas landings. Correcoes locais aplicadas:
  - `tools/audit-wgeasy-site-sync.mjs` quebrado em funcoes menores.
  - `ObraEasyLanding.jsx` e `EasyRealStateLanding.jsx` ajustadas para usar chaves estaveis e alias `Seo`.
  - `EasyRealStateLanding.jsx` limpou imports/ternario redundante.

### Pendencias abertas

- Criar endpoint ou snapshot publico gerado automaticamente a partir do WGEasy para eliminar espelhos manuais de preco.
- Auditar artigos tecnicos com tabelas de custo contra `pricelist_itens`, `sinapi_composicoes` e `iccri_indice`.
- Fazer auditoria futura do repo pai e duplicatas antigas para decidir o que fica e o que e lixo, sem misturar com rodada de produto/SEO.

---

## Ponto de Retorno - PR #39 em producao

Data/hora: 2026-04-25 05:06 BRT.

### Merge/deploy

- PR: `https://github.com/almeidawg/site-wgalmeida/pull/39`.
- Merge commit em `main`: `ca45fcf260e0369ca67b5c1c9b633d59fc490021`.
- Vercel production deployment: `AdS3HMPn9DCH6ebcRRPuehmLD8re`.
- Vercel dashboard: `https://vercel.com/william-almeidas-projects/site-wgalmeida/AdS3HMPn9DCH6ebcRRPuehmLD8re`.
- CI main: `https://github.com/almeidawg/site-wgalmeida/actions/runs/24926311369`, OK.

### Producao validada

Dominio publico final validado: `https://wgalmeida.com.br`.

- `https://wgalmeida.com.br/obraeasy`: HTTP 200, DOM com `R$ 0`, `R$ 29,90`, `R$ 59,90`, sem `R$ 297`, `R$ 797` ou `R$ 97,90`, sem erro de console, hero background renderizado.
- `https://wgalmeida.com.br/easy-real-state`: HTTP 200, DOM com `R$ 0`, `R$ 79,90`, `R$ 149,90`, sem `R$ 49` legado, `R$ 297` ou `R$ 797`, sem erro de console, hero background renderizado.
- `https://wgalmeida.com.br/blog/evf-estudo-viabilidade-financeira`: HTTP 200, CTA com `R$ 29,90/mês`, sem `R$ 297` ou `R$ 797`, sem erro de console.
- Browser audit de producao salvo em:
  - `.codex/tmp/browser-audit/prod-obraeasy-desktop`
  - `.codex/tmp/browser-audit/prod-obraeasy-mobile`
  - `.codex/tmp/browser-audit/prod-easyrealstate-desktop`
  - `.codex/tmp/browser-audit/prod-easyrealstate-mobile`

### Estado final da decisao de precificacao

- ObraEasy cliente final: Gratuito `R$ 0`, Pro `R$ 29,90/mês`, Business `R$ 59,90/mês`.
- Easy Real State: Calculo Publico `R$ 0`, Solo `R$ 79,90/mês`, Completo `R$ 149,90/mês`.
- `R$ 97,90` nao aplicado: sem fonte ativa em SSoT, checkout real ou WGEasy normalizado.

---

## Ponto de Retorno - Intervencao P0 BuildTech em producao

Data/hora: 2026-04-29 17:45 BRT.

### Merge/deploy

- PR: `https://github.com/almeidawg/site-wgalmeida/pull/44`.
- Merge commit em `main`: `b7d3213 fix(buildtech): restore canonical routes and secured contact capture`.
- Vercel production deployment: `CuGbaAzBSyVUBoER7mLcsjGNssBW`.
- Vercel dashboard: `https://vercel.com/william-almeidas-projects/site-wgalmeida/CuGbaAzBSyVUBoER7mLcsjGNssBW`.
- CI main: `https://github.com/almeidawg/site-wgalmeida/actions/runs/25132728219`, OK.

### Producao validada

Dominio publico final validado: `https://wgalmeida.com.br`.

- `/buildtech`: HTTP 200.
- `/buildtech/solucoes.html`: HTTP 200, H1 `WG Build.tech`, secao `Experimente ao Vivo` visivel, sem erro de console.
- `/buildtech/metodo.html`: HTTP 200, H1 `WG Build.tech`, secao `Experimente ao Vivo` visivel, sem erro de console.
- `/buildtech/contato.html`: HTTP 200, H1 `Fale Conosco`, formulario renderizado, sem erro de console.
- `/clientes/umauma`: HTTP 200, H1 `WG Build.tech`, secao `Experimente ao Vivo` visivel, sem erro de console.
- `/buildtech/clientes/umauma`: HTTP 200.
- `/contato?context=buildtech`: HTTP 200.

### Causa raiz e decisao

- As rotas legadas da WG BuildTech eram capturadas por rewrites/proxy antigos e nao tinham mapeamento SPA canonico suficiente.
- A branch `recovery/buildtech-dirty-baseline-20260429` continua preservada como evidencia; a correcao de producao foi aplicada cirurgicamente no repo canonico `site-wgalmeida`.
- Turnstile server-side ficou preparado em `/api/contact`; ativacao completa depende de `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` e loader aprovado de script Cloudflare sem falhar Sonar.

---

## Ponto de Retorno - Hardening P1 BuildTech em producao

Data/hora: 2026-04-29 19:08 BRT.

### Merge/deploy

- PR: `https://github.com/almeidawg/site-wgalmeida/pull/46`.
- Merge commit em `main`: `03f961cfa610d9f53022ffa35045be4490d63899`.
- Commit P1: `ed8b128 feat(buildtech): harden post go-live telemetry and contact`.
- Vercel production deployment: `dpl_7FkHYj7jBV9TFV46WwjKBrK8cTUZ`.
- Vercel production URL: `https://site-wgalmeida-kh03ymxu7-william-almeidas-projects.vercel.app`.
- Dominio validado: `https://wgalmeida.com.br`.
- CI main: `https://github.com/almeidawg/site-wgalmeida/actions/runs/25136239073`, OK.

### Producao validada

Synthetic checks em `https://wgalmeida.com.br`:

- `/api/health`: HTTP 200.
- `/buildtech`: HTTP 200.
- `/buildtech/solucoes.html`: HTTP 200.
- `/buildtech/metodo.html`: HTTP 200.
- `/buildtech/contato.html`: HTTP 200.
- `/clientes/umauma`: HTTP 200.
- `/contato?context=buildtech`: HTTP 200.

Browser audit final:

- Desktop e mobile em `https://wgalmeida.com.br/buildtech`: OK.
- H1 `WG Build.tech`, H2 `Portfólio tecnológico para operação, vendas e dados`, secao `Demos leves para entender valor antes da reuniao`, CTA `Converse com a Liz agora` e campo `Area operacional impactada` renderizados.

### Lighthouse final

- Desktop: Performance 81, Accessibility 96, Best Practices 96, SEO 100; LCP 1.0 s, CLS 0, TBT 410 ms.
- Mobile: Performance 55, Accessibility 96, Best Practices 96, SEO 100; LCP 4.7 s, CLS 0.021, TBT 1710 ms.
- O runner Lighthouse local continuou retornando `EPERM` ao limpar diretorio temporario do Chrome, mas os JSONs foram gerados e lidos com sucesso.

### Decisao

- Go-live mantido.
- P1 aprovado para seguranca basica, observabilidade, SEO, acessibilidade, conversao e vitrine viva.
- Hold remanescente: ativar `VITE_TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY` no Vercel para Turnstile real.
- P2 recomendado: reduzir TBT/hidratacao mobile do shell SPA, especialmente `NextBestActionPanel`, contexto global e chunks iniciais.

---

## Ponto de Retorno - P2 BuildTech performance e Turnstile

Data/hora: 2026-04-29 19:56 BRT.

### Merge/deploy

- PR: `https://github.com/almeidawg/site-wgalmeida/pull/49`.
- Merge commit em `main`: `1ab172648f35c1408b450bdcb6e11147ecfbc471`.
- Commit P2: `171ce48116bab2d28fb884a523a8c960537d0753`.
- Vercel production deployment: `https://site-wgalmeida-qlenk9rzr-william-almeidas-projects.vercel.app`.
- Dominio validado: `https://wgalmeida.com.br`.
- CI main: `https://github.com/almeidawg/site-wgalmeida/actions/runs/25138293295`, OK.
- Escopo: melhoria cirurgica pos go-live, sem migracao de framework e sem reescrita do site.

### O que foi aplicado

- Shell SPA:
  - `Footer`, `ContextTracker`, `NextBestActionPanel`, Vercel Analytics, Speed Insights, Toaster e `web-vitals` passaram a carregar em idle/deferido.
  - CTA mobile do header deixou de importar o componente global `Button`.
- Hero BuildTech:
  - `PROCESSOS.webp` convertido para WebP real.
  - Criadas variantes `PROCESSOS-640.webp`, `PROCESSOS-960.webp` e `PROCESSOS-1200.webp`.
  - Adicionado `srcset` responsivo e preload especifico para `/buildtech`, `/buildtech/solucoes.html` e `/buildtech/metodo.html`.
- Contato/Turnstile:
  - `/api/contact` agora aceita ativacao progressiva via `CONTACT_TURNSTILE_REQUIRED`.
  - Fallback sem secret permanece operacional quando `CONTACT_TURNSTILE_REQUIRED=false`.
  - Modo obrigatorio falha explicitamente se `TURNSTILE_SECRET_KEY` estiver ausente.
  - Testes unitarios cobrem fallback e falha segura.

### Validacao local executada

- `npm run verify:deploy` OK:
  - lint OK
  - check imports OK
  - audit estrutural OK
  - audit consistency normal e strict OK
  - Vitest: 9 arquivos / 54 testes OK
  - audit public claims strict OK
  - build Vite OK
  - SEO audit e validate dist OK
- `npm audit --omit=dev` OK, 0 vulnerabilidades.
- Rotas locais em preview:
  - `/buildtech`: HTTP 200.
  - `/buildtech/solucoes.html`: HTTP 200.
  - `/buildtech/metodo.html`: HTTP 200.
  - `/contato?context=buildtech`: HTTP 200.
- Browser audit local:
  - `buildtech-p2-desktop`: OK.
  - `buildtech-p2-mobile`: OK.
  - `contact-p2-desktop`: OK.
  - `contact-p2-mobile`: OK.

### Lighthouse local

- Desktop: Performance 94, Accessibility 96, Best Practices 92, SEO 100; LCP 1.1 s, CLS 0, TBT 170 ms.
- Mobile: Performance 59, Accessibility 96, Best Practices 92, SEO 100; LCP 5.1 s, CLS 0.021, TBT 720 ms.
- O runner Lighthouse local segue retornando `EPERM` ao limpar temporarios do Chrome, mas os JSONs foram gerados e lidos.

### Resultado

- Entrada SPA reduziu de ~336.99 KB para ~291.80 KB bruto.
- Gzip reduziu de ~102.87 KB para ~90.61 KB.
- Brotli reduziu de ~77.64 KB para ~67.54 KB.
- `PROCESSOS.webp` reduziu de ~93.97 KB para ~42.81 KB, com variantes responsivas menores.

### Producao validada

- `/api/health`: HTTP 200.
- `/buildtech`: HTTP 200.
- `/buildtech/solucoes.html`: HTTP 200.
- `/buildtech/metodo.html`: HTTP 200.
- `/contato?context=buildtech`: HTTP 200.
- `/api/contact`: POST invalido retornou HTTP 400 com validacao server-side, sem criar lead real.
- Browser audit de producao:
  - `prod-buildtech-p2-desktop`: OK.
  - `prod-buildtech-p2-mobile`: OK.
  - `prod-contact-p2-mobile`: OK.
- Imagem hero em producao:
  - `currentSrc`: `https://wgalmeida.com.br/images/banners/PROCESSOS-640.webp`.
  - `naturalWidth`: 390.
  - `naturalHeight`: 204.
  - console sem erro na rota `/buildtech`.

### Pendencias antes de considerar P2 production hardened completo

- Configurar Turnstile no Vercel:
  - `VITE_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `CONTACT_TURNSTILE_REQUIRED=true`
- Validar CSP real de producao com `https://challenges.cloudflare.com`.
- P3 recomendado para performance mobile: reduzir hidratacao do shell SPA, CSS critico e custo de i18n/contextos globais.
