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

### CX-T1 · Dirección visual del pensamiento  [S] [done]
- ✅ **(2026-11-19, devlog 032).** Storyboard de 5 fases aprobado: reposo → entra la consulta (tiñe zonas) →
  se activan los candidatos → propagación por conexiones (2 saltos) → converge + destello. ~3 s, ease-in-out,
  paleta actual del Cortex, reduced-motion = foto final. Honestidad: todo lo que se enciende es real.

### CX-T2 · Exponer la activación real a la animación  [M] [done]
- ✅ **(2026-11-19, devlog 032).** No hizo falta cálculo nuevo: la secuencia sale de los datos que el grafo ya
  tiene — `nodosPorZona` (candidatos reales por zona) y `enl` (aristas reales de 2 saltos), los mismos que usa
  `buscar()`/F11. La animación los lee, no inventa.

### CX-T3 · Coreografía en `cerebro3D`  [L] [done]
- ✅ **(2026-11-19, devlog 032).** `pensarFormando(zs)` en `cerebro3D` reproduce las fases EN ORDEN reutilizando
  `foco`/`pulsos`/`destellos`: Fase A candidatos (resto atenuado) → B impulsos por sus aristas (350 ms) →
  C converge el clúster (900 ms) → D destello (1500 ms). `encender()` (botón «cómo piensa») lo llama en vez de
  la ráfaga aleatoria. `prefers-reduced-motion` → estado final al instante. Verificado: `node --check` +
  `test-cortex-visual` **40/0**.

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
