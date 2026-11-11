# Memoria del proyecto

<!--
Lo que SIGUE VIGENTE, en una línea por punto y con la entrada del devlog que lo explica. Máximo 60 líneas:
lo sustituido o cerrado pasa a MEMORIA-historico.md. La crea y mantiene el agente con la skill devlog
(references/memoria.md); el hook stop-guard exige actualizarla cuando el devlog del día trae decisiones.

Formato:
  - D-007 · Correos siempre por cola (Horizon + Redis), nunca síncronos · ver 012
  - D-003 · Sanctum, no Passport: no hay terceros que consuman la API · ver 005
  - D-002 · Stripe Elements: sustituida por D-009 · ver 004
  - [desde 2026-10-04] Textos legales del cliente (en «Pendientes abiertos», siempre con su fecha)

Lo que vale en TODOS los proyectos del usuario no va aquí: va a su memoria personal (/recordar).
-->

## Decisiones vigentes
- D-002 · La memoria del proyecto la lleva Corvusmem; Senzu 2.25.0 cede sus hooks de memoria (no-op con `hayCorvus()`) · ver 002
- D-003 · Idioma de identificadores: mixto real (dominio en español, plumbing a veces inglés), NO se consolida — gana la consistencia existente · ver 003
- D-006 · Credibilidad de Corvus = abstención determinista + knowledge-update (bench serio: LongMemEval), NO recall multi-hop ni frecuencia de uso · ver 006
- D-008 · La abstención se arregla NORMALIZANDO el umbral (confianza [0,1] = puntuación/techo, corpus-independiente), NO con ingesta estructurada/LLM; corrige el remedio de dev-007 · ver 008

## Reglas del cliente y del proyecto
- Convenciones selladas con `/adoptar` en `senzu/conventions.md` + `senzu/conventions.json` (`senzu:inmutable`): Node ESM puro `.mjs`, sin TypeScript, builtins con `node:`, cero dependencias de runtime, cabecera de autoría r3v3rs3 intocable · ver 003

## Lo que no funcionó (no repetir)
- Abstención por umbral ABSOLUTO (0.8): 0/24 en LongMemEval, porque la puntuación escala con el corpus (idf). NO necesita ingesta estructurada (corregido) sino NORMALIZAR el umbral → confianza [0,1] · ver 008 (corrige 007)

## Pendientes abiertos
- [desde 2026-11-11] Decidir rama y qué versionar tras instalar Corvus + actualizar Senzu: `.claude/`, `.mcp.json`, `AGENTS.md`, `CLAUDE.md`, `senzu/`, `.corvusmem/` (y si `.corvusmem/memory/` se comparte o no) · ver 002
