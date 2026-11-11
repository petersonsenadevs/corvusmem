# Plan — F17 "Memoria más humana (determinista)"

- **Objetivo:** subir el recall del motor (sobre todo cat3 multi-hop) emulando mecanismos deterministas de memoria humana, sin LLM/embeddings/red y sin bajar la abstención de la batería.
- **Estado:** en curso · **Actualizado:** 2026-11-11
- **Stack / perfil:** node-api · librería + CLI · Node ESM puro (`.mjs`), cero dependencias de runtime
- **Brief:** `senzu/plan/brief.md` · **Semilla:** `docs/investigacion-memoria-humana.md` · **Devlog:** `senzu/devlog/INDEX.md`
- **Definición de hecho global:** batería `eval-memoria` con **abstención 100%** y hit@5 ≥ hoy; bench LoCoMo cat1-4 sin regresión; `npm test` en verde; determinismo (misma entrada → misma salida); sin dependencias de runtime nuevas; convenciones de `senzu/conventions.md` respetadas; devlog al día; sin deploy.

## Alcance
- **IN:** F17-T1…T6 (los 6 mecanismos de la semilla), cada uno medido y descartable con evidencia.
- **OUT (explícito):** LLM/embeddings/red dentro del motor; cat5 end-to-end (lo limita el contestador); UI nueva; dependencias de runtime.
- **Supuestos:** Ollama + Qwen3 local y LoCoMo descargado para el bench e2e; cat3 se itera rápido con retrieval puro.
- **Riesgos:** ver sección final.

## Fases
| Fase | Entregable verificable por el usuario | Estado |
|---|---|---|
| F17 | El motor recupera y rankea como una memoria humana determinista: cat3 (multi-hop) sube hacia el nivel del embedding y el ranking se unifica en activación ACT-R, **sin bajar la abstención (100%)** | doing |

---

## F17 — Memoria más humana (determinista)

Método (para TODAS las tarjetas): hipótesis → implementar determinista → **medir** en batería (`node tools/eval-memoria/eval.mjs --json`) y, si aplica, en bench LoCoMo → quedarse o **descartar con evidencia**. **Antes de implementar cada fórmula, verificarla contra la fuente primaria citada en la semilla.**

### F17-T1 · Multi-hop por activación propagada  [L] [blocked]
> **Bloqueada (2026-11-11, ver devlog 004):** el lever de afinar el fan-guard / profundizar la propagación por nombres NO mejora cat3 (medido: clavado en 19,2%, empeora al aflojar). Necesita rescope (grafo de co-ocurrencia del contenido, no de nombres/uso) o reordenar a F17-T2. Baseline cat3 recall@5 = 24,3%.
- Para qué: que Corvus responda preguntas que exigen **cruzar dos hechos** (cat3), como el recuerdo asociativo humano, sin LLM. Es la apuesta #1 (mayor hueco medido: 17,7% motor vs 24% embedding).
- Skill: `code-quality → references/node-api.md` (lógica + tests) · teoría: `docs/investigacion-memoria-humana.md` §2.2
- Archivos: `src/facts.mjs` (recuperación: tras el top-k, propagar 1–2 saltos por hechos co-ocurrentes/enlazados, con peso), grafo de co-activación desde el uso real; tests en `tests/test-hard-recall.mjs`; casos en `tools/eval-memoria/casos.json`.
- Hecho cuando: **cat3 del bench sube** de forma medible **sin bajar cat1 ni cat5** ni la abstención de la batería (100%); el salto de propagación es determinista y acotado (1–2).
- Verificar: `node tools/eval-productos/recuperar.mjs --locomo --motor --limite 10` (bucle rápido de cobertura multi-hop, sin LLM) · batería `node tools/eval-memoria/eval.mjs --json` · e2e `node tools/eval-productos/pipeline.mjs --locomo --ingesta llm --retriever motor --topk 10 --salida tools/eval-productos/resultados-f17t1.json` + `node tools/eval-productos/comparar.mjs`.
- Depende de: — (usa la semilla de enlaces entre hechos, X-T13)
- Verificado: —
- Cumple: —
- Devlog: —

### F17-T2 · Ranking por activación (ACT-R base-level)  [M] [doing]
- Para qué: unificar recencia + frecuencia de uso + olvido en **una sola ecuación probada** (`B_i = ln(Σ t^−d)`, d≈0,5) como término del score, en vez de señales sueltas. Base de T3 y T4.
- Skill: `code-quality → references/node-api.md` · teoría: `docs/investigacion-memoria-humana.md` §2.1
- Archivos: `src/facts.mjs` (función de score: léxico BM25 actual **+** base-level ACT-R); `tests/test-facts.mjs` (determinismo con fechas fijas); baseline en `tools/eval-memoria/resultados.json`.
- Hecho cuando: hit@5 de la batería **≥ hoy**, **abstención 100%**, cat1-4 del bench sin regresión; la ecuación verificada contra la fuente ACT-R antes de codificar.
- Verificar: `node tools/eval-memoria/eval.mjs --json` (comparar hit@5 y abstención con el baseline) · `npm run test:core`.
- Depende de: —
- Verificado: —
- Cumple: —
- Devlog: —

### F17-T3 · Olvido blando + refuerzo por uso  [M] [todo]
- Para qué: que lo no usado en meses **baje de ranking** (no se borra) y lo recurrente suba — menos ruido en proyectos con mucha historia. Es el `B_i` de ACT-R aplicado al tiempo.
- Skill: `code-quality → references/node-api.md` · teoría: `docs/investigacion-memoria-humana.md` §2.3 (Ebbinghaus/SM-2)
- Archivos: `src/facts.mjs` (decaimiento temporal + refuerzo con `ultimo_uso`/`usos`); `tests/test-facts.mjs` (hechos "viejos" vs "recientes").
- Hecho cuando: en la batería, hechos viejos irrelevantes bajan **sin hundir** hechos estables importantes (saliencia §2.7); abstención 100%; hit@5 ≥ hoy.
- Verificar: `node tools/eval-memoria/eval.mjs --json` con casos viejos/nuevos en `tools/eval-memoria/casos.json`.
- Depende de: F17-T2
- Verificado: —
- Cumple: —
- Devlog: —

### F17-T4 · Efecto fan / saturación de pistas  [S] [todo]
- Para qué: cuando una dimensión/clave tiene **muchos** hechos, cada uno es menos recuperable (interferencia): penalizar en ranking o **avisar** al agente ("14 hechos en `nota.cliente`, concreta"). Mejora precisión en dominios densos y da un dato a `--health`.
- Skill: `code-quality → references/node-api.md` · teoría: `docs/investigacion-memoria-humana.md` §2.6 (`S_ji = S − ln(fan)`)
- Archivos: `src/facts.mjs` (conteo de fan por pista + término en el score/aviso); `cli/memory.mjs`/`src/facts-guard.mjs` (dato en `--health`).
- Hecho cuando: en dominios densos sube la precisión sin bajar abstención; `--health` muestra las pistas saturadas.
- Verificar: `node tools/eval-memoria/eval.mjs --json` (casos de dominio denso) · `node cli/corvusmem.mjs --health` (o su equivalente) muestra el fan.
- Depende de: F17-T2
- Verificado: —
- Cumple: —
- Devlog: —

### F17-T5 · Consolidación episódico→semántico  [M] [todo]
- Para qué: al cerrar sesión ("sueño"), detectar hechos **episódicos repetidos** y **abstraerlos** en una regla/preferencia estable — menos ruido, más señal duradera. Determinista: por recurrencia y co-ocurrencia.
- Skill: `code-quality → references/node-api.md` · teoría: `docs/investigacion-memoria-humana.md` §2.4 (CLS)
- Archivos: `src/session-end.mjs` / `src/facts.mjs` (proceso de consolidación), familias `aprendizaje.*`.
- Hecho cuando: baja el ruido (hechos ignorados en `--informe`) **sin perder recall**; la abstracción es determinista y reversible (el episódico no se destruye).
- Verificar: `node tools/eval-memoria/eval.mjs --json` · `node cli/memory.mjs --informe --json` (uso real antes/después).
- Depende de: —
- Verificado: —
- Cumple: —
- Devlog: —

### F17-T6 · Gist explícito (con guardia de abstención)  [M] [todo]
- Para qué: guardar junto al hecho literal (verbatim) un **gist determinista** (categoría/claves canónicas) para recall **por significado sin embeddings**. El verbatim da precisión; el gist, alcance.
- Skill: `code-quality → references/node-api.md` · teoría: `docs/investigacion-memoria-humana.md` §2.5 (fuzzy-trace; **aviso: el gist genera falsos recuerdos**)
- Archivos: `src/facts.mjs` (gist por hecho + su uso en recall), `LEXICO`/convención de claves.
- Hecho cuando: sube recall por significado **y la abstención sigue al 100%** en la batería. **Si baja la abstención, se descarta** (como F15-T6) y se documenta la evidencia.
- Verificar: `node tools/eval-memoria/eval.mjs --json` (regla de oro delante) · bench cat1/cat3.
- Depende de: —
- Verificado: —
- Cumple: —
- Devlog: —

---

## Tareas ad hoc (fuera del plan original)
### X-T1 · Aislar test-plugin de la instalación global de Corvus  [S] [todo]
- Para qué: `tests/test-plugin.mjs:117` (`rutaCliMemoria sin instalación -> npx`) falla si hay Corvus instalado en `~/.config/corvusmem/` (lo instalamos esta sesión): el test asume máquina limpia y `rutaCliMemoria` prioriza global sobre npx. No es regresión de F17; es aislamiento del test.
- Skill: `code-quality → references/node-api.md` (tests deterministas/aislados)
- Hecho cuando: el test fuerza el caso "sin instalación" sin depender del entorno real (p. ej. override de HOME/USERPROFILE o un flag de aislamiento) y `npm run test:core` pasa en verde en una máquina con Corvus global.
- Verificar: `node tests/test-plugin.mjs` → 0 fallos.
- Depende de: —

## Cambios al plan
| Fecha | Cambio | Motivo |
|---|---|---|
| 2026-11-11 | Plan F17 creado desde `docs/investigacion-memoria-humana.md` | Formalizar la semilla investigada en tarjetas medibles |
| 2026-11-11 | F17-T1 → blocked (fan-tuning descartado, ver 004) | Medición: el lever no mueve cat3; rescope o reordenar a F17-T2 |
| 2026-11-11 | F17 reanclado a abstención + knowledge-update en LongMemEval (ver 006) | Credibilidad: Corvus gana en abstención determinista, no en recall multi-hop; bench serio = LongMemEval |

## Riesgos y bloqueos
| Riesgo / bloqueo | Impacto | Mitigación / qué se necesita | Estado |
|---|---|---|---|
| Una teoría no garantiza que suba el número | Esfuerzo sin ganancia | Cada tarjeta se mide y se puede descartar con evidencia | abierto |
| Trade-off recall ↔ abstención (sobre todo T6) | Bajar la abstención (argumento del producto) | Regla de oro delante: abstención batería 100% en cada medición | abierto |
| Fórmulas de fuentes secundarias | Implementar algo incorrecto | Verificar la ecuación contra la fuente primaria antes de codificar | abierto |
| Bench e2e depende de Ollama/Qwen3 + LoCoMo | No poder medir cat1-5 | Bucle rápido con retrieval puro (`recuperar.mjs`) para cat3; e2e cuando haya entorno | abierto |
