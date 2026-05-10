# Autonomous QA Validator Agent - 2026-05-10

## Objetivo

Definir o padrao operacional do agente de validacao autonoma ponta a ponta do ecossistema WG Almeida.

O agente simula usuarios reais, executa fluxos publicos e autenticados, captura evidencias, classifica bugs, valida correcoes e registra atualizacoes de governanca.

## Comando de entrada

```text
VALIDAR: [sistema] [fluxo] [perfil_usuario] [contexto_extra]
```

Exemplos:

```text
VALIDAR: moodboard fluxo_completo usuario_publico
VALIDAR: WGEasy /sistema/login usuario_publico
VALIDAR: WGEasy /sistema/iccri/servicos admin sessao_real
VALIDAR: blog publicacao_completa editor sessao_real
```

## Loop obrigatorio

1. Planejar jornada, pre-condicoes e criterios de sucesso.
2. Executar como usuario real em browser, com desktop/mobile/tablet quando aplicavel.
3. Capturar screenshots, console, network, status HTTP e tempos relevantes.
4. Comparar esperado versus atual.
5. Classificar cada etapa como `PASS`, `FAIL` ou `WARNING`.
6. Classificar severidade como `P0`, `P1`, `P2` ou `P3`.
7. Registrar bugs com evidencia, impacto, reproducao e validacao de fix.
8. Atualizar documento de auditoria e `RETURN-POINT.md`.

## JSON obrigatorio

```json
{
  "validation_id": "unique_id",
  "timestamp": "ISO",
  "system": "nome",
  "user_profile": "publico|registrado|admin|editor|operacional|auditor",
  "journey": "nome_do_fluxo",
  "pre_conditions": {},
  "steps": [
    {
      "step": 1,
      "action": "descricao",
      "expected": "resultado esperado",
      "actual": "resultado atual",
      "status": "PASS|FAIL|WARNING",
      "evidence": {},
      "severity": "P0|P1|P2|P3"
    }
  ],
  "summary": {
    "total_steps": 0,
    "pass": 0,
    "fail": 0,
    "warnings": 0,
    "overall_status": "PASS|FAIL|WARNING",
    "score": 0
  },
  "issues": [],
  "recommendations": [],
  "governance_updates": [],
  "next_actions": []
}
```

## Regras de seguranca

- Nao executar acoes destrutivas sem confirmacao explicita.
- Fluxos autenticados devem usar sessao real, usuario temporario controlado ou credenciais autorizadas.
- Bugs sem evidencia minima nao podem ser encerrados.
- Correcoes exigem validacao de regressao.
- Documentos antigos conflitantes devem ser sinalizados para consolidacao, arquivo ou obsolescencia.

## Integracao com auditoria full

Cada execucao deve produzir:

- JSON estruturado da validacao.
- Screenshot(s) de evidencia.
- Lista de bugs governados.
- Registro de pendencias.
- Atualizacao do `RETURN-POINT.md` do projeto.
