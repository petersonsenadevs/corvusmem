# 013 — F17-T8c: el nudge usa el extractor (comando destilado) + fix node node

- **Fecha/hora:** 2026-11-17 15:16
- **Tipo:** feature
- **Mejora a:** 012
- **Tarea:** F17-T8

## Qué se hizo
- **Cableado (T8c):** el hook `UserPromptSubmit` (`src/live-memory.mjs`) ahora, ante una frase con forma de hecho,
  llama a `extraerHecho(texto)`. Si el extractor dimensiona el hecho (ubicación/sede/herramienta), el nudge le ofrece
  al agente el comando **YA DESTILADO** (`--dimension … --valor … --claves …` rellenos, el agente solo revisa); si es
  ambiguo, el placeholder de siempre y el agente destila a mano. **La clave deja de depender de que el agente acierte**
  — golpe directo a `pending.senzu-cede-escritura` (el dato que acababa en la dimensión/almacén equivocados).
- La construcción del comando se extrajo a `comandoGuardado(texto, cli)` (pura, exportable, testeable).
- **Fix colateral (bug preexistente que el cableado destapó):** el nudge anteponía `node` a `${cli}`, pero
  `rutaCliMemoria` YA trae el ejecutable (`node "…/corvusmem.mjs"` o `npx corvusmem`) → salía `node node …`, un comando
  roto. Corregido (se usa `${cli}` tal cual). `facts-guard` NO tenía el bug: ahí `cli` es `rutaBuscador(...)`, una ruta
  pura, y `node ${cli}` es correcto.

## Nota de arquitectura
- `live-memory` ↔ `extractor` forman un ciclo de imports (extractor usa el detector; live-memory usa el extractor).
  Es SEGURO: ninguno usa símbolos del otro en el top-level (solo dentro de funciones) y los módulos se cachean, así
  que no hay doble evaluación del hook. `test-boundary` (66 casos) carga ambos sin problema.

## Verificación
- `node tests/test-extractor.mjs` → **83 casos, 0 fallos** (76 + 7 nuevos de T8c: el nudge trae el comando destilado
  cuando la dimensión es clara, el placeholder cuando es ambigua o ruido).
- Hook end-to-end: `echo '{"prompt":"usamos pnpm",…}' | node src/live-memory.mjs` → el comando sale con
  `--dimension preferencia.gestor-paquetes` y un solo `node` (fix confirmado).
- Verde: boundary, facts, save-criterios, hecho-detector, extractor, import, parity, y la **puerta de `eval-memoria`
  (abstención 100%, hit@5 inyectado, duplicados)**. Rojo ajeno: `test-plugin` (`rutaCliMemoria` sin instalación),
  de ENTORNO (esta máquina tiene Corvus global), no de T8.

## Próximos pasos
- **T8d (medición en uso real):** el extractor ya alimenta el nudge; falta medir que al usarse no sube el ruido ni
  baja la abstención en sesiones reales (`--informe`). Y ampliar el extractor a más patrones (v1) solo con evidencia.
- Opcional: confirmar el de-risk con n=21 (lo lanza Peterson).
