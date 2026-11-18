# 009 — F17-T7 descartada: la confianza normalizada no porta entre regímenes

- **Fecha/hora:** 2026-11-12 00:30
- **Tipo:** decisión
- **Mejora a:** 008
- **Tarea:** F17-T7
- **Stack:** node-api

## Qué se hizo
- Se midió si la `confianza` normalizada separa `_abs` de answerable, en LongMemEval **y** en la batería (regla de oro).
- **LongMemEval (turnos verbatim):** separa bien. T=0,7 → 55% de abstención con 0% de pérdida de recall
  (`_abs` mediana 0,65 min 0,30; answerable mediana 1,0 min 0,78).
- **Batería (hechos comprimidos = régimen REAL del producto):** trampas conf 0–0,03; reales conf **0,21–1,0** (mediana 0,35).
  El umbral que separa aquí es ~0,15 → batería 100%/100%, pero **empata** con el `punt<0.8` actual (sin mejora).
- **Conflicto:** el umbral de LongMemEval (0,7) hunde la batería (pierde 90% de reales); el de la batería (0,15) no
  abstiene nada en LongMemEval. **Un umbral único de confianza es imposible.**

## Decisiones (resumen; detalle en DECISIONES.md#dev-009)
- **F17-T7 descartada con evidencia.** La confianza mide cobertura pregunta↔texto, que depende del RÉGIMEN (verbatim
  vs comprimido), no solo del tamaño del corpus. Normalizar por el techo arregla el escalado, no el régimen.
- **dev-008 queda sustituida (D-008 → D-009):** la abstención NO se arregla con un umbral normalizado único.
- Código revertido: se quitaron `techoConsulta`/`confianza` de `buscarHechos` y `ultConf` del arnés. Repo limpio.

## Verificación
- `npm run test:core` tras revertir: test-facts 227/0, resto verde (único fallo: test-plugin X-T1 ambiental).
- GATE (regla de oro) ✓ 100% (abstención/hit@5/duplicados) — como antes de tocar nada.

## Próximos pasos
- La abstención desde el motor por UMBRAL está agotada de forma determinista (dev-005, 007, 008/009 + cat5 LoCoMo).
- El patrón de fondo: las victorias del motor viven en el régimen de **hechos comprimidos** (batería/producto); los
  benchmarks meten **turnos crudos**. El puente sería un **extractor determinista** (sin LLM) o medir en el régimen real.
- Decidir la siguiente card de F17 con eso en cuenta (ver respuesta al usuario).
