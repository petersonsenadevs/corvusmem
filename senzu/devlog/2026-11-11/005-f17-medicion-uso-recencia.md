# 005 — F17-T2: ninguna medición actual ve el uso/recencia (hay que construirla)

- **Fecha/hora:** 2026-11-11 11:45
- **Tipo:** decisión
- **Mejora a:** —
- **Tarea:** F17-T2
- **Stack:** node-api

## Qué se investigó
Al arrancar F17-T2 (ranking por activación ACT-R base-level, que unifica **frecuencia de uso + recencia**),
revisando los dos arneses de medición:

- **Bench LoCoMo** (`recuperar.mjs`): ingiere cada turno como hecho **nuevo**, `usos=0`, fechas sintéticas
  en segundos y sin historial de uso. El base-level ≈ constante para todos → **el bench NO puede medir T2**.
- **Batería** (`eval-memoria`, `casos.json`): los hechos se crean con `usos=0` y timestamps en **segundos**;
  el enfriamiento por recencia de `pesoUso` solo actúa tras **90 días** (DIAS_TEMPLADO) → en la escala de la
  batería la recencia es **inerte**, y el esquema de casos **no permite fijar `usos`** → **tampoco mide T2**.

## Conclusión
T2 (y por extensión T3 olvido, y parte de T5 consolidación) mejoran la **memoria real** (en uso, el hecho más
usado y reciente debe rankear mejor), pero **ningún arnés actual lo mide**. Hacer T2 con el método
"medir, no adivinar" **exige construir primero su medición**: una batería que discrimine por uso/recencia
(fijar `usos`/`ultimo_uso` en los fixtures y comprobar el ORDEN, p. ej. hit@1), no solo top-5.

Corrige lo dicho al recomendar T2: **mejora la memoria real, NO el bench** (el bench no tiene historial de uso).
Coincide con el patrón ya conocido: cat5/abstención tampoco se mide desde el motor en el bench, vive en la batería.

## Decisión pendiente (usuario)
Cómo medir T2 antes de implementarlo:
1. **Construir la medición** (recomendado): extender la batería con casos de uso/recencia (fixtures con `usos`
   y `ultimo_uso`, y una comprobación de rank-1), que es la puerta honesta para T2/T3/T5. Luego implementar el
   base-level (bounded, para no tocar la abstención) y medir ahí. El bench solo se usa como "no regresión".
2. Implementar el base-level y verificar **solo no-regresión** (bench + batería 100%), asumiendo que la mejora
   de producto no se mide con número (peor: viola "terminado = medido").

Recomendación: **opción 1**. Sin medición, T2 sería adivinar; y la medición (batería de uso/recencia) es
reutilizable para T3 y T5.

## Verificación
- Lectura del código: `tools/eval-productos/recuperar.mjs` (ingesta de turnos sin uso), `tools/eval-memoria/eval.mjs`
  (fixtures `T(tOffset)` en segundos, sin `usos`; mide hit@5, no orden), `src/facts.mjs:443` (`pesoUso`,
  enfriamiento a ≥90 días).

## Próximos pasos
- Con el OK: construir la batería de uso/recencia (hit@1 + fixtures con `usos`/`ultimo_uso`), luego el base-level.
