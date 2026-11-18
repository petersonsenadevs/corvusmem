# 027 — Release 0.6.0: puerta de publish verde (X-T1) + notas y bump

- **Fecha/hora:** 2026-11-18 15:20
- **Tipo:** release
- **Mejora a:** —
- **Tarea:** release 0.6.0 (cierra X-T1)

## Contexto
El usuario decide publicar: npm está en **0.5.2**, package.json en 0.5.3 (bump colgado, nunca publicado),
y `[Unreleased]` acumula lo gordo (extractor T8, suelo del diario T9, --health, nudges, benchmark). Al
preparar el release salta el bloqueo conocido: `test:core` falla en `test-plugin`.

## Qué se hizo
1. **X-T1 — aislar `test-plugin` del Corvus global (el bloqueo de publish).** `rutaCliMemoria` (src/lib.mjs)
   prioriza plugin > proyecto > **global (`~/.config/corvusmem/cli`)** > npx. En la máquina del autor ese
   global EXISTE (es el CLI de memoria), así que la aserción «sin instalación → npx» devolvía el global y
   fallaba. Como `preversion` y `prepublishOnly` corren `test:core`, **abortaba `npm version` y `npm publish`**.
   Arreglo: la aserción apunta `HOME`/`USERPROFILE` a un temp vacío solo durante esa comprobación y restaura
   (test-only, no toca el producto). `tests/test-plugin.mjs` 63/0.
2. **Verificación:** `npm run test:core` **verde de punta a punta** — todas las suites + `eval-memoria --gate`
   (abstención 100%, hit@5 inyectado 100%, duplicados 100%, ~2 ms). La regla de oro intacta.
3. **CHANGELOG:** `[Unreleased]` → **`[0.6.0] — 2026-11-18`** (+ nuevo `[Unreleased]` vacío). Viñeta del
   benchmark actualizada con el hallazgo crudo (modo nativo sin LLM = **34,8 %**, la columna más alta; honradez:
   con LLM el embedding aún gana cat1/cat3). Nueva entrada en Fixed por X-T1.
4. **Bump:** package.json 0.5.3 → **0.6.0** (minor; features retrocompatibles). Edición directa (paquete sin
   dependencias; sin re-disparar la puerta ni crear tag suelto en la rama).

## Verificación
- `test:core` verde (ver arriba). `npm pack --dry-run` pendiente de revisar antes de publicar (que no viaje
  el log privado ni el harness). No se tocó lógica del motor en este paso (solo un test + CHANGELOG + versión).

## Próximos pasos (los lanza Peterson — regla: él pushea y publica)
1. `git push -u origin chore/corvus-senzu-adopt`
2. Merge a `main` (PR o fast-forward).
3. En main: `git tag v0.6.0 && git push --follow-tags`
4. `npm publish` (el registry pasa de 0.5.2 a 0.6.0; el 0.5.3 nunca salió y se queda como historial del CHANGELOG).
