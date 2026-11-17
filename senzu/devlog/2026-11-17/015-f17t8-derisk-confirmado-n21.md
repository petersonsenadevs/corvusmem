# 015 — F17-T8: de-risk confirmado con n=21 (el comprimido supera al crudo)

- **Fecha/hora:** 2026-11-17 16:02
- **Tipo:** decisión
- **Mejora a:** 012
- **Tarea:** F17-T8

## Qué se hizo
- Peterson lanzó `scratchpad/lme-extractor-v1.mjs 21` (LongMemEval knowledge-update, n=21, la muestra de referencia).
  Confirma y **refuerza** el de-risk que en n=8 era solo sugerente.

| variante                 | r@5  | ac@5 |
|--------------------------|------|------|
| CRUDO (turnos crudos)    | 73,8 | 90,5 |
| **v0 salientes k=3**     | **75,4** | **100** |
| stem k=3                 | 71,4 | 90,5 |
| stem k=4                 | 70,6 | 90,5 |
| conjunto-completo stem   | 73,0 | 95,2 |

## Por qué importa
- En n=8 el régimen comprimido solo **empataba** al crudo en recall@5 (72,9% vs 75%) y ganaba en abstención. Con n=21
  **lo supera en las DOS métricas**: +1,6 pts de recall@5 (75,4 vs 73,8) y abstención perfecta (100 vs 90,5). El
  fundamento de T8 —comprimir turnos en hechos con clave estable mejora knowledge-update— queda firme con la muestra
  de referencia, no solo con la pequeña.
- El criterio del experimento («si stem o conjunto superan a v0 sin bajar ac@5, esa es la clave a llevar al
  producto») **no se cumple para ninguna** variante nueva: stem baja r@5, conjunto baja r@5 y ac@5. La **v0 salientes
  k=3**, que es la que ya vive en `src/extractor.mjs`, es la mejor clave comprimida. **Cero cambios de código.**

## Verificación
- Salida pegada por Peterson (n=21). Decisión de T8a (stemming descartado, v0 al producto) queda FIRME, no provisional.

## Próximos pasos
- T8 cerrado en lo medible. Falta solo medición en **uso real** (`--informe`: inyectado→usado, ruido) en sesiones de
  verdad, no en test. Ampliar el extractor a más patrones (v1) solo con evidencia de que hace falta.
