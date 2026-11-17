# 016 — F17-T8d: línea base de uso real (`--informe`) antes del extractor

- **Fecha/hora:** 2026-11-17 16:20
- **Tipo:** decisión
- **Mejora a:** 014
- **Tarea:** F17-T8

## Qué se hizo
- Primer paso de la medición en uso real de T8d: snapshot de `--informe` ANTES de que el extractor lleve tiempo
  alimentando guardados, para tener contra qué comparar. Dos proyectos con registro real (`recuerdo-uso.jsonl`):

| proyecto       | mensajes | inyectados | usados | ignorados | precisión real |
|----------------|----------|------------|--------|-----------|----------------|
| dev-standards  | 378      | 1460       | 348    | 1107      | **23,9 %**     |
| hemispheric    | 29       | 82         | 19     | 62        | **23,5 %**     |

## Lecturas honestas (para no sobreinterpretar)
1. **«Ignorado» es un proxy DÉBIL:** se marca ignorado cuando el texto del recuerdo no aparece literal en la respuesta
   del agente. Un recuerdo puede ser útil (evita una pregunta, frena una contradicción) sin aparecer palabra por
   palabra. 23,9 % es un **suelo** de utilidad, no la utilidad real. Vale la señal RELATIVA, no el número absoluto.
2. **El ruido NO son los hechos tipo-extractor.** Lo que más se ignora en dev-standards son hechos LARGOS, multilínea,
   inyectados por solapamiento léxico flojo: `[memoria]` git/gitignore (ignorado 57 / usado 9 = 12 %), pentest-guard
   (30/5), ui-verify-reinventa (25/9). Los que el extractor produce son CORTOS y bien keyeados
   (`identidad.ubicacion = "Valencia"`, claves `[ciudad, Valencia]`) — el patrón opuesto al ruidoso.

## Por qué importa
- **El extractor va en la dirección correcta del ruido** (clave precisa → recall preciso), pero su efecto AÚN NO se
  puede medir: recién commiteado (012–015), sin sesiones post-adopción. T8d-uso-real = volver a correr `--informe`
  tras días de uso y comparar precisión + comprobar que ningún hecho extraído aparece en la cabeza de «lo más
  ignorado».
- **Hallazgo mayor e inmediato, OTRO lever:** el ruido real viene de **inyectar hechos largos con poca pista**, no del
  extractor. Eso es ranking/amplitud de inyección (pariente de F17-T4, efecto fan), no T8. Candidato fuerte a
  siguiente tarjeta si el objetivo es subir la precisión de uso real.

## Verificación
- `node cli/memory.mjs --informe --dias 60` en cada proyecto (2026-11-17). `recuerdo-uso.jsonl` es privado
  (gitignored); las cifras quedan aquí como línea base reproducible.

## Próximos pasos
- Reejecutar `--informe` dentro de ~1-2 semanas de uso con el extractor activo y comparar contra esta tabla.
- Decidir si F17 abre una tarjeta de **precisión de inyección** (acotar amplitud de hechos largos / mejor ranking),
  que es donde está el ruido medible de verdad.
