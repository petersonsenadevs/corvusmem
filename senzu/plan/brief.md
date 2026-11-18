# Brief — F17 "Memoria más humana (determinista)"

- **Fecha:** 2026-11-11 · **Autor:** Peterson Sena (r3v3rs3)
- **Semilla:** `docs/investigacion-memoria-humana.md` (investigación con fuentes)
- **Producto:** Corvusmem — memoria determinista, offline, sin red ni modelos, para agentes de IA + CLI.

## Objetivo
Subir el **recall del motor** (`src/facts.mjs`) emulando mecanismos **deterministas** de la memoria
humana (ACT-R, spreading activation, curva de olvido, consolidación), **sin LLM, sin embeddings y sin red**,
y **sin bajar la abstención** de la batería interna. El mayor hueco medido es **cat3 (multi-hop)**: Corvus
pierde 17,7% vs 24% del embedding — ahí se apuesta primero.

## Alcance
- **IN:**
  - F17-T1 Multi-hop por activación propagada (spreading activation sobre el grafo de co-activación).
  - F17-T2 Ranking por activación ACT-R (base-level `B_i`) que unifica recencia/uso.
  - F17-T3 Olvido blando + refuerzo por uso (decaimiento temporal del score).
  - F17-T4 Efecto fan / saturación de pistas (penalizar/avisar dimensiones densas; dato en `--health`).
  - F17-T5 Consolidación episódico→semántico al cerrar sesión.
  - F17-T6 Gist explícito por hecho (recall por significado) **con guardia de abstención**.
  - Cada tarjeta: hipótesis → implementación determinista → **medir** en batería + bench → quedarse o **descartar con evidencia**.
- **OUT (explícito):**
  - Nada de LLM/embeddings/red **dentro del motor** (traiciona el producto).
  - **cat5 end-to-end** de LoCoMo: lo limita el contestador (modelo pequeño), no el motor; medido que un
    modelo mayor lo empeora. No se ataca desde aquí.
  - Sin UI nueva (el Cortex no se toca en esta fase).
  - Sin añadir dependencias de **runtime** (cero-deps es la promesa).
- **Supuestos:**
  - Para el bench e2e: Ollama + Qwen3 local disponibles y LoCoMo descargado (`bajar-locomo.mjs`).
  - El bucle rápido de cat3 es **retrieval puro** (`recuperar.mjs`), determinista y sin LLM.
- **Riesgos:**
  - Una teoría de psicología **no garantiza** que suba el número → cada tarjeta se mide y **puede descartarse**
    (como el umbral de recuperación y F15-T6).
  - Trade-off **recall ↔ abstención** (sobre todo en T6 gist): la **regla de oro** manda.
  - Fórmulas de fuentes secundarias: **verificar la ecuación contra la fuente primaria** antes de implementar.

## Regla de oro (inviolable)
Nunca subir recall a costa de la **abstención de la batería** (`eval-memoria`, hoy **100%**). Es el mayor
argumento del producto. Cada mejora se mide contra eso.
