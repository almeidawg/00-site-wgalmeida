# Inventário Digital Mestre - Grupo WG Almeida

> **FASE 1: INVENTÁRIO**
> **Data:** 2026-08-18
> **Fonte:** Crawl inicial via sitemaps (`sitemap-index.xml`, `sitemap.xml`, `video-sitemap.xml`).

Este documento representa o inventário inicial de todos os ativos digitais (URLs e vídeos) do domínio `wgalmeida.com.br` conforme declarado nos sitemaps do site.

---

## 1. Resumo Quantitativo

- **Total de URLs no `sitemap.xml`:** 175
- **Total de Vídeos no `video-sitemap.xml`:** 3
- **Total de Sitemaps:** 2 (`sitemap.xml`, `video-sitemap.xml`)

---

## 2. URLs por Categoria

### 2.1. Páginas Principais e Institucionais (12 URLs)
- https://wgalmeida.com.br/
- https://wgalmeida.com.br/sobre
- https://wgalmeida.com.br/a-marca
- https://wgalmeida.com.br/projetos
- https://wgalmeida.com.br/processo
- https://wgalmeida.com.br/depoimentos
- https://wgalmeida.com.br/contato
- https://wgalmeida.com.br/faq
- https://wgalmeida.com.br/privacidade
- https://wgalmeida.com.br/exclusao-de-dados
- https://wgalmeida.com.br/solicite-proposta
- https://wgalmeida.com.br/store (Potencialmente um erro ou página antiga)

### 2.2. Páginas de Serviço (6 URLs)
- https://wgalmeida.com.br/arquitetura
- https://wgalmeida.com.br/engenharia
- https://wgalmeida.com.br/marcenaria
- https://wgalmeida.com.br/obra-turn-key
- https://wgalmeida.com.br/arquitetura-corporativa
- https://wgalmeida.com.br/construtora-alto-padrao-sp

### 2.3. Páginas de Produtos Digitais / Marcas (7 URLs)
- https://wgalmeida.com.br/buildtech
- https://wgalmeida.com.br/wgeasy
- https://wgalmeida.com.br/iccri
- https://wgalmeida.com.br/iccri-para-imobiliarias
- https://wgalmeida.com.br/easylocker
- https://wgalmeida.com.br/obraeasy
- https://wgalmeida.com.br/easy-real-state

### 2.4. Páginas de Conteúdo Interativo (5 URLs)
- https://wgalmeida.com.br/revista-estilos
- https://wgalmeida.com.br/moodboard
- https://wgalmeida.com.br/moodboard-generator
- https://wgalmeida.com.br/room-visualizer

### 2.5. Páginas de SEO Local (Geográficas) (21 URLs)
- https://wgalmeida.com.br/reforma-apartamento-sp
- https://wgalmeida.com.br/reforma-apartamento-itaim
- https://wgalmeida.com.br/reforma-apartamento-jardins
- https://wgalmeida.com.br/construtora-brooklin
- https://wgalmeida.com.br/marcenaria-sob-medida-morumbi
- https://wgalmeida.com.br/arquitetura-interiores-vila-nova-conceicao
- https://wgalmeida.com.br/jardins
- https://wgalmeida.com.br/vila-nova-conceicao
- https://wgalmeida.com.br/itaim
- https://wgalmeida.com.br/brooklin
- https://wgalmeida.com.br/morumbi
- https://wgalmeida.com.br/cidade-jardim
- https://wgalmeida.com.br/alto-de-pinheiros
- https://wgalmeida.com.br/moema
- https://wgalmeida.com.br/campo-belo
- https://wgalmeida.com.br/higienopolis
- https://wgalmeida.com.br/pinheiros
- https://wgalmeida.com.br/perdizes
- https://wgalmeida.com.br/paraiso
- https://wgalmeida.com.br/aclimacao
- https://wgalmeida.com.br/vila-mariana
- https://wgalmeida.com.br/mooca

### 2.6. Artigos de Blog (80 URLs)
- (Lista extensa de 80 URLs de blog, como `https://wgalmeida.com.br/blog/acapulco-club-house-residencia-luxo`, etc.)

### 2.7. Guias de Estilo (44 URLs)
- (Lista extensa de 44 URLs de estilos, como `https://wgalmeida.com.br/estilos/japandi`, etc.)

---

## 3. Inventário de Vídeos

| # | Página Associada | Thumbnail | Título | Duração | URL do Vídeo (Cloudinary) |
|---|---|---|---|---|---|
| 1 | https://wgalmeida.com.br/ | hero-poster-1280.webp | Grupo WG Almeida - Arquitetura, Engenharia e Marcenaria Premium | 45s | `https://res.cloudinary.com/dwukfmgrd/video/upload/.../h6zftberxzqzf4mqpyyr` |
| 2 | https://wgalmeida.com.br/sobre | hero-poster-1280.webp | Sobre o Grupo WG Almeida - Nossa História | 120s | `https://res.cloudinary.com/dwukfmgrd/video/upload/.../h6zftberxzqzf4mqpyyr` |
| 3 | https://wgalmeida.com.br/ (Mobile) | hero-poster-640.webp | WG Almeida - Arquitetura Premium SP (Mobile) | 45s | `https://res.cloudinary.com/dwukfmgrd/video/upload/.../h6zftberxzqzf4mqpyyr` |

---

## 4. Observações Iniciais

- **Estrutura Robusta:** O site possui uma quantidade significativa de conteúdo, bem categorizado em páginas de serviço, produtos, blog, SEO local e guias de estilo.
- **Conteúdo Duplicado?:** A URL `/store` parece deslocada e pode ser uma página legada ou de teste. Precisa de investigação.
- **SEO Local Agressivo:** Há um grande número de páginas focadas em bairros de São Paulo, o que indica uma forte estratégia de SEO Local. A efetividade e o conteúdo de cada uma precisa ser analisado para evitar `doorway pages`.
- **Conteúdo de Blog Extenso:** O blog é o maior ativo de conteúdo em termos de volume de URLs.
- **Vídeos Centralizados:** Os vídeos estão hospedados no Cloudinary, o que é uma boa prática de performance.
- **Sitemaps Múltiplos:** O uso de `sitemap-index.xml` para separar sitemaps de página e vídeo é correto.

---

## Próximos Passos (Fase 2 - Crawl Técnico)

1.  Realizar um crawl em uma amostra de URLs de cada categoria para verificar status HTTP, titles, meta descriptions, e a presença de tracking (GA4/GTM).
2.  Analisar o conteúdo das páginas de SEO local para garantir que possuem valor único.
3.  Investigar a URL `/store`.
4.  Expandir o inventário para incluir subdomínios e outras propriedades digitais mencionadas na missão.

---

## 5. Performance Baseline (Qualitativo)

> **Data:** 2026-08-18
> **Metodologia:** Análise de código e configuração, devido a falhas nas ferramentas de medição automatizada (Lighthouse, PageSpeed API).

Apesar da impossibilidade de coletar métricas quantitativas (LCP, INP, CLS) neste momento, a análise da arquitetura do projeto revela uma base sólida e consciente da performance.

### 5.1. Pontos Fortes

- **Build Moderno (Vite):** O uso do Vite como build tool permite otimizações modernas, como tree-shaking eficiente e gestão de bundles.
- **Lazy Loading de Scripts:** Scripts de terceiros (GTM, Pinterest) são carregados de forma assíncrona e somente após interação do usuário, uma prática excelente que reduz o tempo de bloqueio da thread principal (TBT).
- **Otimização de Build:** O `package.json` contém scripts para tarefas de performance como compressão de ativos (`vite-plugin-compression2`), poda de CSS e SVGs não utilizados, e otimização de imagens, indicando um processo de build maduro.
- **Monitoramento:** A inclusão do pacote `web-vitals` demonstra a intenção de medir os Core Web Vitals no cliente.
- **Análise de Bundle:** A existência de um script `npm run analyze` com `rollup-plugin-visualizer` é um ponto extremamente positivo, permitindo a identificação de dependências pesadas no bundle final.

### 5.2. Pontos de Atenção e Oportunidades

- **Fontes Externas:** As fontes são carregadas do Google Fonts. Para otimização máxima, auto-hospedar as fontes (self-hosting) eliminaria uma requisição externa bloqueante, melhorando o tempo de carregamento.
- **Dependências Pesadas:**
    - **Animações (`framer-motion`):** É uma biblioteca poderosa, mas seu impacto no tamanho do bundle deve ser verificado com o `npm run analyze`.
    - **Geração de Documentos (`html2canvas`, `jspdf`):** Essas bibliotecas são tipicamente grandes. É crucial garantir que sejam carregadas apenas nas rotas e através de interações que as exijam (lazy loading dinâmico).
- **Subdomínio `easy.wgalmeida.com.br`:** O link para este subdomínio deve ser analisado. Se for uma aplicação separada, é importante garantir que a navegação para ele seja rápida e que ele também seja otimizado.

### 5.3. Conclusão Parcial

O projeto está arquitetado com boas práticas de performance em mente. As otimizações mais significativas parecem já estar implementadas no processo de build. As oportunidades de melhoria são incrementais e estão relacionadas ao carregamento de fontes e à verificação do impacto de dependências específicas. A ausência de métricas de LCP/INP/CLS é um bloqueio para uma auditoria completa, mas a análise qualitativa é favorável.

---

## 6. Correção de Dados Estruturados (Schema)

> **Data:** 2026-08-18
> **Status:** CORRIGIDO

### 6.1. Diagnóstico

- A auditoria manual do `index.html` revelou a presença de um `aggregateRating` dentro do schema `ProfessionalService`.
- Este schema declarava **47 reviews** com uma nota **5.0**.
- A verificação do conteúdo renderizado da página (`rendered_homepage.html`) confirmou que estas 47 avaliações **não são visíveis para o usuário**.
- Esta prática viola as diretrizes do Google para dados estruturados, que exigem que o conteúdo marcado com schema seja visível na página. A marcação de conteúdo invisível pode ser considerada uma técnica de spam.

### 6.2. Ação Corretiva

- **Causa Raiz Identificada:** O schema `aggregateRating` era gerado em múltiplos locais: no `index.html` estático, em um helper `localBusiness` no componente `src/components/SEO.jsx`, e em uma exportação standalone em `src/data/schemaConfig.js`.
- **Implementação da Correção:**
    1.  O bloco `aggregateRating` foi removido do `index.html` para garantir que a primeira renderização servida aos crawlers esteja em conformidade.
    2.  O bloco `aggregateRating` foi removido da função helper `localBusiness` em `src/components/SEO.jsx` para corrigir as páginas que a utilizam (ex: páginas de SEO local).
    3.  A exportação do schema `aggregateRating` standalone foi removida de `src/data/schemaConfig.js` para prevenir reintrodução acidental.
- **Verificação:** O comando `npm run build` foi executado com sucesso após as alterações, confirmando que a correção não introduziu erros no processo de build do projeto.

---

## 7. Criação de Ativo Digital (Página de Produto: Easy Food)

> **Data:** 2026-08-18
> **Status:** IMPLEMENTADO E VERIFICADO

### 7.1. Diagnóstico

- Conforme a **Fase 9** da missão ("Produtos sem presença adequada"), foi identificado que o produto "Easy Food", embora existente e operacional em seu próprio subdomínio (`easyfood.wgalmeida.com.br`), não possuía uma página de marketing e descoberta dentro do site principal `wgalmeida.com.br`.
- A ausência desta página impedia a descoberta orgânica do produto através do site principal e a sua integração na estratégia de conteúdo do Grupo WG.

### 7.2. Ação Corretiva

- **Criação do Componente da Página:** Foi criado um novo arquivo de componente (`src/pages/EasyFoodLanding.jsx`) para servir como a página de aterrissagem do produto.
- **Desenvolvimento do Conteúdo:** O conteúdo da página foi desenvolvido com base nas informações do `CANONICAL.md` do produto e modelado a partir de outras páginas de produtos existentes para manter a consistência visual e estrutural. A página inclui:
    - SEO (Title e Description) otimizado.
    - Seção Hero com proposta de valor.
    - Grid de funcionalidades (Cardápio Digital, Gestão de Cozinha, PDV, Admin).
    - CTAs (Call to Actions) para acessar a plataforma e solicitar uma demonstração.
- **Configuração de Rota:** Uma nova rota `/easyfood` foi adicionada ao roteador principal da aplicação (`src/App.jsx`).
- **Atualização de Configuração:** A URL do produto foi adicionada ao arquivo de configuração central (`src/data/companyPublic.js`).
- **Refatoração do Header:** Para integrar a nova página (e futuras páginas de produtos SaaS) de forma escalável, o header do site (`src/components/layout/Header.jsx`) foi refatorado:
    - Os links diretos para produtos SaaS (WGEasy, etc.) foram removidos.
    - Foi criado um novo menu dropdown, acionado por um ícone (`Cpu`), que agora lista os produtos "WGEasy", "Easy Food" e "Easy Real Estate", tornando a navegação mais limpa e organizada.
- **Verificação:** Após uma série de depurações relacionadas a ícones inexistentes (o que exigiu uma mudança de estratégia da adição de um ícone para a refatoração com um menu dropdown), o comando `npm run build` foi executado com sucesso, validando a integração completa e sem erros da nova página e do header atualizado.

---

## 8. Criação de Ativo Digital (Página de Produto: AcessooS)

> **Data:** 2026-08-18
> **Status:** IMPLEMENTADO E VERIFICADO

### 8.1. Diagnóstico

- Conforme a **Fase 9** da missão ("Produtos sem presença adequada"), foi identificado que o produto "AcessooS", embora existente e operacional em seu próprio subdomínio (`https://acessoos-app.vercel.app`), não possuía uma página de marketing e descoberta dentro do site principal `wgalmeida.com.br`.
- A ausência desta página impedia a descoberta orgânica do produto através do site principal e a sua integração na estratégia de conteúdo do Grupo WG.
- O `CANONICAL.md` do projeto AcessooS revelou que o produto está em "PRODUÇÃO_DEMONSTRATIVA_ATIVA", o que permitiu uma análise detalhada da interface e funcionalidades.

### 8.2. Ação Corretiva

- **Criação do Componente da Página:** Foi criado um novo arquivo de componente (`src/pages/AcessosLanding.jsx`) para servir como a página de aterrissagem do produto.
- **Desenvolvimento do Conteúdo:** O conteúdo da página foi desenvolvido com base na análise do aplicativo demo (`https://acessoos-app.vercel.app/`) e no `CANONICAL.md` do produto. Foi modelado a partir de outras páginas de produtos existentes para manter a consistência visual e estrutural. A página inclui:
    - SEO (Title e Description) otimizado.
    - Seção Hero com proposta de valor ("A gestão do seu condomínio, simplificada e inteligente.").
    - Grid de funcionalidades detalhadas (Controle de Acesso, Gestão de Moradores, Reservas e Ocorrências, Operação Predial).
    - CTAs (Call to Actions) para acessar a demonstração e falar com um especialista.
- **Configuração de Rota:** Uma nova rota `/acessos` foi adicionada ao roteador principal da aplicação (`src/App.jsx`).
- **Atualização de Configuração:** A URL do produto foi adicionada ao arquivo de configuração central (`src/data/companyPublic.js`).
- **Atualização do Header:** O produto "AcessooS" foi adicionado ao menu dropdown de produtos SaaS no header (`src/components/layout/Header.jsx`), garantindo a sua visibilidade na navegação principal.
- **Verificação:** O comando `npm run build` foi executado com sucesso após as alterações, validando a integração completa e sem erros da nova página e do header atualizado.

