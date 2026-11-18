# 026 — LoCoMo: Corvus en crudo (34,8 %) gana a TODOS end-to-end — su modo más barato es el mejor

- **Fecha/hora:** 2026-11-18 14:05
- **Tipo:** decisión
- **Mejora a:** 025
- **Tarea:** benchmark LoCoMo (cara a cara contra productos de memoria)

## De dónde salió
025 de-riskeó offline que la recuperación del motor domina (2-4×), y lanzó la hipótesis: un end-to-end con
**ingesta cruda** (turnos sin LLM) debería trasladar esa ventaja a las respuestas. Peterson lo lanzó él
(regla bench-lanzamiento). Resultado medido hoy.

## Resultado (end-to-end LoCoMo, 1986 preguntas, Qwen3-8B contesta y juzga, 0 €)
Cinco modos, mismas preguntas (`comparar.mjs`):

| cat | **motor crudo** | motor +LLM | emb crudo | emb +LLM | mem0 |
|---|---|---|---|---|---|
| cat1 | 26,2 % | 23,0 % | 9,2 % | **30,5 %** | 25,2 % |
| cat2 | **22,4 %** | 16,2 % | 10,3 % | 17,4 % | 5,3 % |
| cat3 | 18,8 % | 17,7 % | 13,5 % | **24,0 %** | 17,7 % |
| cat4 | **57,2 %** | 41,6 % | 32,2 % | 44,7 % | 35,0 % |
| cat5 | 10,5 % | 5,6 % | 11,9 % | 3,4 % | 4,7 % |
| **GLOBAL** | **34,8 %** | 25,6 % | 19,9 % | 28,0 % | 21,1 % |

## Conclusión (hipótesis CONFIRMADA)
- **Corvus en crudo (34,8 %) es la columna más alta de todas.** Supera a su propia variante con LLM (25,6 %),
  al embedding con LLM (28,0 % — el que le ganaba en la tabla pública) y a mem0 full (21,1 %).
- **Motor y embedding tienen gustos opuestos:** el embedding mejora con hechos extraídos por LLM
  (19,9 → 28,0); el motor **empeora** con esa extracción (el LLM pequeño mutila los hechos) y brilla con el
  turno entero (crudo 34,8 vs con-LLM 25,6). La tabla pública (ingesta LLM) estaba corrida **en el modo que
  favorece al embedding**, para igualar el método de mem0/Zep.
- **El modo más barato y determinista de Corvusmem (cero LLM al ingerir) es el que más acierta.** Es
  exactamente la tesis del producto, ahora con número.
- Honestidad fina: con LLM el embedding aún gana cat1 (30,5) y cat3 (24,0) sueltas; pero en global, cat2,
  cat4 y cat5, Corvus crudo manda.

## Qué se hizo
- `tools/eval-productos/BENCHMARK.md`: sección 3 ampliada con la tabla **end-to-end crudo** y la lectura
  («dos modos, una lectura»); nueva viñeta en conclusiones (§4): el modo nativo rinde 34,8 %, el más barato
  es el mejor.
- Ficheros de resultados (los generó el run de Peterson): `resultados-e2e-locomo-motor-crudo.json`,
  `resultados-e2e-locomo-embedding-crudo.json`.

## Verificación
- Documentación + comparación determinista sobre los crudos ya guardados (`comparar.mjs`, 1986 preguntas
  comunes). No se tocó código del motor → sin build/test.

## Próximos pasos
- Decisión de producto (Peterson): si el **0.6.0** lidera con el modo nativo (crudo) en la web/README, o si
  se mantiene la tabla LLM como principal y la cruda como segunda lectura. La cruda es más representativa de
  cómo funciona el producto de verdad (no extrae con LLM).
- Opcional: medir mem0/Zep no aplica en crudo (necesitan LLM por diseño); la comparación justa crudo es
  motor vs embedding, que ya está.
