# William Almeida Public Entity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a página canônica `/william-almeida` e alinhar o grafo SEO do site para representar William Almeida como Founder, Operator & Builder e Advisor Estratégico, conectado ao Grupo WG Almeida e à WG/Build.tech, sem claims não verificados.

**Architecture:** A implementação seguirá os padrões atuais do React/Vite: nova página lazy-loaded, metadados centralizados em `seoConfig.js`, entidades JSON-LD centralizadas em `schemaConfig.js`, autoria de artigos apontando para a mesma `Person`, e links internos a partir da página Sobre. A rota será descoberta pelos scripts de sitemap existentes e validada pelos gates SEO/build atuais.

**Tech Stack:** React 19, React Router, Vite, react-helmet-async, Schema.org JSON-LD, Vitest, scripts SEO proprietários.

**Spec:** `E:/02_Core/09_Marca_e_Comunicacao/00_Brand_HQ/03_Marketing_Posicionamento/03_SEO_Social/WILLIAM_PUBLIC_ENTITY_SEO_BLUEPRINT_CURRENT_20260915.md`

## Global Constraints

- Nome público oficial: `WG/Build.tech`.
- William: `Founder, Operator & Builder` + `Advisor Estratégico para fundadores e empresários`.
- Trajetória pública: `desde 2011`; data exata refere-se à primeira empresa da trajetória, não ao CNPJ atual.
- WG/Build.tech: criada em 2025.
- Grupo: quatro núcleos; Turnkey é modelo integrado, não quinto núcleo.
- Não publicar 480+ clientes, 1.000+ propostas, 284/285+, R$10M+ ou métricas HOLD.
- Não apresentar William como conselheiro formal de board sem prova.
- URL canônica da pessoa: `https://wgalmeida.com.br/william-almeida`.
- LinkedIn canônico conhecido: `https://www.linkedin.com/in/wgalmeida/`.

---

### Task 1: Contrato de identidade e rota William

**Files:**
- Modify: `src/__tests__/institutionalIdentity.test.js`
- Modify: `src/App.jsx`
- Create: `src/pages/WilliamAlmeida.jsx`

**Interfaces:**
- Consumes: `SEO`, `SCHEMAS.personWilliam`, `SCHEMAS.profileWilliam`.
- Produces: rota pública `/william-almeida` e página com copy canônica.

- [ ] **Step 1: Write the failing tests**

Adicionar testes que exijam:
```js
const app = read('src/App.jsx')
const william = read('src/pages/WilliamAlmeida.jsx')
expect(app).toContain('path="/william-almeida"')
expect(william).toContain('Founder, Operator & Builder')
expect(william).toContain('Advisor Estratégico')
expect(william).toContain('Desde 2011')
expect(william).toContain('WG/Build.tech')
expect(william).not.toContain('480+')
expect(william).not.toContain('1.000+')
```

- [ ] **Step 2: Run test to verify RED**

Run: `node ./tools/run-vitest.mjs run src/__tests__/institutionalIdentity.test.js`
Expected: FAIL porque a rota/página ainda não existem.

- [ ] **Step 3: Implement minimal route/page**

Adicionar lazy import e rota em `App.jsx`. Criar `WilliamAlmeida.jsx` com hero, trajetória, princípios, método, projetos PUBLIC_ALLOWED, advisory e CTA.

- [ ] **Step 4: Run test to verify GREEN**

Run: `node ./tools/run-vitest.mjs run src/__tests__/institutionalIdentity.test.js`
Expected: PASS.

### Task 2: Knowledge graph e SEO canônico

**Files:**
- Modify: `src/data/schemaConfig.js`
- Modify: `src/data/seoConfig.js`
- Modify: `src/components/SEO.jsx`
- Test: `src/__tests__/institutionalIdentity.test.js`

**Interfaces:**
- Produces: `SCHEMAS.personWilliam`, `SCHEMAS.profileWilliam`, `SCHEMAS.breadcrumbWilliam`.

- [ ] **Step 1: Write failing schema tests**

```js
const schema = read('src/data/schemaConfig.js')
const seo = read('src/data/seoConfig.js')
const seoComponent = read('src/components/SEO.jsx')
expect(schema).toContain('/william-almeida#person')
expect(schema).toContain('ProfilePage')
expect(schema).toContain('Advisor Estratégico')
expect(schema).toContain('https://www.linkedin.com/in/wgalmeida/')
expect(schema).not.toContain('CEO e Diretor de Arquitetura')
expect(schema).not.toContain('WG_Build.tech')
expect(seo).toContain('"/william-almeida"')
expect(seoComponent).toContain("url: 'https://wgalmeida.com.br/william-almeida'")
```

- [ ] **Step 2: Verify RED**

Run the institutional identity test and confirm expected failures.

- [ ] **Step 3: Implement graph**

Move `PERSON_WILLIAM_ID` to `/william-almeida#person`; add `ProfilePage`; expand `knowsAbout`; add LinkedIn `sameAs`; update Article author URL and title; correct residual `WG_Build.tech`.

- [ ] **Step 4: Verify GREEN**

Run the test again and confirm PASS.

### Task 3: Internal linking and About handoff

**Files:**
- Modify: `src/pages/About.jsx`
- Test: `src/__tests__/institutionalIdentity.test.js`

- [ ] **Step 1: Write failing test**

```js
const about = read('src/pages/About.jsx')
expect(about).toContain('to="/william-almeida"')
```

- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Add contextual CTA from William section to dedicated landing**
- [ ] **Step 4: Verify GREEN**

### Task 4: SEO route discovery and public-claims gates

**Files:**
- No production file required unless a gate finds a gap.

- [ ] Run `node ./tools/audit-public-claims.mjs --strict`.
- [ ] Run `node ./scripts/check-imports.mjs`.
- [ ] Run `node ./scripts/audit-i18n-public-keys.mjs`.
- [ ] Run `node ./scripts/audit-brand-visual-tokens.mjs`.
- [ ] Run `node ./scripts/audit-structural.mjs`.
- [ ] Run `node ./scripts/audit-consistency.mjs --strict`.
- [ ] Run full Vitest suite.

### Task 5: Build, sitemap, SEO dist validation

- [ ] Generate required assets/OG.
- [ ] Run Vite production build.
- [ ] Audit production React bundle.
- [ ] Prune unused media.
- [ ] Generate SEO routes/sitemaps.
- [ ] Run SEO audit.
- [ ] Run `seo-validate-dist`.
- [ ] Confirm `/william-almeida` is present in generated route/sitemap output.
- [ ] Run `git diff --check`.

### Task 6: Review, commit, PR and production verification

- [ ] Review exact diff and ensure no WIP from canonical checkout entered branch.
- [ ] Commit only intended files with message `feat(identity): publish William Almeida entity page`.
- [ ] Push branch and create PR to `main`.
- [ ] Wait for CI/Vercel preview checks.
- [ ] Merge only when clean/mergeable and checks pass.
- [ ] Verify canonical Vercel project/domain before promotion.
- [ ] Smoke `https://wgalmeida.com.br/william-almeida`.
- [ ] Verify title, description, visible copy and JSON-LD contain canonical William identity and no blocked claims.
