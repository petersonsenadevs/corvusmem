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


