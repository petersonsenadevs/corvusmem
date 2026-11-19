<!-- Corvusmem · author: Peterson Sena (r3v3rs3) · https://corvusmem.vercel.app -->
# Plan — Cortex: "el pensamiento que se forma" (visual honesto de la activación real)

## La idea que vertebra la fase
El Cortex ya ilumina el dato buscado y mueve impulsos por las conexiones. Falta **coreografiar** eso para que,
al pensar o buscar, se vea el **pensamiento formándose**: entra la consulta → se activan los nodos candidatos →
la activación **se propaga por las conexiones reales** (2 saltos por nombres compartidos) → converge en el dato →
se arma la respuesta. Es el activo único de Corvus (mem0/Zep no tienen "ves tu memoria") y **marketing visual**
de primera: un GIF del cerebro pensando.

## Regla de oro de la fase
**Honestidad visual:** la animación refleja la activación **REAL** que calcula el motor (foco + vecinos de 2
saltos, el mismo que usa la búsqueda F11), **nunca** impulsos aleatorios disfrazados de pensamiento. Si no es el
mecanismo de verdad, no se anima. Y **no toca el motor de recuperación** (solo lee lo que ya calcula).

## Alcance
- **IN:** coreografía dirigida del pensamiento en `cerebro3D` (standalone y embed de la web); modo grabable para
  GIF/vídeo; respeta `prefers-reduced-motion`; dark (único modo tras el 0.6.1).
- **OUT:** no cambia el ranking ni la abstención; no inventa conexiones; no es física de juguete; no reescribe el
  Cortex — reutiliza `pulsos`/`destellos`/`foco` que ya existen.

## Métricas que gobiernan
- **Honestidad:** cada nodo/arista que se enciende sale del grafo real (`cortex-graph` / `focoBusqueda`).
- **Rendimiento:** fluido en el canvas 2D actual, sin bloquear; cae a estado estático con reduced-motion.
- **Verificación:** `test-cortex-visual` verde; capturas 375/768/1440, móvil primero, dark, consola limpia.

---

## Tarjetas

### CX-T1 · Dirección visual del pensamiento  [S] [todo]  ← SIGUIENTE
- **Skill:** ui-ux-pro-max. Decidir la **coreografía** y el estilo: las 4-5 fases (entrada de consulta →
  activación de candidatos → propagación por conexiones → convergencia → destello de respuesta), timing, easing,
  tokens/paleta del Cortex, y los estados (reposo, pensando, reduced-motion). Storyboard antes de codificar.
- **Hecho cuando:** hay un storyboard aprobado de las fases (una maqueta o descripción visual por fase).
- **Verificar:** el usuario valida la dirección antes de tocar código.

### CX-T2 · Exponer la activación real a la animación  [M] [todo]
- **Skill:** code-quality. El motor ya conoce el foco y los vecinos de 2 saltos (lo usa `buscar`/`focoBusqueda`).
  Asegurar que la **secuencia de activación** (candidatos → saltos → convergencia) sale del cálculo REAL y en
  orden, lista para animar — sin inventar nada.
- **Hecho cuando:** dada una consulta, la secuencia de nodos a encender proviene del grafo real (verificable).
- **Verificar:** test que compruebe que la secuencia coincide con los vecinos reales del dato.

### CX-T3 · Coreografía en `cerebro3D`  [L] [todo]
- **Skill:** ui-ux-pro-max + threejs/canvas. Implementar la animación **dirigida** sobre `pulsos`/`destellos`/
  `foco` existentes: una `pensarFormando(secuencia)` que reproduce las fases EN ORDEN (no la ráfaga aleatoria de
  `rafaga`). Reutiliza el canvas 2D. Respeta `prefers-reduced-motion` (estado final estático, sin movimiento).
- **Hecho cuando:** al pulsar «pensar» o al buscar, se ve el pensamiento **formarse** de verdad, suave y sin
  bajar el rendimiento.
- **Verificar:** `test-cortex-visual` verde; `node --check`.

### CX-T4 · Grabable para marketing  [S] [todo]
- **Skill:** ui-ux-pro-max. Un modo/param para capturar la animación **limpia** (sin panel, en bucle, fondo apto)
  reutilizando el modo solo-cerebro → GIF/vídeo para dev.to/LinkedIn.
- **Hecho cuando:** sale un GIF compartible del pensamiento formándose, en las tres anchuras.
- **Verificar:** captura revisada por el usuario.

### CX-T5 · Verificación UI  [S] [todo]
- **Skill:** ui-verify. `test-cortex-visual` verde; 375/768/1440 móvil primero; dark; consola limpia;
  `prefers-reduced-motion` respetado.
- **Hecho cuando:** todo verde + captura anotada.

---

## Notas
- El embed de la web (`data-solo`) debe heredar la coreografía sin el panel; coordinar con `D:/hemi-web`
  (CortexEmbed) cuando CX-T3 esté.
- Los experimentos/benchmarks pesados los lanza Peterson (regla bench-lanzamiento); aquí no hay bench pesado,
  es visual.
