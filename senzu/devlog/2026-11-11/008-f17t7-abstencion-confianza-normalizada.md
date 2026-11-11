# 008 — F17-T7: la abstención era un umbral mal calibrado (confianza normalizada)

- **Fecha/hora:** 2026-11-11 23:55
- **Tipo:** decisión
- **Mejora a:** 007
- **Tarea:** F17-T7
- **Stack:** node-api

## Qué se hizo
- Diagnóstico offline del umbral de abstención en LongMemEval (scripts en scratchpad, sin tocar el proyecto):
  se midió la puntuación TOP del motor en preguntas SIN respuesta (`_abs`) vs con respuesta.
- Hallazgo de raíz: la puntuación **escala con el tamaño del corpus** (`idf = log(1+(nVig+1)/(df+0.5))`, `facts.mjs:691`).
  En la batería (corpus pequeño) las puntuaciones viven ~0.8 → el gate absoluto `maxPunt < UMBRAL_RECUERDO(0.8)`
  (`eval.mjs:53`) abstiene bien. En LongMemEval (cientos de turnos) viven en **8–39** → 0.8 nunca abstiene (0/24).
- Barrido de umbral crudo (n=20/grupo): sí hay **separación parcial** (al contrario que LoCoMo cat5, ver dev-007):

  | T | se calla (`_abs`) | pierde recall |
  |---|---|---|
  | 0.8 (actual) | 0% | 0% |
  | 12 | 25% | 5% |
  | 14 | 50% | 15% |
  | 18 | 80% | 30% |

- Implementado el **paso 1 de F17-T7** (adición pura): campo `confianza = puntuación ÷ techo de la consulta`
  (masa idf de las palabras con peso) en `buscarHechos` (`facts.mjs`), expuesto en el arnés (`recuperar.mjs: ultConf`).
  No cambia `puntuacion` ni el ranking (constante por consulta).

## Decisiones (resumen; detalle en DECISIONES.md#dev-008)
- **Corrige a dev-007:** la abstención NO necesita ingesta estructurada (LLM). Necesita **normalizar el umbral**
  (confianza corpus-independiente). Sigue siendo determinista, offline y cero dependencias.

## Verificación
- `npm run test:core`: test-boundary 58/0, test-facts 227/0, test-hard-recall 14/0, test-install 36/0,
  test-import 26/0, test-parity 28/0, save-criterios 18/0, hecho-detector 34/0, health 14/0.
  Único fallo: test-plugin (X-T1 ambiental, Corvus global; no es regresión).
- **GATE (regla de oro) ✓**: abstención 100%, hit@5 inyectado 100%, duplicados 100%. El campo `confianza` no rompe nada.

## Próximos pasos (lo que FALTA para cerrar F17-T7)
1. Medir si la **confianza [0,1] separa** `_abs` de answerable con un umbral único (corriendo: `lme-conf-diag.mjs`).
2. Si separa → cambiar el gate a `confianza < UMBRAL_CONFIANZA` en `eval.mjs`, `recuperar.mjs` y el llamador del
   producto, recalibrar el umbral, y medir: **batería gate 100%** + **LoCoMo cat1-4 sin regresión** + abstención
   LongMemEval arriba. Si baja la abstención de la batería → se descarta con evidencia (regla de oro, como F15-T6).
3. `tools/eval-memoria/resultados.json` quedó regenerado por el gate (salida de medición): no se commitea aquí.
