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

## dev-009 — La confianza normalizada no porta entre regímenes (descarta F17-T7, sustituye dev-008)
- **Contexto:** medido en LongMemEval (turnos verbatim) y en la batería (hechos comprimidos = régimen real del producto).
- **Datos:** LongMemEval separa con T≈0,7 (55% abstención, 0% pérdida); la batería separa con T≈0,15 pero empata con el
  `punt<0.8` actual. El 0,7 hunde la batería (−90% reales); el 0,15 no abstiene en LongMemEval. Umbral único imposible.
- **Elección:** descartar F17-T7 con evidencia; revertir el código (`confianza`/`techoConsulta`/`ultConf`).
- **Motivo:** la confianza mide cobertura pregunta↔texto, que depende del RÉGIMEN (verbatim vs comprimido), no solo del
  corpus. dev-008 se equivocó al creer que normalizar bastaba para un umbral único.
- **Consecuencias:** **sustituye a dev-008** (D-008 → D-009). La abstención por umbral desde el motor está agotada de
  forma determinista (junto a dev-005/007 y cat5 de LoCoMo). El puente real sería un extractor determinista o medir en
  el régimen de hechos comprimidos.

## dev-008 — La abstención sí sale de un umbral, pero NORMALIZADO (corrige dev-007) [SUSTITUIDA por dev-009]
- **Contexto:** diagnóstico en LongMemEval. La puntuación escala con el corpus (idf ∝ log nVig): el gate absoluto
  0.8 funciona en la batería (scores ~0.8) pero nunca abstiene en corpus grande (scores 8–39). El barrido mostró
  separación parcial (`_abs` puntúa más bajo), al contrario que en LoCoMo cat5.
- **Opciones:** (a) ingesta estructurada con LLM (lo propuesto en dev-007); (b) normalizar la puntuación a una
  confianza [0,1] corpus-independiente y mover el gate ahí.
- **Elección:** (b). **Corrige la conclusión de dev-007**: no hace falta LLM ni estructura; era calibración.
- **Motivo:** mantiene el paradigma (determinista, offline, cero dependencias) y ataca la causa real (umbral absoluto
  sobre una escala relativa). dev-007 acertó en "el umbral crudo no sirve"; se equivocó en el remedio.
- **Consecuencias:** F17-T7 (confianza normalizada). Pendiente: confirmar que la confianza separa y que el nuevo
  gate no baja la abstención 100% de la batería ni el recall cat1-4 de LoCoMo (regla de oro).

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


