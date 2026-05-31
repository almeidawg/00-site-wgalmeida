# Log de Auditorias SEO Recorrentes — site-wgalmeida

Histórico de auditorias SEO automáticas do site https://wgalmeida.com.br.
O conteúdo completo de cada auditoria também é registrado em `RETURN-POINT.md`.

---

## Auditoria SEO — 2026-05-31 (Liz SEO Bot)

**Data:** 2026-05-31
**Próxima auditoria:** 2026-06-05
**Branch auditada:** `main` (HEAD `af80674`)
**Executor:** Liz SEO Bot (Claude Code on the web)

### Tabela de Saúde SEO

| Indicador | Valor | Status |
|---|---|---|
| AI Readiness Score | N/A — script não encontrado | ⚠️ PENDENTE |
| Rotas no sitemap (local `public/sitemap.xml`) | 161 | ✅ OK |
| Rotas no sitemap (produção) | Inacessível — rede bloqueada¹ | ⚠️ INACESSÍVEL |
| i18n Public Keys Audit | 227 chaves / OK | ✅ OK |
| Brand Visual Tokens Audit | 138 arquivos / OK | ✅ OK |
| Structural Audit | OK | ✅ OK |
| Consistency Audit (anti-drift) | OK — sem regressão | ✅ OK |
| SEO Audit — frontmatter assets | 2 assets ausentes | 🟡 MÉDIA |
| Vitest (testes automatizados) | 15 arquivos / 72 testes — OK | ✅ OK |
| PageSpeed / LCP | N/A — script não encontrado | ⚠️ PENDENTE |

¹ Ambiente de execução remoto (Claude Code on the web) com política de rede restritiva:
`curl https://wgalmeida.com.br/sitemap.xml` retornou HTTP 403 "Host not in allowlist".
O sitemap local `public/sitemap.xml` tem 161 rotas — dentro do esperado (limite crítico: 145).

### Alertas

| Severidade | Achado | Ação Recomendada |
|---|---|---|
| MÉDIA | `scripts/ai-readiness-audit.js` não existe no repo | Criar script ou remover da missão de auditoria |
| MÉDIA | `scripts/pagespeed-monitor.js` não existe no repo | Criar script ou remover da missão de auditoria |
| MÉDIA | `arquiteto-vs-mestre-de-obras-direto.md` → `/images/blog/gestao-vs-mestre-obras.webp` ausente | Adicionar imagem ou corrigir path no frontmatter |
| MÉDIA | `marcenaria-sob-medida-vs-planejados.md` → `/images/blog/sob-medida-vs-planejados.webp` ausente | Adicionar imagem ou corrigir path no frontmatter |

### Evidências de Execução

Scripts tentados e resultado:

```
node scripts/ai-readiness-audit.js
# Error: Cannot find module — script não existe no repo

node scripts/pagespeed-monitor.js
# Error: Cannot find module — script não existe no repo

curl -s https://wgalmeida.com.br/sitemap.xml | grep -c '<loc>'
# HTTP 403 "Host not in allowlist" — rede bloqueada no ambiente remoto

cat public/sitemap.xml | grep -c '<loc>'
# 161 ← sitemap local saudável
```

Scripts disponíveis e resultado:

```
node scripts/audit-i18n-public-keys.mjs
# public i18n literal key audit OK: 227 keys checked across pt-BR, en, es

node scripts/audit-brand-visual-tokens.mjs
# brand visual token audit OK: 138 files checked

node scripts/audit-structural.mjs
# Audit estrutural site-wgalmeida OK

node scripts/audit-consistency.mjs
# Audit OK (sem regressão nova)

npm run seo:audit
# markdown checked: 152
# missing frontmatter assets: 2
#   - src/content/blog/arquiteto-vs-mestre-de-obras-direto.md → /images/blog/gestao-vs-mestre-obras.webp
#   - src/content/blog/marcenaria-sob-medida-vs-planejados.md → /images/blog/sob-medida-vs-planejados.webp

npm run verify:fast
# Test Files: 15 passed (15)
# Tests: 72 passed (72)
```

### Observações

- Nenhum alerta CRÍTICO ou ALTA encontrado nesta auditoria.
- Todos os audits disponíveis no repo passaram sem regressão.
- Sitemap local saudável: 161 rotas (limite crítico de alerta é 145).
- A produção não foi acessível pelo ambiente remoto — validação do sitemap de produção
  deve ser feita manualmente via GSC ou em ambiente com rede liberada.
- Os 2 assets de frontmatter ausentes não bloqueiam build nem indexação das rotas afetadas,
  mas causam `og:image` quebrado nesses 2 artigos.
- Push direto para `main` bloqueado por branch protection (2 checks obrigatórios).
  Commit `305d696` está no branch local; este PR aplica o log via branch separada.

### Plano de Ação — Próximos 5 Dias

| Dia | Data | Ação | Responsável |
|---|---|---|---|
| 1 | 2026-06-01 | Criar `scripts/ai-readiness-audit.js` (schema.org, meta OG, canonical, hreflang) | Dev |
| 2 | 2026-06-02 | Criar `scripts/pagespeed-monitor.js` (PSI API v5, LCP, CLS, FID) | Dev |
| 3 | 2026-06-03 | Adicionar imagens: `gestao-vs-mestre-obras.webp` e `sob-medida-vs-planejados.webp` | Editorial |
| 4 | 2026-06-04 | Validar sitemap em produção via GSC e conferir indexação | SEO |
| 5 | 2026-06-05 | Executar próxima auditoria recorrente com scripts criados | Liz SEO Bot |

---

### Histórico

| Data | AI Readiness | Sitemap (local) | Alertas Críticos | Altos | Médios |
|---|---|---|---|---|---|
| 2026-05-31 | N/A (script ausente) | 161 ✅ | 0 | 0 | 4 |
