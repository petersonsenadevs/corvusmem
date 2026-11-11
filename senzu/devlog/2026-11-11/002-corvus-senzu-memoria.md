# 002 — Corvusmem instalado y Senzu cede la memoria (2.25.0)

- **Fecha/hora:** 2026-11-11 10:27
- **Tipo:** infra
- **Mejora a:** —
- **Tarea:** —
- **Stack:** node-api

## Qué se hizo
- Instalado **Corvusmem por proyecto** (no global) con el CLI local del plugin 0.5.3
  (`node .../plugins/cache/corvusmem/corvusmem/0.5.3/cli/corvusmem.mjs install`): copia hooks y CLI a
  `.corvusmem/`, registra hooks en `.claude/settings.json`, 3 comandos en `.claude/commands`, manifiesto
  `.corvusmem/hooks.json`. Corvus asume la propiedad de la memoria y adopta los hechos de `senzu/memoria/`.
- **Actualizado/re-sincronizado Senzu** a la versión **2.25.0** ("Senzu cede la memoria a Corvus") con
  `node ~/.senzu/tools/init.mjs --stack node-api --tools claude,codex --seleccion categorias
  --grupos quality,security,ops --perfil libreria --lang es` (misma selección guardada en `senzu/senzu.json`).
  Regenera `CLAUDE.md`, `.claude/`, `.mcp.json`, `AGENTS.md`.
- **Verificada la convivencia de ambas memorias** en `.claude/settings.json`: no hay doble inyección ni
  doble aviso de cierre.

## Commits
- — (sin commit todavía; cambios sin seguimiento en `main`, pendiente de decidir rama y qué versionar)

## Decisiones (resumen; detalle en DECISIONES.md)
- La memoria del proyecto pasa a Corvus; Senzu 2.25.0 cede sus hooks de memoria (ver DECISIONES.md#dev-002).

## Verificación
- Hooks de memoria de Senzu cableados pero con cortocircuito al detectar Corvus (`hayCorvus()` →
  `process.exit(0)`), comprobado por código:
  - `recuerdo-vivo.mjs` (recuerdo por mensaje) → cede · `memoria-viva.mjs` (aviso de regla) → cede,
    conserva solo el rastro de últimas peticiones para `/retomar` · `hechos-guard.mjs` → cede, incluido
    el ramo `Stop`.
  - `hayCorvus(root)` (lib.mjs:250) detecta `.corvusmem/` en el proyecto o `~/.config/corvusmem/` global.
- El hook de cierre que disparó en la sesión fue el de Corvus (`.corvusmem/hooks/facts-guard.mjs`),
  no dos a la vez.
- Matiz: `memoria-archivo.mjs` (memoria por archivo al editar) NO cede; aporta decisiones del devlog por
  archivo, informativo y una vez por archivo/sesión. Complementa a Corvus, no duplica el recuerdo vivo.
- Senzu conserva sus guardas no-memoria (guard, supply-guard, pentest-guard, protect-files,
  secrets-guard, code-hygiene…), plan y devlog.

## Próximos pasos
- Abrir **sesión nueva** del agente para que cargue la config regenerada.
- Decidir rama y qué versionar: `.claude/`, `.mcp.json`, `AGENTS.md`, `CLAUDE.md`, `senzu/`, `.corvusmem/`.
  (`.corvusmem/memory/` → commitear para compartir memoria del equipo o dejar fuera para memoria individual;
  `.corvusmem/cortex/` se ignora solo.)
- Siguiente en esta sesión: `/adoptar`.
