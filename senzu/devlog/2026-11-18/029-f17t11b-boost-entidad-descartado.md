# 029 — F17-T11b/c: boost de entidad/hablante DESCARTADO — sube cat1/cat3 pero hunde la abstención (cat5)

- **Fecha/hora:** 2026-11-18 18:40
- **Tipo:** decisión
- **Mejora a:** 028
- **Tarea:** F17-T11b (cierra F17-T11)

## Qué se probó
La palanca candidata de T11a: **boost del encaje entidad/hablante**. De-risk como RE-RANKING posterior sobre
la salida del motor, sin tocar el producto (`scratchpad/t11b-boost-entidad.mjs`): a los turnos cuyo HABLANTE
aparece nombrado en la pregunta se les suma `A = alpha × (mejor puntuación base de la consulta)`. Barrido
alpha ∈ {0, 0,5, 1, 1,5} sobre LoCoMo completo, por categoría.

## Resultado (acierto@10 / recall@10)
| alpha | cat1 | cat2 | cat3 | cat4 | cat5 |
|---|---|---|---|---|---|
| 0 (base) | 56,4/29,6 | 68,2/64,9 | 39,1/28,3 | 65,9/64,5 | **65,5/64,7** |
| 0,5 | **60,6/33,8** | 69,2/66,1 | **41,3/30,7** | 66,9/65,5 | **44,6/44,2** |
| 1,0 | 60,6/33,5 | 69,5/66,5 | 41,3/30,7 | 66,2/64,8 | **22,9/22,5** |

acierto@5 cat1: 40,4 → **47,5** (+7,1).

## Conclusión: DESCARTADO
- La hipótesis de T11a era **correcta**: el boost sube cat1 (+4-7 pts) y cat3 (+2) **sin regresar cat2/cat4**.
- Pero **hunde cat5 (abstención)**: 65,5 → 44,6 (alpha 0,5) → 22,9 (alpha 1). El boost **inunda el top-10 con
  turnos de la persona nombrada** y, al **inflar sus puntuaciones por encima del `UMBRAL_RECUERDO`**, en una
  pregunta-trampa el motor **inyecta y contesta en vez de callar**. Es *"recuperar más mintiendo más es
  perder"* — la regla de oro de la fase. Mismo patrón que [[F17-T7]].
- **Tensión de fondo, no bug:** lo que ayuda a cat1 (fiarse a ciegas del hablante) es lo que rompe la
  abstención. No se puede exigir solape para filtrar porque el oro de cat1 tiene solape ~0 (T11a). Una
  variante "solo reordenar sin subir sobre el umbral" no ayudaría: traer el oro (rank 196, score 0,48) al
  top-10 EXIGE subir su puntuación, que es justo lo que rompe la abstención.

## Qué cierra
- **T11b descartado; T11c (confirmación end-to-end) NO se lanza** (el de-risk offline ya dio el no → ahorra el
  bench de Peterson). **F17-T11 cerrado con evidencia.**
- Lección de fase: en cat1/cat3 el motor ya está **cerca de su techo determinista**; el hueco que queda es el
  **solape léxico casi nulo** pregunta↔respuesta (intrínsecamente duro; el embedding va aún peor, ac@10 16 %).
  No hay ganancia de recuperación barata y segura. El titular sigue siendo el 0.6.0: Corvus en crudo 34,8 %.

## Verificación
- Barrido reproducible en `scratchpad/`, sin red, LoCoMo completo. No se tocó el producto (de-risk por
  re-ranking posterior). La regla de oro se respetó: no se sube nada que la rompa.
