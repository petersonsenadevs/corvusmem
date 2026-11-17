# 020 — F17-T9: bench de precisión de inyección (el arena que sí ve T9)

- **Fecha/hora:** 2026-11-17 18:05
- **Tipo:** feature (bench)
- **Mejora a:** 019
- **Tarea:** F17-T9d

## Qué se hizo
- `tools/eval-precision-inyeccion.mjs`: bench de la PRECISIÓN DE INYECCIÓN. Arena distinta a LongMemEval/LoCoMo —
  esos miden el RECALL del motor (si el dato está en el top-k); por eso NO ven T9. Este mide lo contrario: de lo que la
  memoria inyecta en el contexto con cada mensaje, cuánto SIRVE y cuánto es ruido. Verdad-de-campo = las etiquetas
  reales usado/ignorado de `recuerdo-uso.jsonl`. Replay determinista, sin LLM ni red. Reporta precisión ANTES
  (inyección real) y DESPUÉS (contrafactual: aplicando el suelo del diario 0,25 × escala que metió T9b).
- Sustituye el script de usar-y-tirar del de-risk por una herramienta reproducible (la que confirma T9d con el tiempo).

## Resultado hoy (datos reales acumulados)
| proyecto      | precisión antes → después | ruido cortado / útiles perdidos | relación |
|---------------|---------------------------|---------------------------------|----------|
| dev-standards | **23,6 % → 26,6 %** (+3 pts) | 267 / 36                        | 7,4 : 1  |
| hemispheric   | 23,5 % → 23,5 %           | 0 / 0                            | — (sin suelo: poca historia) |

- Por cada útil perdido se cortan ~7 de ruido. En hemispheric el suelo aún no actúa (escala 0 por < 20 consultas de
  diario): honesto, no inventado.

## Por qué importa
- Responde objetivamente «¿mejoró?» con la misma clase de evidencia que los benches que ya se usan, pero en el arena
  correcto. NO es puerta de `npm test` (depende de datos privados de uso, no reproducibles en CI): es herramienta que
  lanza Peterson, como el bench de LoCoMo.

## Verificación
- `node tools/eval-precision-inyeccion.mjs D:/dev-standards D:/hemispheric` (2026-11-17). Reutiliza `escalaDiario` y
  `rutaUso` de `src/facts.mjs` (una sola fuente del suelo).

## Próximos pasos
- T9d: reejecutar este bench tras días de uso y ver la precisión «después» convertirse en la precisión «antes» real,
  también en hemispheric cuando junte ≥ 20 consultas de diario.
