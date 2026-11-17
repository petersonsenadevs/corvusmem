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

### F17-T8 · Extractor determinista: turnos → hechos con clave  [L] [doing]  ← columna de la fase
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
- **Sub-tareas:** (a) de-risk del suelo ESCALADO sobre el log (que el +~3 pts aguante al normalizar por tamaño);
  (b) implementarlo en `live-recall.mjs` (diario + decisiones, no hechos); (c) gate: `npm test` verde, abstención
  100 % intacta, sin regresión LoCoMo cat1–4; (d) reejecutar `--informe` tras días de uso y confirmar el +pts real.
- **Hecho cuando:** la precisión de uso real sube de forma medible SIN bajar la abstención 100 % ni perder recall de
  hechos. Si al escalar el suelo el margen se evapora, se descarta con evidencia.

### F17-T5 · Consolidación episódico → semántico  [M] [todo]
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
