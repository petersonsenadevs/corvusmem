# 004 — F17-T1: afinar el fan-guard NO mejora cat3 (descartado con evidencia)

- **Fecha/hora:** 2026-11-11 11:30
- **Tipo:** decisión
- **Mejora a:** —
- **Tarea:** F17-T1
- **Stack:** node-api

## Qué se hizo
- Baseline por categoría del motor sobre LoCoMo (retrieval puro, offline, sin LLM), 1982 preguntas:
  cat1 19,3% · cat2 59,2% · **cat3 24,3%** · cat4 56,6% · cat5 56,8% (recall@5).
- Hallazgo del código: el motor YA hace spreading activation a 2 saltos (`SALTOS=2`) desde las semillas
  top-3, por enlaces y por nombres compartidos (`redDeNombres`). En el harness cada turno es un hecho sin
  enlaces → la propagación multi-hop depende solo de nombres, y el fan-guard (`fuerzaNombre`/ABANICO:
  nombre en ≥5 hechos → peso 0) la corta en entidades frecuentes.
- **Hipótesis:** aflojar el fan-guard (subir el umbral FAN) deja propagar por entidades frecuentes y sube cat3.
- Parametricé por env (`FAN`, `SALTOS`, `DECAE_NOMBRE`, `MAX_PROP`) con defaults idénticos y **barrí** sobre
  un subset de 4 haystacks (cat3 n=30, baseline 19,2%).

## Resultado del barrido (subset 4 haystacks, cat3 r@5)
| Config | cat3 | cat2 | cat4 | cat5 | TOTAL |
|---|---|---|---|---|---|
| defaults (FAN=5) | 19,2% | 69,6% | 52,4% | 55,5% | 50,1% |
| FAN=8 | 19,2% | 69,6% | 52,1% | 55,5% | 49,9% |
| FAN=12 | 19,2% | 69,2% | 51,4% | 56,1% | 49,6% |
| FAN=20 | **15,0%** | 65,4% | 49,8% | 54,9% | 47,8% |
| FAN=∞ | **11,7%** | 54,6% | 40,4% | 46,5% | 40,0% |
| FAN=12, SALTOS=3 | 19,2% | 69,2% | 51,1% | 56,1% | 49,5% |
| FAN=12, MAX_PROP=8 | 19,2% | 69,2% | 51,4% | 56,1% | 49,6% |

- cat3 **clavado** en 19,2% con FAN=5/8/12 (la propagación por nombres no contribuye a cat3 sobre turnos
  crudos) y **empeora** al aflojar más (ruido que arrastra todas las categorías). SALTOS/MAX_PROP no mueven cat3.

## Decisión (detalle en DECISIONES.md#dev-004)
- **Descartado** el lever "afinar el fan-guard / profundizar la propagación por nombres" para cat3:
  refutado por medición. FAN=5 es lo mejor. Se revierte el andamiaje (`git revert` de 50b6575) para dejar
  el motor limpio (convención: sin código muerto).

## Verificación
- Barrido: `tools/eval-productos/recuperar.mjs` (motor) sobre LoCoMo, 4 haystacks, por categoría.
- Tras el revert: `test-facts` 227/0, `test-hard-recall` 14/0, gate `eval-memoria --gate` ✓ (abstención 100%).

## Commits
- `50b6575` refactor: perillas por env (F17-T1) → **revertido** en este cierre.
- (este devlog) revert + documentación del resultado negativo.

## Próximos pasos (decisión del usuario)
- F17-T1 queda **blocked** (el lever simple no sirve). Opciones:
  1. **Rescope F17-T1**: multi-hop real necesita otro mecanismo (grafo de co-ocurrencia del CONTENIDO del
     corpus, no de nombres ni de uso; o expansión de consulta multi-hop) — esfuerzo mayor, con guardia de abstención.
  2. **Reordenar**: pasar a **F17-T2** (ranking ACT-R base-level), que es la "base de todo lo demás" y
     ataca cat1/overall, dejando cat3 para un diseño posterior.
  3. Diagnóstico corto: confirmar si la propagación llega a dispararse sobre turnos crudos (semillas ≥ umbral).
- Recomendación: **opción 2** (F17-T2) — cat3 por nombres está agotado; el ranking por activación da valor
  medible ya y es cimiento de T3/T4.
