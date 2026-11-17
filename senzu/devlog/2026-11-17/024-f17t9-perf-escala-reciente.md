# 024 — F17-T9: el suelo mira solo la historia reciente (más rápido y más exacto)

- **Fecha/hora:** 2026-11-17 19:40
- **Tipo:** perf
- **Mejora a:** 022
- **Tarea:** F17-T9

## Qué se hizo
- `pisoDiario`/`escalaDiario` leían y parseaban el log de uso ENTERO en cada mensaje. Medido: 412 líneas → 2 ms; pero
  el log crece hasta `MAX_REGISTRO` (3000) → ~14 ms por mensaje, un ~40 % sobre el presupuesto del hook (~35 ms).
- `mejoresDiario` ahora mira solo las **últimas 1000 líneas** del log (`MAX_LINEAS_ESCALA`). Doble ganancia: (1) acota
  el coste del hook sin importar cuánto crezca el log; (2) es más EXACTO — la escala del diario crece con el tiempo
  (más entradas → `search.mjs` puntúa distinto), y la historia reciente refleja la escala ACTUAL, no la de hace meses.

## Verificación
- Perf: log sintético de 3000 líneas → `pisoDiario` **1,85 ms** (antes ~14 ms). Proyectos reales (< 1000 líneas):
  sin cambio (dev-standards escala 20,2 / piso 7,07 / precisión 28,8 % idénticos).
- `tests/test-recall-piso.mjs` **13/0** (nuevo: log de 1200 líneas → usa las últimas 1000, piso correcto = 7).

## Próximos pasos
- T9d: confirmar en uso real con el tiempo (`npm run bench:precision`).
