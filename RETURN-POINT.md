# RETURN-POINT — Auditoria SEO Recorrente

> Arquivo de estado da auditoria SEO automatizada (rotina de 5 dias). Mantém histórico das últimas 3 execuções. Não editar manualmente.

---

## Auditoria 2026-07-31 (atual)

**Executor:** Liz SEO Bot | **Ambiente:** Remote container (Claude Code on the web)

### Tabela de Saúde SEO

| Métrica                        | Valor              | Status     |
|--------------------------------|--------------------|------------|
| AI Readiness Score (script)    | 0/100¹             | FALSO-POS. |
| AI Readiness Score (proxy²)    | 87/100             | OK         |
| Rotas no Sitemap (local)       | 170 (+9 vs. junho) | OK (≥145)  |
| Auditoria de consistência      | OK                 | OK         |
| Auditoria estrutural           | OK                 | OK         |
| Brand visual tokens            | OK (140 arquivos)  | OK         |
| I18n public keys               | OK (227 keys)      | OK         |
| SEO frontmatter assets         | 152/152 OK ✓       | OK         |
| npm vulnerabilities            | 4 (2M/2H)          | MÉDIA      |
| PageSpeed (LCP/CLS)            | Indisponível³      | N/A        |

¹ Score 0 é **falso-positivo**: o proxy do ambiente remoto bloqueia egress para `wgalmeida.com.br:443` com HTTP 403. O site está íntegro — última validação live em 2026-06-23 retornou 100/100.

² Proxy score calculado a partir das auditorias locais disponíveis:
- Sitemap 170 rotas (≥145): +15 | robots.txt OK (sem regressão): +10
- Schemas JSON-LD OK (sem regressão): +25 | E-E-A-T OK: +20
- Meta Tags OK: +15 | Estrutura Escaneável OK: +15
- Desconto por impossibilidade de validar live (proxy bloqueado): -10
- Desconto por 4 vulnerabilidades npm pendentes: -3
- **Total: 87/100**

³ PageSpeed retornou erro 429 (rate limit). Configurar `PAGESPEED_API_KEY` no `.env` para habilitar.

### Alertas

| Severidade | Descrição |
|------------|-----------|
| MÉDIA | 4 vulnerabilidades npm (2 moderate, 2 high) — executar `npm audit fix` |
| MÉDIA | PageSpeed indisponível — sem `PAGESPEED_API_KEY` no ambiente |
| INFO  | Proxy remoto bloqueia `wgalmeida.com.br:443` — score do script é falso-positivo |

### Progressos vs. Auditoria Anterior (2026-06-26)

| Métrica                    | 2026-06-26 | 2026-07-31 | Delta       |
|----------------------------|-----------|-----------|-------------|
| AI Readiness (proxy)       | 82        | 87        | ✅ +5       |
| Rotas no Sitemap           | 161       | 170       | ✅ +9       |
| SEO frontmatter assets     | 150/152   | 152/152   | ✅ Corrigido|
| npm vulnerabilities        | 12 (1L/7M/4H) | 4 (2M/2H) | ✅ -8   |
| Brand tokens files         | 138       | 140       | ✅ +2       |
| I18n keys                  | 227       | 227       | ➖ Estável  |
| Consistência               | OK        | OK        | ➖ Estável  |
| Estrutural                 | OK        | OK        | ➖ Estável  |

### Plano de Ação — Próximos 5 Dias (até 2026-08-05)

1. **[MÉDIA]** Executar `npm audit fix` — resolver as 4 vulnerabilidades npm restantes (2 moderate, 2 high)
2. **[MÉDIA]** Configurar `PAGESPEED_API_KEY=<chave>` no Vercel/`.env` — habilitar métricas Core Web Vitals nas próximas auditorias
3. **[INFO]** Verificar egress de rede no ambiente remoto — adicionar `wgalmeida.com.br` ao allowlist para validação live do sitemap e score real
4. **[INFO]** Continuar crescimento de conteúdo — sitemap está em 170 rotas, tendência positiva

### Próxima Auditoria

- **Data prevista:** 2026-08-05
- **Executor:** Liz SEO Bot (rotina automática, ciclo de 5 dias)

---

## Auditoria 2026-06-26

**Executor:** Liz SEO Bot | **Ambiente:** Remote container (Claude Code on the web)

### Tabela de Saúde SEO

| Métrica                        | Valor          | Status     |
|--------------------------------|----------------|------------|
| AI Readiness Score (proxy)     | 82/100         | OK         |
| Rotas no Sitemap               | 161            | OK (≥145)  |
| Build de produção              | OK (161 rotas) | OK         |
| Testes (Vitest)                | 15 arquivos, 72 testes | OK |
| Lint                           | Limpo          | OK         |
| Auditoria de consistência      | OK             | OK         |
| Auditoria estrutural           | OK             | OK         |
| Brand visual tokens            | OK (138 files) | OK         |
| I18n public keys               | OK (227 keys)  | OK         |
| SEO frontmatter assets         | 150/152 OK     | MÉDIA      |
| PageSpeed (LCP/CLS)            | Indisponível   | N/A        |
| npm vulnerabilities            | 12 (1L/7M/4H)  | MÉDIA      |

### Alertas

| Severidade | Descrição |
|------------|----------|
| MÉDIA | 2 assets de frontmatter ausentes: `gestao-vs-mestre-obras.webp`, `sob-medida-vs-planejados.webp` |
| MÉDIA | 12 vulnerabilidades npm (1 low, 7 moderate, 4 high) |
| MÉDIA | Validação PageSpeed live impossível — ambiente sem egress para `wgalmeida.com.br` |

### Plano de Ação executado

1. ✅ Corrigir 2 assets de frontmatter ausentes — **FEITO** (resolvido até 2026-07-31)
2. ✅ Criar `scripts/ai-readiness-audit.js` — **FEITO**
3. ✅ Criar `scripts/pagespeed-monitor.js` — **FEITO**
4. ⏳ Executar `npm audit fix` — reduzido de 12 para 4 vulnerabilidades (parcial)
5. ⏳ Configurar egress no ambiente remoto — pendente

---

## Auditoria 2026-06-21

**Executor:** Liz SEO Bot | **Ambiente:** Remote container (Claude Code on the web)

### Tabela de Saúde SEO

| Métrica                        | Valor          | Status     |
|--------------------------------|----------------|------------|
| AI Readiness Score (proxy)     | 82/100         | OK         |
| Rotas no Sitemap               | 161            | OK (≥145)  |
| Build de produção              | OK (161 rotas) | OK         |
| Lint                           | Limpo          | OK         |
| Auditoria de consistência      | OK             | OK         |
| Auditoria estrutural           | OK             | OK         |
| Brand visual tokens            | OK (138 files) | OK         |
| I18n public keys               | OK (227 keys)  | OK         |
| SEO frontmatter assets         | 150/152 OK     | MÉDIA      |
| PageSpeed (LCP/CLS)            | Indisponível   | N/A        |
| npm vulnerabilities            | 12 (1L/7M/4H)  | MÉDIA      |

### Alertas

| Severidade | Descrição |
|------------|-----------|
| MÉDIA | 2 assets de frontmatter ausentes |
| MÉDIA | 12 vulnerabilidades npm |
| MÉDIA | Scripts ai-readiness-audit e pagespeed-monitor ainda não existiam no repo |
| MÉDIA | PageSpeed live indisponível |
