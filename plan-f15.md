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

### F15-T2 · Criterios de guardado explícitos (baja la varianza del agente)  [S] [todo]
- **Skill:** devlog / recordar (texto de la skill) + el texto de los nudges.
- Fijar un checklist de "qué es un hecho duradero" (decisión tomada, límite descubierto, preferencia dicha, dato externo
  con nombre, un *gotcha* que costó tiempo) y reflejarlo en el texto del nudge de `live-memory.mjs` y en la skill, para
  que agentes distintos converjan en lo mismo.
- **Hecho cuando:** el nudge y la skill enumeran los criterios; distintos agentes guardan lo mismo ante el mismo caso.
- **Verificar:** test que comprueba que el texto del nudge incluye los criterios; `npm test` verde.

### F15-T3 · Detectores "con forma de hecho" + nudge suave de cierre  [S] [todo]
- **Skill:** code-quality §hooks.
- `live-memory.mjs`: patrones de **alta precisión** más allá de reglas («el cliente X paga…», «usamos…», «vive en…»,
  «la API es…») → empujan a guardar. Precisión alta, recall bajo: antes perder uno que meter ruido.
- `session-state.mjs` (Stop): nudge **no bloqueante** de destilado si la sesión tocó código o avanzó plan y guardó
  **cero** hechos ("¿salió un aprendizaje reusable? guárdalo o di `--none`").
- **Hecho cuando:** los detectores disparan en casos fuertes y callan en las trampas; el nudge de cierre nunca bloquea.
- **Verificar:** test de precisión sobre la batería (dispara en los fuertes, 0 falsos en trampas); `npm test` verde.

### F15-T4 · Guard de casi-duplicados al guardar  [S] [todo]
- **Skill:** code-quality §tests.
- `facts.mjs` (`guardarHecho`): detectar hecho casi-igual (misma dimensión + solape alto de claves/valor) → **actualiza**
  el vigente en vez de añadir un duplicado. Respeta la regla legacy de autor de F14.
- **Hecho cuando:** guardar dos variantes del mismo hecho deja **un** hecho, no dos.
- **Verificar:** test dedup (2 variantes → 1); re-correr F15-T1 y comprobar que el ruido NO sube; `npm test` verde.

### F15-T5 · Expansión determinista de consulta (recall)  [S] [todo]
- **Skill:** code-quality §rendimiento.
- `facts.mjs` (`recuerdo`/`palabras`): stemming ligero + mapa de sinónimos por idioma + apalancar las `--keys` (EN +
  idioma nativo) que ya se guardan, para que «servidor»≈«host»≈«server» coincidan. Todo en tablas locales, sin red.
- **Hecho cuando:** las consultas parafraseadas/multiidioma de la batería suben el hit@5.
- **Verificar:** hit@5 sube vs. baseline de F15-T1 **y** la precisión de abstención se mantiene; `npm test` verde.

### F15-T6 · Coincidencia débil etiquetada (en vez de callar)  [S] [todo]
- **Skill:** code-quality §hooks.
- `live-recall.mjs`: cuando el mejor candidato queda **justo** bajo el umbral, mostrarlo marcado como débil (ya existe la
  marca `débil`) en vez de silenciarlo. El agente decide si viene al caso.
- **Hecho cuando:** un caso de paráfrasis perdida ahora muestra el candidato marcado, sin inventar.
- **Verificar:** los casos "justo bajo umbral" de la batería aparecen como débil; la precisión de abstención NO baja;
  `npm test` verde.

### F15-T7 · La batería como PUERTA de regresión (npm test)  [S] [todo]
- **Skill:** code-quality §tests.
- Congelar el set de F15-T1 y meterlo en `npm test` con umbrales: `hit@5 ≥ X`, abstención `≥ Y`, 0 duplicados (X e Y se
  fijan con los números reales de F15-T5/T6, nunca por debajo del baseline).
- **Hecho cuando:** `npm test` falla si el recall o el guardado regresan.
- **Verificar:** forzar una regresión (bajar un umbral del motor) → test rojo; revertir → verde.

### F15-T8 · (opcional) `--health` y panel de fiabilidad en el Cortex  [S] [todo]
- **Skill:** ui-ux-pro-max (para el panel) + cli.
- `corvusmem --health`: hechos guardados, tasa de acierto sobre la eval, última sesión (guardó/omitió). Panel en el
  Cortex con lo mismo. Responde al "¿por qué no lo recordó?" con transparencia.
- **Hecho cuando:** `--health` imprime el estado y el Cortex lo muestra.
- **Verificar:** `node cli/corvusmem.mjs --health` da el informe; panel visible; `npm test` verde.

---

## Orden recomendado
T1 (baseline, obligatoria) → T2, T3, T4 (guardado) → T5, T6 (recall) → T7 (puerta) → T8 (opcional).
Los números de los umbrales de T7 salen de medir en T5/T6: **primero se mide, luego se sella.**
