# 006 — F17 reanclado: credibilidad = abstención + knowledge-update (LongMemEval), no recall por uso

- **Fecha/hora:** 2026-11-11 12:00
- **Tipo:** decisión
- **Mejora a:** 005
- **Tarea:** F17-T2
- **Stack:** node-api

## Contexto
Discusión con el usuario sobre QUÉ bench serio da credibilidad a Corvus (objetivo: cara a cara vs
mem0/Zep, directorio de Anthropic). Dos hallazgos previos lo acotan:
- La **frecuencia de acceso** (`usos`, el término puro de ACT-R) no la mide **ningún** bench (es señal de
  uso real, no de dataset) → no da credibilidad (devlog 005).
- El **multi-hop** (lo que mide LoCoMo cat3) es el terreno de los sistemas con LLM/embeddings; Corvus
  pierde ahí por diseño y el lever fácil se descartó (devlog 004).

## Decisión (detalle en DECISIONES.md#dev-006)
- **El diferenciador de Corvus NO es "más recall", es "abstención perfecta y determinista, offline, cero-deps,
  con recall competitivo".** Ya medido: en LoCoMo cat5 (saber callar) Corvus es el mejor de los tres
  (5,6% vs mem0 3,4% vs embedding 4,7%), y la batería interna abstiene al 100%.
- **Bench de credibilidad para F17: LongMemEval**, pero como **escaparate del determinismo/abstención**, no
  como carrera de recall. Sus categorías `knowledge-update` (sustitución/recencia del contenido) y `_abs`
  (abstención) son donde el modelo de Corvus (sustitución por dimensión + umbral determinista) puede
  **ganar**, no solo competir.
- **LoCoMo sigue siendo el arena primario** (donde mem0/Zep publican).
- El ranking por `usos` / olvido-por-desuso baja a "pulido de producto": no es objetivo de credibilidad.

## Qué se hizo
- Confirmado el tooling de LongMemEval en el repo (`bajar-longmemeval.mjs`, `cargarLongmemeval`,
  `recuperar.mjs --longmemeval --motor`, offline). Tipos: `knowledge-update`, `temporal-reasoning`, etc.;
  ids `*_abs` = abstención.
- **Descargando** LongMemEval-S (~264 MB, `xiaowu0162/longmemeval-cleaned`) a `tools/eval-productos/.datos/`
  (gitignored).

## Próximos pasos
- Con los datos: baseline del **motor** en `knowledge-update` + abstención (`recuperar.mjs --longmemeval
  --motor`, offline, determinista) para ver el hueco real y citable.
- Reordenar las tarjetas de F17 a lo que ese bench premia (actualización de conocimiento + abstención).

## Verificación
- Pendiente: baseline tras la descarga. Este devlog registra la DECISIÓN de rumbo, no un número aún.
