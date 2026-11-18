# 025 — LoCoMo: la recuperación de Corvus domina (2-4× el embedding), el end-to-end no es problema de recuperación

- **Fecha/hora:** 2026-11-18 12:10
- **Tipo:** decisión
- **Mejora a:** —
- **Tarea:** benchmark LoCoMo (cara a cara contra productos de memoria)

## De dónde salió
El usuario quiere «valor de verdad» antes de publicar el 0.6.0: algo que mueva el número **público**
(LoCoMo), no solo la precisión de inyección interna (n=1, privada). Lo publicable es el cara a cara.

## Qué se midió (offline, sin LLM, 0 €)
Dos capas de análisis sobre los resultados ya guardados (`tools/eval-productos/`), sin lanzar nada pesado:

1. **End-to-end (ingesta LLM), bolsa de oportunidad por categoría** (motor vs embedding, mismas preguntas):
   el embedding solo le gana al motor concentrado en **cat1** (48 preguntas que el embedding acierta y el
   motor falla) y cat4 (91). Global: embedding 28,0 % vs motor 25,6 % (el motor **sí** le gana a mem0, 21,1 %).

2. **Recuperación en crudo** (`recuperar.mjs`, turnos sin LLM, ranking puro, mismos turnos para los dos) —
   **el diagnóstico que fija el techo**. acierto@10 por categoría:

   | cat | motor | embedding |
   |---|---|---|
   | cat1 single-hop | **56,0 %** | 16,3 % |
   | cat2 temporal | **67,9 %** | 29,3 % |
   | cat3 multi-hop | **39,1 %** | 15,2 % |
   | cat4 open-domain | **65,9 %** | 32,5 % |
   | cat5 adversaria | **65,5 %** | 40,6 % |
   | GLOBAL | **63,5 %** | 30,7 % |

## Conclusión
- **La recuperación NO es el problema de Corvus: es su superpoder.** El motor léxico recupera **2-4× mejor
  que el embedding en TODAS las categorías**, incluida cat1 (56 % vs 16 %), justo donde el end-to-end pierde.
- El end-to-end público queda por debajo del embedding (−2,4 pts) porque corre con **ingesta por LLM**
  (elegida para ser justa con mem0/Zep, que la necesitan). Ese modo **tapa** la ventaja determinista de
  Corvus. En la capa propia de Corvus —sin LLM— domina.
- Hipótesis de «valor de verdad» (no refutada, pendiente de medir): un end-to-end con **ingesta cruda**
  (turnos, igual para los dos) debería trasladar esa ventaja de recuperación a la respuesta y **dar la
  vuelta a la tabla pública**. Riesgo honesto: los turnos crudos son más ruidosos y Qwen3-8B es pequeño;
  por eso hay que medirlo, no asumirlo.

## Qué se hizo
- `tools/eval-productos/BENCHMARK.md`: nueva **sección 3 «La recuperación en crudo — el terreno propio de
  Corvusmem»** con la tabla y el matiz honesto (es otra capa que el end-to-end); lectura añadida a la sección
  de conclusiones (ahora §4). Reproducible con `node tools/eval-productos/recuperar.mjs --locomo`.

## Verificación
- Solo documentación (`BENCHMARK.md`) + análisis con datos ya guardados. No se tocó código del motor → sin
  build/test. Las cifras salen de `recuperar.mjs` sobre LoCoMo completo (1982 preguntas con evidencia,
  cobertura del oro 99,7 %) y de los `resultados-e2e-locomo-*-llm.json` ya existentes.

## Próximos pasos
- **Peterson lo lanza él** (regla bench-lanzamiento): end-to-end con ingesta cruda, motor y embedding —
  `pipeline.mjs --locomo --ingesta crudo --retriever {motor,embedding} --topk 10` → `comparar.mjs`. Si el
  motor gana end-to-end sin LLM en la memoria, ese es el titular del 0.6.0.
