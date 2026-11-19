# 032 — Cortex: el pensamiento se forma (coreografía honesta de la activación real)

- **Fecha/hora:** 2026-11-19 11:00
- **Tipo:** feature
- **Mejora a:** —
- **Tarea:** CX-T1/T2/T3 (plan-cortex-pensamiento.md)

## Qué se hizo
Marketing visual del Cortex: al «pensar», el cerebro muestra el pensamiento **formándose** por fases, en vez de
una ráfaga de impulsos aleatoria. Clave: **reutiliza la activación REAL** (foco + vecinos de 2 saltos), no
inventa nada ni toca el motor de recuperación.

- **`pensarFormando(zs)` en `cerebro3D` (cortex/cortex.mjs).** Reproduce las fases EN ORDEN reusando los
  primitivos que ya existen (`foco`, `pulsos`, `destellos`, `nodosPorZona`, `enl`):
  - Fase A (0): se encienden los **candidatos** (top nodos de las zonas tocadas), el resto se atenúa.
  - Fase B (350 ms): **impulsos** desde cada candidato por sus **aristas reales** (la propagación / 2 saltos).
  - Fase C (900 ms): **converge** — se enciende el clúster completo (candidatos + vecinos).
  - Fase D (1500 ms): **destello** en los candidatos (la respuesta formada).
  - `coreoT` cancela una coreografía anterior (sin solapes). `prefers-reduced-motion` (`quieto`) → estado final
    al instante, sin movimiento.
- **`encender(zs)`** (el botón «cómo piensa», que reproduce las consultas reales pasadas una a una) ahora llama a
  `pensarFormando` en vez de `rafaga` (aleatoria). `rafaga`/`buscar` se conservan.

## Honestidad (regla de oro de la fase)
Cada nodo/arista que se enciende es un hecho/conexión de verdad; el atenuado del resto es el foco real; la
propagación son las aristas reales de 2 saltos. Si no es el mecanismo, no se dibuja. **No afecta a la velocidad
de Corvus:** el Cortex es bajo demanda y corre en el navegador, no en los hooks (recall sigue ~1-2 ms).

## Verificación
- `node --check cortex/cortex.mjs` OK; `tests/test-cortex-visual.mjs` **40/0** (render intacto).
- Gotcha cazado: el JS del Cortex va dentro de un template literal → **sin backticks en los comentarios** (un
  `` `buscar` `` cerraba el string). Corregido.

## Próximos pasos
- **CX-T4:** modo grabable (GIF) reutilizando el solo-cerebro para marketing (dev.to/LinkedIn).
- **CX-T5:** verificación en navegador real (375/768/1440, dark, reduced-motion) — ver la animación en vivo.
- Coordinar con `D:/hemi-web` (CortexEmbed) para que el embed herede la coreografía.
