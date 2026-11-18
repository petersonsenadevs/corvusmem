# 007 — F17: baseline del motor en LongMemEval (abstención por umbral = 0%)

- **Fecha/hora:** 2026-11-11 23:10
- **Tipo:** decisión
- **Mejora a:** 006
- **Tarea:** F17-T2
- **Stack:** node-api

## Qué se hizo
- Baseline del motor de Corvus en LongMemEval, **offline y sin LLM** (recuperación pura sobre turnos crudos,
  `recuperadorMotor` de `tools/eval-productos/recuperar.mjs`), con scripts de medición en el scratchpad
  (streaming, un haystack a la vez, checkpoint; no se tocó código del proyecto — árbol git limpio).
- Dos runs los paró el sistema por RAM (no es fallo del script); el checkpoint capturó lo que importaba.

## Resultado (medido)
| Métrica | n | recall@5 | acierto@5 |
|---|---|---|---|
| knowledge-update | 21 | 73,8% | 90,5% |
| temporal-reasoning | 25 | 58,8% | 76% |
| abstención (`_abs`) | 24 | — | **0% (0/24 se calla)** |
| single-session-user | 40 | 80% | 80% |

## Decisiones (resumen; detalle en DECISIONES.md#dev-007)
- La **abstención no sale de un umbral sobre BM25 de turnos crudos** (0/24). La abstención real necesita
  **ingesta estructurada** (`recuperadorMotorEstructurado`: claves estables, sustitución cronológica).
- No contradice LoCoMo cat5 (5,6%): aquello es end-to-end con LLM, esto es recuperación pura.

## Verificación
- Checkpoint: `scratchpad/lme-dirigido-checkpoint.json` (vistos 387, medidos 70, umbral 0.8).
- `git status -sb` → árbol limpio (sin cambios en el proyecto; medición en scratchpad).

## Próximos pasos
- Visión fijada (memoria Corvus `objetivo.paradigma-memoria`): Corvus = memoria determinista que
  complementa al vector; cada card = mejora medible, no humo.
- Candidata a primera card real: **abstención por ingesta estructurada** (mayor hueco y donde Corvus puede
  ganar, no empatar). Decidir con el usuario si reordena por delante de F17-T2 (ACT-R), que sigue `doing` sin tocar.
