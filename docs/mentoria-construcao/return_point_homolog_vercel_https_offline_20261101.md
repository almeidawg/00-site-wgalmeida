# Return point — Mentoria, pipeline Vercel e homologação offline (2026-11-01)

## Identidade validada
- Produto: Mentoria Estratégica Individual (site institucional WG Almeida); domínio `mentoria.wgalmeida.com.br`.
- Repositório `almeidawg/00-site-wgalmeida`; branch isolada `feat/mentoria-consent-site-20261101`; worktree `E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101`.
- HEAD de partida `953b496250efd217fe4de9558a76137839f9b2f7`, working tree limpa antes de testes.
- Projeto Vercel acessível `site-wgalmeida`, id `prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM`, team `grupo-wg-almeida-vercel-projects`, id `team_PZqrfArEACLjprLuIKVVA7Ch`.
- Referência legada `site-wgalmeida-repo-fixed` sob `william-almeidas-projects` não resolvida: API 403 nesse escopo e 404 para o nome no tenant acessível. Não inferir equivalência automática.

## Evidências remotas read-only
- O deployment `dpl_7ZMYnoUa6PGAe4TyQGNxc4VuDeAy` estava READY, proveniente do GitHub, branch `chore/seo-audit-2026-11-01`, SHA `13b8fe4e413a51ae9606f240f1fbd196353154e6` — NÃO do commit local `953b496`.
- Os eventos reais deste deployment registram `Running "vercel build"`, `Running "install" command: npm ci` e `Running "npm run build"`. Logo, o pipeline desse deployment percorreu o script npm de build.
- Os mesmos logs exibem o script do checkout remoto antigo terminando com `vite build` e pós-processamentos SEO, sem `check-mentoria-commercial-build-gate.mjs`. Isso NÃO demonstra a presença da proteção nova em Vercel.
- Vercel confirmou os domínios `mentoria.wgalmeida.com.br`, `wgalmeida.com.br` e `www.wgalmeida.com.br` como vinculados/verificados ao projeto acessível.
- HEAD HTTP em `https://mentoria.wgalmeida.com.br/`: `200 OK`, `Server: Vercel`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Robots-Tag: noindex, nofollow`. Somente a landing pública foi testada, não um serviço de consentimento.
- Log de `npm ci` do deployment declarou `19 vulnerabilities (17 moderate, 2 high)`; é sinal para triagem separada por dependência/ambiente, NÃO prova de vulnerabilidade explorável em produção.

## Evidências locais atuais
- `node ./tools/check-mentoria-commercial-build-gate.mjs`: PASS, consent/OTP não montados.
- Quatro testes específicos (build gate, consent boundary, opt-in, release gate): 39/39 PASS.
- `node ./tools/run-vitest.mjs run`: 62 arquivos e 297/297 testes PASS.
- `npm run lint`: PASS (exit 0).
- `node ./node_modules/vite/bin/vite.js build --outDir dist-mentoria-homolog-20261101`: PASS (exit 0), com `[mentoria-commercial-vite-gate] PASS`, compilação direta Vite com 2076 módulos transformados.
- O teste global atualizou temporariamente o snapshot rastreado `src/__tests__/__snapshots__/example.test.jsx.snap`. Backup em `dist/mentoria-homolog-backups-20261101/example.test.jsx.snap.before-restore`; restauração seletiva efetuada, árvore Git de volta a limpa.
- O build isolado ficou em artefato local ignorado, sem publicação.

## Critérios ainda não homologados (FAIL_CLOSED)
1. Build: evidência do comando de um deployment remoto está comprovada, mas settings/overrides atuais e execução remota do commit protegido `953b496` não. Se houver build alternativo, obrigar release gate no pipeline canônico.
2. HTTPS comercial: não existe endpoint do boundary independente montado. A página estática HTTPS saudável não certifica o serviço nem o proxy confiável.
3. Identidade: `authenticateLeadSession` é interface injetada offline, sem prova de sessão HttpOnly assinada, CSRF server-side, expiração e autorização reais.
4. OTP: `beginChallenge`/`confirmChallenge` são portas contratuais. Falta provedor real, antifraude/rate limit, challenge persistido, expiração, atomicidade, custo e consentimento durável. Nenhum OTP/SMS enviado.
5. Jurídico: a aprovação `privacy_legal` em `launch-approvals.json` cobre Pixel Meta, banner e política, NÃO equivale à aprovação jurídica do texto específico `mentoria_commercial_contact` e do recibo revogável. Revisão formal pendente.
6. CRM: gravação WGEasy requer aceite vigente verificado, autorização do fundador e idempotência — não testados ou acionados nesta frente.
7. Publicação: nova autorização explícita do owner para push/merge/deploy/DNS, quaisquer alterações de produção, credenciais, SMS ou integrações reais.

## Aprendizado de governança
- Causa raiz: o get_project não devolvia o Build Command efetivo; usar evidência do log de deployment identificando SHA e branch, nunca tomar `READY` como prova de release da feature local.
- Prevenção: cruzar tenant/project ID, Git ref/SHA, log de build, scripts do mesmo SHA e gate de release. Não extrapolar observação de um deployment para settings futuros.
- Causa de risco residual: boundary/OTP injetados e cobertura unitária não implicam serviço real operacional; cabeçalhos declarados pelo navegador não autenticam a sessão.
- Regra futura: `privacy_legal` de marketing/Pixel não pode ser reutilizada como consentimento comercial identificado/OTP; exigir texto legal aprovado e trilha de revogação.
- Validação: evidências remotas read-only + teste local direto do Vite + regressão + lint + Git preservado.

## Fechamento
RESOLVIDO: identidade Git/tenant Vercel; Build Command observado no deployment; HTTPS público da landing; gates e regressão locais.

PENDENTE: configuração/override atual e build remoto com novo commit; serviço HTTPS comercial, autenticação, OTP, aviso jurídico e CRM reais.

RISCO VISTO: deployment examinado não contém gate novo; proteções apenas locais até publicação autorizada. Log npm reporta 2 vulnerabilidades high no conjunto instalado, sujeito a triagem.

Status: PARCIAL / FAIL_CLOSED. Nenhum push, merge, deploy, restart, DNS, SMS, acesso WhatsApp pessoal ou gravação WGEasy realizado.
