# Return point — High deps remediation preflight (2026-11-02)

## Identidade canônica e escopo
- Produto: site Grupo WG Almeida / Mentoria Estratégica Individual, `https://mentoria.wgalmeida.com.br/mentoria-construcao`.
- Repositório `almeidawg/00-site-wgalmeida`; fonte `main` = `fdc068d2c6fc279444e4ba458b4248c3d17ea480` (GitHub API + `origin/main`).
- Nova worktree isolada `E:\01_WG_Ecosystem\09_TMP\mentoria-dependencies-high-fix-20261102`; branch `fix/mentoria-vite-sharp-high-20261102`, criada em `origin/main` sem tocar outros checkouts.
- Vercel produção `site-wgalmeida` `prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM`, team `team_PZqrfArEACLjprLuIKVVA7Ch`; último deployment lido `dpl_82RwnFKZeTcpXaFAKygJxqaSEaF5`, `READY` e SHA `fdc068d2`. Esta worktree ainda não teve link local `.vercel/project.json` e não está apta para deploy.

## Fonte do risco
- GitHub Actions [auditoria npm completa e --omit=dev](https://github.com/almeidawg/00-site-wgalmeida/actions/runs/41382749017) (run 41382749017, SUCCESS) em PR [#166, draft](https://github.com/almeidawg/00-site-wgalmeida/pull/166), identificou **19 advisory counts**: 2 high e 17 moderate. `--omit=dev`: 0 high e 2 moderate (React Router 6).
- `vite@8.0.16`: advisory high em launch-editor Windows; `npm audit` indica `vite@8.3.5` como correção sem SemVer major.
- `sharp@0.33.5`: múltiplos advisory high nas bibliotecas de imagens de build; `npm audit` indica `sharp@0.35.5` como correção potencialmente incompatível de 0.x.
- `sharp` processa SVG/PNG do repositório por `tools/generate-style-webp-from-svg.mjs` e `tools/generate-about-webp.mjs`; atualização exige verificação de resultado e compatibilidade nativa Windows/Linux.
- Moderates da stack de lint e React Router 6 ficam em iniciativa separada, sem upgrades major às cegas.

## Execução desta etapa
1. Confirmados Git limpo, branch/site/remote, Vercel produção e ausência de lease conflitante.
2. Worktree nova criada sob lease governada; `package.json` e `package-lock.json` copiados para `dist-mentoria-high-remediation-evidence-20261102/` (pasta ignorada), **antes** de qualquer mutação.
3. A tentativa explícita `npm install --save-dev --save-exact vite@8.3.5 sharp@0.35.5` foi **RECUSADA** pelo executor MCP com `Comando bloqueado por politica` (`npm install`). Esse bloqueio tem precedência sobre a intenção do owner: não executar sinônimos (`npm update`, `npm exec` etc.) nem comandar serviço externo para obter o mesmo efeito por fora da política.
4. `package.json` e `package-lock.json` permanecem **inalterados**, versões `vite@8.0.16` e `sharp@0.33.5`. As vulnerabilidades high NÃO foram corrigidas.
5. Para antecipar QA útil sem modificar dependências, criado `src/__tests__/sharpImageGenerationContract.test.js` com **dois testes de contrato sobre imagens totalmente sintéticas**: converte SVG 2400x1200 em WebP 1600x800 sem aumentar tamanho, confirma reexecução sem alteração; processa PNG sintético embutido em SVG em WebP 320x160.
6. `npm ci`: PASS, 838 pacotes instalados; reproduz 19 (17 moderate + 2 high).
7. Novos testes específicos **2/2 PASS**, lint **PASS**.
8. `npm run verify:fast`: **64/64 arquivos, 316/316 testes PASS**, incluindo scanner imports, i18n, brand visual, structural, strict consistency e lint (avisos históricos React act/fetchPriority apenas stderr).
9. `npm run build`: **PASS**, `[mentoria-commercial-build-gate] PASS` e `[mentoria-commercial-vite-gate] PASS`; SEO pós-processado. Consentimento/OTP **continuam NÃO montados**.
10. Sitemaps e snapshot gerados pelo teste/build foram copiados antes/depois para o diretório ignorado e restaurados seletivamente (`git restore --` somente nesses três arquivos), `git diff --check` PASS.
11. Commit local seletivo para novo teste/return point e liberação de leases são esperados no encerramento; registrar SHA depois de validar Git.

## Próximo gate explícito
- É necessário **ajuste aprovado e aplicado na política do executor governado** para permitir especificamente atualização seletiva de `vite` e `sharp`, ou um processo oficial de atualização de dependências, com as permissões efetivas comprovadas. Autorização por chat não remove allowlist.
- Não tratar o bloqueio como permissão para usar comandos equivalentes, editar manualmente lockfile sem integridade ou criar uma tarefa remota que instale por outro canal.
- Com ferramenta aprovada, fazer updates **separados** e compatíveis com SemVer, backup, `npm ci`, run full QA, build, testes específicos, verificação de diffs de ativos WebP, `npm audit --json` e `--omit=dev` oficiais; verificar 0 high após alteração e regressão do site. Só depois PR e merge/deploy com gate do owner.
- Não confundir aceite comercial, Pixel, dados pessoais ou WGEasy com QA de dependências. Backend comercial segue `FAIL_CLOSED`.

## Aprendizado
- Contexto: advisories altos em `vite` e `sharp`, dependências de desenvolvimento, mas usadas nas ferramentas de build.
- Causa operacional: política proíbe `npm install`, enquanto `npm ci` não modifica lockfile. Sem fonte confiável para reconstrução do lock, não é admissível declarar patch instalado.
- Prevenção: governança precisa de fluxo explícito de manutenção de dependências com escopo mínimo e travas anti-`--force`.
- Validação: introduzir regressões de pipeline com imagens sintéticas antes da atualização e revalidá-las com a nova versão; declarar versão real e advisory residual depois do update, nunca inferir do resultado da build antiga.

**RESOLVIDO:** worktree isolada, backups, nova cobertura de testes para pipeline Sharp e baseline CI local 316 PASS.
**PENDENTE:** atualização das versões, remediação dos dois high, npm SCA pós-fix, PR e release.
**RISCO VISTO:** dois high permanecem na toolchain. Nenhum pacote nem produção foi modificado.
**STATUS: PARCIAL / FAIL_CLOSED para remediação de vulnerabilidades; OK para pré-QA local.**
