<!-- Corvusmem · author: Peterson Sena (r3v3rs3) · https://corvusmem.vercel.app -->
# Corvusmem vs memoria de pago — cara a cara sobre LoCoMo

> **Corvusmem** es memoria para agentes de IA: **determinista, offline, sin modelo y gratis** (el motor es
> `src/facts.mjs`). Los productos del sector (**mem0**, **Zep/Graphiti**) construyen la memoria **con un LLM**
> (extraen hechos y grafos llamando a GPT-4o) y cobran por ello. La pregunta honesta: en **su** terreno
> —conversaciones largas, el benchmark académico que ellos mismos usan, **LoCoMo** (Maharana et al. 2024, SNAP
> Research)— ¿aguanta la comparación? Borrador reproducible, victorias **y** derrotas, sin cherry-picking.

## El método (la misma vara para todos)

- **Mismo contestador y mismo juez para todos: Qwen3-8B local vía Ollama.** Lo **único** que cambia entre
  columnas es **de qué memoria** sale el contexto. Así el cara a cara es controlado y justo.
- Cada producto **ingiere a su manera natural**: mem0 por sesión, Zep/Graphiti por episodios (~6 turnos),
  Corvusmem y el baseline de embedding indexando los hechos.
- Dataset: **LoCoMo completo, 1986 preguntas**, 10 conversaciones largas, 5 categorías.
- Juez: el mismo Qwen3 decide acierto/fallo contra la respuesta de referencia. **Todo en local, 0 €.**

> **Matiz imprescindible (credibilidad):** usamos **Qwen3-8B local, no GPT-4o**. Por eso los **números absolutos
> NO son comparables** al leaderboard oficial de mem0/Zep (que corren con GPT-4o y publican cifras más altas).
> Lo que esta tabla mide es el **cara a cara entre memorias bajo condiciones idénticas**: quién aporta mejor
> contexto cuando el modelo que responde y el que juzga son los mismos. La tesis de Corvusmem **no** es «ganamos
> su benchmark», es **«precisión comparable o mejor, pero determinista, offline, 0 € y sabe decir "no sé"»**.

## 1. Cara a cara completo — LoCoMo, 1986 preguntas

| categoría | qué mide | **Corvusmem** | embedding e5 | mem0 |
|---|---|---|---|---|
| cat1 single-hop (282) | dato directo | 23,0 % | 30,5 % | 25,2 % |
| cat2 **temporal** (321) | fechas / orden | **16,2 %** | 17,4 % | 5,3 % |
| cat3 multi-hop (96) | cruzar datos | 17,7 % | 24,0 % | 17,7 % |
| cat4 open-domain (841) | + sentido común | 41,6 % | 44,7 % | 35,0 % |
| cat5 adversaria (446) | saber decir «no sé» | **5,6 %** | 3,4 % | 4,7 % |
| **GLOBAL** | | **25,6 %** | **28,0 %** | **21,1 %** |

**Lecturas clave:**
- **Corvusmem le gana a mem0** en global (25,6 % vs 21,1 %) **siendo gratis y offline** — mem0 cobra y llama a un
  LLM para ingerir.
- En lo **temporal casi triplica a mem0** (16,2 % vs 5,3 %): Corvusmem guarda los hechos **con fecha**, su punto
  fuerte.
- Queda **pegado al embedding** (28,0 %), que también es gratis y determinista.
- En **saber callar** (cat5) es **el mejor de los tres**.

## 2. Muestra con Zep/Graphiti — conv-1, 195 preguntas

Zep/Graphiti construye un **grafo de conocimiento** con el LLM. A escala completa en local resulta **inviable por
tiempo** (cientos de llamadas a Qwen3 por conversación; la ingesta de las 1986 preguntas llevaba decenas de
horas). Se incluye como **muestra sobre la primera conversación**, a cuatro:

| categoría | **Corvusmem** | embedding e5 | mem0 | zep |
|---|---|---|---|---|
| cat1 (32) | 25,0 % | 31,3 % | 21,9 % | 18,8 % |
| cat2 (37) | 27,0 % | 27,0 % | 2,7 % | 2,7 % |
| cat3 (13) | 30,8 % | 46,2 % | 15,4 % | 30,8 % |
| cat4 (70) | 40,0 % | 47,1 % | 24,3 % | 30,0 % |
| cat5 (43) | 11,6 % | 0,0 % | 4,7 % | 9,3 % |
| **GLOBAL** | **28,2 %** | **30,3 %** | **14,9 %** | **18,5 %** |

En la muestra Corvusmem **supera a mem0 y a Zep**, y Zep queda por delante de mem0. Es una muestra (una
conversación), pero confirma el patrón de la tabla completa.

## 3. Lo que esto demuestra (y lo que no)

- **Sí demuestra:** Corvusmem, bajo condiciones idénticas, **iguala o supera** a dos productos de pago del
  sector —con mem0 medido **a escala completa**— siendo **determinista, offline y 0 €**.
- **No demuestra:** que gane su leaderboard oficial con GPT-4o. No se ha medido así (ni es el objetivo).
- **Honestidad de la ingesta:** cada producto se alimenta como es natural para él; el contenido, las preguntas,
  el contestador y el juez son idénticos. Zep solo pudo medirse en muestra por su coste en local.

## Reproducirlo

Las tablas salen de los **resultados crudos ya guardados** (con procedencia), sin red, con un recuento
determinista:

```
# Tabla 1 — los tres completos
node tools/eval-productos/comparar.mjs \
  resultados-e2e-locomo-motor-llm.json \
  resultados-e2e-locomo-embedding-llm.json \
  resultados-e2e-locomo-mem0-full.json

# Tabla 2 — muestra a cuatro con Zep
node tools/eval-productos/comparar.mjs \
  resultados-e2e-locomo-motor-llm.json \
  resultados-e2e-locomo-embedding-llm.json \
  resultados-e2e-locomo-mem0.json \
  resultados-e2e-locomo-zep.json
```

- **Resultados crudos** (per-pregunta, juzgados, con procedencia): `resultados-e2e-locomo-*.json`.
- **Motor medido:** el de Corvusmem (`src/facts.mjs`) — cada turno ingerido como un hecho, con su propio ranking
  determinista. El arnés lo carga de `src/` (override con `CORVUS_ENGINE_DIR`).

### Re-ejecutar desde cero (el arnés vive aquí, apuntando al motor de Corvusmem)

```
# 0) una vez: dataset LoCoMo (~2,7 MB de GitHub, luego offline)
node tools/eval-productos/bajar-locomo.mjs

# 1) comprobar el cableado SIN LLM (sin Ollama): recuperación + montaje de contexto
node tools/eval-productos/recuperar.mjs --locomo --motor --limite 10
node tools/eval-productos/pipeline.mjs  --locomo --dry --retriever motor --limite 5

# 2) run real de Corvusmem (necesita Ollama + qwen3:8b): motor y baseline embedding
node tools/eval-productos/pipeline.mjs --locomo --retriever motor     --topk 10 --salida tools/eval-productos/resultados-e2e-locomo-motor-llm.json
node tools/eval-productos/pipeline.mjs --locomo --retriever embedding --topk 10 --salida tools/eval-productos/resultados-e2e-locomo-embedding-llm.json

# 3) mem0 (venv Python propio + Ollama); desde tools/eval-productos/mem0:
#    .venv/Scripts/python.exe mem0_locomo.py --topk 10 --coleccion locomo_full --salida ../resultados-e2e-locomo-mem0-full.json
```

Notas honestas: **la columna embedding** necesita `@huggingface/transformers` (import dinámico; descarga el modelo
una vez a `tools/.models/`, gitignored). **mem0/Zep** llevan su propio entorno Python (venv) y, Zep, Docker/Neo4j —
por eso Zep solo se midió en muestra (a escala completa en local es inviable por tiempo). Todo determinista
(temp 0, seed fija), 0 € y reanudable.

> Nota: este banco de pruebas es **herramienta de desarrollo**; no viaja en el paquete npm (no está en la lista
> `files` de `package.json`), igual que `tools/eval-memoria/`.
