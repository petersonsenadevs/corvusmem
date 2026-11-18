# 010 — F17-T4: efecto fan / pistas saturadas en --health

- **Fecha/hora:** 2026-11-12 01:10
- **Tipo:** feature
- **Mejora a:** —
- **Tarea:** F17-T4
- **Stack:** node-api

## Qué se hizo
- Efecto fan de ACT-R (§2.6, `S_ji = S − ln(fan)`): una pista con muchos hechos hace cada uno menos recuperable.
- `datosSalud` (`src/facts.mjs`) calcula `pistasSaturadas`: dimensiones con **≥5 hechos activos** (umbral = ABANICO),
  con su conteo y la **interferencia ln(fan)**, ordenadas por densidad.
- `--health` (`cli/memory.mjs`) muestra una sección "Pistas saturadas" cuando las hay; el `--health --json` ya las trae.
- **Decisión de alcance:** solo el AVISO (determinista, no toca el ranking). El penalizar-en-ranking se deja fuera a
  propósito (riesgo a la regla de oro, sin necesidad medida); sería extensión futura dependiente de F17-T2.

## Verificación
- `node tests/test-health.mjs` → 18/0 (añadidos 4 casos: `nota.cliente` con 6 hechos sale saturada con interferencia>0;
  `preferencia.editor` con 1 hecho NO sale).
- `node tests/test-facts.mjs` → 227/0 · `node tests/test-parity.mjs` → 28/0.
- `node tools/eval-memoria/eval.mjs --gate` → **GATE 100%** (abstención 100%, hit@5 100%, duplicados 100%): el ranking no
  se tocó, la regla de oro intacta.

## Próximos pasos
- Siguiente card de F17 a decidir. T2 (ACT-R ranking) y T3 (olvido) siguen bloqueadas por medición (dev-005: la batería
  no ve uso/recencia). La apuesta grande sigue siendo el extractor determinista (ver 009).
