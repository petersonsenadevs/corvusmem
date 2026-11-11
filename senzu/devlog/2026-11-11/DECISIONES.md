# Decisiones - 2026-11-11

## dev-002 — La memoria del proyecto pasa a Corvusmem
- **Contexto:** el proyecto usaba la memoria de hechos de Senzu (`senzu/memoria/`). Se instala Corvusmem
  por proyecto y su instalador toma la propiedad de la memoria, adoptando los hechos existentes.
- **Opciones:** (a) mantener solo la memoria de Senzu; (b) Corvus dueño y Senzu cede; (c) ambos activos.
- **Elección:** (b) Corvus dueño; Senzu actualizado a 2.25.0 cede sus hooks de memoria.
- **Motivo:** evitar doble inyección de contexto y doble aviso de cierre; memoria compartida entre
  Claude y Codex vía Corvus.
- **Consecuencias:** los hooks de memoria de Senzu siguen cableados pero hacen no-op cuando detectan
  Corvus (`hayCorvus()`). `memoria-archivo.mjs` sigue activo (decisiones del devlog por archivo). La
  memoria del proyecto se guarda/consulta ahora con el CLI de Corvus.

## dev-003 — Idioma de identificadores: no se consolida a inglés
- **Contexto:** `/adoptar` sobre Corvusmem. El código tiene identificadores mixtos: dominio en español
  (`buscarHechos`, `recuerdo`, `palabras`, `hecho`, `memoria`) y fontanería genérica a veces en inglés
  (`readHookInput`, `projectRoot`, `sessionFlag`).
- **Opciones:** (a) consolidar todo a inglés de aquí en adelante; (b) consolidar todo a español;
  (c) mantener el mixto real: dominio en español, seguir el estilo del archivo que se toca.
- **Elección:** (c). Gana la consistencia del proyecto existente (principio de `/adoptar`).
- **Motivo:** el dominio del producto es español (lenguaje ubicuo de la memoria); reescribir plumbing
  a español o dominio a inglés rompería la coherencia sin aportar valor.
- **Consecuencias:** regla sellada en `senzu/conventions.md` §Idioma; la CLI pública mantiene inglés
  primario con alias en español (i18n, F14).

## dev-004 — Afinar el fan-guard no mejora cat3 (F17-T1)
- **Contexto:** cat3 (multi-hop) es el mayor hueco del motor. Hipótesis: el fan-guard de la propagación
  por nombres (`fuerzaNombre`, nombre en ≥5 hechos → peso 0) la corta en entidades frecuentes y por eso
  cat3 no sube.
- **Opciones:** (a) aflojar FAN / subir SALTOS / MAX_PROP; (b) dejarlo y buscar otro mecanismo.
- **Elección:** (b). Medido en un barrido (devlog 004): cat3 queda clavado en 19,2% con FAN=5/8/12 y
  EMPEORA al aflojar más (FAN=20→15%, ∞→11,7%), arrastrando cat2/4/5. FAN=5 es lo mejor.
- **Motivo:** sobre turnos crudos la propagación por nombres no contribuye a cat3; aflojar solo mete ruido.
- **Consecuencias:** se revierte el andamiaje (50b6575); F17-T1 queda `blocked` a la espera de rescope
  (grafo de co-ocurrencia del contenido, no de nombres) o de reordenar a F17-T2.

## dev-007 — La abstención no sale de un umbral sobre BM25 (necesita ingesta estructurada)
- **Contexto:** baseline del motor en LongMemEval (offline, turnos crudos). abstención `_abs` = 0/24;
  knowledge-update recall@5 73,8%, temporal-reasoning 58,8%.
- **Opciones:** (a) seguir afinando el umbral sobre turnos crudos; (b) abstención por ingesta estructurada.
- **Elección:** (b). El umbral sobre BM25 nunca abstiene (0/24): es un callejón.
- **Motivo:** la abstención determinista (el diferenciador, D-006) exige memoria estructurada
  (`recuperadorMotorEstructurado`: claves estables, sustitución cronológica), no un filtro sobre ranking léxico.
- **Consecuencias:** candidata a primera card real = abstención por ingesta estructurada; F17-T2 (ACT-R) sigue
  `doing` sin tocar. Decidir reordenación con el usuario. No contradice LoCoMo cat5 (end-to-end con LLM).

## dev-006 — Credibilidad de F17 = abstención + knowledge-update (LongMemEval), no recall por uso
- **Contexto:** ¿qué bench serio da credibilidad a Corvus vs mem0/Zep? La frecuencia de uso no la mide
  ningún bench (dev-005); el multi-hop es terreno de LLM/embeddings (dev-004).
- **Opciones:** (a) perseguir recall multi-hop en LoCoMo; (b) construir batería propia de uso/recencia;
  (c) anclar en el DIFERENCIADOR de Corvus (abstención determinista + knowledge-update) con un bench serio.
- **Elección:** (c). Bench: **LongMemEval** (`knowledge-update` + `temporal-reasoning` + `_abs`), como
  escaparate del determinismo/abstención, no como carrera de recall. LoCoMo sigue de arena primario.
- **Motivo:** Corvus no gana en recall puro (por diseño, sin LLM/embeddings), pero SÍ en abstención
  (en LoCoMo cat5 ya es el mejor) y en actualización de conocimiento (sustitución por dimensión). La
  credibilidad sale de un bench serio donde Corvus puede GANAR, no solo competir. (b) sería "criterio
  propio", sin credibilidad externa.
- **Consecuencias:** el ranking por `usos`/olvido-por-desuso baja a pulido de producto. F17 se reordena a
  knowledge-update + abstención tras ver el baseline de LongMemEval (devlog 006).


