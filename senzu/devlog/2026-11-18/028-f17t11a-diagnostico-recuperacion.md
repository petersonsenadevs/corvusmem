# 028 — F17-T11a: diagnóstico de recuperación cat1/cat3 — no es vocabulario, es ranking por solape casi nulo

- **Fecha/hora:** 2026-11-18 17:30
- **Tipo:** decisión
- **Mejora a:** —
- **Tarea:** F17-T11a

## Qué se hizo
Diagnóstico offline (sin LLM) de por qué el motor recupera flojo en cat1/cat3. Para cada pregunta cuyo
turno-evidencia no entra en el top-10, se clasifica el fallo por la puntuación/rango que el motor le da al
turno-oro (`scratchpad/t11a-diagnostico-recuperacion.mjs`). Nota: aquí "fallo" = no están TODAS las
evidencias en top-10 (más estricto que acierto@10 = al menos una), por eso el % de fallo sale alto.

## Resultado
| fallo | cat1 (255) | cat3 (74) |
|---|---|---|
| vocab_gap (oro puntúa 0) | 5% | 8% |
| **ranking_loss (oro >0, lo superan)** | **44%** | **66%** |
| short_turn (oro ≤5 palabras) | 0% | 1% |
| multihop_part (alguna evidencia hallada, no todas) | 51% | 24% |
| **solape medio pregunta↔oro** | **0,64** | **0,30** palabras de contenido |

## Conclusión
- **La hipótesis del vocabulario queda REFUTADA** (vocab_gap 5-8%). El léxico/expansión de conceptos **NO es
  la palanca**. (Mata la "envidia al embedding": no perdemos por no entender significado.)
- El fallo dominante es **ranking_loss**: el turno-oro puntúa >0 pero lo superan turnos de ruido (ranks 79,
  105, 196, 254…).
- **Causa de raíz:** el solape pregunta↔respuesta es **~0,3-0,64 palabras**. En LoCoMo la pregunta nombra a
  una persona y pregunta por un concepto que la respuesta **narra sin nombrarlo** ("What is Caroline's
  identity?" → oro "The transgender stories were so inspiring…", solape 0). Es **intrínsecamente duro**: el
  embedding ahí va aún PEOR (ac@10 16% vs motor 56%).
- **multihop_part** (51% cat1) sobredimensiona el fallo: encontrar UNA evidencia suele bastar para contestar,
  y acierto@10 ya lo cuenta como acierto. El bucket accionable es **ranking_loss**.

## Palanca candidata (para T11b)
Los turnos-oro **son de/sobre la persona que nombra la pregunta** (Caroline) pero rankean 196/254. El motor
ya ingiere el hablante como `clave`, pero pesa poco. Hipótesis T11b: **subir el peso del encaje
entidad/hablante** cuando la pregunta nombra a esa persona → los turnos de esa persona suben sin semántica,
determinista. Riesgo: techo limitado (solape ~0 es duro) y la regla de oro (abstención 100%) manda; podría
descartarse.

## Verificación
- Script reproducible en `scratchpad/`, sin red, sobre LoCoMo (cat1 282, cat3 92 con evidencia). No se tocó
  producto.

## Próximos pasos
- T11b: implementar el boost de entidad/hablante tras un flag y medir offline (`recuperar.mjs` por categoría
  + `eval-memoria --gate`). Quedarse o descartar con evidencia.
