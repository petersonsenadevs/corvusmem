# 021 — F17-T10: fatiga de inyección DESCARTADA con evidencia

- **Fecha/hora:** 2026-11-17 18:30
- **Tipo:** decisión
- **Mejora a:** 020
- **Tarea:** F17-T10 (descartada)

## Qué se probó
- Tras el suelo T9, queda ruido residual. 11 entradas de SITUACIÓN (diario + un pendiente, 0 permanentes) se
  sobre-disparan (iny ≥ 8, uso < 20 %) y concentran el 14 % del ruido restante. Idea: **fatiga de inyección** — una
  entrada situacional inyectada muchas veces sin usarse se suprime; scoped a situación, nunca permanentes (así NO
  entierra [[preference.autoria]], que era el bloqueo de 017).
- De-risk CAUSAL (replay en orden temporal, decidiendo cada inyección solo con lo visto hasta ese momento, sin mirar
  el futuro) sobre el log real de dev-standards, ya con el suelo T9 aplicado.

## Resultado (negativo, honesto)
| regla (MIN/RATIO) | ruido suprimido / útiles perdidos | relación | precisión |
|-------------------|-----------------------------------|----------|-----------|
| base (solo suelo) | —                                  | —        | 26,7 %    |
| 8 / 0,15          | 42 / 14                            | 3,0 : 1  | 26,8 %    |
| 6 / 0,20          | 83 / 25                            | 3,3 : 1  | 27,1 %    |
| 5 / 0,20          | 91 / 29                            | 3,1 : 1  | 27,0 %    |

- **+0,4 pts como mucho, a 3:1** (vs el suelo T9: +3 pts a 7:1). No compensa: por cada 3 ruidos cortados se tira 1
  recuerdo útil.
- **Por qué falla:** cuando una entrada «demuestra» que casi nunca sirve (hacen falta 8+ inyecciones), ya hizo el
  daño, y suprimirla después mata también sus usos futuros. El proxy débil («usado» = match literal) vuelve a morder:
  causalmente no se distingue «crónicamente ignorada» de «a punto de servir».

## Conclusión
- **El suelo del diario (T9) era el lever bueno y está hecho.** Pasado él, el ruido del diario está DISPERSO (muchas
  entradas inyectadas pocas veces cada una), sin patrón concentrado que cortar sin tirar útiles.
- El único lever de fondo que queda sería **mejorar el proxy de utilidad** (que «usado» capte el valor que no aparece
  literal en la respuesta). Eso es investigación, no un parche; se deja anotado, no se abre a ciegas.

## Verificación
- Replay causal `scratchpad` sobre `recuerdo-uso.jsonl` de dev-standards (datos privados). Determinista.
