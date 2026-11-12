# Decisiones - 2026-11-12

## dev-011 — La recencia no mejora knowledge-update (bloquea F17-T3)
- **Contexto:** experimento LongMemEval knowledge-update: ingestión con fechas reales (recencia activa) vs segundos.
- **Datos (n=12):** A (segundos) recall@5 70,8% · B (fechas reales) 66,7% · Δ −4,1 pts; acierto@5 83→75.
- **Elección:** no perseguir recencia/olvido sobre turnos crudos; F17-T3 queda blocked.
- **Motivo:** la recencia enfría turnos-oro de sesiones antiguas y los saca del top-5; el lever `pesoUso` (±21%) es muy
  suave para ayudar. La otra pata de T3 (menos ruido) no la mide la batería (dev-005).
- **Consecuencias:** se confirma el patrón de toda la sesión: ningún lever interno del motor sobre TURNOS CRUDOS mejora
  el bench (abstención 005/007/008/009, multi-hop 004, recencia 011). Camino restante: extractor determinista (009).
