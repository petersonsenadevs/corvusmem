# 033 — Cortex: el cerebro piensa en bucle (solo-cerebro) y el hero de la web lo hereda

- **Fecha/hora:** 2026-11-19 12:30
- **Tipo:** feature
- **Mejora a:** 032
- **Tarea:** CX-T4 + B (hero de la web)

## Qué se hizo
- **`autoPensarBucle()` en `cortex/cortex.mjs`.** En el modo **solo-cerebro** (`data-solo`, el embeddable), tras
  arrancar el 3D el cerebro **piensa en bucle**: reproduce la coreografía (`pensarFormando`) consulta tras
  consulta (de `A.pensamientos`, o cae a las zonas con uso), cada ~3,5 s. `prefers-reduced-motion` → una sola
  vez, sin bucle. Sirve para **grabar el GIF** (CX-T4) y para el **hero vivo de la web** (B).
- **B — hero de la web regenerado.** `D:/hemi-web/public/cortex-hero.html` y `cortex-demo.html` se re-renderizaron
  con el `cortex.mjs` nuevo (`scratchpad/regen-cortex-web.mjs`: extrae los datos de demo Aurora Coffee del
  `<script id="datos-cortex">` del HTML viejo y vuelve a llamar a `htmlCortex`). El hero resultante tiene
  `data-solo` + `autoPensarBucle` → animará solo al cargar la web.

## Verificación
- `node --check cortex/cortex.mjs` OK; `test-cortex-visual` **40/0**.
- Regen: `hero tiene data-solo: true · autoPensarBucle: true`; demo 99,9 KB, hero 99,9 KB.

## Próximos pasos (del usuario)
- Grabar el **GIF** desde el navegador (el Cortex/hero ya pensando en bucle) para dev.to/LinkedIn.
- **Desplegar** `D:/hemi-web` con los `public/cortex-*.html` regenerados (hero vivo).
- **Mergear** `feat/cortex-pensamiento` → main y publicar (la animación entra en la release).
