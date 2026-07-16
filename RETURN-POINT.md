# RETURN-POINT — Auditoria SEO Recorrente · wgalmeida.com.br

> Atualizado automaticamente pela rotina Liz SEO Bot a cada 5 dias.
> Ambiente: Remote container (Claude Code on the web) — egress para `wgalmeida.com.br` bloqueado pela política de rede do proxy; scores marcados **(proxy)** são calculados localmente.

---

## Auditoria Atual — 2026-07-16

### Tabela de Saúde SEO

| Métrica                        | Valor          | Status     |
|--------------------------------|----------------|------------|
| AI Readiness Score (proxy)     | 85/100         | OK         |
| Rotas no Sitemap (local)       | 161            | OK (≥145)  |
| SEO frontmatter assets         | 152/152 OK     | ✅ RESOLVIDO |
| Audit de consistência          | OK             | OK         |
| Audit estrutural               | OK             | OK         |
| Brand visual tokens            | OK (138 files) | OK         |
| I18n public keys               | OK (227 keys)  | OK         |
| Check imports                  | OK             | OK         |
| npm vulnerabilities            | 11 (1L/6M/4H)  | MÉDIA      |
| PageSpeed (LCP/CLS)            | Indisponível   | N/A        |
| Sitemap live (curl)            | Bloqueado (proxy 403) | N/A |

### AI Readiness Score — 85/100 (proxy)

Score calculado localmente a partir das auditorias de código, pois o ambiente remoto não tem acesso de rede ao domínio ao vivo:

| Componente               | Pontos   | Status       |
|--------------------------|----------|--------------|
| Sitemap 161 rotas        | 20/20    | OK           |
| Build limpo (último OK)  | 15/15    | OK           |
| Lint/imports limpos      | 10/10    | OK           |
| I18n 3 idiomas, 227 keys | 15/15    | OK           |
| Brand visual tokens      | 10/10    | OK           |
| SEO frontmatter 152/152  | 15/15    | **+3 vs anterior** |
| Audit estrutural         | 10/10    | OK           |
| Desconto (sem PageSpeed) | -10      | Sem API key  |
| **Total**                | **85/100** | ↑ de 82    |

### Alertas

| Severidade | Descrição |
|------------|-----------|
| ✅ RESOLVIDO | 2 assets de frontmatter ausentes corrigidos: `gestao-vs-mestre-obras.webp` e `sob-medida-vs-planejados.webp` agora existem em `public/images/blog/` |
| MÉDIA | 11 vulnerabilidades npm (1 low, 6 moderate, 4 high) — 1 a menos que na auditoria anterior; recomendado `npm audit fix` |
| INFO | Scripts `ai-readiness-audit.js` e `pagespeed-monitor.js` existem no repo, mas retornam HTTP 403 (proxy bloqueia egress para o domínio ao vivo) |
| INFO | Validação live do sitemap e PageSpeed impossível — ambiente sem acesso de rede ao domínio `wgalmeida.com.br` |

### Notas da Execução

- **Ambiente**: Remote container (Claude Code on the web). Egress para `wgalmeida.com.br` bloqueado pela política de rede (HTTP 403 no proxy CONNECT).
- **AI readiness audit**: Script rodou, mas retornou 0/100 por HTTP 403 (falso negativo de rede — não é problema do site).
- **PageSpeed**: 429 rate limit (sem `PAGESPEED_API_KEY` no `.env`).
- **Todas as auditorias locais passaram**: consistência, estrutural, brand visual tokens, i18n keys, check imports.
- **SEO frontmatter**: 152/152 — melhora em relação às auditorias anteriores (2 assets corrigidos).
- **npm audit**: 11 vulnerabilidades (era 12 na auditoria de 2026-06-26).

### Plano de Ação — Próximos 5 Dias (até 2026-07-21)

1. **[MÉDIA] Executar `npm audit fix`** — resolver as 11 vulnerabilidades npm sem breaking changes.
2. **[MÉDIA] Configurar `PAGESPEED_API_KEY`** — adicionar chave ao `.env` para desbloquear métricas Core Web Vitals (LCP, CLS, INP).
3. **[INFO] Solicitar liberação de egress de rede** — adicionar `wgalmeida.com.br` ao allowlist do ambiente remoto para validação live do sitemap e AI Readiness Score real.
4. **[INFO] Monitorar npm vulnerabilities** — se a contagem de `high` não cair com `npm audit fix --force`, revisar manualmente os pacotes afetados.
5. **[MANUTENÇÃO] Validar build de produção local** — executar `npm run build:local` para confirmar que as novas imagens de blog estão sendo incluídas corretamente no bundle.

### Próxima Auditoria

- **Data prevista**: 2026-07-21
- **Responsável**: Liz SEO Bot (rotina automática)

---

## Histórico das Últimas 3 Auditorias

| Data       | AI Readiness (proxy) | Sitemap | Alertas Críticos | Alertas Médios | Delta             |
|------------|---------------------|---------|------------------|----------------|-------------------|
| 2026-07-16 | **85/100**          | 161     | 0                | 1              | ↑ +3 pts; 2 assets SEO corrigidos; npm -1 vuln |
| 2026-06-26 | 82/100              | 161     | 0                | 4              | Estável vs anterior |
| 2026-06-21 | 82/100              | 161     | 0                | 4              | Baseline          |
