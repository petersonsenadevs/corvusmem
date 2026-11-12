# 011 — F17-T3: la recencia no mejora knowledge-update (lo empeora)

- **Fecha/hora:** 2026-11-12 09:30
- **Tipo:** decisión
- **Mejora a:** —
- **Tarea:** F17-T3
- **Stack:** node-api

## Qué se hizo
- Experimento (scratchpad, sin tocar el proyecto): ingerir los turnos de LongMemEval knowledge-update con sus **fechas
  reales** de sesión (recencia activa vía `pesoUso`) vs la ingestión en **escala de segundos** (recencia inerte, lo de hoy).
- Antes, un probe cuantificó el lever `pesoUso`: rango total ~21% (+12% por 50 usos; −7,5% por 1 año sin uso).

## Resultado (n=12 knowledge-update, direccional)
| Ingestión | recall@5 | acierto@5 |
|---|---|---|
| A (segundos) | 70,8% | 83,3% |
| B (fechas reales) | 66,7% | 75,0% |
| Δ (B−A) | **−4,1 pts** | −8,3 |

## Decisiones (resumen; detalle en DECISIONES.md#dev-011)
- **La recencia NO mejora knowledge-update; tiende a empeorarlo.** Activar fechas reales ENFRÍA los turnos-oro de
  sesiones antiguas y los saca del top-5; el lever (±21%) es muy suave para ayudar y suficiente para estorbar.
- F17-T3 (recencia/olvido) queda **blocked** para el bench: no mejora el pilar medible (knowledge-update) y su otra
  pata (menos ruido en historias largas) no la ve la batería (dev-005).

## Verificación
- `scratchpad/lme-recencia.mjs` · checkpoint `lme-recencia-checkpoint.json` (12 items, 1090s). No se tocó el proyecto.

## Próximos pasos
- Patrón confirmado (sesión entera): **ningún lever interno del motor sobre TURNOS CRUDOS mejora el bench** — abstención
  (005/007/008/009), multi-hop (004), recencia (011). El único camino que queda es cambiar el RÉGIMEN de ingesta:
  **extractor determinista** (turnos → hechos con clave), ver 009 y `aprendizaje.regimen-comprimido-vs-verbatim`.
