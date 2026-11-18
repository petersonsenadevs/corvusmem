# 031 — Cortex: oscuro siempre (sin modo claro), 3D por defecto y auto-abrir en el navegador

- **Fecha/hora:** 2026-11-18 21:30
- **Tipo:** feature
- **Mejora a:** —
- **Tarea:** ad-hoc (petición del usuario sobre el Cortex)

## Qué se hizo (`cortex/cortex.mjs` + `commands/corvus-cortex.md`)
1. **Sin modo claro.** Quitado el botón `#tema` y su handler; quitada la línea de `traducir()` que lo tocaba.
   El Cortex es **oscuro siempre** (`data-theme="dark"` fijo). Única excepción conservada: **embebido en la
   web** (`data-solo`), sigue el tema de la página para no verse como una caja negra sobre una página clara
   (`aplicarTemaWeb` ahora solo actúa en modo `data-solo`). El CSS `[data-theme="light"]` queda como código
   muerto inofensivo (no se activa en el standalone).
2. **3D por defecto.** La vista arranca en **3D**: `data-vista="3d"`, el botón 3D `aria-pressed="true"`, y al
   cargar se dispara el arranque del motor 3D siempre (antes solo en el embed). El 2D sigue disponible con su
   botón.
3. **Auto-abrir.** `/corvus-cortex` ahora instruye al agente a **abrir el HTML en el navegador al momento**
   tras generarlo (herramienta de navegador con `file://`, o el abridor del SO: `start`/`open`/`xdg-open`/
   `wslview`), y luego dar la ruta. Cross-platform vía el agente, sin tocar el CLI.

## Verificación
- `tests/test-cortex-visual.mjs` **40/0**; `test-parity` **28/0**; `test-plugin` **63/0**. Comandos root↔plugin
  idénticos (`corvus-cortex.md` sincronizado).

## Próximos pasos
- Entra en el **0.6.1** (junto al fix del absorb WSL). Lo publica Peterson.
- Pendiente de decidir: ¿el Cortex EMBEBIDO en la web también oscuro-siempre? Hoy sigue el tema de la web (para
  no romper el hero en claro). Si se quiere oscuro también ahí, es un cambio aparte en la web/embed.
