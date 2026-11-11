# Convenciones del proyecto (adoptadas con /adoptar)
<!-- senzu:inmutable -->
Analizado el 2026-11-11 sobre ~6 archivos (package.json, src/facts.mjs, cli/memory.mjs, src/live-recall.mjs, tests/test-facts.mjs) + estructura y `git log -30`. Estas convenciones GANAN a las preferencias de Senzu (los muros de seguridad e higiene siguen aplicando).

El proyecto es **Corvusmem**: memoria determinista, offline y **sin dependencias de runtime** para agentes de IA, más un CLI. Node ESM puro. Autoría: Peterson Sena (r3v3rs3).

## Naming
- **Archivos**: kebab-case con extensión `.mjs` — ej. `facts-guard.mjs`, `live-recall.mjs`, `session-start.mjs`, `test-facts.mjs`.
- **Funciones y variables**: camelCase — ej. `buscarHechos()`, `normAutor()`, `readHookInput()`, `projectRoot()`.
- **Constantes de módulo**: UPPER_SNAKE_CASE — ej. `FAMILIAS_VARIOS`, `PERSONALES`, `ALIAS_FLAG`, `UMBRAL_HECHO` (`src/facts.mjs:24`, `cli/memory.mjs:27`).
- **Helpers cortos como arrow functions**: `const ok = (c, n, d = '') => {…}` (`tests/test-facts.mjs:20`), `const normAutor = s => …` (`src/facts.mjs:30`).

## Estructura
- `src/` — motor y hooks (`.mjs`). `cli/` — ejecutables con shebang `#!/usr/bin/env node`. `tests/` — suites espejo `test-<area>.mjs`. `tools/` — eval y bench. `commands/`, `cortex/` (HTML), `docs/`, `assets/`.
- Es una **librería + CLI**, no una app por capas: módulos por responsabilidad, no MVC. La lógica no vive en "controladores"; cada `.mjs` expone funciones puras o un hook.

## Módulos e imports
- **ESM puro** (`"type": "module"` en package.json, todo `.mjs`). **No TypeScript**.
- Builtins de Node con prefijo **`node:`** — `import fs from 'node:fs'`, `node:path`, `node:crypto`, `node:os`, `node:child_process`, `node:url` (`src/facts.mjs:15-20`).
- Imports **relativos** con extensión (`./lib.mjs`, `./facts.mjs`). Sin alias de ruta.
- **Cero dependencias de runtime** (la promesa del producto): `package.json` no tiene `dependencies`; solo `devDependencies` para eval/bench (`@huggingface/transformers`, `gpt-tokenizer`). No añadir dependencias de runtime sin decisión explícita del usuario.
- `engines.node >= 18`.

## Cabecera de archivo (autoría — intocable)
Cada módulo de `src/` y `cli/` empieza con la línea de autoría, y debajo un bloque de comentario en español que explica el módulo:
```js
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
```
Ej. `src/facts.mjs:1`, `cli/memory.mjs:2`, `src/live-recall.mjs:1`. No se elimina ni se altera la autoría.

## Tests
- **Sin framework**: se corren con `node tests/test-<area>.mjs`. Helper propio `ok(cond, nombre, detalle)` que cuenta `casos`/`fallos` e imprime `FAIL <nombre> -> <detalle>` (`tests/test-facts.mjs:19`).
- **Deterministas**: fechas fijas con `Date.UTC(...)`, almacenes aislados en `os.tmpdir()` (`tests/test-facts.mjs:15-17`). Misma entrada → misma salida.
- `npm test` encadena todas las suites + el gate de eval (`tools/eval-memoria/eval.mjs --gate`). `test:core` para el núcleo.

## Git
- **Conventional Commits en español**, imperativo, ≤72, **sin líneas de co-autor**.
- Etiqueta de fase del plan entre paréntesis: `(F16)`, `(F15-T8)`. Tipos en uso: `feat`, `fix`, `docs`, `test`, `chore`.
- Ej.: `feat: umbral de recuperacion + scan para recuperar abstencion (F16)`.

## Idioma (por ejes — no mezclar)
- **Identificadores técnicos**: **mixto real** en el código. El **dominio va en español** (lenguaje ubicuo: `hecho`, `recuerdo`, `memoria`, `dimension`, `guardar`, `buscar`, `palabras`, `anotarUso`); la **fontanería genérica** aparece a veces en inglés (`readHookInput`, `projectRoot`, `sessionFlag`, `outHookJson`). **Regla sellada**: sigue el estilo del archivo que tocas; para lógica de dominio de la memoria, **español**. No se consolida a inglés (gana la consistencia del proyecto existente).
- **API/CLI pública** (flags y mensajes de usuario): **inglés primario con alias en español** (internacionalización, F14) — ej. `--save`/`--guardar`, `--search`/`--buscar` (`cli/memory.mjs:27-31`).
- **Comentarios**: **español**.
- **Devlog y memoria**: **español**.
- **Mensajes de commit**: **español**, Conventional ≤72 sin co-autores.
- **Textos de cara al usuario / producto (Cortex)**: **multilingüe** (es, en, pt, fr, de, it).

## Zonas intocables
- La **línea de autoría** (r3v3rs3) en las cabeceras: no se quita ni se cambia.
- Lo **generado por Senzu/Corvus**: `.claude/**`, `.corvusmem/**`, `CLAUDE.md`, `AGENTS.md`, `.mcp.json`, `senzu/senzu.json` (se regeneran, no se editan a mano).
- **Almacenes de memoria versionados** (`*.jsonl`): no se reescriben a mano; los gestiona el motor.
- **Cero dependencias de runtime**: no se añade ninguna sin aprobación del usuario.

---
Cambiar estas convenciones = decisión explícita del usuario: borrar `senzu/conventions.md` y `senzu/conventions.json` y re-ejecutar `/adoptar` (o editarlos a mano). Documentar el cambio en el devlog.
