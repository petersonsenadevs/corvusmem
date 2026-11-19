# Índice de Devlog

Registro correlativo de todas las entradas del proyecto.

| Nº  | Fecha      | Título                | Tipo    | Mejora a | Tarea |
|-----|------------|-----------------------|---------|----------|-------|
| 001 | YYYY-MM-DD | Setup inicial         | infra   | —        | —     |
| 002 | 2026-11-11 | Corvusmem instalado y Senzu cede la memoria (2.25.0) | infra | — | — |
| 003 | 2026-11-11 | /adoptar: convenciones del proyecto selladas | docs | — | — |
| 004 | 2026-11-11 | F17-T1: afinar el fan-guard NO mejora cat3 (descartado) | decisión | — | F17-T1 |
| 005 | 2026-11-11 | F17-T2: ninguna medición actual ve el uso/recencia | decisión | — | F17-T2 |
| 006 | 2026-11-11 | F17 reanclado: abstención + knowledge-update (LongMemEval) | decisión | 005 | F17-T2 |
| 007 | 2026-11-11 | F17 baseline LongMemEval: abstención por umbral = 0% (necesita ingesta estructurada) | decisión | 006 | F17-T2 |
| 008 | 2026-11-11 | F17-T7: abstención = umbral mal calibrado; confianza normalizada (corrige 007) | decisión | 007 | F17-T7 |
| 009 | 2026-11-11 | F17-T7 descartada: la confianza no porta entre regímenes (verbatim vs comprimido) | decisión | 008 | F17-T7 |
| 010 | 2026-11-11 | F17-T4: efecto fan / pistas saturadas en --health (aviso, sin tocar ranking) | feature | — | F17-T4 |
| 011 | 2026-11-12 | F17-T3: la recencia no mejora knowledge-update (lo empeora, −4pts) | decisión | — | F17-T3 |
| 012 | 2026-11-17 | F17-T8b: extractor determinista de hechos (turnos → clave canónica) | feature | — | F17-T8 |
| 013 | 2026-11-17 | F17-T8c: el nudge usa el extractor (comando destilado) + fix node node | feature | 012 | F17-T8 |
| 014 | 2026-11-17 | F17-T8d: el lazo extractor→motor (acepta, recupera, sustituye) | test | 013 | F17-T8 |
| 015 | 2026-11-17 | F17-T8: de-risk confirmado con n=21 (el comprimido supera al crudo) | decisión | 012 | F17-T8 |
| 016 | 2026-11-17 | F17-T8d: línea base de uso real (--informe) antes del extractor | decisión | 014 | F17-T8 |
| 017 | 2026-11-17 | F17: de-risk del lever de precisión de inyección (sobre-disparo, +7pts, bloqueado por proxy) | decisión | 016 | F17 |
| 018 | 2026-11-17 | F17-T9a: de-risk del suelo escalado del diario (0,25 × escala, seguro en grande y pequeño) | decisión | 017 | F17-T9a |
| 019 | 2026-11-17 | F17-T9b/c: el suelo del diario en el motor (0,25 × escala, gate verde) | feature | 018 | F17-T9 |
| 020 | 2026-11-17 | F17-T9: bench de precisión de inyección (dev-standards 23,6→26,6 %) | feature | 019 | F17-T9d |
| 021 | 2026-11-17 | F17-T10: fatiga de inyección descartada con evidencia (+0,4 pts a 3:1) | decisión | 020 | F17-T10 |
| 022 | 2026-11-17 | F17-T9e: el suelo del diario escalado por confianza (dev-standards +5,1 pts) | feature | 019 | F17-T9e |
| 023 | 2026-11-17 | F17-T5: consolidación aplazada (no hay recurrencia que consolidar aún) | decisión | — | F17-T5 |
| 024 | 2026-11-17 | F17-T9: el suelo mira solo la historia reciente (14ms→2ms, y más exacto) | perf | 022 | F17-T9 |
| 025 | 2026-11-18 | LoCoMo: la recuperación de Corvus domina (2-4× el embedding); el end-to-end no es problema de recuperación | decisión | — | benchmark |
| 026 | 2026-11-18 | LoCoMo: Corvus en crudo (34,8%) gana a TODOS end-to-end — su modo más barato es el mejor | decisión | 025 | benchmark |
| 027 | 2026-11-18 | Release 0.6.0: puerta de publish verde (X-T1 aísla test-plugin del Corvus global) + notas y bump | release | — | release-0.6.0 |
| 028 | 2026-11-18 | F17-T11a: diagnóstico recuperación cat1/cat3 — no es vocabulario, es ranking por solape casi nulo | decisión | — | F17-T11a |
| 029 | 2026-11-18 | F17-T11b/c: boost de entidad/hablante descartado — sube cat1/cat3 pero hunde la abstención (cat5) | decisión | 028 | F17-T11b |
| 030 | 2026-11-18 | fix: /corvus-absorb usa el CLI local (no npx) — arregla el import sobre proyectos WSL | fix | — | ad-hoc WSL |
| 031 | 2026-11-18 | Cortex: oscuro siempre (sin modo claro), 3D por defecto y auto-abrir en el navegador | feature | — | ad-hoc Cortex |
| 032 | 2026-11-19 | Cortex: el pensamiento se forma (coreografía honesta de la activación real) | feature | — | CX-T1/T2/T3 |
