# 023 — F17-T5: consolidación APLAZADA (no hay recurrencia que consolidar aún)

- **Fecha/hora:** 2026-11-17 19:15
- **Tipo:** decisión
- **Mejora a:** —
- **Tarea:** F17-T5

## Qué se hizo
- De-risk de T5 (consolidación episódico → semántico: juntar hechos recurrentes en una regla estable) antes de
  construir. Pregunta: ¿hay de verdad recurrencia/fan que consolidar en los hechos reales?

## Resultado
- Almacenes de hechos de proyecto: **6** (dev-standards) y **8** (hemispheric). Memoria global del usuario: **13
  hechos, cada uno en su PROPIA dimensión** — fan = 0, ninguna dimensión con 2+ hechos.
- La sustitución cronológica (`sustituir()`, ya existente) mantiene las familias de valor único a 1 por dimensión;
  las familias de acumular (nota/aprendizaje/pendiente/objetivo) aún no han acumulado nada que juntar.

## Conclusión
- **No hay nada que consolidar hoy.** T5 resolvería un problema que a esta escala no existe. Construirlo ahora sería
  adivinar, contra el método de la fase («no adivinar, medir»). **Se APLAZA** (no se descarta: importará cuando la
  memoria crezca y las familias de acumular junten varios hechos por tema). Disparador para retomarlo: una dimensión
  de acumular con ≥ 5 hechos, o el aviso de pistas saturadas de `--health` (F17-T4) disparándose sobre HECHOS (hoy el
  ruido saturado era del DIARIO, ya resuelto por T9).

## Verificación
- `corvusmem --list` (13 hechos, 13 dimensiones distintas); `wc -l` de los `facts.jsonl` de proyecto.
