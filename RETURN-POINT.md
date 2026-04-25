# RETURN-POINT — site-wgalmeida
**Atualizado:** 25/04/2026

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
