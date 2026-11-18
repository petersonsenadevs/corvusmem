# F17 — Memoria más humana: del turno crudo al hecho con clave

> Autor: Peterson Sena (r3v3rs3). Fase para que la memoria **recupere y se actualice** como la humana —
> sin traicionar lo que hace único a Corvus: **determinista, offline, cero dependencias, cero LLM/embeddings
> en los hooks**. Semilla teórica en `docs/investigacion-memoria-humana.md` (ACT-R, spreading activation,
> Ebbinghaus+SM-2, CLS, fuzzy-trace, efecto fan).
>
> **Regla de oro inviolable (igual que F15):** la abstención de la batería `tools/eval-memoria` se queda al **100%**
> y `npm test` verde tras CADA tarjeta. Recuperar más mintiendo más es perder.
>
> **El método (el que ya funcionó):** no adivinar, **medir**. Cada tarjeta: hipótesis → implementar determinista →
> medir en la **batería** (`eval-memoria`, gate de `npm test`) y en el **bench** (LoCoMo / LongMemEval) →
> quedarse o **descartar con evidencia**.

## Hallazgo que vertebra la fase (la lección de la primera tanda)

**Ningún lever interno del motor sobre TURNOS CRUDOS (verbatim) mejora un bench serio.** Medido, no opinado:

| Lever probado | Resultado | Evidencia |
|---|---|---|
| Multi-hop / propagación por nombres (cat3) | cat3 clavado en 19,2%; aflojar el fan lo EMPEORA | dev-004 (devlog 004) |
| Medir uso/recencia para rankear | ningún bench actual mide la frecuencia de uso | dev-005 (devlog 005) |
| Abstención por umbral sobre BM25 | 0/24; el umbral crudo nunca abstiene | dev-007 |
| Abstención por confianza normalizada | la confianza no porta entre regímenes (verbatim vs comprimido) | dev-009 (sustituye dev-008) |
| Recencia / olvido blando (knowledge-update) | −4,1 pts: enfría turnos-oro antiguos y los saca del top-5 | dev-011 |
| cat5 de LoCoMo (abstención end-to-end) | la limita el CONTESTADOR (modelo pequeño), no el motor | `learning.cat5-no-desde-motor`, `cat5-modelo-mayor` |

**Conclusión:** el único camino que queda es cambiar el **RÉGIMEN de ingesta** — pasar del turno crudo (verbatim)
al **hecho con clave** (comprimido), que además es el régimen **real** del producto. Esa es la nueva columna de F17:
**F17-T8, extractor determinista.** Todo lo demás es pulido o está cerrado con evidencia.

## Brief — alcance

**IN (lo que entra en F17):**
- **Extractor determinista** turnos → hechos con clave estable (el puente que todos los experimentos señalan).
- **Consolidación** episódico → semántico (abstraer lo recurrente en regla al cerrar sesión) — si mueve el uso real.
- **Diagnóstico** de saturación de pistas (efecto fan) en `--health`.
- Medición seria en **LongMemEval** (knowledge-update + temporal + abstención) como escaparate del determinismo.

**OUT (no es de esta fase):**
- Embeddings, modelo semántico o cualquier red en el recall; LLM dentro de los hooks.
- Perseguir recall multi-hop puro en LoCoMo (terreno de LLM/embeddings; descartado en T1).
- Afinar levers internos sobre turnos crudos (abstención/recencia/uso): agotado de forma determinista.
- Cambiar el formato `.jsonl` o reescribir el motor BM25.

## Métricas que gobiernan la fase
- **Batería `eval-memoria`:** hit@5, **precisión de abstención (regla de oro = 100%)**, duplicados, ms/consulta.
- **LongMemEval:** knowledge-update recall@5 y acierto@5, temporal-reasoning, abstención `_abs`.
- **LoCoMo:** arena primaria (cat1–5) para no regresar; cat5 es de la batería, no del contestador.

---

## Tarjetas

### F17-T8 · Extractor determinista: turnos → hechos con clave  [L] [done]  ✅ publicado en 0.6.0
- **Skill:** code-quality §arquitectura + §tests. **De-risk primero** (commit f48a00d): probar en scratchpad sobre
  LongMemEval que el régimen comprimido sube knowledge-update/abstención ANTES de tocar el producto.
- **De-risk ✅ (2026-11-16, `scratchpad/lme-extractor-v0.mjs`, LongMemEval knowledge-update, n=8):** el régimen
  comprimido determinista (clave = 3 palabras salientes del turno) **empata al crudo en recall@5 (72,9% vs 75%)
  y lo SUPERA en acierto@5 (100% vs 87,5%)**. El baseline crudo reprodujo la referencia (75% ≈ 73,8% de dev-007),
  así que la medición es válida. Con una heurística de clave burdísima ya empata → el puente turnos→hecho-con-clave
  es viable y hay margen para keyear mejor. Variantes: k=1 r@5 58,3%/ac@5 100% (comprime de más); k=2 60,4%/87,5%.
  **Confirmado ✅ (n=21, 2026-11-17, lo lanzó Peterson):** el comprimido con v0 salientes k=3 **SUPERA al crudo en las
  DOS métricas — r@5 75,4% vs 73,8% y ac@5 100% vs 90,5%** (en n=8 solo empataba en r@5). Fundamento de T8 firme con
  la muestra de referencia. (Cuello conocido: `guardarHecho` reescribe el `.jsonl` por turno, O(n²).)
- Convertir los turnos de una conversación en hechos con **clave estable** (`recuperadorMotorEstructurado`:
  sustitución cronológica por dimensión) de forma **determinista** (sin LLM en el camino caliente; LLM, si acaso,
  solo como de-risk de laboratorio, nunca en los hooks).
- **Hecho cuando:** sobre LongMemEval, el régimen comprimido mejora knowledge-update y permite abstención real,
  SIN bajar la abstención 100% de la batería ni el recall cat1–4 de LoCoMo. Si no, se descarta con evidencia.

#### Diseño de implementación (anclado al código real del producto · map 2026-11-17)

**Qué YA existe (no se reconstruye):** la sustitución cronológica por clave es `sustituir()` (`src/facts.mjs:419`),
invocada desde `guardarHecho()` (`src/facts.mjs:272`, sink final) cuando la familia es de valor único; el store es
`.corvusmem/memory/facts.jsonl`; el motor de recall es `buscarHechos()` BM25 propio (`src/facts.mjs:661`), con
índice = tema de la dimensión + valor + texto + claves + léxico + aprendidas. Piezas deterministas reutilizables:
`dimensionConvencional()` (:129), `clavesConvencionales()` (:153), `normalizar()` (:55), `palabras()` (:61),
`avisosAutocontenido()` (:378).

**El hueco real:** hoy el "extractor" es el AGENTE a mano. Pipeline actual: usuario → `live-memory.mjs` detecta
frase con forma de hecho (`esHechoGuardable()` `src/live-memory.mjs:48`) y empuja un nudge (`:94`) → el agente elige
`dimension+valor+claves` → `guardarHecho`. NO hay pieza determinista texto→hecho. Esa dependencia del agente es la
causa del bug [[pending.senzu-cede-escritura]] (el que destila se equivoca de almacén/clave). **T8 pone esa pieza.**

**Matiz honesto:** el de-risk validó el RÉGIMEN comprimido, que el producto YA tiene. Lo que T8 aporta no es el
régimen: es **automatizar la destilación de forma determinista** (quitarle al agente la elección de clave) y, con
ello, mejorar la CALIDAD de la clave/dimensión elegida (el margen que el de-risk destapó).

**Sub-tareas (cada una se mide; regla de oro abstención 100% en todas):**
- **T8a · Clave mejor (laboratorio, barato, NO toca producto).** Probar funciones de clave mejores sobre LongMemEval
  knowledge-update. **Medido 2026-11-17 (`scratchpad/lme-extractor-v1.mjs`, n=8):** el STEMMING NO ayuda, EMPEORA —
  stem k=3 r@5 68,8% / stem k=4 66,7% / conjunto-completo 66,7%, todos ac@5 87,5%; la **v0 salientes k=3 (72,9% /
  ac@5 100%) sigue siendo la mejor** clave comprimida. Recortar sufijos colapsa palabras distintas y BM25 pierde
  señal; meter todas las palabras añade ruido. **Camino del stemming cerrado con evidencia.** **Confirmado n=21
  (2026-11-17, lo lanzó Peterson, ver [[preference.bench-lanzamiento]]):** v0 salientes k=3 r@5 **75,4%** / ac@5
  **100%**; stem k=3 71,4%, stem k=4 70,6%, conjunto 73,0% — ninguna variante nueva cumple el criterio (superar v0
  sin bajar ac@5). *Decisión FIRME:* la **v0 (salientes k=3)** es la clave del producto; el r@5 no estaba en la clave.
- **T8b · Módulo extractor en el producto** ✅ **(2026-11-17, `src/extractor.mjs` + `tests/test-extractor.mjs`,
  76/76 verde).** `extraerHecho(texto)` → `{dimension, valor, claves, fragmento, regla}` CANÓNICO (pasa por
  `dimensionConvencional()` + `clavesConvencionales()`, cero divergencia de formato) o `null`. v0 ACOTADO a los
  patrones de dimensión inequívoca (SUBCONJUNTO de `esHechoGuardable`): ubicación personal → `identidad.ubicacion`,
  sede/oficina → `proyecto.sede`, herramienta → `preferencia.gestor-paquetes`/`preferencia.editor`/`proyecto.stack`.
  Lo ambiguo (cifra de proveedor) devuelve `null` → el agente decide como hoy (precisión > recall). Reusa el guardián
  `PREGUNTA`. Registrado en `test-boundary` (núcleo) y en el script `test`/`test:core`. *Nota:* un rojo ajeno en
  `test-plugin` (`rutaCliMemoria` sin instalación) es de ENTORNO (esta máquina tiene Corvus global), no de T8.
- **T8c · Cableado conservador (recomendado).** El extractor ENRIQUECE el nudge de `live-memory.mjs:94`: en vez de
  pedir «elige dimension/valor», le da la propuesta ya destilada; el agente sigue confirmando (no se automatiza el
  guardado a ciegas, se evita el ruido). Ataca directo el bug de Senzu. Variante agresiva (auto-guardado sin agente)
  solo si la abstención aguanta. *Hecho cuando:* el agente guarda con la clave correcta sin elegirla él.
- **T8d · Medición.** *Matiz hallado (2026-11-17):* `tools/eval-memoria` mide el MOTOR con hechos YA estructurados
  (los casos traen dimension/valor/claves dados), NO la extracción texto→hecho. Por eso la PRECISIÓN del extractor
  la mide su propio test (`test-extractor`, texto → dimensión esperada). `eval-memoria` entra cuando el extractor se
  CABLEE (T8c) y alimente los hechos que luego se recuperan: ahí se exige hit@5 ≥ baseline, abstención 100%,
  duplicados, sin regresión en LoCoMo cat1–4; gate `npm test`. *Hecho cuando:* cableado sin bajar la abstención.
- **T8e · Devlog + decisión viva.** Gana y se integra, o se descarta con evidencia.

### F17-T9 · Suelo absoluto para el diario (el 70 % del ruido de uso real)  [M] [todo · de-riskado]
- **Skill:** code-quality §tests. **Origen:** medición de uso real 2026-11-17 (devlog 016–017). La precisión de uso
  real es ~24 % (3 de cada 4 recuerdos inyectados se ignoran), y el **69 % de ese ruido es el DIARIO** (`[devlog]`,
  1045 inyecciones, 21 % de acierto). Los **permanentes** (preferencia/identidad/restricción) son solo el **2,8 %**
  del ruido → NO se tocan (ahí está [[preference.autoria]]: parece no usarse pero importa; el proxy «usado» la
  infravalora porque moldea código, no el chat).
- **Causa raíz (código real):** `src/live-recall.mjs:43`. Los hechos tienen suelo ABSOLUTO (`UMBRAL_HECHO`); el diario
  y las decisiones solo tienen umbral RELATIVO (`puntuacion > 0 && >= RELATIVO * mejor(fuente)`). Sin suelo absoluto,
  el diario cuela sus mejores entradas aunque la relación real sea mínima («el mejor de un grupo flojo»).
- **De-risk ✅ (sobre `recuerdo-uso.jsonl`, 1127 items de diario+decisiones con puntuación):** un suelo absoluto corta
  mucho ruido perdiendo pocos útiles — suelo 5: −289 ignorados / −42 usados (~7:1); suelo 6: −410 / −66 (~6:1). La
  precisión GLOBAL sube ~24 % → **~27 %** solo con esta perilla, sin tocar hechos ni permanentes. Rodilla en 5–6.
- **Matiz de implementación (por qué NO es un `if` de una línea):** la puntuación del diario DEPENDE del tamaño del
  diario (`search.mjs`: ~0,7 en uno pequeño, ~38 en uno grande; ver comentario en `live-recall.mjs:14-16`) — por eso
  existe el umbral relativo. El suelo tiene que ser **proporcional a la escala** (normalizado o percentil del propio
  diario), NO una constante que rompería los diarios pequeños.
- **Hecho cuando (la tarjeta madre):** la precisión de uso real sube de forma medible SIN bajar la abstención 100 % ni
  perder recall de hechos. Si al escalar el suelo el margen se evapora, se descarta con evidencia.

#### F17-T9a · De-risk del suelo ESCALADO (laboratorio, barato)  [S] [done]
- **Skill:** code-quality §tests. ✅ **(2026-11-17, devlog 018, `scratchpad/t9a-suelo-escalado.mjs`).** Suelo =
  **fracción × escala(p90 del mejor acierto de diario por consulta)**. Escala grande 20,2 vs pequeña 4,7 (~4×) →
  confirma que una constante rompería el pequeño. **Punto seguro `0,25 × escala`:** grande corta 266 ignorados / pierde
  36 útiles (acierto 21→24 %), pequeño corta 4 / pierde 0 (22→24 %); ambos mejoran, ninguno regresa. Pasar de ~0,30
  daña el pequeño. Aviso: pequeño n=37 (poco), pero 0,25 es conservador e inocuo-a-favor allí.

#### F17-T9b · Suelo en el motor  [M] [done]
- **Skill:** code-quality. ✅ **(2026-11-17, devlog 019).** `src/live-recall.mjs` aplica `puntuacion >= 0,25 × escala`
  a `devlog`+`memoria` (los `hecho` NO se tocan). Escala = `escalaDiario(root)` en `src/facts.mjs` = p90 del mejor
  acierto de diario por consulta en `recuerdo-uso.jsonl`. **Fallback:** < 20 consultas → escala 0 → sin suelo
  (proyecto nuevo/pequeño intacto). Verificado: dev-standards escala 20,2; hemispheric 0 (aún poca historia).

#### F17-T9c · Gate de no-regresión  [S] [done]
- **Skill:** code-quality §tests. ✅ **(2026-11-17).** `eval-memoria --gate`: hit@5 100 %, **abstención 100 %**,
  duplicados 100 %. `tests/test-recall-piso.mjs` 9/0 (registrado en `test`/`test:core`). Resto verde; rojo ajeno
  `test-plugin` (ambiental, Corvus global en la máquina). No afecta a LoCoMo (mide el motor, no la inyección).

#### F17-T9e · Suelo escalado por confianza (0,25→0,35)  [M] [done]
- **Skill:** code-quality. ✅ **(2026-11-17, devlog 022).** La fracción del suelo sube con la historia: 0,25 recién
  pasado el mínimo (20 consultas) → 0,35 con ≥ 200. `pisoDiario(root)` en `src/facts.mjs` es la única fuente (hook +
  bench). Bench: dev-standards **23,7 → 28,8 % (+5,1 pts)**, casi el doble del suelo plano; pequeño intacto. Seguro por
  construcción (0,35 solo con mucha historia). `test-recall-piso` 12/0; gate abstención 100 %.

#### F17-T9d · Confirmar en uso real  [S] [todo]  ← SIGUIENTE (lo lanza Peterson, tras días de uso)
- **Skill:** —. **Bench oficial listo (devlog 020): `tools/eval-precision-inyeccion.mjs`** — replay sobre el historial
  real con etiquetas usado/ignorado; reporta precisión antes→después del suelo. Hoy (contrafactual sobre lo ya
  acumulado): dev-standards **23,7 → 28,8 % (+5,1 pts)**, 5,6 ruido:1 útil; hemispheric aún sin suelo (poca historia).
- **Hecho cuando:** tras días de uso, la precisión «después» se vuelve la «antes» real y sube frente a 016; también en
  hemispheric cuando junte ≥ 20 consultas de diario.
- **Verificar:** `node tools/eval-precision-inyeccion.mjs D:/dev-standards D:/hemispheric` (lo lanza Peterson,
  [[preference.bench-lanzamiento]]); comparar con `node cli/memory.mjs --informe` para el detalle.

#### F17-T10 · Fatiga de inyección  [M] [discarded]
- **Skill:** code-quality §tests. ❌ **(2026-11-17, devlog 021).** Suprimir entradas de SITUACIÓN sobre-disparadas
  (iny ≥ 8, uso < 20 %), scoped para no tocar permanentes. De-risk CAUSAL sobre el log (ya con suelo T9): **+0,4 pts
  como mucho, a 3:1** (vs suelo 7:1). No compensa: cuando una entrada «demuestra» que no sirve ya hizo el daño, y
  suprimirla mata sus usos futuros. Ruido residual del diario DISPERSO, sin patrón concentrado. Descartada con
  evidencia. El único lever de fondo restante —mejor proxy de utilidad— es investigación, no se abre a ciegas.

### F17-T5 · Consolidación episódico → semántico  [M] [paused]
- **De-risk 2026-11-17 (devlog 023): APLAZADA.** Memoria global = 13 hechos, cada uno en su propia dimensión (fan 0);
  almacenes de proyecto 6–8. No hay recurrencia que consolidar a esta escala; construirlo ahora sería adivinar.
  **Disparador para retomar:** una dimensión de acumular con ≥ 5 hechos, o `--health` avisando de saturación sobre
  HECHOS (no diario). Hasta entonces, no se toca.
- **Skill:** code-quality. Al cerrar sesión, abstraer hechos recurrentes en una **regla estable** (menos ruido, más
  señal duradera). Mide en **uso real** (`--informe`), no en recall puro.
- **Hecho cuando:** el uso real (inyectado→usado) mejora o el ruido baja sin tocar la abstención. Depende de que T8
  dé el régimen de hechos; va DESPUÉS de T8.

### F17-T6 · Gist explícito (con guardia de abstención)  [M] [todo · riesgo]
- **Skill:** code-quality §tests. Recall por **significado** sin embeddings (determinista). **Riesgo alto:** puede
  bajar la abstención (como F15-T6). Se mide la regla de oro en cada paso.
- **Hecho cuando:** sube hit@5 sin bajar la abstención 100%. **Se descarta sin drama** si la toca.

### F17-T4 · Efecto fan / saturación de pistas en `--health`  [S] [done]
- Aviso de dimensiones densas (pistas saturadas) en `--health`; **sin tocar el ranking**. Diagnóstico, no cambio de
  recuperación. ✅ devlog 010, commits 635e743 + 5774d96.

### F17-T11 · Recuperación en las categorías flojas (cat1 single-hop, cat3 multi-hop)  [M] [todo · de-risk primero]
- **Por qué:** el diagnóstico de hoy (devlog 025-026) mostró que la **recuperación es la fuerza del motor** (2-4× el
  embedding) y que el modo crudo ya **gana end-to-end (34,8 %)**. El techo que queda está en las dos categorías flojas:
  **cat1 single-hop (acierto@5 40,8 %)** y **cat3 multi-hop (34,8 %)**. Subir ahí empuja el 34,8 % más arriba. Reabre
  legítimamente [[F17-T1]] (su condición era *"co-ocurrencia de contenido sobre hechos extraídos, post-T8"* — y **T8 ya
  existe**). Método de la fase: **de-risk offline primero** (`recuperar.mjs`, sin LLM), **regla de oro (abstención
  100 %) en cada paso**, el bench end-to-end pesado lo lanza Peterson ([[preference.bench-lanzamiento]]). Riesgo honesto:
  puede acabar **descartada** (como T1/T3/T7/T10) si el fallo es disperso y sin palanca — y saberlo también es ganar.

#### F17-T11a · Diagnóstico de los fallos de recuperación cat1/cat3 (offline, barato)  [S] [done]
- ✅ **(2026-11-18, devlog 028).** **Vocabulario REFUTADO** (vocab_gap 5-8%): el léxico NO es la palanca. El fallo
  dominante es **ranking_loss (44% cat1, 66% cat3)** — el oro puntúa >0 pero lo superan turnos de ruido (ranks 196,
  254…). Causa: **solape pregunta↔oro ~0,3-0,64 palabras** (la pregunta nombra a alguien y la respuesta narra sin
  nombrar el concepto); intrínsecamente duro (el embedding va aún peor). **Palanca candidata:** subir el peso del encaje
  **entidad/hablante** (el oro es de/sobre la persona nombrada pero pesa poco). → T11b.
- **Skill:** code-quality §tests. En `scratchpad/`, sin tocar producto.
- **Qué:** con `recuperar.mjs` sobre LoCoMo, sacar las preguntas de **cat1 y cat3** donde el motor NO mete la evidencia
  en top-10 y **clasificar el fallo**: (a) **brecha de vocabulario** (palabras de la pregunta ≠ del turno-evidencia →
  palanca léxico/expansión de conceptos), (b) **turno-evidencia corto/escaso** (poco texto que casar → normalización
  por longitud), (c) **referencia/pronombre** (necesita contexto → estructural), (d) **multi-hop**: una evidencia
  encontrada y las otras no. Contar cada tipo.
- **Hecho cuando:** hay un recuento por tipo en cat1 y cat3 y queda claro **si hay una palanca determinista concentrada
  (y cuál)** o si es disperso (→ descartar, como T10).
- **Verificar:** script en `scratchpad/` reproducible, sin red; números por tipo de fallo.

#### F17-T11b · Palanca determinista según el diagnóstico, medida offline  [M] [todo]  ← SIGUIENTE
- **Skill:** code-quality. Depende de T11a. **Palanca elegida (de T11a):** boost del encaje entidad/hablante.
- **Qué:** implementar la palanca MÁS concentrada que halle T11a tras un **flag/env** (sin tocar el camino por defecto):
  p. ej. ampliar el léxico de conceptos para las brechas, o un ajuste de ranking/normalización por longitud. Medir con
  `recuperar.mjs`: recall@5/@10 y acierto@5/@10 en **cat1/cat3 ARRIBA** y **el resto SIN regresar**.
- **Hecho cuando:** sube la recuperación de cat1 y/o cat3 **sin bajar las otras categorías ni la abstención**. Se
  **descarta sin drama** si regresa.
- **Verificar:** `recuperar.mjs` antes/después por categoría; `eval-memoria --gate` verde (**abstención 100 %**, hit@5);
  test propio si se toca código del motor.

#### F17-T11c · Confirmación end-to-end crudo (la lanza Peterson)  [S] [todo]
- **Skill:** —. Si T11b mejora la recuperación offline sin regresar, correr el end-to-end **crudo** del motor y comparar
  global + por categoría contra el baseline de hoy (`resultados-e2e-locomo-motor-crudo.json`, 34,8 %).
- **Hecho cuando:** el global crudo sube (o cat1/cat3 suben sin bajar el global). Si no, se descarta con evidencia.
- **Verificar:** `pipeline.mjs --locomo --ingesta crudo --retriever motor` → `comparar.mjs` contra el crudo de hoy
  ([[preference.bench-lanzamiento]], lo lanza Peterson).

---

## Cerradas con evidencia (no re-abrir sin un régimen nuevo)

### F17-T1 · Multi-hop por activación propagada  [L] [discarded]
- cat3 no sube aflojando el fan; lo empeora. Descartado midiendo (dev-004). Reabrir solo con grafo de **co-ocurrencia
  de contenido** (no de nombres) y **sobre hechos extraídos** (post-T8), no sobre turnos crudos.

### F17-T2 · Ranking por activación (ACT-R base-level)  [M] [paused]
- Baja a **pulido de producto** (dev-006): ningún bench serio mide la frecuencia de uso/recencia (dev-005). No es la
  credibilidad de la fase. Puede volver como ajuste fino una vez T8 fije el régimen.

### F17-T3 · Olvido blando + refuerzo por uso  [M] [blocked]
- La recencia **empeora** knowledge-update (−4,1 pts, dev-011): enfría turnos-oro antiguos. El lever `pesoUso` (±21%)
  es muy suave para ayudar y suficiente para estorbar. Su otra pata (menos ruido) no la ve la batería (dev-005).

### F17-T7 · Abstención por confianza normalizada  [M] [discarded]
- La confianza mide cobertura pregunta↔texto, que depende del **RÉGIMEN** (verbatim vs comprimido), no del corpus:
  umbral único imposible (dev-009, sustituye dev-008). La abstención por umbral desde el motor está **agotada**.

---

## Decisiones vivas de la fase
- **D-006:** la credibilidad de F17 = **abstención + knowledge-update** sobre **LongMemEval** (no recall multi-hop).
- **D-009:** la abstención por umbral desde el motor está cerrada; el puente es el **extractor determinista** (T8).
- **Honestidad (doc §5):** cat5 de LoCoMo lo limita el contestador; el "saber callar" de Corvus vive en la **batería**
  (100% determinista), no en cat5.
