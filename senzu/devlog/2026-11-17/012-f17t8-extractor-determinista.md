# 012 — F17-T8b: extractor determinista de hechos (turnos → clave canónica)

- **Fecha/hora:** 2026-11-17 15:09
- **Tipo:** feature
- **Mejora a:** —
- **Tarea:** F17-T8
- **Stack:** node-api

## Qué se hizo
- **De-risk del régimen comprimido** (laboratorio, `scratchpad/lme-extractor-v0.mjs`, LongMemEval knowledge-update):
  un extractor determinista (clave = 3 palabras salientes del turno) frente a los turnos crudos, conservando el tid
  del turno para una comparación justa a nivel de turno. Carga ACOTADA Y POR TIPO (streaming, solo los N registros
  `knowledge-update`) para no reventar la RAM.
- **T8a** (`scratchpad/lme-extractor-v1.mjs`): probar funciones de clave mejores (stemming, conjunto completo).
- **T8b** (producto): nuevo `src/extractor.mjs` — `extraerHecho(texto)` saca `{dimension, valor, claves}` CANÓNICO,
  sin LLM, reutilizando `dimensionConvencional()` + `clavesConvencionales()` del motor. Test `tests/test-extractor.mjs`.

## Resultado — de-risk (n=8, direccional)
| Régimen | recall@5 | acierto@5 |
|---|---|---|
| CRUDO (baseline) | 75,0% | 87,5% |
| Determinista v0 (clave k=3) | 72,9% | **100%** |

- El régimen comprimido **empata al crudo en recall@5 y lo SUPERA en acierto@5**. El baseline reprodujo la referencia
  (75% ≈ 73,8% de dev-007): la medición es válida. **El puente turnos→hecho-con-clave es viable.**
- **T8a:** el STEMMING no ayuda, EMPEORA (stem k=3 68,8% / conjunto-completo 66,7%; la v0 sin tocar sigue siendo la
  mejor). Camino del stemming cerrado con evidencia. El margen de recall no estaba en la clave.

## Diseño de T8b (el extractor en el producto)
- Hoy la destilación frase→hecho la hace el AGENTE a mano (`live-memory` solo detecta y empuja); eso es inconsistente
  y es la raíz de que un dato acabe en la dimensión/almacén equivocados (ver `pending.senzu-cede-escritura`).
- `extraerHecho` es un **SUBCONJUNTO** de `esHechoGuardable`: adelanta el trabajo SOLO donde la dimensión es
  inequívoca — ubicación personal → `identidad.ubicacion`, sede → `proyecto.sede`, herramienta →
  `preferencia.gestor-paquetes`/`preferencia.editor`/`proyecto.stack`. Lo ambiguo (cifra de proveedor) → `null`,
  lo decide el agente. Precisión > recall. La dimensión pasa por la convención del motor: cero divergencia de formato.
- **Matiz de medición:** `tools/eval-memoria` mide el MOTOR con hechos ya estructurados, NO la extracción; la
  precisión del extractor la mide `test-extractor` (texto → dimensión). `eval-memoria` entra al cablear (T8c).

## Verificación
- `node tests/test-extractor.mjs` → **76 casos, 0 fallos**. Registrado en `test-boundary` (núcleo) y en `test`/`test:core`.
- `npm run test:core` verde salvo `test-plugin` (`rutaCliMemoria` sin instalación), fallo de ENTORNO (esta máquina
  tiene Corvus global instalado), ajeno a T8 — solo se tocaron `src/extractor.mjs`, `tests/test-extractor.mjs`,
  `tests/test-boundary.mjs` y `package.json` (verificado con `git diff`).
- Experimentos pesados: los lanza Peterson en su terminal (el guardián de RAM de Claude Code corta los background;
  ver `preference.bench-lanzamiento`).

## Próximos pasos
- **T8c:** cablear el extractor al nudge de `live-memory` — darle al agente la dimensión/valor/claves YA destilados
  en vez de pedirle que los invente. Es el golpe directo al bug de la escritura cedida a medias. Commit aparte (toca
  comportamiento). Después **T8d:** medir en `eval-memoria` (abstención 100%, hit@5, sin regresión en LoCoMo).
- Pendiente opcional: confirmar el de-risk con n=21 (lo lanza Peterson).
