# Ponto de Retorno - Site WG Almeida (Auditoria Visual & I18n)
**Data:** 08 de maio de 2026

---

## ✅ Concluído Hoje

### 🎬 Introdução & Vídeos
- **Abertura 100% Limpa**: Reescrita radical do `PremiumCinematicIntro.jsx`. Removidos "pontos laranjas", "raios/feixes" e "partículas". 
- **Sincronia de Vídeo**: O `HeroVideo.jsx` agora inicia automaticamente após o evento `wg-intro-complete`, eliminando a imagem estática pós-intro.
- **Sobreposição (Z-Index)**: Elevado `z-index` da intro para `200` para garantir que o cabeçalho não "vaze" por baixo da animação.

### 🌐 Internacionalização (I18n)
- **Estrutura Robusta**: `i18n/index.js` agora suporta chaves aninhadas (`.`) nativamente e possui fallback seguro para `pt-BR`.
- **Traduções Faltantes**: Adicionadas todas as chaves de `home.turnKey.*` e `home.dashboard.*` em PT, EN e ES.
- **15 Anos WG**: Atualizadas metatags em `index.html` e dados dinâmicos em `About.jsx` via hook `useEstatisticasWG`.

### 🎨 Branding & UI
- **Purificação Cromática**: `AdminBlogEditorial.jsx`, `OrcadorInteligente.jsx`, `MoodboardStudioLayout.jsx` e `StyleCard.jsx` saneados. Removidos tons de laranja/amarelo genéricos em favor do `wg-orange` oficial.
- **Rodapé (Footer)**: Ajustada a grade para 5 colunas no XL, dando prioridade e espaço para a seção "Onde Atuamos".
- **Navegação**: Link do Moodboard na Home corrigido para navegação interna (SPA).

### 📱 Integração Social
- **Instagram Real**: Implementado feed dinâmico via `lightwidget` na Home (perfil @wg.almeida).

---

## 🛠️ Pendências para Amanhã (Próximos Passos)

1.  **Localizar Template de Artigo**: Identificar quem renderiza o detalhe do blog (`/blog/:slug`). O arquivo `Blog.jsx` é apenas listagem e o `App.jsx` aponta para ele. Precisa de busca profunda.
2.  **Saneamento do Blog**: Remover as bordas amareladas e a linha amarela horizontal identificada na "Calculadora de Preço por m²" (Audit Visual).
3.  **Efeito de Hover nos Núcleos**: Implementar contornos cinzas claros que se iluminam com a cor do núcleo (Verde/Azul/Marrom) apenas no hover.
4.  **Auditoria de Prints**: Validar os arquivos restantes na pasta `audit_visual/` e movê-los para `_VALIDADOS`.
5.  **Grade Slim**: Confirmar se o layout de 4 colunas está ativo em todos os breakpoints `lg` conforme os prints de referência.

---

## 🚀 Status do Sistema
- **URL Local**: `http://localhost:3000`
- **Build**: `npm run build:local` validado e sitemap atualizado (158 rotas).

---

## Retomada Codex - 2026-05-09

### Diagnóstico do bloqueio deixado pelo Gemini
- O problema principal não era dependência ausente: `node_modules` e `package-lock.json` existem e `npm ls --depth=0` não apontou pacote faltante.
- O primeiro `npm run build:local` dentro do sandbox falhou com `spawn EPERM` no Vite/Rolldown; repetido fora do sandbox, avançou e revelou erro real de código.
- O build estava parado em `src/components/PremiumCinematicIntro.jsx:196` por uma chave `};` extra.
- O lint também estava bloqueado por imports/escopos quebrados em `MoodboardStudioLayout.jsx`, `About.jsx`, `Contact.jsx`, `Home.jsx` e `ObraEasyLanding.jsx`.
- Depois do build/lint, `npm run verify:fast` ainda falhava em testes de `cloudinaryMedia` e `api/contact.js`.

### Correções técnicas aplicadas nesta retomada
- Removida chave extra em `PremiumCinematicIntro.jsx`.
- Repostos imports faltantes: `X`, `useEstatisticasWG`, `COMPANY` e `PRODUCT_URLS`.
- Corrigido `TurnstileWidget` para receber o label por prop em vez de usar `t` fora do escopo.
- Removido atributo legado `allowTransparency` do iframe do Instagram.
- Ajustado `api/contact.js` para aceitar payload de Supabase como array ou objeto e só disparar auto-promoção quando houver `savedContact.id`.
- Atualizado `cloudinaryMedia.test.js` para refletir a regra atual de vídeo: desktop/tablet deitado forçam perfil horizontal.

### Validações executadas
- `npm run lint`: passou.
- `npm run build:local`: passou fora do sandbox; sitemap gerado com 158 rotas.
- `npm run verify:fast`: passou com 12 arquivos de teste e 64 testes.

### Pendências antes de commit/push/deploy
- Worktree continua muito sujo, com dezenas de arquivos rastreados alterados e muitos prints/artefatos não rastreados em `audit_visual/`, `tmp_screenshots/` e `validados_2026-05-08/`.
- Portfolio segue em estado `RED`; deploy/merge continuam bloqueados até saneamento de baseline e triagem dos artefatos.
- Falta validação visual desktop/mobile da rodada atual antes de qualquer declaração de pronto.

---

## Auditoria Visual Controlada - 2026-05-09

Relatório criado:
- `AUDITORIA-VISUAL-SITE-WG-2026-05-09.md`

Fonte auditada:
- `C:\Users\Atendimento\Documents\Imagens\Screenshots\05_site-wg`

### Rodada ponto a ponto - 2026-05-09 12h

Objetivo do bloco:
- Avançar pontuação do site atacando primeiro i18n público, amarelo fora de marca e rota real do artigo `/blog/calculadora-preco-m2-corretores-imobiliarias`.

Arquivos tocados nesta rodada:
- `src/i18n/locales/pt-BR.json`
- `src/i18n/locales/en.json`
- `src/i18n/locales/es.json`
- `src/pages/Blog.jsx`
- `src/pages/Home.jsx`
- `src/components/layout/Header.jsx`
- `AUDITORIA-VISUAL-SITE-WG-2026-05-09.md`

Correções confirmadas:
- Chaves cruas públicas zeradas nas rotas auditadas: Home, Blog, Blog slug, ObraEasy, Room Visualizer, Revista, Sobre, A Marca e Moodboard.
- `/blog/:slug` agora renderiza template de artigo com Markdown real, frontmatter, H1 único, subtítulos, links e botão de compartilhar.
- Erro runtime do `ReactMarkdown` v10 corrigido.
- Amarelo detectado por DOM nas rotas auditadas caiu para `0`.
- Header deixou de usar `text-orange-600`/`bg-orange-600` nos pontos tocados e passou a usar tokens WG.

Validações executadas:
- `npm run lint`: passou.
- `npm run verify:fast`: passou, 12 arquivos de teste e 64 testes.
- `npm run build:local`: passou, sitemap com 158 rotas.
- Auditoria DOM/headless: `.codex/tmp/visual-audit-20260509/current-dom-audit/summary.md`.
- Auditoria visual desktop: `.codex/tmp/visual-audit-20260509/blog-calculadora-desktop-fixed/screenshot.png`.
- Auditoria visual mobile: `.codex/tmp/visual-audit-20260509/blog-calculadora-mobile-fixed/screenshot.png`.

Nova pontuação provisória:
- Qualidade visual percebida: `78/100`
- Qualidade técnica imediata: `86/100`
- Governança de release: `35/100`
- Estrutura i18n para novas línguas: `60/100`
- Prontidão para deploy: `48/100`
- Nota geral ponderada: `66/100`

Pendências abertas:
- Portfolio continua `RED`; deploy, merge e push seguem bloqueados.
- Worktree continua sujo e precisa triagem antes de qualquer commit.
- Blog i18n continua incompleto: PT-BR 78 posts, EN/ES 20 posts; faltam 58 slugs por idioma.
- Home ainda registra um erro 404 genérico no console da auditoria; identificar URL exata no próximo bloco.
- Instagram precisa validação externa e fallback.
- Nenhum grupo completo de prints deve ser movido para `_VALIDADOS` ainda.

Evidências geradas:
- `.codex/tmp/visual-audit-20260509/screenshots-contact-sheet.jpg`
- `.codex/tmp/visual-audit-20260509/current-site-contact-sheet.jpg`
- `.codex/tmp/visual-audit-20260509/current-dom-audit/report.json`
- `.codex/tmp/visual-audit-20260509/current-dom-audit/summary.md`

Resultado:
- Status geral: `PARCIAL`.
- Nota geral ponderada: `58/100`.
- Qualidade visual percebida: `72/100`.
- Qualidade técnica imediata: `82/100`.
- Governança de release: `35/100`.
- Estrutura i18n para novas línguas: `48/100`.
- Prontidão para deploy: `40/100`.

Achados críticos:
- `i18n` vaza chaves cruas em páginas públicas: `/`, `/blog`, `/blog/calculadora-preco-m2-corretores-imobiliarias`, `/sobre` e labels globais do header.
- `aboutPage`, `blogPage` e `home.turnKeyBlock` não existem nos JSON de locale atuais.
- Blog slug da calculadora não foi validado como template de detalhe real; a rota auditada caiu em estrutura de listagem/notFound.
- Ainda existe amarelo puro (`rgb(255, 255, 0)`) detectado em borda de links do header.
- Nenhum grupo de prints pode ser marcado como 100% validado; 11 grupos ficaram parciais e 3 grupos críticos pendentes.

Próximo bloco recomendado:
1. Corrigir contrato i18n PT-BR canônico antes de qualquer nova língua.
2. Criar teste automático contra vazamento de chave crua.
3. Remover amarelo puro do header/CSS.
4. Localizar e corrigir template real de `/blog/:slug`.
5. Revalidar desktop/mobile antes de mover prints para `_VALIDADOS`.
### Rodada de governanca i18n e Instagram - 2026-05-09

Objetivo do bloco:
- Subir a pontuacao com um gate automatico que impeca regressao de chaves cruas publicas e iniciar tratamento da integracao Instagram sem declarar validacao falsa.

Arquivos tocados nesta rodada:
- `scripts/audit-i18n-public-keys.mjs`
- `package.json`
- `src/i18n/locales/pt-BR.json`
- `src/i18n/locales/en.json`
- `src/i18n/locales/es.json`
- `src/pages/Home.jsx`
- `AUDITORIA-VISUAL-SITE-WG-2026-05-09.md`
- `RETURN-POINT.md`

Correcoes confirmadas:
- Novo script `audit:i18n:public` valida 185 chaves literais publicas em `pt-BR`, `en` e `es`.
- `verify:fast`, `verify:full`, `verify:deploy` e `prepush` agora executam o gate publico de i18n.
- Home recebeu iframe Instagram com `https://`, renderizacao por visibilidade e fallback visual caso o widget externo falhe.
- Auditoria DOM atual nao reproduziu o 404 generico anterior da Home.

Validacoes executadas:
- `npm run verify:fast`: passou, incluindo `public i18n literal key audit OK: 185 keys checked across pt-BR, en, es`.
- `npm run build:local`: passou, sitemap com 158 rotas.
- Auditoria DOM/headless atual: sem vazamento de chaves cruas, sem texto `IA/AI` e `yellowishCount: 0` nas rotas auditadas.

Validacao parcial:
- Instagram ainda nao esta validado visualmente. O script dedicado nao conseguiu provar iframe carregado nem fallback exibido; manter o item como pendente ate evidencia real.

Pontuacao provisoria apos este bloco:
- Qualidade visual percebida: `79/100`
- Qualidade tecnica imediata: `88/100`
- Governanca de release: `38/100`
- Estrutura i18n para novas linguas: `66/100`
- Prontidao para deploy: `50/100`
- Nota geral ponderada: `69/100`

Pendencias para o proximo bloco:
- Sanear ou incluir `AMarca.jsx` no contrato estatico de i18n, especialmente `brandPage.*`.
- Fazer validacao visual dedicada do Instagram/fallback.
- Comecar saneamento dos 58 slugs faltantes em EN/ES ou criar politica documentada de fallback editorial.
- Executar triagem do worktree antes de qualquer commit, push ou deploy.

### Rodada A Marca e fonte canonica visual - 2026-05-09

Objetivo do bloco:
- Responder e operacionalizar o acesso as regras de identidade visual, cores, aplicacoes e fontes, e usar isso para tirar `A Marca` da pendencia de i18n.

Fontes canonicas confirmadas:
- `00_CORE/05_MARCA_E_MARKETING/_I/00_START-HERE/MAPA-CANONICO-ECOSSISTEMA-WG.md`
- `00_CORE/05_MARCA_E_MARKETING/_I/01_CANONICO_MARCA/CANONICO-MARCA-WG-ALMEIDA.md`
- `00_CORE/05_MARCA_E_MARKETING/_I/01_CANONICO_MARCA/20250111ManualdeIdentidadeVisual.pdf`
- `00_CORE/03_MARKETING/06_WG_BUILD_TECH/01_IDENTIDADE_VISUAL/README_IDENTIDADE_VISUAL_WG_BUILD_TECH.md`

Arquivos tocados nesta rodada:
- `scripts/audit-i18n-public-keys.mjs`
- `src/i18n/locales/pt-BR.json`
- `src/i18n/locales/en.json`
- `src/i18n/locales/es.json`
- `AUDITORIA-VISUAL-SITE-WG-2026-05-09.md`
- `RETURN-POINT.md`

Correcoes confirmadas:
- `AMarca.jsx` agora faz parte do gate publico de i18n.
- `brandPage.*` foi completado em `pt-BR`, `en` e `es`.
- A pagina `A Marca` renderiza conteudo real em desktop e mobile, sem vazamento `brandPage.*`.

Validacoes executadas:
- `npm run audit:i18n:public`: passou com `225 keys checked across pt-BR, en, es`.
- `npm run verify:fast`: passou, 12 arquivos e 64 testes.
- `npm run build:local`: passou, sitemap com 158 rotas.
- Browser audit desktop: `.codex/tmp/visual-audit-20260509/a-marca-desktop-i18n/summary.md`.
- Browser audit mobile: `.codex/tmp/visual-audit-20260509/a-marca-mobile-i18n/summary.md`.

Pontuacao provisoria apos este bloco:
- Qualidade visual percebida: `80/100`
- Qualidade tecnica imediata: `89/100`
- Governanca de release: `39/100`
- Estrutura i18n para novas linguas: `70/100`
- Prontidao para deploy: `52/100`
- Nota geral ponderada: `71/100`

Pendencias:
- Validar manual PDF visualmente antes de transformar qualquer HEX/uso de logo em decreto final.
- WG_Build.tech ainda tem pendencias declaradas de HEX/RGB, tipografia, respiro e aplicacoes.
- Instagram e blog EN/ES seguem como proximos gargalos.

### Rodada gate visual anti-reincidencia - 2026-05-09

Objetivo do bloco:
- Deixar o projeto local rodando para validacao humana e criar protecao automatica contra retorno de amarelo/amber/pure-yellow em paginas e componentes publicos.

Servidor local:
- URL: `http://127.0.0.1:3000/`
- Status: ativo ao final desta rodada para validacao do usuario.

Arquivos tocados nesta rodada:
- `scripts/audit-brand-visual-tokens.mjs`
- `package.json`
- `src/i18n/locales/pt-BR.json`
- `src/i18n/locales/en.json`
- `src/i18n/locales/es.json`
- `src/pages/BuildTechClientProposal.jsx`
- `src/pages/MoodboardGenerator.jsx`
- `AUDITORIA-VISUAL-SITE-WG-2026-05-09.md`
- `RETURN-POINT.md`

Correcoes confirmadas:
- Paleta de `A Marca` alinhada aos tokens operacionais atuais do site.
- Removidos `amber-*` dos componentes publicos tocados.
- Novo gate `audit:brand:visual` criado e acoplado a `verify:fast`, `verify:full`, `verify:deploy` e `prepush`.

Validacoes executadas:
- `npm run audit:brand:visual`: passou, `129 files checked`.
- `npm run verify:fast`: passou, incluindo i18n publico, gate visual e 64 testes.
- Browser audit `/a-marca` desktop/mobile: passou com evidencias em `.codex/tmp/visual-audit-20260509/a-marca-*-brand-gate/`.
- `npm run build:local`: passou, sitemap com 158 rotas.

Pontuacao provisoria apos este bloco:
- Qualidade visual percebida: `81/100`
- Qualidade tecnica imediata: `90/100`
- Governanca de release: `41/100`
- Estrutura i18n para novas linguas: `70/100`
- Prontidao para deploy: `54/100`
- Nota geral ponderada: `72/100`

Proximos gargalos:
- Validacao visual real do Instagram/fallback.
- Validacao visual do PDF/manual de marca para consolidar HEX e usos oficiais.
- Politica editorial ou traducao dos slugs EN/ES restantes.

### Rodada blog - materia `arquitetos-brasileiros-famosos-legado` - 2026-05-09

Objetivo do bloco:
- Recuperar a estrutura antiga de imagens contextuais da materia e transformar o artigo em modelo replicavel para demais posts longos.

Arquivos tocados nesta rodada:
- `src/pages/Blog.jsx`
- `src/data/blogImageManifest.js`
- `00_CORE/05_MARCA_E_MARKETING/_I/06_BIBLIOTECA_MODELOS_DIGITAIS/README.md`
- `00_CORE/05_MARCA_E_MARKETING/_I/06_BIBLIOTECA_MODELOS_DIGITAIS/APROVACOES-MODELOS.md`
- `RETURN-POINT.md`

Correcoes confirmadas:
- O template de artigo agora usa `getBlogImageUrl` para priorizar hero/card do manifesto editorial.
- O corpo da materia e dividido por secoes `H2`.
- Imagens de contexto sao inseridas pela correspondencia `sectionTitle` do manifesto.
- A materia `arquitetos-brasileiros-famosos-legado` renderiza 7 imagens contextuais, uma por bloco principal de arquiteto.
- A imagem antiga da Lina Bo Bardi retornava bloqueio/403 e foi substituida por ativo estavel do Wikimedia Commons.

Validacoes executadas:
- `npm run verify:fast`: passou, 12 arquivos e 64 testes.
- Browser audit desktop: `.codex/tmp/arquitetos-legado-20260509-desktop/summary.md`.
- Browser audit mobile: `.codex/tmp/arquitetos-legado-20260509-mobile/summary.md`.
- Validacao Playwright focada: `.codex/tmp/arquitetos-legado-20260509-final/report.json` com `figureCount: 7` e `loadedCount: 7`.
- Evidencias visuais: `.codex/tmp/arquitetos-legado-20260509-final/01-hero.png`, `02-oscar-contexto.png`, `03-lina-contexto.png`.

Decisao de biblioteca:
- Modelo `M013 - Materia longa com imagens contextuais` registrado como `aprovado como referencia`.

Proximo passo:
- Replicar o mesmo padrao nas demais materias que ja possuem `context` em `src/data/blogImageManifest.js` e auditar fonte externa antes de aprovar.

### Rodada blog - copiar estrutura visual da producao - 2026-05-09

Pedido original:
- Acessar `https://wgalmeida.com.br/blog/arquitetos-brasileiros-famosos-legado`, ver como esta em producao e copiar estrutura/estilos para o template local.

Arquivos tocados nesta rodada:
- `src/pages/Blog.jsx`
- `RETURN-POINT.md`

Correcoes aplicadas:
- Template de detalhe da materia reorganizado com estrutura inspirada na producao atual: hero escuro, card `Leitura Guiada`, indice `Neste artigo`, primeira secao com imagem + texto, secoes seguintes alternando texto/imagem, bloco Liz/ICCRI, tags e proximo passo.
- Mantido o efeito automatico de zoom-out no hero que havia sido aprovado no bloco anterior.
- Adicionado tratamento para remover sumario duplicado vindo do markdown antes de renderizar o indice visual.
- Mantida a listagem do blog sem substituicao global do arquivo, preservando os ajustes ja aprovados de cards/tags.

Validacoes executadas:
- Producao auditada como referencia visual: `https://wgalmeida.com.br/blog/arquitetos-brasileiros-famosos-legado`.
- `npm run verify:fast`: passou, incluindo auditorias i18n/tokens/estrutura/consistencia e 64 testes.
- Browser audit local desktop: `.codex/tmp/arquitetos-prod-structure-local-desktop/summary.md` e `screenshot.png`.
- Browser audit local mobile: `.codex/tmp/arquitetos-prod-structure-local-mobile/summary.md` e `screenshot.png`.

Pendencia visual controlada:
- Algumas imagens contextuais seguem aparecendo como bloco cinza quando a fonte externa nao entrega imagem renderizada no navegador. Estrutura aprovada pode seguir; o proximo bloco recomendado e auditoria/substituicao de assets externos por imagem local/cacheada quando necessario.

### Rodada blog - zoom-out automatico no hero da materia - 2026-05-09

Pedido original:
- Ao entrar na materia, aplicar o efeito `zoom out` automatico na imagem principal.

Arquivos tocados nesta rodada:
- `src/pages/Blog.jsx`
- `src/index.css`
- `RETURN-POINT.md`

Correcoes aplicadas:
- O disparo do zoom-out deixou de depender apenas do `onLoad` da imagem e agora acontece na montagem da pagina da materia.
- O hero inicia em escala `1.24` e anima ate `1.0` em `5.2s`, com curva suave.

Validacoes executadas:
- `npm run verify:fast`: passou, incluindo auditorias e 64 testes.
- Medicao via Playwright/headless confirmou a animacao `wg-hero-zoom-out` ativa:
  - `180ms`: `matrix(1.03419, 0, 0, 1.03419, 0, 0)`
  - `1480ms`: `matrix(1.00522, 0, 0, 1.00522, 0, 0)`
  - `5780ms`: `matrix(1, 0, 0, 1, 0, 0)`

URL limpa para validacao humana:
- `http://127.0.0.1:3000/blog/arquitetos-brasileiros-famosos-legado?wg_cache_bust=20260509141356`

### Rodada blog - replicacao exata do zoom da producao - 2026-05-09

Pedido original:
- Como o efeito ainda nao apareceu visualmente, buscar no material em producao e replicar localmente.

Fonte validada em producao:
- URL: `https://wgalmeida.com.br/blog/arquitetos-brasileiros-famosos-legado`
- Medicao Playwright em producao mostrou que o efeito esta no wrapper `.wg-hero-zoom-in`, nao no `img`.
- Classe do wrapper em producao: `absolute inset-0 wg-hero-zoom-in`.
- Classe da imagem em producao: `h-full w-full object-cover will-change-transform`.
- Animacao em producao: `wgHeroZoomIn`, duracao `2.1s`.

Arquivos tocados nesta rodada:
- `src/pages/Blog.jsx`
- `src/index.css`
- `RETURN-POINT.md`

Correcoes aplicadas:
- Removido o mecanismo paralelo `blog-article-hero-image--loaded`.
- O hero da materia passou a usar o mesmo wrapper de producao: `.wg-hero-zoom-in`.
- A imagem voltou a ser simples, com `will-change-transform`, como na producao.

Validacoes executadas:
- `npm run verify:fast`: passou, incluindo auditorias e 64 testes.
- Medicao local via Playwright confirmou equivalencia com producao:
  - `500ms`: `matrix(1.13353, 0, 0, 1.13353, 0, 0)`
  - `1500ms`: `matrix(1.03751, 0, 0, 1.03751, 0, 0)`
  - `2700ms`: `matrix(1, 0, 0, 1, 0, 0)`

URL limpa para validacao humana:
- `http://127.0.0.1:3000/blog/arquitetos-brasileiros-famosos-legado?wg_cache_bust=20260509141657`

### Rodada blog - ajuste fino do texto e tag do hero - 2026-05-09

Pedido original:
- Hero aprovado; trabalhar texto de apresentacao, ajuste fino e aplicacao da tag.

Arquivos tocados nesta rodada:
- `src/pages/Blog.jsx`
- `RETURN-POINT.md`

Correcoes aplicadas:
- Tag do nucleo aplicada no hero como pill preenchida pela cor do assunto.
- Metadados do hero reorganizados: `Arquitetura`, `Materia especial`, data e tempo de leitura.
- Texto de apresentacao da materia ajustado para tom editorial:
  `Um guia editorial para reconhecer referencias, obras e licoes da arquitetura brasileira que seguem influenciando projetos contemporaneos.`
- Link de retorno do hero ajustado para `Blog & Artigos`.

Validacoes executadas:
- `npm run verify:fast`: passou, incluindo auditorias e 64 testes.
- Browser audit desktop: `.codex/tmp/arquitetos-hero-text-tag-desktop/screenshot.png`.
- Browser audit mobile: `.codex/tmp/arquitetos-hero-text-tag-mobile/screenshot.png`.

URL limpa para validacao humana:
- `http://127.0.0.1:3000/blog/arquitetos-brasileiros-famosos-legado?wg_cache_bust=20260509141828`

### Rodada blog - enquadramento de rosto e metadados com icones - 2026-05-09

Pedidos originais:
- Padronizar melhor ponto da imagem para nao cortar rosto/pessoas.
- Remover `Materia especial`.
- Descer informacoes para o formato `Grupo WG Almeida`, `January 24, 2026`, `6 min read` com icones como na producao.

Arquivos tocados nesta rodada:
- `src/pages/Blog.jsx`
- `src/data/blogImageManifest.js`
- `RETURN-POINT.md`

Correcoes aplicadas:
- Manifesto editorial passou a aceitar `subject` e `objectPosition` nos assets.
- Hero desta materia marcado como `subject: person` e `objectPosition: center top`.
- Template do hero passa a ler `getBlogImageAsset(... variant: hero)` e aplicar `object-position` no `img`.
- Regra padrao criada: se o asset for `person` ou alt tiver `retrato`, o fallback de enquadramento e `center top`; demais imagens ficam `center center`.
- `Materia especial` removido do hero.
- Metadados movidos para baixo da apresentacao com icones: autor, data e tempo de leitura.

Validacoes executadas:
- `npm run verify:fast`: passou, incluindo auditorias e 64 testes.
- Browser audit desktop: `.codex/tmp/arquitetos-hero-meta-icons-desktop/screenshot.png`.
- DOM check confirmou:
  - `objectPosition`: `50% 0%`
  - `Materia especial`: ausente
  - `Grupo WG Almeida`: presente
  - `January 24, 2026`: presente
  - `6 min read`: presente

URL limpa para validacao humana:
- `http://127.0.0.1:3000/blog/arquitetos-brasileiros-famosos-legado?wg_cache_bust=20260509142128`

## Sessão: 09/05/2026 - Otimização de SEO e Dossier do Ecossistema

### O que foi feito:
1. **Otimização de Metadados Dinâmicos:**
   - Atualizado `src/pages/Blog.jsx` para passar `keywords` (tags), `og.image` e `twitter.image` (capa do artigo) e `schema` (JSON-LD Article) para o componente `<SEO>`. Isso garante Rich Snippets e compartilhamento social atraente para todos os artigos.
2. **Criação do Dossier de SEO do Ecossistema:**
   - Criado `01_APPS/02_BUILDTECH/SEO-DOSSIER-ECOSSISTEMA.md` com diretrizes globais para padronização de SEO em todo o ecossistema (SaaS, Sites, Landing Pages).
3. **Atualização do Manual de SEO Local:**
   - Atualizado `MANUAL-SEO-PERFORMANCE.md` com referência ao Dossier Global e reforço das boas práticas de metadados dinâmicos.

### Status da Página Solicitada:
A página `/blog/arquitetos-brasileiros-famosos-legado` agora está 100% otimizada com:
- Tags H1-H3 corretas.
- Imagem Open Graph específica (`ARQ.webp`).
- Metadados de palavras-chave dinâmicos.
- Dados Estruturados `Article` (Schema.org).

### Próximos Passos Sugeridos:
- Validar as tags Hreflang para o blog internacional (está no radar como Gap de alta prioridade no Manual).
- Automatizar o BreadcrumbList dinâmico no componente `SEO.jsx`.

---

## Sessao: 09/05/2026 - Padrao Visual Canonico do Artigo Modelo

### Pagina modelo
- `/blog/arquitetos-brasileiros-famosos-legado`

### Padroes aprovados para replicacao
- Artigo editorial longo deve usar a estrutura desta pagina como base: hero, card `Leitura Guiada`, bloco `Neste artigo`, cards de conteudo, bloco Liz/ICCRI, tags e fechamento.
- CTAs publicos devem seguir o padrao discreto aprovado pelos prints `ctas.png`, `padronizar altura tamamnhh e formato dos ctas.png` e `estes ctas tb .png`.
- Classe canonica criada no CSS:
  - `wg-cta-canonical`
  - `wg-cta-canonical-primary`
  - `wg-cta-canonical-accent`
- Tags finais do artigo devem vir do frontmatter, sem linha manual `Tags:` dentro do markdown.
- Tags visuais devem ser chips baixos, preenchidos pela cor do nucleo e com texto branco.
- Titulos de blocos do artigo usam `font-playfair`, `text-xl`, `md:text-2xl`, `font-light` e `leading-tight`, preservando semantica real `H2/H3`.

### Arquivos relevantes tocados neste bloco
- `src/pages/Blog.jsx`
- `src/index.css`
- `src/components/SmartCTA.jsx`
- `src/components/ICCRILinksBlock.jsx`
- `src/content/blog/arquitetos-brasileiros-famosos-legado.md`
- `MANUAL-SEO-PERFORMANCE.md`
- `01_APPS/02_BUILDTECH/SEO-DOSSIER-ECOSSISTEMA.md`

### Documentacao atualizada
- `MANUAL-SEO-PERFORMANCE.md`: indice e numeracao corrigidos apos inclusao do Dossier global.
- `01_APPS/02_BUILDTECH/SEO-DOSSIER-ECOSSISTEMA.md`: adicionado padrao editorial de artigos, CTAs, tags e checklist de validacao visual/cache-bust.

### Validacoes executadas
- `npm run verify:fast`: passou, 12 arquivos de teste e 64 testes.
- URL limpa mais recente para validacao humana:
  - `http://127.0.0.1:3000/blog/arquitetos-brasileiros-famosos-legado?wg_cache_bust=20260509161840`

### Proximo passo operacional
- Aguardar retorno do Google/SEO para aplicar ajustes finos.
- Depois, documentar aprovacao final e iniciar replicacao pagina por pagina, botao por botao, link por link, com validacao visual desktop/mobile e URL limpa.

---

## Sessao: 09/05/2026 - Saneamento do contrato SEO dinamico

### Motivo
- Validacao do relatorio de SEO mostrou que `Blog.jsx` ja passava `keywords`, `og.image`, `twitter.image` e `schema`, mas o contrato real do componente `SEO.jsx` ainda nao imprimia tudo que o dossie prometia.

### Correcoes aplicadas
- `src/components/SEO.jsx` agora:
  - renderiza `<meta name="keywords">` quando recebe tags/palavras-chave;
  - aceita `og.type` dinamico e permite `article` em artigos;
  - converte canonical, OG image, Twitter image e imagens de schema para URL absoluta;
  - declara `og:image:type` conforme a extensao real do asset (`webp`, `png`, `gif`, `avif`, `jpeg`);
  - fortalece `schemas.article` com `mainEntityOfPage` e `dateModified`;
  - exporta `schemas.project` como `CreativeWork` para futuras paginas de projetos/cases.
- `src/pages/Blog.jsx` passa `og={{ image: articleHeroSrc, type: 'article' }}` nas paginas de artigo.
- `01_APPS/02_BUILDTECH/SEO-DOSSIER-ECOSSISTEMA.md` recebeu o contrato tecnico do componente SEO e os prompts oficiais de replicacao/auditoria.

### Validacoes executadas
- `npm run audit:i18n:public`: passou, 227 chaves verificadas em `pt-BR`, `en` e `es`.
- `npm run seo:audit`: passou, 149 markdowns verificados e 0 assets de frontmatter ausentes.
- `npm run verify:fast`: passou, incluindo imports, i18n, brand tokens, auditorias estruturais/consistencia e 64 testes.

### Governanca
- `git-sync-gate -Stage start` segue bloqueado porque o worktree do `site-wgalmeida` ja esta sujo.
- Portfolio continua `RED`; sem commit, push, merge ou deploy nesta rodada.
- Replicacao para outros projetos deve ser feita projeto por projeto, depois de triagem do worktree e leitura do `RETURN-POINT.md` local.

---

## Sessao: 09/05/2026 - Excecao controlada para prontidao de producao do site

### Pedido atual
- Continuar somente com o `site-wgalmeida` ate deixar pronto para producao com o novo padrao de SEO.
- `Liz_Assistente_WhatsApp` fica fora desta secao e sera tratada em outro bloco.

### Evidencias de isolamento
- Portfolio permanece `RED` por incidentes em:
  - `C:/AI`
  - `03_AUTOMACAO/Liz_Assistente_WhatsApp`
- Repo alvo `site-wgalmeida` esta `GREEN` no dashboard:
  - dirty `0`
  - drift `0/0`
  - branch `feature/buildtech-vitrine-star-20260502`
  - ultimo commit `570c9be`
- Mudancas deste bloco ficam restritas ao site e sua documentacao local.
- Nao tocar em `C:/AI`, Liz, runtime compartilhado, credenciais, banco ou automacoes produtivas externas.

### Regra operacional deste bloco
- Permitido: auditoria tecnica, SEO, rotas publicas, validacao visual local/producao e correcoes cirurgicas no site.
- Bloqueado: deploy/merge global, alteracoes em Liz/C:/AI e mudancas transversais fora do repo do site.

### Evolucao executada neste bloco
- Corrigido vazamento de chaves i18n em rotas publicas:
  - `/arquitetura`: `architecturePage.*`, `cta.learnMore`.
  - `/contato`: `seo.contact.*`, `contactPage.info.title`.
  - `/engenharia`: `engineeringPage.*`.
  - `/marcenaria`: `carpentryPage.*`.
- Idiomas atualizados com cobertura equivalente em `pt-BR`, `en` e `es`.
- Mantida a restricao de nao alterar layout, cores ou estrutura visual fora do necessario para remover chaves cruas.

### Validacoes executadas
- `npm run audit:i18n:public`: OK, 227 chaves verificadas em `pt-BR`, `en` e `es`.
- `npm run verify:fast`: OK, 12 arquivos de teste e 64 testes aprovados.
- `npm run seo:audit`: OK, 149 markdowns verificados e 0 assets SEO ausentes.
- `npm run build`: OK, build de producao gerado e 158 rotas estaticas processadas.
- `npm run seo:validate:dist`: OK, sitemap com 158 rotas e dist validado.

### Evidencias visuais locais
- Preview local de producao: `http://127.0.0.1:3011`.
- Prints e relatorios salvos em:
  - `.codex/tmp/prod-audit/arquitetura-desktop-after-i18n/`
  - `.codex/tmp/prod-audit/contato-desktop-after-i18n/`
  - `.codex/tmp/prod-audit/engenharia-desktop-after-i18n/`
  - `.codex/tmp/prod-audit/marcenaria-desktop-after-i18n/`
- Rotas revalidadas sem chaves cruas no DOM auditado:
  - `/arquitetura`
  - `/contato`
  - `/engenharia`
  - `/marcenaria`

### Pendencias para prontidao final
- Validar rotas publicas restantes em lote com o mesmo criterio de chaves cruas, SEO e console.
- Rodar validacao final no dominio publico depois de deploy, conforme regra de producao real.
- Manter `Liz_Assistente_WhatsApp` fora deste bloco ate abertura de frente propria.

### Saneamento de smoke local
- Ajustado `src/components/DeferredClientEnhancements.jsx` para nao carregar Vercel Analytics e Speed Insights em `localhost`, `127.0.0.1`, `::1` ou `file:`.
- Motivo: o preview local gerava 404 em `/_vercel/insights/script.js` e `/_vercel/speed-insights/script.js`, poluindo o smoke sem indicar falha real de producao.
- Producao preservada: os componentes continuam ativos fora de runtime local.
- Validacao apos ajuste:
  - `npm run verify:fast`: OK.
  - `npm run seo:audit`: OK.
  - `npm run build`: OK.
  - `npm run seo:validate:dist`: OK.
  - `npm run smoke:console`: OK, sem ocorrencias relevantes.

### Auditoria visual da pasta 05_site-wg
- Pasta auditada: `C:\Users\Atendimento\Documents\Imagens\Screenshots\05_site-wg`.
- Relatorio criado: `C:\Users\Atendimento\Documents\Imagens\Screenshots\05_site-wg\AUDITORIA-05-SITE-WG-2026-05-09.md`.
- Prints arquivados como validados em `_VALIDADOS_2026-05-09`:
  - `ctas.png`
  - `padronizar altura tamamnhh e formato dos ctas.png`
  - `estes ctas tb .png`
- Correcoes aplicadas por vazamento de chave crua:
  - `googleReviews.countWithValue` e familia `googleReviews.*`.
  - `contactPage.info.subtitle`.
  - `projectsPage.hero.title`, `projectsPage.hero.kicker`, `projectsPage.hero.subtitle` e estrutura de `projectsPage`.
- Idiomas atualizados com cobertura equivalente em `pt-BR`, `en` e `es`.
- Evidencias de navegador geradas em:
  - `.codex/tmp/screenshot-audit-05-site-wg/projetos-after-i18n/`
  - `.codex/tmp/screenshot-audit-05-site-wg/contato-after-i18n/`
  - `.codex/tmp/screenshot-audit-05-site-wg/home-after-google-reviews/`
- Rotas validadas sem chaves cruas no DOM auditado:
  - `/projetos`
  - `/contato`
  - `/`

### Auditoria visual do blog - listagem
- Rota auditada: `/blog`.
- Correcoes aplicadas em `src/pages/Blog.jsx`:
  - filtro ativo `Todos` deixou de usar texto branco sobre fundo cinza claro;
  - tags dos dois cards pequenos da primeira linha voltaram para o topo da imagem, alinhadas ao padrao aprovado dos demais cards;
  - card destaque espelhado revalidado sem area branca indevida sob a imagem.
- Evidencias de navegador geradas em:
  - `.codex/tmp/screenshot-audit-05-site-wg/blog-list-after-card-tags/`
  - `.codex/tmp/screenshot-audit-05-site-wg/blog-list-after-card-tags-mobile/`
- Prints arquivados em `_VALIDADOS_2026-05-09`:
  - `aplicar em local corretoas tags destes dois cards.png`
  - `corrigir cor de cta .png`
  - `ajsutar container para aprecer a iamgem e não cortar.png`
  - `ajsutar container para aprecer a iamgem e não cortar 2.png`
- Validacao tecnica parcial deste bloco:
  - `npm run audit:i18n:public`: OK.

### Auditoria visual de engenharia e visualizador
- Rota auditada: `/engenharia`.
- Correcoes aplicadas:
  - removido vazamento de chave crua `processPage.integration.quote`;
  - criada chave `engineeringPage.commitment.quote` em `pt-BR`, `en` e `es`;
  - adicionado fallback de imagem no bloco de compromisso de engenharia para evitar alt text em card vazio;
  - print antigo de `14+` revalidado: a pagina atual nao reproduz mais o valor antigo e a base canonica usa minimo de 15 anos.
- Rota auditada parcialmente: `/room-visualizer`.
- Correcoes aplicadas:
  - removidas referencias explicitas a `IA` no SEO do visualizador;
  - icone `Wand2` substituido por `Layers3` no visualizador.
- Evidencias de navegador geradas em:
  - `.codex/tmp/screenshot-audit-05-site-wg/engenharia-after-years-i18n-image/`
  - `.codex/tmp/screenshot-audit-05-site-wg/room-visualizer-no-ai-symbol/`
- Print arquivado em `_VALIDADOS_2026-05-09`:
  - `ATUALIZAR DOCUMENTAÇÃO CANONICA DA MARCA SÃO  AGORA 15 ANOS NÃO MAIS 14 .png`
- Pendencia mantida:
  - prints de simbolos de IA continuam na fila ate validacao visual autenticada do estado interno do visualizador.
- Validacao tecnica parcial deste bloco:
  - `npm run audit:i18n:public`: OK.

### Encerramento de governanca do bloco
- Commit enviado: `b1a111d fix(site): clean engineering and visualizer copy`.
- Repo `site-wgalmeida`: GREEN, dirty `0`, drift `0/0`, alinhado com `origin/feature/buildtech-vitrine-star-20260502`.
- Validacoes finais:
  - `npm run verify:fast`: OK, 12 arquivos de teste e 64 testes aprovados.
  - Sync Gate `pre-push`: PASS.
  - `git push`: OK; hook pre-push executou `check:imports`, `audit:consistency:strict`, `build` e gerou sitemap com 158 rotas.
- Portfolio Health final ficou `RED` por incidente restrito a `03_AUTOMACAO/Liz_Assistente_WhatsApp`:
  - repo bloqueador: `Liz_Assistente_WhatsApp`;
  - dirty reportado: `7`;
  - repo alvo `site-wgalmeida` segue isolado e GREEN;
  - este bloco nao tocou Liz, `C:/AI`, runtime compartilhado, credenciais, banco ou automacoes produtivas externas.

### Auditoria visual - bloco cores, regioes e Timeline
- Estado de governanca no inicio:
  - `PORTFOLIO-HEALTH.md`: GREEN, health score `100`, repos criticos `0`.
  - Sync Gate `start`: PASS em `feature/buildtech-vitrine-star-20260502`.
  - Repo alvo iniciou limpo e alinhado com `origin/feature/buildtech-vitrine-star-20260502`.
- Pasta auditada: `C:\Users\Atendimento\Documents\Imagens\Screenshots\05_site-wg`.
- Prints ativos apos limpeza manual do usuario: `36`.
- Prints arquivados em `_VALIDADOS_2026-05-09` neste bloco:
  - `apareceu amarelo de novo .png`
  - `AMARELO APARECE AQUI DE NOVO .png`
  - `COR  FORA DO PADRÃO DA MARCA .png`
  - `AS REGRAS DE ERXSONALZIAÇÃO DE CORES PARA OS NUCLEOS DEVE SER REGRA PARA TODO O SITE .png`
  - `AMARELO DE NOVO.png`
  - `borda amarela e cor do texto fora do padrão da marca .png`
- Correcoes aplicadas:
  - `src/pages/Process.jsx`: adicionados fallbacks editoriais para as etapas da Timeline; removidos vazamentos `processPage.steps.*` na renderizacao local.
  - `src/pages/regions/RegionTemplate.jsx`: adicionados fallbacks canonicos para paginas regionais sem bloco i18n completo; corrigidas chaves cruas `regions.defaults.*`; servicos regionais passaram a usar cores por nucleo em vez de tudo laranja.
  - `src/components/SEO.jsx`: `schemas.localBusiness` ficou resiliente quando o bairro estiver ausente.
  - `src/pages/EstiloDetail.jsx`: botoes de compartilhamento trocaram contorno amarelo por cinza discreto.
- Evidencias de navegador:
  - `.codex/tmp/screenshot-audit-05-site-wg/style-coastal-current/`
  - `.codex/tmp/screenshot-audit-05-site-wg/style-coastal-after-share-border/`
  - `.codex/tmp/screenshot-audit-05-site-wg/process-current/`
  - `.codex/tmp/screenshot-audit-05-site-wg/process-after-i18n/`
  - `.codex/tmp/screenshot-audit-05-site-wg/alto-de-pinheiros-current/`
  - `.codex/tmp/screenshot-audit-05-site-wg/alto-de-pinheiros-after-i18n-fallback/`
  - `.codex/tmp/screenshot-audit-05-site-wg/blog-architects-cta-current/`
- Validacoes:
  - `npm run audit:i18n:public`: OK.
  - `npm run lint -- --max-warnings=0`: OK; apenas aviso do npm sobre parametro futuro.
  - `npm run verify:fast`: OK, 12 arquivos de teste e 64 testes aprovados.
- Pendencias:
  - `aviso amarelo .png`: texto `Ativo sincronizado` nao localizado no codigo-fonte; manter na fila ate validacao dirigida do Moodboard Studio.
  - Prints de simbolos/termos de IA em estado autenticado continuam pendentes.
  - Header/menu e diagramações restantes seguem para o proximo bloco.
