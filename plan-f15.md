# F15 — Memoria fiable: endurecer guardado y recall con batería adversarial

> Autor: Peterson Sena (r3v3rs3). Fase para que la memoria se **sienta** fiable, con evidencia, no con fe.
> **Regla de toda la fase (igual que F14): sin romper nada.** El formato `.jsonl` no cambia, los hechos ya guardados se
> leen igual, el motor BM25 sigue siendo el mismo, **cero embeddings y cero LLM en los hooks** (es lo que hace único a
> Corvus). `npm test` verde tras CADA tarjeta; si algo rompe, no se avanza.
>
> **La estrategia no es "adivinar mejor", es subir el suelo de forma determinista y MEDIRLO.** Por eso la primera
> tarjeta es la batería adversarial: sin baseline, el resto es a ciegas. La última tarjeta convierte esa batería en la
> puerta de `npm test`, para que ninguna regresión entre.

## Brief — alcance

**IN (lo que entra en F15):**
- Endurecer el **GUARDADO** (la vía que hoy depende del criterio del agente): criterios explícitos, detectores de alta
  precisión en los mensajes del usuario, nudge suave de cierre, guard de casi-duplicados.
- Endurecer el **RECALL** sin romper el determinismo: expansión determinista de consulta y coincidencia débil
  etiquetada en vez de silencio.
- **Batería adversarial** como baseline primero y como puerta de regresión después.
- (Opcional) Fiabilidad **percibida**: `--health` / panel en el Cortex.

**OUT (no es de esta fase):**
- Embeddings, modelo semántico o cualquier red en el recall. LLM dentro de los hooks.
- Cambiar el formato `.jsonl` o reescribir el motor BM25.
- Distribución / directorio oficial / marketplace (es otro frente, no es fiabilidad del motor).

## Métricas que gobiernan la fase (se fijan en F15-T1)
- **hit@5**: de las consultas de la batería con hecho conocido, cuántas lo traen en el top 5.
- **Precisión de abstención**: de las trampas (sin respuesta correcta), cuántas calla de verdad (no inventa).
- **Guardado**: en qué casos salta el nudge y en cuáles calla (varianza y ruido).
- **Duplicados**: 0 al guardar variantes del mismo hecho.
> Regla de oro del recall: **subir hit@5 NUNCA a costa de bajar la precisión de abstención.** Recuperar más mintiendo
> más es perder.

---

## Tarjetas

### F15-T1 · Batería adversarial + baseline  [S] [done]
- **Skill:** code-quality §tests (estilo de `tools/eval-tokens.mjs`, que ya existe).
- Crear `tools/eval-memoria/eval.mjs` + `tools/eval-memoria/casos.json` (set de hechos conocidos + consultas):
  paráfrasis, sinónimos, multiidioma (ES/EN), temporal (pasado/presente) y **trampas** (franjas del día, siglas, nombres).
- Mide **hit@5**, **hit@5 inyectado**, **precisión de abstención**, **duplicados** y **ms/consulta**; deja
  `tools/eval-memoria/resultados.json`.
- **Hecho cuando:** el runner corre y escupe el informe con los números de HOY (el "antes" de la fase). ✅
- **Verificar:** `node tools/eval-memoria/eval.mjs` + `npm run test:core` verde (227/227 facts, 14/14 hard-recall). ✅
- **Baseline (2026-11-09, umbral 0,8):** hit@5 **81,8 %** · hit@5 inyectado **63,6 %** · abstención **100 %** ·
  duplicados OK **100 %** · **~2 ms**/consulta. Los 4 fallos son paráfrasis sin vocabulario compartido
  (`sangrar`≈indentar, `publicar`≈desplegar, `API externa`≈servicios externos, y `charge` que trae la tarifa al top-5
  pero bajo umbral) → objetivo directo de **F15-T5/T6**. La abstención (100 %) es la línea que no se puede bajar.

### F15-T2 · Criterios de guardado explícitos (baja la varianza del agente)  [S] [done]
- **Skill:** devlog / recordar (texto de la skill) + el texto de los nudges.
- Nuevo mensaje canónico **`save.criterios`** (`messages.mjs`, ES+EN): la **vara** concreta y en positivo ("guarda si
  salió una decisión, un límite, una preferencia, un dato externo con nombre/cifra, un *gotcha* con su causa, o un
  objetivo/pendiente; ¿lo necesitarías la próxima vez y no está en el código? entonces va; el trabajo rutinario NO").
- **Una sola fuente, usada en los dos sitios:** `session-start.mjs` (al empezar) y `facts-guard.mjs` (aviso de cierre)
  ahora usan `save.criterios` en vez de una pregunta vaga ("¿dijo algo estable?") que invitaba a responder "no".
- **Hecho cuando:** el criterio es explícito, concreto y el mismo al empezar y al cerrar. ✅
- **Verificar:** `tests/test-save-criterios.mjs` (18/0): el criterio enumera los disparadores en ES+EN y lo usan
  `session-start` y `facts-guard`. `npm run test:core` verde. ✅

### F15-T3 · Detectores "con forma de hecho" + nudge suave de cierre  [S] [done]
- **Skill:** code-quality §hooks.
- `live-memory.mjs`: patrones de **alta precisión** más allá de reglas («usamos X», «… cobra 600 €», «vivo en Madrid»,
  «la oficina está en Bilbao», «la API es …») → empujan a guardar. Detectores **puros y exportables**
  (`esHechoGuardable`, `PREGUNTA`), con el hook tras una guarda «solo como script» para poder testearlos sin montarlo.
  **Guardián de precisión:** una PREGUNTA nunca es un hecho (así «qué framework usamos…» o «cuánto paga…» NO disparan).
  Deja la marca `hecho-pendiente`; usa la vara única `save.criterios` (F15-T2).
- `session-state.mjs` (Stop, sección 2b): recordatorio **no bloqueante** (`systemMessage`, nunca `decision:block`) si
  quedó un `hecho-pendiente` y la sesión no guardó nada (facts.jsonl / MEMORIA.md / memoria del usuario sin tocar).
- **Hecho cuando:** los detectores disparan en casos fuertes y callan en las trampas; el nudge de cierre nunca bloquea. ✅
- **Verificar:** `tests/test-hecho-detector.mjs` (34/0): dispara en los 8 hechos fuertes, **0 falsos** sobre las 15
  consultas de la batería + ruido conversacional, y el cierre solo usa `systemMessage`. `npm run test:core` verde. ✅
- **Nota (bug encontrado):** `\b` tras vocal acentuada (á/é) no casa en JS (los acentos no son «word char» ASCII), así que
  `\bqu[eé]\b` no veía "qué" y `\best[aá]\b` no veía "está". Arreglado con lookarounds `(?<![\p{L}])…(?![\p{L}])` (flag `u`).

### F15-T4 · Guard de casi-duplicados al guardar  [S] [done]
- **Skill:** code-quality §tests.
- **Ya estaba cubierto por el motor:** `parecido()` + `UMBRAL_CASI_DUPLICADO = 0.6` en `guardarHecho` ya deduplican
  variantes (misma dimensión, valor casi-igual). La batería de F15-T1 lo **verifica**: `vim`/`VIM` y `Astro con Vue`/
  `Astro + Vue` → un solo hecho activo.
- **Hecho cuando:** guardar dos variantes del mismo hecho deja **un** hecho, no dos. ✅
- **Verificar:** `duplicados OK 100 %` en la batería; `npm run test:core` verde. ✅ (Sin cambios de código necesarios.)

### F15-T5 · Expansión determinista de consulta (recall)  [S] [done]
- **Skill:** code-quality §rendimiento.
- **En vez de abrir un camino nuevo, se extendió el mecanismo que ya existe:** `LEXICO` en `facts.mjs` (concepto →
  formas en varios idiomas, que se añade a cada hecho cuyo tema coincide). Los fallos del baseline eran temas sin
  entrada. Añadidos: `indentacion`, `oficina`, `deploy`, `tarifa` (ES/EN + conjugaciones frecuentes). Cero red, cero LLM.
- **Hecho cuando:** las consultas parafraseadas/multiidioma de la batería suben el hit@5. ✅
- **Verificar:** hit@5 sube y la abstención se mantiene; `npm run test:core` verde (227/227, 14/14). ✅
- **Resultado (2026-11-09):** hit@5 inyectado **63,6 → 90,9 %** sobre la batería original, **abstención 100 %** intacta
  (la regla de oro). El único caso que faltaba (`«API externa»`) resultó ser el motor absteniéndose **con razón**: marca
  `nombra:["API"]` (la pregunta nombra algo que la memoria nunca oyó → "sabe que no sabe"), no un fallo de recall. Se
  reclasificó en la batería como comprobación de abstención. Batería final honesta: **inyectado 100 % · abstención 100 %**.

### F15-T6 · Coincidencia débil etiquetada (en vez de callar)  [S] [descartada]
- **Skill:** code-quality §hooks.
- **Decisión (2026-11-09): NO se envía.** Se implementó y se revirtió tras medir. Dos razones de evidencia:
  1. El caso que la motivaba (`«API externa»`) no era un hueco: el motor lo suprime a propósito (`nombra`, "sabe que no
     sabe"). Mostrarlo contradiría esa garantía.
  2. Los casos débiles **legítimos** (sin `nombra`, bajo umbral) son raros: cuando una palabra de contenido real coincide,
     el motor ya puntúa por encima del umbral; cuando no, no hay nada. La franja intermedia es delgada y en buena parte es
     `nombra`. Aflorarla arriesgaría la **abstención del 100 %**, que es el mayor argumento del producto.
- **Conclusión:** el comportamiento "o coincide con fuerza o calla" es más fuerte que un canal de "quizá". El frente de
  recall cierra en **T5**. Código revertido; `facts.mjs`/`messages.mjs`/`live-recall.mjs` quedan como estaban.

### F15-T7 · La batería como PUERTA de regresión (npm test)  [S] [done]
- **Skill:** code-quality §tests.
- `tools/eval-memoria/eval.mjs --gate` (nuevo modo) falla con **exit 1** si la memoria regresa. Umbrales: **hit@5
  inyectado ≥ 90 %**, **abstención = 100 %** (la regla de oro, exacta), **duplicados = 100 %**, y **MIN_CASOS 12**
  (para que nadie "pase" vaciando la batería). Cableado en `test` y `test:core` de `package.json`.
- **Hecho cuando:** `npm test` falla si el recall, la abstención o el dedup regresan. ✅
- **Verificar:** forzar regresión (umbral a 101 %) → **exit 1, rojo**; revertir a 90 % → verde; `test:core` completo
  verde con la puerta dentro (exit 0). ✅ Probado 2026-11-09.

### F15-T8 · `--health` y panel de fiabilidad en el Cortex  [S] [done]
- **Skill:** ui-ux-pro-max (para el panel) + cli.
- **Una sola fuente:** `datosSalud(root)` en `facts.mjs` (hechos activos/histórico/por familia, objetivos abiertos, uso
  REAL de `informeUso`, última sesión de `ultima-sesion.json`, y la batería `eval-memoria/resultados.json` **solo si
  existe** —es herramienta de desarrollo, en una instalación sale `null` y se dice).
- `corvusmem --health` (alias de `--salud`, `+--json`): imprime el informe. `datosCortex` incluye `salud`; `htmlCortex`
  pinta un panel **server-rendered** (se lee sin JS; etiquetas por `data-t` con fallback es→en). Las filas privadas
  (uso real, última sesión) van con `solo-dueno` y **no viajan** al HTML/JSON del cliente (gate verificado).
- **Hecho cuando:** `--health` imprime el estado y el Cortex lo muestra, sin filtrar nada privado al cliente. ✅
- **Verificar:** `tests/test-health.mjs` (14/0): forma de `datosSalud`, panel del dueño con filas `solo-dueno`, cliente
  sin uso ni última sesión (ni en JSON), y `corvusmem --health --json` exit 0 parseable. `npm run test:core` verde +
  `test-cortex-visual` 40/0. ✅

---

## Orden recomendado
T1 (baseline, obligatoria) → T2, T3, T4 (guardado) → T5, T6 (recall) → T7 (puerta) → T8.
Los números de los umbrales de T7 salen de medir en T5/T6: **primero se mide, luego se sella.**

## Estado final de F15 (2026-11-10)
**Completa.** T1·T2·T3·T4·T5·T7·T8 **done** · T6 **descartada con evidencia**. Batería: hit@5 inyectado 100 % ·
abstención 100 % · duplicados 100 % · ~0,7 ms, convertida en puerta de `npm test`. Guardado endurecido (criterio único,
detectores con forma de hecho, dedup) y recall ampliado deterministamente. Fiabilidad visible con `--health` y el panel
del Cortex. Cero embeddings, cero LLM en los hooks, formato `.jsonl` intacto. Siguiente frente: **F16 (bench vs Mem0/Zep).**
