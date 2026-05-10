# Governanca Anti-Reincidencia - site-wgalmeida

## Incidente de 09/05/2026

Em 09/05/2026, a producao do `wgalmeida.com.br` foi sobrescrita por uma versao inferior do site a partir de uma branch/hotfix que nao continha o conjunto completo validado do site novo.

A branch correta era `feature/buildtech-vitrine-star-20260502`, com video de intro, BuildTech, moodboard, revista/blog atualizados e estrutura visual aprovada. O erro operacional foi promover uma versao antiga sem validacao visual final e sem a `main` refletir exatamente o estado aprovado.

## Causa raiz

- `main` nao estava alinhada com a versao realmente aprovada em preview/producao.
- Houve deploy de branch nao canonica antes de consolidar merge/PR.
- Nao havia checkpoint operacional forte o bastante impedindo `vercel --prod` fora da `main`.
- O historico de branch antiga carregava sinais que bloquearam GitGuardian na PR #60.
- `RETURN-POINT.md` nao estava servindo como unico ponto de verdade para branch canonica, deploy e validacao final.

## Regras obrigatorias

1. NUNCA rodar `vercel --prod` de branch hotfix sem validacao visual completa e PR aprovada.
2. `main` SEMPRE reflete exatamente o que esta em producao.
3. Qualquer divergencia entre branches deve ser resolvida por merge + PR antes do deploy.
4. Deploy de producao so pode sair de `main`, com `HEAD` local igual a `origin/main`.
5. Antes de deploy, validar checks obrigatorios do PR: GitGuardian, CI, deploy gate e Vercel Preview.
6. Antes de deploy, confirmar visualmente em ambiente local/preview: video, BuildTech, moodboard, blog, revista, mobile e ausencia de texto antigo bloqueado.
7. Depois de deploy, validar o dominio final publico, nao apenas a URL Vercel.
8. Se GitGuardian bloquear por historico antigo, criar PR limpa/squash a partir de `origin/main`; nao promover branch contaminada.
9. `RETURN-POINT.md` deve registrar branch canonica, merge commit, deploy URL, alias, data/hora, checklist e responsavel.
10. Limpeza de branches/deploys antigos deve ser tratada como bloco de governanca separado, com evidencias preservadas e sem apagar rastreabilidade do incidente.

## Estado canonico apos correcao

- Data: `2026-05-10`.
- Branch canonica: `main`.
- Merge commit canonico: `08143211dea4c9347f86dba26bf555a40a83d8cc`.
- PR canonica: `https://github.com/almeidawg/site-wgalmeida/pull/61`.
- Deploy de producao: `https://site-wgalmeida-gjr6hopwu-william-almeidas-projects.vercel.app`.
- Inspect Vercel: `https://vercel.com/william-almeidas-projects/site-wgalmeida/FQAcXdwJZBL6v6viN7QUaF5E5YBJ`.
- Alias validado: `https://wgalmeida.com.br`.

## Checklist minimo para proximos deploys

- [ ] `git status --short --branch` mostra `main...origin/main` sem mudancas.
- [ ] `git rev-parse HEAD` e `git rev-parse origin/main` sao iguais.
- [ ] PR aprovada e checks verdes.
- [ ] `npm run verify:full` verde ou checks equivalentes verdes no GitHub.
- [ ] Preview validado visualmente em desktop e mobile.
- [ ] `vercel --prod --yes` executado somente de `main`.
- [ ] Dominio final validado com HTTP `200`.
- [ ] Home com video reproduzindo.
- [ ] BuildTech e Moodboard visiveis.
- [ ] Blog/revista sem crash e sem imagens quebradas.
- [ ] Sem `Este conteúdo está bloqueado`.
- [ ] `RETURN-POINT.md` atualizado no mesmo bloco.
