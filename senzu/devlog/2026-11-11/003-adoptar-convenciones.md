# 003 — /adoptar: convenciones del proyecto selladas

- **Fecha/hora:** 2026-11-11 10:30
- **Tipo:** docs
- **Mejora a:** —
- **Tarea:** —
- **Stack:** node-api

## Qué se hizo
- Ejecutado `/adoptar` en **modo evidencia** (el proyecto, Corvusmem, tiene código real): analizados
  `package.json`, `src/facts.mjs`, `cli/memory.mjs`, `src/live-recall.mjs`, `tests/test-facts.mjs`,
  la estructura y `git log -30`.
- Sellados **`senzu/conventions.md`** (fuente humana, con ejemplo real por sección) y
  **`senzu/conventions.json`** (4 reglas ejecutables para `conventions-guard`), ambos con `senzu:inmutable`.

## Commits
- — (sin commit; archivos nuevos sin seguimiento)

## Decisiones (resumen; detalle en DECISIONES.md)
- Idioma de identificadores: mixto real, NO se consolida a inglés — gana la consistencia existente
  (ver DECISIONES.md#dev-003).

## Verificación
- `node -e` valida: JSON OK, 4 reglas, todos los regex compilan.
- Anti-falso-positivo de la regla `node:`: `import fs from 'node:fs'` y los imports relativos PASAN;
  solo se vetaría un `from 'fs'` nuevo.
- La convención de autoría sellada coincide con el hecho en memoria `[preferencia.autoria]` (cabecera
  r3v3rs3 en cada módulo del core).

## Convenciones clave adoptadas
- Node **ESM puro** `.mjs`, **sin TypeScript**, builtins con prefijo `node:`, **cero dependencias de runtime**.
- Cabecera de autoría r3v3rs3 + bloque en español en cada módulo de `src/`/`cli/` (intocable).
- Naming: archivos kebab-case `.mjs`, funciones camelCase, constantes UPPER_SNAKE, helpers como arrow fn.
- Tests sin framework (`node tests/test-*.mjs`, helper `ok()`, deterministas); `npm test` con gate de eval.
- Git: Conventional en español ≤72, sin co-autores, con etiqueta de fase `(Fnn)`.
- Idioma: dominio en español (lenguaje ubicuo: `hecho`, `recuerdo`, `memoria`); fontanería a veces en
  inglés; CLI pública inglés+alias español (i18n); comentarios/devlog en español; producto multilingüe.

## Reglas ejecutables (conventions.json)
1. `.ts/.tsx` → prohibido (nada de TypeScript).
2. `.mjs` → builtins sin `node:` prohibidos.
3. `.mjs` → `require(` prohibido.
4. `.mjs` → `module.exports` prohibido.

## Próximos pasos
- Las convenciones GANAN a las preferencias; el muro `conventions-guard` veta violaciones nuevas y
  `protect-files` bloquea editar los dos archivos. Para cambiarlas: borrar ambos y re-ejecutar `/adoptar`.
- Abrir sesión nueva para que todo cargue. Decidir rama y qué versionar.
