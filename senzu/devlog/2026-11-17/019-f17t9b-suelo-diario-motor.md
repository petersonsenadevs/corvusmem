# 019 — F17-T9b/c: el suelo del diario en el motor (0,25 × escala)

- **Fecha/hora:** 2026-11-17 17:40
- **Tipo:** feature
- **Mejora a:** 018
- **Tarea:** F17-T9b, F17-T9c

## Qué se hizo
- **T9b.** El recuerdo vivo (`src/live-recall.mjs`) ahora da al diario y a las decisiones un **suelo ABSOLUTO** además
  del relativo: `puntuacion >= 0,25 × escala`. Antes solo exigía «ser el mejor de su fuente» (relativo), así que en una
  consulta floja el diario colaba su mejor entrada aunque no tuviera relación real. Los `hecho` NO se tocan.
- **Escala auto-calibrada del historial:** `escalaDiario(root)` (nuevo en `src/facts.mjs`) = **p90 del mejor acierto de
  diario por consulta** en `recuerdo-uso.jsonl` (que ya se acumula solo). Esto resuelve que los puntos de `search.mjs`
  dependan del tamaño del diario (~0,7 pequeño, ~38 grande): el suelo escala con el proyecto, no es una constante.
- **Fallback seguro:** con < 20 consultas de diario en el historial → escala 0 → **sin suelo** (comportamiento relativo
  de antes). Un proyecto nuevo o pequeño no se daña al arrancar. Verificado: dev-standards escala 20,2 (suelo 5,05);
  hemispheric 17 consultas → escala 0 (sin suelo todavía).

## Por qué importa
- El de-risk (016–018) midió que el **70 % del ruido de uso real es el diario** inyectándose de más, y que `0,25 ×
  escala` corta ~266 molestias de 866 en el proyecto grande perdiendo 36 útiles de 228, subiendo el acierto del diario
  del 21 % al 24 %, SIN tocar los permanentes (preferencias/identidad, donde está la autoría). Esto lo pone en el
  producto de forma determinista, offline, cero-dep.

## Verificación
- **T9b:** `tests/test-recall-piso.mjs` (9 casos, 0 fallos): escala = p90, los hechos no inflan la escala, las
  búsquedas del agente (`origen=consulta`) no cuentan, < 20 consultas → 0, sin historial → 0, y el suelo 0,25×escala
  separa un acierto flojo de uno fuerte. Registrado en `test`/`test:core`.
- **T9c (regla de oro):** `eval-memoria --gate` → **hit@5 100 %, abstención 100 %, duplicados 100 %**. Verde: boundary
  (66), facts (227), hard-recall, parity, save-criterios, hecho-detector, extractor (83), integración (12), health.
  Rojo ajeno: `test-plugin` (ambiental, Corvus global en esta máquina), no de T9.
- No afecta a LoCoMo (mide el motor, no la inyección del hook).

## Próximos pasos
- **T9d:** reejecutar `--informe` tras días de uso con el suelo puesto y comparar contra la línea base (016). Lo lanza
  Peterson. Hasta tener suficiente historial en hemispheric (≥20 consultas de diario), allí el suelo aún no actúa.
