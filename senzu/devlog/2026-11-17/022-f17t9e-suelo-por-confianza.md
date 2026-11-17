# 022 — F17-T9e: el suelo del diario, escalado por confianza (0,25→0,35)

- **Fecha/hora:** 2026-11-17 18:55
- **Tipo:** feature
- **Mejora a:** 019
- **Tarea:** F17-T9e

## Qué se hizo
- El suelo del diario era `0,25 × escala` fijo (conservador, para no dañar diarios pequeños). Pero los pequeños ya no
  reciben suelo (fallback por < 20 consultas). De-risk sobre dev-standards: con historia de sobra el suelo aguanta más
  alto sin estropear la relación ruido:útil — 0,25 → 26,7 % (7,4:1); 0,35 → 28,8 % (5,6:1). A 0,35 FIJO el pequeño
  sufría (de-risk 018). Solución: **fracción ESCALADA POR CONFIANZA** — `0,25` recién pasado el mínimo (20 consultas),
  sube lineal hasta `0,35` con ≥ 200. Más datos, más confianza, listón más alto.
- **Refactor a una sola fuente:** `pisoDiario(root)` en `src/facts.mjs` devuelve el suelo absoluto final (fracción ×
  escala). Lo usan el hook (`live-recall.mjs`) y el bench (`eval-precision-inyeccion.mjs`); `escalaDiario` queda para
  mostrar la escala. Sin historial suficiente → 0 (sin suelo).

## Resultado (bench de precisión de inyección, datos reales)
| proyecto      | antes → después | ruido cortado / útiles perdidos | relación |
|---------------|-----------------|---------------------------------|----------|
| dev-standards (N=292 → frac 0,35) | **23,7 % → 28,8 %** (+5,1 pts) | 478 / 86 | 5,6 : 1 |
| hemispheric (N=17 → sin suelo)    | 23,5 % → 23,5 % | 0 / 0 | — |

- Casi DOBLA la ganancia del suelo plano (era +3 pts) en el proyecto maduro, sin tocar el pequeño. Seguro por
  construcción: solo llega a 0,35 con mucha historia; con poca es el 0,25 ya validado.

## Verificación
- `tests/test-recall-piso.mjs` **12/0** (nuevos: N=20→piso 5, N=110→6, N≥200→7, N<20→0). Regla de oro:
  `eval-memoria --gate` hit@5 100 %, **abstención 100 %**, duplicados 100 %. facts 227/0.
- No afecta a LoCoMo (mide el motor, no la inyección). Rojo ajeno `test-plugin` (ambiental).

## Próximos pasos
- T9d (uso real): el bench ya reporta +5,1 pts contrafactuales; confirmarlo en sesiones nuevas con el tiempo.
