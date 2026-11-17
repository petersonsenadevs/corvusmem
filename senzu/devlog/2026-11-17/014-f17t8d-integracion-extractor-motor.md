# 014 — F17-T8d: el lazo extractor→motor (acepta, recupera, sustituye)

- **Fecha/hora:** 2026-11-17 15:21
- **Tipo:** test
- **Mejora a:** 013
- **Tarea:** F17-T8

## Qué se hizo
- Primera evidencia de T8d: `tests/test-extractor-integracion.mjs` cierra el lazo **extractor → motor**. No basta con
  que el extractor dé la dimensión correcta (eso lo prueba `test-extractor`); hay que ver que el hecho que produce,
  guardado tal cual, el motor lo ACEPTA, lo RECUPERA y lo SUSTITUYE. Mismo arnés determinista que `eval-memoria`
  (proyecto temporal, fechas fijas con `T()`), sin LLM ni red.
- Cubre: (1) extraer→guardar→`buscarHechos` recupera el hecho en el top-5 con una pregunta que comparte términos con
  sus claves (ubicación, gestor, stack, sede); (2) **sustitución cronológica con hechos extraídos** — «vivía en Madrid»
  luego «vivo en Valencia» → Valencia vigente, Madrid al histórico (no se pierde); «npm» → «pnpm» pisa; (3) el mismo
  hecho extraído dos veces NO duplica.

## Por qué importa
- La sustitución es lo que knowledge-update necesita y lo que el régimen comprimido aporta sobre los turnos crudos
  (de-risk 012). Este test demuestra que el extractor lo habilita de verdad en el producto, no solo en el laboratorio.

## Verificación
- `node tests/test-extractor-integracion.mjs` → **12 casos, 0 fallos**. Registrado en `test`/`test:core`.

## Próximos pasos
- T8d completo necesita medir en **uso real** (`--informe`: inyectado→usado, ruido) en sesiones de verdad, no en test.
- Ampliar el extractor a más patrones (v1) solo con evidencia de que hace falta.
- Opcional: confirmar el de-risk con n=21 (lo lanza Peterson).
