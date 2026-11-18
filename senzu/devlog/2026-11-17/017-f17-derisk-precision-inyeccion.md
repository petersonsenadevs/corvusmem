# 017 — F17: de-risk del lever de precisión de inyección (sobre lo medido en 016)

- **Fecha/hora:** 2026-11-17 16:40
- **Tipo:** decisión
- **Mejora a:** 016
- **Tarea:** F17 (nueva tarjeta candidata, fuera de T8)

## Qué se hizo
- Tras ver en 016 que la precisión de uso real es ~24 %, de-risk de levers SIMPLES para subirla, usando los datos que
  ya hay (`recuerdo-uso.jsonl`, 1536 items marcados usado/ignorado, dev-standards + hemispheric). Sin esperar
  sesiones, sin RAM: replay de lo ya registrado.

## Resultado (honesto)
- **La LONGITUD no separa** usados de ignorados: corto [0-80) 28,7 % · medio [80-160) 15-21 % · largo [160+) 26,7 %.
  No es monótono; los largos van *mejor* que los medianos → **«penalizar hechos largos» NO lo sostienen los datos**
  (mi hipótesis inicial en 016 era errónea a nivel de item; el top-ignorados estaba dominado por POCOS hechos
  inyectados MUCHAS veces, no por la longitud).
- **La PUNTUACIÓN separa flojo:** solo el cuartil alto (≥9,65) sube a 31 %; el resto ~21 %. Subir el umbral se
  llevaría muchos usados por delante.
- **Los DÉBILES (relaciones fan-flagged) se usan MÁS que la media (31,5 %)** → su castigo actual está mal calibrado.
- **LEVER REAL — sobre-disparo por hecho:** 27 hechos inyectados ≥8× con uso <20 % concentran **29,3 % de todo el
  ruido**. Callarlos subiría la precisión global **~24 % → ~30,7 % (+7 pts)**, concentrado en un puñado de hechos
  (ej.: git/gitignore iny 69/uso 9; pentest-guard iny 35/uso 5).

## El bloqueo (por qué NO se construye a ciegas)
- Demotar por ratio de uso enterraría hechos IMPORTANTES que el proxy infravalora: `[preference.autoria]`
  (iny 15 / uso 1 = 7 %) es una preferencia real de Peterson; no aparece literal en el chat porque moldea cabeceras
  de código, no la respuesta. El cuello es el MISMO que en cat5: el proxy de «usado» (match literal) es débil.
- Conclusión: **el lever existe y da +7 pts, pero necesita un proxy de utilidad mejor que el match literal** antes de
  tocar el ranking de inyección. Es una tarjeta de F17 bien acotada (realimentación de uso con mejor señal), NO algo
  para construir hoy.

## Verificación
- `--informe` (016) + dos análisis replay sobre `recuerdo-uso.jsonl` (longitud/puntuación/débiles y sobre-disparo por
  hecho). Datos privados (gitignored); cifras aquí reproducibles.

## Próximos pasos
- T8d-uso-real: reejecutar `--informe` tras días de uso con el extractor y comparar contra 016.
- Si F17 quiere subir precisión real: tarjeta «ranking por realimentación de uso» que primero resuelva el proxy de
  utilidad (no demotar autoría/preferencias). Sin eso, no se toca el ranking.
