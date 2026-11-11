<!-- Corvusmem · author: Peterson Sena (r3v3rs3) · https://corvusmem.vercel.app -->
# Investigación: memoria más humana para Corvusmem (semilla de F17)

> **Tesis:** Corvusmem no necesita LLM ni embeddings para mejorar. La memoria humana se modela desde hace décadas
> con **ecuaciones deterministas** probadas en psicología cognitiva. Emularlas sube el techo de recall **sin traicionar
> lo que hace único a Corvus** (determinista, offline, sin red, sin modelo). Este documento investiga esas teorías,
> confirma sus fórmulas con fuentes, y mapea cómo aplicarlas — con el método de medir, no adivinar.
>
> Fecha: 2026-11-11 · Autor: Peterson Sena (r3v3rs3).

## 1. Dónde está el techo (lo dijo el benchmark)

El bench de LoCoMo (ver `tools/eval-productos/BENCHMARK.md`) ya nos dijo **dónde** se puede ganar y dónde no:

- **La recuperación del motor es buena** (cobertura 100% de la evidencia). El cuello de botella de cat5 (abstención)
  es el **contestador** (Qwen3-8B local), **no el motor** — medido: un modelo mayor lo empeora. **No gastar ahí.**
- **La grieta real es cat3 (multi-hop):** Corvus **pierde** contra el embedding (17,7% vs 24%). Multi-hop es
  *intrínsecamente* conectar hechos → es donde una **memoria asociativa determinista** puede ganar sin LLM.
- **cat1 (dato directo):** F15 ya subió aquí extendiendo el `LEXICO`. Hay más recorrido por la misma vía.

> Regla de oro (heredada de F15): **nunca subir recall a costa de la abstención de la batería interna** (`eval-memoria`,
> hoy 100%). Es el mayor argumento del producto. Cada mejora se mide contra eso.

---

## 2. Las teorías (qué son, su ecuación, y cómo se emulan en Corvus)

### 2.1. ACT-R — activación de la memoria declarativa  ⭐ *el marco que lo unifica*

**Qué es.** ACT-R (Anderson) modela la memoria declarativa humana como *chunks* con un nivel de **activación**. Se
recupera el chunk más activo; si ninguno supera un umbral, hay **fallo de recuperación** (= abstención). La activación es:

```
A_i = B_i + Σ_j W_j · S_ji            (activación total = base + propagada por el contexto)
B_i = ln( Σ_k t_k^(−d) )              (base-level: frecuencia + recencia, con decaimiento potencial; d ≈ 0,5)
S_ji = S − ln(fan_j)                  (fuerza de asociación; baja con el "fan": cuántos hechos cuelgan de j)
```

- `B_i` sube cuanto **más veces** y **más recientemente** se usó el chunk, y decae con el tiempo (curva de olvido).
- `S_ji` es el **efecto fan**: si una pista `j` (p. ej. "cliente") está asociada a MUCHOS hechos, recuperar uno
  concreto cuesta más (interferencia).

**Cómo en Corvus.** Es el marco que **une piezas que ya tienes sueltas** (recencia, `usos`, `ultimo_uso`, enlaces) en
una sola ecuación de activación determinista que **sustituye o complementa** el ranking actual (BM25 + recencia):
el score de un hecho = su relevancia léxica (lo de hoy) **+** su base-level (frecuencia/recencia con decaimiento)
**+** activación propagada por los hechos del contexto **−** penalización por fan.

**Ya tiene:** recencia y `usos` en el ranking, enlaces entre hechos (parcial), "saber que no sabe" (≈ umbral de
recuperación). **Falta:** la ecuación unificada, el decaimiento potencial explícito, el fan effect.

**Medir:** batería `eval-memoria` (hit@5 y abstención) + bench (cat1-4). Fuente: ecuaciones ACT-R estándar
([equations PDF](https://cw.fel.cvut.cz/old/_media/courses/a6m33ksy/cvika3_working_memory_actr_activation_and_context_equations.pdf);
fan effect: Anderson & Reder 1999 / Anderson & Lebiere 1998 — **verificar `S_ji` contra el libro antes de implementar**).

### 2.2. Spreading activation — recuperación asociativa / multi-hop  🎯 *la apuesta #1*

**Qué es.** Collins & Loftus (1975): los conceptos son **nodos en una red**; activar uno **propaga activación a sus
vecinos**, más fuerte cuanto más estrecho el enlace. Explica el *priming* (recuerdas B porque pensaste en A).
Anderson (1983) lo generalizó → es el `Σ_j W_j·S_ji` de ACT-R.

**Cómo en Corvus (y por qué es la apuesta #1).** cat3 (multi-hop) es **exactamente esto**: la respuesta exige **cruzar
dos hechos**. Hoy el motor recupera el top-k y para. La propuesta: tras recuperar, **propagar** 1–2 saltos por los
hechos co-ocurrentes / enlazados y traer también esos. Es un **grafo de co-activación determinista** (aprendido del
uso real: qué hechos se recuperan juntos), cero LLM. Es *literalmente* cómo funciona el recuerdo asociativo humano.

**Ya tiene:** enlaces entre hechos (X-T13, "activación propagada por nombres compartidos") — la **semilla exacta**.
**Falta:** profundizarlo a 2 saltos, pesar la propagación, construir el grafo desde el uso.

**Medir:** cat3 en el bench (el hueco vs embedding); que cat1/cat5 no empeoren. Fuentes:
[Spreading activation (Wikipedia)](https://en.wikipedia.org/wiki/Spreading_activation),
Collins & Loftus (1975), *Psychological Review* 82, 407–428.

### 2.3. Curva de olvido + repaso espaciado (Ebbinghaus + SM-2)

**Qué es.** Lo que no se usa se **olvida** con el tiempo; lo que se repasa se **refuerza** y dura más.
- Forma de libro: `R = e^(−t/S)`, con `R` retención, `t` tiempo, `S` fuerza/estabilidad (vida media = `S·ln(2)`).
  La investigación actual suele preferir una **ley de potencia**: `P = m·(1 + h·t)^(−f)`.
- **SM-2** (SuperMemo) es la receta **determinista** del repaso: intervalos `I(1)=1, I(2)=6, I(n)=I(n−1)·EF`;
  factor de facilidad `EF' = EF + (0,1 − (5−q)·(0,08 + (5−q)·0,02))`, `EF` arranca en 2,5, suelo 1,3; un fallo reinicia.

**Cómo en Corvus.** Un **olvido blando y determinista**: la activación de un hecho **decae con el tiempo** y **se
refuerza con cada uso** (justo el `B_i` de ACT-R, que es la misma idea). Lo no usado en meses **baja de ranking** (no
se borra: olvido ≠ borrado); lo recurrente sube. Esto reduce ruido en proyectos con mucha historia.

**Ya tiene:** `ultimo_uso`, `usos` (señales sueltas). **Falta:** la función de decaimiento/refuerzo como parte del score.

**Medir:** batería con hechos "viejos" vs "recientes"; que no hunda hechos estables importantes (saliencia, 2.6).
Fuentes: [Forgetting curve (Wikipedia)](https://en.wikipedia.org/wiki/Forgetting_curve),
[SM-2 (SuperMemo)](https://www.gwern.net/docs/www/www.supermemo.com/89c4aa4e8e1fada3b52b9f6ceccda5a327f56037.html).

### 2.4. Consolidación — de lo episódico a lo duradero (Complementary Learning Systems)

**Qué es.** McClelland, McNaughton & O'Reilly (1995): el **hipocampo** aprende rápido lo episódico (pero decae y sufre
interferencia); el **neocórtex** aprende lento y extrae **estructura/semántica** reactivando ("replay", durante el
sueño) esas memorias. La consolidación "termina" cuando el neocórtex recupera sin el hipocampo.

**Cómo en Corvus.** Ya **tienes la metáfora** en el Cortex (zonas hipocampo / occipital). La mejora: un proceso de
**consolidación al cerrar sesión** ("sueño") que detecta hechos **episódicos repetidos** y los **abstrae** en una
regla/preferencia estable (semántica), separando lo que perdura de lo efímero. Determinista: por recurrencia y
co-ocurrencia, no por LLM.

**Ya tiene:** "consolidar aprendizajes" básico (facts-guard), familias `aprendizaje.*`. **Falta:** la abstracción
episódico→semántico por recurrencia; el "replay" determinista.

**Medir:** ¿baja el ruido (hechos ignorados) sin perder recall? Fuente:
[McClelland, McNaughton & O'Reilly 1995 (Stanford PDF)](https://stanford.edu/~jlmcc/papers/McCMcNaughtonOReilly95.pdf).

### 2.5. Gist vs verbatim (Fuzzy-trace theory) — con una advertencia

**Qué es.** Reyna & Brainerd: la memoria guarda **dos trazas en paralelo** — *verbatim* (el detalle literal, se pierde
en días) y *gist* (el significado/esencia, perdura). **Aviso crítico:** el **gist genera falsos recuerdos**; el
verbatim los **suprime**. (En humanos, con el tiempo la memoria verdadera decae y la falsa aumenta.)

**Cómo en Corvus.** Guardar junto al hecho literal (verbatim) un **gist determinista** (categoría / convención /
claves canónicas) para recall **por significado sin embeddings**: el verbatim da precisión, el gist da alcance. Ya
empezaste esto con el `LEXICO` y la convención de claves — son una forma de gist.

**La advertencia, aplicada a Corvus:** más gist = más recall por significado **pero también más riesgo de "falso
recuerdo"** (traer un hecho que *suena* relacionado y no lo es) → puede **bajar la abstención**. Es el mismo trade-off
recall↔abstención que vimos en F15. **Medir con la regla de oro delante.**

**Ya tiene:** `LEXICO`, convención de claves. **Falta:** un gist explícito por hecho, y medir su efecto en abstención.
Fuente: [Fuzzy-trace theory (Wikipedia)](https://en.wikipedia.org/wiki/Fuzzy-trace_theory); Reyna & Brainerd (1995).

### 2.6. Efecto fan / interferencia — saturación de pistas

**Qué es.** Parte de ACT-R (2.1): cuantos más hechos cuelgan de una pista, **menos recuperable** es cada uno
(`S_ji = S − ln(fan)`). En humanos, saber muchas cosas de "cliente" hace cada dato concreto más lento de recuperar.

**Cómo en Corvus.** Detectar cuándo una **dimensión/clave está saturada** y (a) penalizar en el ranking para forzar
desambiguación, o (b) **avisar** al agente ("hay 14 hechos en `nota.cliente`, concreta"). Mejora precisión en dominios
densos y es un diagnóstico útil para el panel `--health`.

**Ya tiene:** nada explícito. **Falta:** el conteo de fan por pista y su uso en ranking/aviso.

### 2.7. (menor) Saliencia emocional

Lo que "duele" se recuerda mejor. En un agente: **correcciones del usuario** y **gotchas que costaron tiempo** deben
pesar más y **resistir el olvido** (2.3). Corvus ya prioriza reglas/correcciones; faltaría un **peso de saliencia**
explícito que module el decaimiento (lo importante decae más lento).

---

## 3. Mapa de prioridad (qué atacar primero y por qué)

| # | Mecanismo | Por qué primero | Dónde se mide |
|---|---|---|---|
| 🎯 1 | **Spreading activation / multi-hop** (2.2) | Mayor hueco (cat3 vs embedding), ya hay semilla (enlaces), muy "cerebro" | bench cat3 |
| 2 | **Ranking por activación ACT-R** (2.1) | Unifica recencia/uso/olvido/fan en una ecuación probada; base de todo lo demás | batería + bench cat1-4 |
| 3 | **Olvido blando + repaso** (2.3) | Menos ruido en historias largas; es el `B_i` de ACT-R aplicado | batería (viejos vs nuevos) |
| 4 | **Consolidación episódico→semántico** (2.4) | Menos ruido, más señal duradera | uso real (`--informe`) |
| 5 | **Gist explícito** (2.5) | Recall por significado sin embeddings — **con cuidado por la abstención** | batería (regla de oro) |
| 6 | **Fan effect / saturación** (2.6) | Pulido de precisión + diagnóstico para `--health` | batería (dominios densos) |

## 4. El método (el que ya nos funcionó)

**No adivinar, medir.** Cada tarjeta: hipótesis → implementar **determinista** → medir en la **batería** (`eval-memoria`)
y en el **bench** (LoCoMo) → quedarse o **descartar con evidencia** (como el umbral de recuperación y F15-T6, que se
descartaron midiendo). La infraestructura ya está: `tools/eval-memoria/` (gate de `npm test`) y `tools/eval-productos/`
(cara a cara, `estabilidad.mjs`, `umbral-scan.mjs`). **Regla de oro inviolable:** abstención de la batería al 100%.

## 5. Lo que NO se puede mejorar desde aquí (honestidad)

- **Abstención end-to-end (cat5 de LoCoMo):** la limita el **contestador** (modelo pequeño), no el motor. Un modelo
  mayor (qwen3:14b) la **empeora** (medido 2026-11-11). El argumento de "saber callar" de Corvus vive en la **batería**
  (100% determinista), no en cat5.

## 6. Propuesta de fase F17 "Memoria más humana" (borrador de tarjetas)

- **F17-T1 · Multi-hop por activación propagada** [L] — grafo de co-activación determinista del uso; recuperar + propagar
  1–2 saltos. Hecho cuando: cat3 sube sin bajar cat1/cat5. (Apuesta #1.)
- **F17-T2 · Ranking por activación (ACT-R base-level)** [M] — `B_i = ln(Σ t^−d)` como término del score; unifica
  recencia/uso. Hecho cuando: hit@5 de la batería ≥ hoy, abstención 100%.
- **F17-T3 · Olvido blando + refuerzo por uso** [M] — decaimiento temporal del score; lo no usado baja (no se borra).
- **F17-T4 · Efecto fan / saturación de pistas** [S] — penalizar/avisar dimensiones densas; dato en `--health`.
- **F17-T5 · Consolidación episódico→semántico** [M] — abstraer hechos recurrentes en regla estable al cerrar sesión.
- **F17-T6 · Gist explícito (con guardia de abstención)** [M] — recall por significado sin embeddings; medir la regla
  de oro. Puede descartarse si baja la abstención (como F15-T6).

## Referencias

- ACT-R (activación): [working-memory / activation & context equations (PDF)](https://cw.fel.cvut.cz/old/_media/courses/a6m33ksy/cvika3_working_memory_actr_activation_and_context_equations.pdf) · Anderson & Lebiere (1998), *The Atomic Components of Thought* · Anderson & Reder (1999), fan effect.
- Spreading activation: [Wikipedia](https://en.wikipedia.org/wiki/Spreading_activation) · Collins & Loftus (1975), *Psychological Review* 82, 407–428 · Anderson (1983).
- Olvido / repaso: [Forgetting curve (Wikipedia)](https://en.wikipedia.org/wiki/Forgetting_curve) · [SM-2 (SuperMemo, original)](https://www.gwern.net/docs/www/www.supermemo.com/89c4aa4e8e1fada3b52b9f6ceccda5a327f56037.html) · Wixted & Carpenter (2007), ley de potencia.
- Consolidación: [McClelland, McNaughton & O'Reilly (1995) (Stanford PDF)](https://stanford.edu/~jlmcc/papers/McCMcNaughtonOReilly95.pdf) · Kumaran, Hassabis & McClelland (2016).
- Gist/verbatim: [Fuzzy-trace theory (Wikipedia)](https://en.wikipedia.org/wiki/Fuzzy-trace_theory) · Reyna & Brainerd (1995); Brainerd & Reyna (2005), *The Science of False Memory*.

> **Nota de rigor:** las fórmulas vienen de resúmenes secundarios (salvo las de ACT-R y SM-2, bastante estándar).
> Antes de implementar cada tarjeta, verificar la ecuación contra la fuente primaria citada. Y recordar: una teoría de
> psicología no es una garantía de que suba el número — por eso **cada tarjeta se mide y se puede descartar**.
