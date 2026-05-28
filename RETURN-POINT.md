# SEO & IA — RETURN-POINT
> Atualizado em: 2026-05-27 | Branch: fix/seo-schema-sitemap

## Status: PRONTO PARA MERGE E DEPLOY

---

## Ciclo Atual — Concluído Tecnicamente

### Ações Executadas (Sessão 2026-05-27)
1. **Restauração de Build:** `vite.config.js` restaurado via PowerShell bit-a-bit, resolvendo erros de parsing Unicode.
2. **Schemas JSON-LD:** Scripts `Organization`, `Person` e `FAQPage` injetados no `index.html` via `public/schemas/`.
3. **Sitemap:** Build executado com sucesso → `dist/sitemap.xml` com **161 rotas**.
4. **Scripts de Auditoria Criados:**
   - `scripts/pagespeed-monitor.js` — Core Web Vitals via PageSpeed API (mobile + desktop)
   - `scripts/ai-readiness-audit.js` — Score 0-100 de prontidão para LLMs
   - `scripts/submit-sitemap.cjs` — Submissão do sitemap ao Google Search Console
5. **Relatório inicial gerado:** `reports/seo/latest/ai-readiness-2026-05-27.json` — Score: **75/100**
6. **Governança:** AGENTS.md e RETURN-POINT.md atualizados com regras SEO & IA.

---

## Métricas da Última Auditoria

| Check | Status | Detalhe |
|---|---|---|
| Sitemap XML | ✅ PASS | 161 rotas detectadas |
| robots.txt | ✅ PASS | Googlebot permitido, sitemap declarado |
| E-E-A-T | ✅ PASS | Autoria William Almeida, casos reais |
| Meta Tags (SEO/OG) | ✅ PASS | title, description, canonical, og:title, og:image |
| Estrutura Escaneável | ✅ PASS | h1, FAQ, lang=pt-BR |
| Schemas JSON-LD | ⚠️ ALERTA | Apenas 2/5 schemas em produção (deploy pendente) |

**AI Readiness Score: 75/100** — Sobe para ~95/100 após deploy dos schemas.

---

## Pendências Obrigatórias (Ação Manual)

1. **Merge no GitHub:**
   - Branch: `fix/seo-schema-sitemap` → `main`
   - PR já criado na sessão atual.

2. **Deploy Vercel (após merge):**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Submeter Sitemap ao Google Search Console:**
   ```bash
   node scripts/submit-sitemap.cjs
   ```
   Ou manualmente: `https://search.google.com/search-console` → Sitemaps → Adicionar `https://wgalmeida.com.br/sitemap.xml`

4. **(Opcional) API Key PageSpeed:**
   - Configure `PAGESPEED_API_KEY=` no `.env` para remover rate-limit da auditoria.
   - Obtenha em: https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com

---

## Rotina de Auditoria Recorrente (a cada 5 dias)

```bash
node scripts/pagespeed-monitor.js   # Core Web Vitals (requer PAGESPEED_API_KEY para sem rate-limit)
node scripts/ai-readiness-audit.js  # Score AI Readiness (0-100)
```

Relatórios salvos em: `reports/seo/latest/`

**Critérios de alerta:**
- LCP > 2.5s → ALTA
- CLS > 0.1 → ALTA
- AI Readiness < 60 → CRÍTICO
- "Crawled - currently not indexed" sobe >10% no GSC → INCIDENTE

---

## Próxima Auditoria: 2026-06-01

Schemas faltantes em produção (Person, FAQPage, BreadcrumbList) são esperados antes do deploy.
Após deploy, re-executar `node scripts/ai-readiness-audit.js` para confirmar score ≥ 90.
