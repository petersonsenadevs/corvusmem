# 018 — F17-T9a: de-risk del suelo escalado del diario (0,25 × escala)

- **Fecha/hora:** 2026-11-17 17:10
- **Tipo:** decisión
- **Mejora a:** 017
- **Tarea:** F17-T9a

## Qué se hizo
- T9a: confirmar sobre `recuerdo-uso.jsonl` que un suelo ABSOLUTO para el diario, expresado como **fracción de la
  escala del propio diario** (no una constante), corta ruido sin llevarse los útiles, y que aguanta en el diario
  PEQUEÑO (hemispheric) además del grande (dev-standards). Script: `scratchpad/t9a-suelo-escalado.mjs`.
- **Escala del diario = p90 del mejor acierto por consulta** (`mejor(diario)` por línea del log). Grande: 20,2 ·
  pequeño: 4,7 → difieren ~4×. **Eso confirma por qué una constante rompería el pequeño**; el suelo DEBE escalar.

## Resultado (por proyecto, con suelo = fracción × escala)
| fracción | GRANDE: ignor. cortados / usados perdidos | acierto | PEQUEÑO: cortados / perdidos | acierto |
|----------|--------------------------------------------|---------|------------------------------|---------|
| 0,00     | 0 / 0                                       | 21 %    | 0 / 0                         | 22 %    |
| **0,25** | **266 / 36**                                | **24 %**| **4 / 0**                     | **24 %**|
| 0,35     | 472 / 83                                    | 27 %    | 8 / 3 (⚠ pierde útiles)       | 19 %    |
| 0,50     | 667 / 142                                   | 30 %    | 14 / 6                        | 12 %    |

- **Punto seguro: `0,25 × escala`.** Mejora los DOS proyectos y no regresa ninguno. En el grande corta 266 molestias
  (de 866) perdiendo 36 útiles (de 228); en el pequeño corta 4 sin perder ninguno. Pasar de ~0,30 gana en el grande
  pero **daña el pequeño** (empieza a tirar los pocos útiles que tiene).
- **Aviso de muestra:** el pequeño son 37 items (poco). Conclusión honesta: 0,25 es conservador y seguro; la ganancia
  sólida está demostrada en el grande, y en el pequeño es inocuo-a-favor.

## Diseño que habilita (para T9b)
- El motor necesita la ESCALA en caliente. Camino determinista/offline/cero-dep que encaja con Corvus: **auto-calibrar
  la escala desde el historial** — p90 de los `mejor(diario)` por consulta que YA se acumulan en `recuerdo-uso.jsonl`.
  Sin historial (proyecto nuevo) → sin suelo (comportamiento relativo actual), así no se daña a nadie al arrancar.

## Verificación
- `node scratchpad/t9a-suelo-escalado.mjs` (reproducible; datos privados gitignored). Replay sobre 1094 items (grande)
  + 37 (pequeño).

## Próximos pasos
- **T9b:** implementar el suelo `0,25 × escala(p90 histórico)` en `src/live-recall.mjs:43` para `devlog`+`memoria`
  (NO hechos), con fallback sin-historial = sin-suelo. Luego T9c (gate) y T9d (uso real).
