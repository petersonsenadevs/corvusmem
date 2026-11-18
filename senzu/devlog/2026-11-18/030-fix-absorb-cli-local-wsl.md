# 030 — fix: /corvus-absorb usa el CLI local (no npx) — arregla el import sobre proyectos WSL

- **Fecha/hora:** 2026-11-18 20:10
- **Tipo:** fix
- **Mejora a:** —
- **Tarea:** ad-hoc (reporte de uso: `corvusmem import` sobre proyecto WSL)

## Qué pasaba
El usuario ejecuta `/corvus-absorb` (lo lanza **Claude**, no el usuario) sobre un proyecto en **WSL**. El
comando `commands/corvus-absorb.md` **hardcodeaba `npx corvusmem import --json`**, y el `npx` de **Windows**
no puede alcanzar una ruta UNC `\\wsl$\…` (no soporta UNC) → falla. Inconsistencia: `/corvus-cortex` y
`/corvus-install` ya usan el CLI **instalado** (`node "<ruta>"`) con npx solo de fallback; `/corvus-absorb`
se lo saltaba.

## Qué se hizo
- `commands/corvus-absorb.md` (+ copia `plugins/corvusmem/commands/corvus-absorb.md`, idénticas por paridad):
  el paso 1 (`import`) y el paso 3 (`--save`) usan ahora la **escalera de ruta local** (plugin > proyecto >
  global > npx fallback), igual que los otros comandos. Así, cuando **Claude** lo lanza, usa `node "<ruta>"`,
  que **sí cruza a WSL** (Node de Windows lee UNC; npx no). Añadida una **nota WSL** en el propio comando.
- `README.md`: nota en la sección Install — en un proyecto WSL, correr Claude Code y Corvus **dentro de WSL**
  (Node/npx Linux-nativos; la ruta es un `/home/…` normal, sin UNC).

## Verificación
- `test-plugin` 63/0, `test-parity` 28/0 (root↔plugin idénticas), `test-import` 26/0. No se tocó código del
  motor. Solo markdown de comandos + README (ambos viajan: `commands/` en npm, `plugins/` en el marketplace git).

## Próximos pasos
- Entra en la próxima release (0.6.1 o batch con la web/anuncio) — lo publica Peterson. Sin bump aún (lo
  decide él según si agrupa más fixes).
