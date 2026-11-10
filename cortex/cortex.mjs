// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// Cortex (F7-T3/T4): la memoria del proyecto como un HTML local, autocontenido y sin red, con el diseño elegido en las
// rondas (plan/design-system/cortex/MASTER.md: «Nocturno» + 2D «Neón de línea» + 3D de puntos con giro libre).
// Lo usa `memory.mjs --cortex [--cliente] [--idioma xx]`; los datos salen de facts.mjs → datosCortex() (con --cliente,
// lo privado ni siquiera entra en el archivo). Todo texto de la memoria se pinta con textContent: nunca como HTML.
// La interfaz habla el idioma del navegador (o el de --idioma, o el que se elija): textos en cortex-text.mjs.
import { TEXTOS } from './cortex-text.mjs';

// Marca del header: el cuervo de Corvusmem (PNG reescalado a 72px e incrustado como data-URI para que el HTML siga
// siendo autocontenido y offline). Fuente: assets/crow.png.
const CUERVO_SRC = 'data:image/png;base64,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';

// ---------------------------------------------------------------- 2D: vista lateral (delante a la izquierda)
// Frontal y parietal separados por el surco central; el temporal, por debajo de la cisura de Silvio (con aire); el
// hipocampo, dentro del temporal; cerebelo con sus láminas y tronco del encéfalo.
const ZONAS = [
    ['frontal', 'M62,178 C40,150 42,100 78,68 C104,45 140,34 176,34 L188,36 C186,70 182,104 176,132 C150,138 118,146 96,160 C84,168 72,174 62,178Z'],
    ['parietal', 'M188,36 C236,34 282,48 312,74 C300,98 286,114 268,124 C238,126 206,128 176,132 C182,104 186,70 188,36Z'],
    ['occipital', 'M312,74 C338,96 352,126 350,154 C348,172 340,184 328,190 C312,170 292,146 268,124 C286,114 300,98 312,74Z'],
    ['temporal', 'M102,172 C122,158 150,148 180,144 C214,140 246,138 272,140 C292,152 310,170 322,193 C298,210 262,220 222,222 C176,224 136,218 114,204 C102,196 98,184 102,172Z'],
    ['hipocampo', 'M157,196 C173,175 210,169 241,173 C265,176 277,190 273,204 C265,217 241,219 222,213 C206,209 192,212 180,219 C164,224 155,212 157,196Z'],
];
const SURCOS = {
    frontal: ['M70,140 C80,120 96,124 104,108 C112,92 128,96 136,80', 'M92,70 C104,82 120,76 132,64 C142,54 156,58 166,48', 'M118,130 C128,118 142,124 150,110 C158,96 170,100 174,86', 'M56,160 C68,150 82,154 92,144'],
    parietal: ['M200,52 C212,64 226,58 238,68 C250,78 262,72 276,80', 'M196,98 C210,88 224,96 238,88 C252,80 266,88 282,84', 'M202,120 C218,112 234,118 252,112'],
    occipital: ['M316,96 C326,108 324,122 334,132', 'M298,128 C310,136 312,152 324,160', 'M330,160 C336,170 334,178 340,184'],
    temporal: ['M116,190 C130,180 142,188 154,178', 'M276,160 C288,168 294,180 306,186', 'M188,156 C208,152 228,158 250,152'],
    hipocampo: ['M172,200 C190,188 214,184 240,188 C256,190 262,198 254,204'],
};
const NEUTRO = '<path class="cerebelo" d="M300,206 C326,198 356,206 360,226 C358,246 328,256 300,248 C284,240 284,214 300,206Z"/>'
    + '<path class="laminas" d="M292,220 C312,214 336,216 354,222 M290,232 C312,228 336,230 356,236 M296,244 C314,242 332,244 348,246"/>'
    + '<path d="M238,222 C246,246 250,268 248,292 L230,292 C230,270 226,248 220,224Z"/>'
    + '<path class="cisura" d="M188,36 C186,70 182,104 176,132 M96,160 C130,148 170,140 210,136 C236,134 256,134 270,138"/>';
const ETIQUETAS = [['frontal', 78, 112], ['parietal', 214, 100], ['occipital', 296, 150], ['temporal', 190, 168], ['hipocampo', 192, 201]];

const cerebro = () => `<svg class="cerebro neon" viewBox="20 20 360 285" role="group" data-t-aria="ariaCerebro">
  <g class="neutro" aria-hidden="true">${NEUTRO}</g>
  ${ZONAS.map(([r, d]) => `<path class="respira" data-region="${r}" data-t-aria="zonas.${r}" d="${d}"/>`).join('\n  ')}
  <g aria-hidden="true">${Object.entries(SURCOS).map(([r, l]) => l.map(d => `<path class="surco-neon surco-${r}${r === 'hipocampo' ? ' fluye' : ''}" style="stroke:var(--r-${r})" d="${d}"/>`).join('')).join('')}</g>
  <g class="etiquetas" aria-hidden="true">${ETIQUETAS.map(([r, x, y]) => `<g class="etq-neon etq-${r}"><circle cx="${x - 7}" cy="${y - 4}" r="3" style="fill:var(--r-${r})"/><text x="${x}" y="${y}" data-t="etq.${r}"></text></g>`).join('')}</g>
</svg>`;

const CSS = `
/* Paleta alineada a la web de Corvusmem (D:/hemi-web, src/styles/tokens.css: design-system «corvusmem»): base
   casi-negra + acento ÁMBAR, tipografía serif en títulos. Las 5 zonas se rearmonizan a tonos tierra/joya apagados:
   distinguibles entre sí y distintos del ámbar, que queda reservado al ESTADO ACTIVO (--foco). */
:root {
  --fondo: #121110; --papel: #1A1917; --papel-alto: #222120; --borde: #2C2A28; --texto: #F5F5F5; --suave: #A6A3A0; --linea: #3A3836; --foco: #B45309;
  --r-frontal: #C25E3A; --r-parietal: #4E8C86; --r-occipital: #5B7FA6; --r-temporal: #B05C7E; --r-hipocampo: #7E9B52;
  --fuente-titulos: 'Instrument Serif', Georgia, 'Times New Roman', serif; --fuente-texto: 'Inter', system-ui, 'Segoe UI', sans-serif; --radio: 999px;
  --halo: rgba(10, 10, 10, .85); --tinte: 12%;
  color-scheme: dark;
}
/* Claro: papel blanco de la web, tinta casi-negra, acento ámbar más hondo y zonas más oscuras para que contrasten
   sobre blanco (en claro el brillo ensucia). */
[data-theme="light"] {
  --fondo: #FAFAFA; --papel: #FFFFFF; --papel-alto: #F5F5F5; --borde: #E5E5E5; --texto: #0A0A0A; --suave: #737373; --linea: #D4D4D4; --foco: #92400E;
  --r-frontal: #A8431F; --r-parietal: #2F6F69; --r-occipital: #3C5F86; --r-temporal: #8E3A5C; --r-hipocampo: #5A7334;
  --halo: rgba(255, 255, 255, .92); --tinte: 8%;
  color-scheme: light;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--fondo); color: var(--texto); font: 16px/1.55 var(--fuente-texto); -webkit-font-smoothing: antialiased; }
h1, h2, h3 { font-family: var(--fuente-titulos); margin: 0; letter-spacing: -.02em; }
button, select { font: inherit; color: inherit; cursor: pointer; }
button:focus-visible, select:focus-visible, input:focus-visible, .hecho:focus-visible, canvas:focus-visible, [data-region]:focus-visible { outline: 3px solid var(--foco); outline-offset: 2px; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.escena { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(340px, 1fr); min-height: 100vh; }
.lienzo { position: relative; padding: 28px 32px; display: grid; grid-template-rows: auto 1fr auto auto; gap: 12px;
  background: radial-gradient(60% 55% at 45% 52%, color-mix(in srgb, var(--r-parietal) var(--tinte), transparent), transparent 70%), var(--fondo); }
.arriba { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
.marca { display: flex; align-items: center; gap: 11px; font: 700 12px/1 var(--fuente-titulos); letter-spacing: .2em; text-transform: uppercase; color: var(--suave); }
.marca img { width: 34px; height: 34px; display: block; filter: drop-shadow(0 0 11px color-mix(in srgb, var(--foco) 42%, transparent)); }
.marca b { color: var(--r-temporal); font-weight: 700; }
h1 { font-size: clamp(30px, 4.4vw, 54px); font-weight: 700; line-height: 1.02; margin-top: 10px; overflow-wrap: anywhere; }
.cifras { margin: 8px 0 0; color: var(--suave); font-size: 15px; } .cifras b { color: var(--texto); }
.mandos { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.mandos button, .mandos select { border: 1px solid var(--borde); background: var(--papel); border-radius: var(--radio); padding: 9px 16px; min-height: 44px; font-weight: 700; font-size: 14px; transition: border-color .2s, background .2s, color .15s; }
.mandos button:hover, .mandos select:hover { border-color: var(--linea); background: var(--papel-alto); }
.mandos select { padding-right: 12px; }
.mandos button[aria-pressed="true"] { background: var(--texto); color: var(--fondo); border-color: var(--texto); }
.escenario { display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; min-height: 340px; }
.escenario .v2d { width: min(100%, 680px); display: grid; align-content: center; justify-items: center; }
.escenario .v3d { width: 100%; max-width: 760px; display: grid; justify-items: center; }
.v3d canvas { width: 100%; height: 460px; display: block; touch-action: none; cursor: grab; }
.v3d canvas:active { cursor: grabbing; }
[data-vista="2d"] .v3d, [data-vista="3d"] .v2d { display: none !important; }
/* modo solo-cerebro (incrustable en la web): solo el canvas 3D, sin panel ni mandos, fondo transparente para fundirse */
html[data-solo], html[data-solo] body { background: transparent; }
html[data-solo] .panel, html[data-solo] .arriba, html[data-solo] .mente, html[data-solo] .chips, html[data-solo] .pista { display: none !important; }
html[data-solo] .escena { grid-template-columns: 1fr; min-height: 100vh; }
html[data-solo] .lienzo { padding: 0; grid-template-rows: 1fr; min-height: 100vh; background: transparent; }
html[data-solo] .escenario { min-height: 100vh; }
html[data-solo] .escenario .v3d { max-width: none; width: 100%; height: 100%; }
html[data-solo] .v3d canvas { height: 100vh; }
.dibujo { width: 100%; }
.pista { margin: 6px 0 0; text-align: center; color: var(--suave); font-size: 14px; max-width: 60ch; }
.cerebro { width: 100%; height: auto; display: block; overflow: visible; }
.cerebro [data-region] { cursor: pointer; opacity: var(--brillo, 1); transition: opacity .25s, fill-opacity .25s; outline: none;
  fill-opacity: .16; stroke-width: 2.4; stroke-linejoin: round; filter: drop-shadow(0 0 calc(var(--brillo, 1) * 9px) currentColor); }
${ZONAS.map(([r]) => `.cerebro [data-region="${r}"] { fill: var(--r-${r}); stroke: var(--r-${r}); color: var(--r-${r}); }`).join('\n')}
.cerebro [data-region="hipocampo"] { fill-opacity: .3; stroke-width: 3; }
.cerebro [data-region="hipocampo"]:not(.apagada) { opacity: 1 !important; animation: none; }
.cerebro [data-region]:hover { fill-opacity: .3; }
.cerebro [data-region][aria-pressed="true"] { fill-opacity: .42; }
.cerebro .vacia:not(.apagada) { opacity: .38 !important; }
.cerebro .apagada, .apagada { opacity: .14 !important; }
.cerebro [data-region]:focus-visible { stroke-width: 4; }
.cerebro .neutro path { fill: none; stroke: var(--linea); stroke-width: 2; stroke-linejoin: round; }
.cerebro .neutro .cerebelo { fill: color-mix(in srgb, var(--suave) 8%, transparent); }
.cerebro .neutro .laminas { stroke-width: 1.4; stroke-linecap: round; }
.cerebro .neutro .cisura { stroke: var(--suave); stroke-width: 1.2; stroke-dasharray: 2 4; stroke-linecap: round; opacity: .55; }
.cerebro .etiquetas { pointer-events: none; }
.etq-neon text { font: 700 12px var(--fuente-titulos); letter-spacing: .05em; fill: var(--texto); paint-order: stroke; stroke: var(--halo); stroke-width: 3.5px; stroke-linejoin: round; }
.surco-neon { fill: none; stroke-width: 1.7; stroke-linecap: round; opacity: .8; pointer-events: none; filter: drop-shadow(0 0 4px currentColor); }
.surco-neon.fluye, .surco-neon.activa { stroke-dasharray: 6 8; animation: fluye 1.6s linear infinite; opacity: 1; }
.surco-neon.fluye { stroke-width: 2.2; }
.surco-neon.activa { animation-duration: var(--vel, 1.6s); }
/* X-T10: lo que más usa brilla más (--calor) y, al reproducir cómo piensa, la zona consultada se enciende */
.cerebro [data-region] { filter: drop-shadow(0 0 calc(3px + var(--calor, .5) * 15px) currentColor); }
.cerebro [data-region].chispa { opacity: 1 !important; fill-opacity: .62; stroke-width: 3.4; filter: drop-shadow(0 0 22px currentColor) drop-shadow(0 0 6px currentColor); transition: fill-opacity .15s, opacity .15s; }
.cerebro .respira.chispa { animation: none; }
.cerebro.pensando [data-region]:not(.chispa) { opacity: .28 !important; }
.cerebro.pensando .surco-neon:not(.activa) { opacity: .22; }
[data-theme="light"] .cerebro [data-region].chispa { fill-opacity: .5; filter: drop-shadow(0 0 6px currentColor); }
.chips button.chispa { border-color: currentColor; box-shadow: 0 0 18px currentColor, 0 0 0 1px currentColor inset; }
.chips button u { display: block; height: 3px; width: 28px; border-radius: 3px; background: color-mix(in srgb, currentColor 22%, transparent); position: relative; overflow: hidden; }
.chips button u::after { content: ""; position: absolute; inset: 0 auto 0 0; width: calc(var(--n, 0) * 100%); background: currentColor; border-radius: 3px; }
.mente { min-height: 24px; margin: 0; text-align: center; color: var(--suave); font-size: 14px; }
.mente q, .mente b { color: var(--texto); } .mente .zz { font-weight: 700; } .mente small { display: block; font-size: 12px; }
.cerebro .respira { animation: respira 4s ease-in-out infinite; }
@keyframes respira { 50% { opacity: calc(var(--brillo, 1) * .8); } }
@keyframes fluye { to { stroke-dashoffset: -28; } }
[data-theme="light"] .cerebro [data-region] { fill-opacity: .2; stroke-width: 2.4; filter: none; }
[data-theme="light"] .cerebro [data-region="hipocampo"] { fill-opacity: .32; }
[data-theme="light"] .cerebro [data-region][aria-pressed="true"] { fill-opacity: .4; }
[data-theme="light"] .surco-neon { filter: none; opacity: .9; }
[data-theme="light"] .cerebro .neutro .cisura { opacity: .7; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chips button { border: 1px solid var(--borde); background: var(--papel); border-radius: var(--radio); padding: 7px 12px 7px 10px; min-height: 44px; display: inline-flex; gap: 8px; align-items: center; font-size: 14px; transition: border-color .2s, box-shadow .2s, background .2s; }
.chips button:hover { background: var(--papel-alto); }
.chips button i { width: 10px; height: 10px; border-radius: 50%; background: currentColor; box-shadow: 0 0 10px currentColor; }
.chips button span { color: var(--texto); }
.chips button[aria-pressed="true"] { border-color: currentColor; box-shadow: 0 0 0 1px currentColor inset; }
.chips b { color: var(--suave); font-weight: 600; font-variant-numeric: tabular-nums; }
[data-theme="light"] .chips button i { box-shadow: none; }
[data-cliente] .solo-dueno, [data-cliente] .chips [data-region="temporal"], [data-cliente] .etq-temporal { display: none !important; }
[data-cliente] .surco-temporal { opacity: .12; }
.panel { background: var(--papel); border-left: 1px solid var(--linea); padding: 24px; display: grid; gap: 24px; align-content: start; max-height: 100vh; overflow: auto; position: sticky; top: 0; }
.busca input { width: 100%; font: inherit; padding: 13px 18px; border-radius: var(--radio); border: 1px solid var(--borde); background: var(--papel-alto); color: var(--texto); transition: border-color .2s, box-shadow .2s; }
.busca input:focus { border-color: var(--foco); box-shadow: 0 0 0 3px color-mix(in srgb, var(--foco) 22%, transparent); outline: none; }
.busca input::placeholder { color: var(--suave); }
h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .16em; color: var(--suave); font-weight: 700; margin-bottom: 10px; }
.cambios, .abiertos { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.cambios li, .abiertos li { display: grid; grid-template-columns: 14px 1fr; gap: 10px; font-size: 15px; }
.cambios li::before, .abiertos li::before { content: ""; width: 8px; height: 8px; margin-top: 8px; border-radius: 50%; background: var(--c); box-shadow: 0 0 10px var(--c); }
.cambios small, .abiertos small { display: block; color: var(--suave); font-size: 12px; }
.vacio { color: var(--suave); font-size: 14px; margin: 0; }
.salud { display: grid; gap: 10px; }
.salud-l { list-style: none; margin: 0; padding: 0; display: grid; gap: 7px; }
.salud-l li { display: flex; align-items: baseline; gap: 8px; font-size: 14px; border: 1px solid var(--borde); border-radius: var(--radio); padding: 8px 12px; background: var(--papel-alto); }
.salud-l li > span { color: var(--suave); }
.salud-l li > b { color: var(--texto); font-variant-numeric: tabular-nums; }
.salud-l li > small { color: var(--suave); margin-left: auto; text-align: right; font-size: 12px; }
.lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.hecho { padding: 12px 16px 12px 18px; border-radius: 16px; background: var(--papel-alto); border: 1px solid var(--borde); display: grid; gap: 2px; cursor: pointer; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: border-color .2s, transform .2s, box-shadow .2s; }
.hecho::before { content: ""; position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px; border-radius: 3px; background: var(--c); box-shadow: 0 0 12px var(--c); }
.hecho:hover { border-color: var(--c); transform: translateX(2px); box-shadow: 0 10px 26px -14px rgba(0,0,0,.6); }
.h-tema { font: 700 12px var(--fuente-titulos); letter-spacing: .08em; text-transform: uppercase; color: var(--c); }
.h-valor { overflow-wrap: anywhere; }
.h-meta { font-size: 12px; color: var(--suave); }
[data-theme="light"] .h-tema, [data-theme="light"] .d-region { color: color-mix(in srgb, var(--c) 70%, #000); }
[data-theme="light"] .hecho::before, [data-theme="light"] .cambios li::before, [data-theme="light"] .abiertos li::before { box-shadow: none; }
.mas { border: 1px solid var(--linea); background: none; border-radius: var(--radio); padding: 8px 14px; min-height: 44px; }
.detalle { border-radius: 20px; padding: 18px; background: var(--papel-alto); border: 1px solid var(--c); box-shadow: 0 0 0 1px var(--c), 0 0 40px color-mix(in srgb, var(--c) 25%, transparent); }
[data-theme="light"] .detalle { box-shadow: 0 0 0 1px var(--c), 0 10px 30px rgba(15, 23, 34, .08); }
.detalle .cerrar { float: right; border: 0; background: none; color: var(--suave); min-width: 44px; min-height: 44px; font-size: 22px; margin: -10px -10px 0 0; }
.d-region { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: .14em; color: var(--c); }
.detalle h3 { font-size: 24px; margin: 2px 0; } .d-valor { margin: 0 0 10px; font-size: 17px; overflow-wrap: anywhere; }
.d-dicho { margin: 0 0 10px; color: var(--suave); font-style: italic; }
.detalle dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; font-size: 14px; margin: 0 0 8px; } .detalle dt { color: var(--suave); } .detalle dd { margin: 0; }
.detalle h4 { margin: 10px 0 4px; font-size: 12px; color: var(--suave); text-transform: uppercase; letter-spacing: .12em; }
.historia, .enlaces { margin: 0; padding-left: 18px; font-size: 14px; } .historia .viejo { color: var(--suave); text-decoration: line-through; }
.cmd { font-size: 13px; color: var(--suave); } .cmd code { display: block; margin-top: 4px; padding: 8px 12px; border-radius: 12px; background: var(--papel-alto); border: 1px solid var(--borde); color: var(--texto); overflow-wrap: anywhere; white-space: pre-wrap; }
.pie { font-size: 12px; color: var(--suave); margin: 0; }
@media (max-width: 860px) {
  .escena { grid-template-columns: 1fr; min-height: 0; }
  .lienzo { padding: 18px 16px; grid-template-rows: auto auto auto auto; }
  .escenario { min-height: 220px; } .v3d canvas { height: 340px; }
  .chips { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory; }
  .chips button { flex: none; scroll-snap-align: start; }
  .mandos select, .busca input { font-size: 16px; }
  .panel { position: static; max-height: none; border-left: 0; border-top: 1px solid var(--linea); padding: 18px 16px 40px; }
}
/* --- Panel: cabecera, colapso y pulido --------------------------------------------------------------- */
.panel { border-top-left-radius: 20px; box-shadow: inset 1px 1px 0 color-mix(in srgb, #fff 4%, transparent); }
[data-theme="light"] .panel { box-shadow: none; }
.panel-cab { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 2px; }
.panel-tit { display: inline-flex; align-items: center; gap: 9px; font: 700 12px/1 var(--fuente-titulos); letter-spacing: .2em; text-transform: uppercase; color: var(--suave); }
.panel-tit::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--foco); box-shadow: 0 0 10px color-mix(in srgb, var(--foco) 70%, transparent); }
.panel-cerrar, .panel-abrir { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; min-width: 40px; border: 1px solid var(--borde); background: var(--papel-alto); border-radius: 12px; color: var(--suave); transition: background .2s, color .2s, border-color .2s, transform .2s; }
.panel-cerrar:hover, .panel-abrir:hover { color: var(--texto); border-color: var(--linea); background: var(--papel); }
.panel-cerrar svg, .panel-abrir svg { width: 17px; height: 17px; }
.panel > section { padding-top: 20px; border-top: 1px solid color-mix(in srgb, var(--linea) 55%, transparent); }
.busca { position: relative; display: block; }
.busca .lupa { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); width: 17px; height: 17px; color: var(--suave); pointer-events: none; }
.busca input { padding-left: 44px; }
/* botón flotante para reabrir (solo visible cuando el panel está colapsado) */
.panel-abrir { position: fixed; top: 20px; right: 20px; z-index: 6; display: none; box-shadow: 0 10px 26px -14px rgba(0,0,0,.55); }
.panel-abrir:hover { transform: translateY(-1px); }
[data-panel="off"] .escena { grid-template-columns: minmax(0, 1fr); }
[data-panel="off"] .panel { display: none; }
[data-panel="off"] .panel-abrir { display: inline-flex; }
html[data-solo] .panel-abrir { display: none !important; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

// El programa de la página (sin dependencias). Lee los datos y los textos de los <script type="application/json">.
const APP = String.raw`
(function () {
  var D = JSON.parse(document.getElementById('datos-cortex').textContent);
  var TX = JSON.parse(document.getElementById('textos-cortex').textContent);
  var ZONAS = ['frontal', 'parietal', 'occipital', 'temporal', 'hipocampo'];
  var raiz = document.documentElement, region = null, previa = !!D.cliente, filtro = '', PAGINA = innerWidth < 860 ? 12 : 40, limite = PAGINA;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var css = function (v) { return getComputedStyle(raiz).getPropertyValue(v).trim(); };
  var el = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  // ---------------- idioma: el elegido (guardado), el de --idioma, el del navegador, o castellano
  var guardado = null; try { guardado = localStorage.getItem('cortex-idioma'); } catch (e) {}
  var delNavegador = (navigator.languages || [navigator.language || 'es']).map(function (l) { return String(l).slice(0, 2).toLowerCase(); }).filter(function (l) { return TX[l]; })[0];
  var L = [guardado, D.idioma, delNavegador, 'es'].filter(function (l) { return l && TX[l]; })[0];
  function t(clave, vars) {
    var ir = function (o) { return clave.split('.').reduce(function (a, k) { return a && a[k]; }, o); };
    var s = ir(TX[L]); if (s == null) s = ir(TX.en); if (s == null) s = ir(TX.es); if (s == null) s = clave;
    if (vars) Object.keys(vars).forEach(function (k) { s = String(s).split('{' + k + '}').join(vars[k]); });
    return s;
  }
  var nombreZona = function (z) { return t('zonas.' + z); };
  var fecha = function (iso) { if (!iso) return ''; var d = new Date(iso); return isNaN(d) ? String(iso).slice(0, 10) : d.toLocaleDateString(L, { day: 'numeric', month: 'short', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined }); };
  function traducir() {
    raiz.lang = L;
    $$('[data-t]').forEach(function (e) { e.textContent = t(e.getAttribute('data-t')); });
    $$('[data-t-aria]').forEach(function (e) { e.setAttribute('aria-label', t(e.getAttribute('data-t-aria'))); });
    $$('[data-t-ph]').forEach(function (e) { e.setAttribute('placeholder', t(e.getAttribute('data-t-ph'))); });
    $$('[data-t-title]').forEach(function (e) { e.setAttribute('title', t(e.getAttribute('data-t-title'))); });
    $('#tema').textContent = raiz.getAttribute('data-theme') === 'light' ? t('oscuro') : t('claro');
    $('#pie').textContent = t('pie', { f: new Date(D.generado).toLocaleString(L) }) + ' ' + (D.cliente ? t('pieCliente') : t('pieDueno'));
  }
  var sel = $('#idioma');
  Object.keys(TX).forEach(function (k) { var o = el('option', '', TX[k].nombre); o.value = k; sel.appendChild(o); });
  sel.value = L;
  sel.addEventListener('change', function () { L = sel.value; try { localStorage.setItem('cortex-idioma', L); } catch (e) {} traducir(); todo(); var d = $('#detalle'); if (!d.hidden && ultimo) detalle(ultimo[0], ultimo[1]); });

  var visible = function (it) { return !previa || !it.privado; };
  var zonaVisible = function (z) { return !(previa && z === 'temporal'); };
  var items = function (z) { return (D.zonas[z] || []).filter(visible); };
  var peso = function (z) { return items(z).reduce(function (s, it) { return s + (it.usos || 0) + 1; }, 0); };
  // X-T10: cuánto USA el agente cada zona (0..1), del registro real; sin registro aún, lo que guarda cada zona
  var A = D.actividad || { zonas: {}, pensamientos: [], consultas: 0 };
  var usoDe = function (z) { return zonaVisible(z) ? A.zonas[z] || 0 : 0; };
  var conUso = function () { return ZONAS.some(function (z) { return usoDe(z) > 0; }); };
  var nivel = function (z) {
    var f = conUso() ? usoDe : function (k) { return zonaVisible(k) ? peso(k) : 0; };
    var max = Math.max.apply(null, ZONAS.map(f).concat([1e-9]));
    return f(z) / max;
  };
  var chispa = {};   // zonas encendidas en este momento al reproducir cómo piensa
  var temaDe = function (it) { return it.tipo === 'entrada' ? t('entrada', { n: it.devlog }) : it.tipo === 'regla' ? t('regla') : it.tema; };

  function cabecera() {
    var total = ZONAS.reduce(function (s, z) { return s + items(z).length; }, 0);
    $('#titulo').textContent = t('titulo', { p: D.proyecto });
    var c = $('#cifras'); c.textContent = '';
    c.append(t('recuerda') + ' ', el('b', '', total + ' ' + (total === 1 ? t('cosa') : t('cosas'))), ' · ', el('b', '', D.cambios.filter(visible).length + ' ' + t('cambiosN')), ' ' + t('en7') + ' · ', el('b', '', D.abiertos.filter(visible).length + ' ' + t('abiertosN')));
  }
  function regiones() {
    $$('[data-region]').forEach(function (e) {
      var z = e.getAttribute('data-region'), n = nivel(z);
      e.style.setProperty('--brillo', (0.4 + 0.6 * n).toFixed(2));
      e.style.setProperty('--calor', n.toFixed(2));
      e.classList.toggle('chispa', !!chispa[z]);
      e.classList.toggle('apagada', !zonaVisible(z) || (region !== null && region !== z));
      e.classList.toggle('vacia', items(z).length === 0);
      e.setAttribute('aria-pressed', region === z ? 'true' : 'false');
    });
    // los surcos de la zona elegida «fluyen»: la actividad de esa parte de la memoria
    // y, sin zona elegida, también fluyen las que más se usan (más deprisa cuanto más), y las que se encienden al pensar
    $$('.surco-neon').forEach(function (s) {
      var z = (/surco-(\w+)/.exec(s.getAttribute('class')) || [])[1], n = nivel(z);
      s.classList.toggle('activa', !!chispa[z] || (region !== null ? region === z : n >= 0.55));
      s.style.setProperty('--vel', (chispa[z] ? 0.7 : 2.6 - 1.4 * n).toFixed(2) + 's');
    });
    $$('[data-cuenta]').forEach(function (e) { e.textContent = items(e.getAttribute('data-cuenta')).length; });
    $('.cerebro').classList.toggle('pensando', !!pensando);   // al pensar, lo que no se consulta se apaga (y si no encontró nada, todo)
    $$('[data-calor]').forEach(function (e) { var z = e.getAttribute('data-calor'); e.style.setProperty('--n', nivel(z).toFixed(2)); e.parentNode.classList.toggle('chispa', !!chispa[z]); });
    var m = $('#mente');
    if (m && !pensando) {
      var orden = ZONAS.filter(function (z) { return usoDe(z) > 0; }).sort(function (a, b) { return usoDe(b) - usoDe(a); }).slice(0, 2);
      m.textContent = orden.length ? '' : t('sinUso');
      if (orden.length) m.append(t('masUsa', { d: A.dias || 14 }) + ' ', el('b', '', orden.map(nombreZona).join(' · ')));
    }
  }
  // ---------------- cómo piensa: sus últimas consultas a la memoria, una a una, encendiendo las zonas que tocó
  var pensando = null, quietoP = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function encender(zs) {
    chispa = {}; zs.forEach(function (z) { chispa[z] = 1; });
    regiones(); if (tresD) { tresD.rafaga(zs); tresD.dibujar(); }
  }
  function pararPensar() {
    clearTimeout(pensando); pensando = null; encender([]);
    var b = $('#piensa'); if (b) { b.setAttribute('aria-pressed', 'false'); b.textContent = t('piensa'); }
    regiones();
  }
  function pensar() {
    if (pensando) return pararPensar();
    var l = A.pensamientos || [], i = 0, b = $('#piensa');
    if (!l.length) return;
    b.setAttribute('aria-pressed', 'true'); b.textContent = t('pararP');
    var uno = function () {
      if (i >= l.length) return pararPensar();
      var p = l[i++], zs = (p.zonas || []).filter(zonaVisible), m = $('#mente');
      m.textContent = '';
      if (!previa && p.consulta) m.append(el('q', '', p.consulta), ' → ');
      if (zs.length) zs.forEach(function (z, k) { var s = el('span', 'zz', nombreZona(z)); s.style.color = 'var(--r-' + z + ')'; if (k) m.append(' · '); m.append(s); });
      else m.append(t('nadaEncontro'));
      if (p.usado === true) m.append(' · ' + t('loUso')); else if (p.usado === false) m.append(' · ' + t('noLoUso'));
      var d = new Date(p.t);
      m.appendChild(el('small', '', t('paso', { i: i, n: l.length }) + (isNaN(d) ? '' : ' · ' + d.toLocaleString(L, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))));
      encender(zs);
      pensando = setTimeout(uno, quietoP ? 2600 : 1700);
    };
    pensando = -1; uno();
  }
  function meta(it) {
    var m = [];
    if (it.tipo === 'decision') m.push(t('mDecision'));
    if (it.tipo === 'entrada') m.push(fecha(it.creado));
    if (it.fuente && it.fuente !== 'usuario' && it.tipo === 'hecho') m.push(it.fuente === 'agente' ? t('mAgente') : t('mDevlog'));
    if (it.estado === 'dudoso') m.push(t('dudoso'));
    if (it.progreso === 'en-curso') m.push(t('enCurso'));
    if (!previa && it.usos) m.push(it.usos + ' ' + (it.usos === 1 ? t('uso') : t('usos')));
    if (!previa && it.devlog && it.tipo !== 'entrada') m.push(t('ver') + ' ' + it.devlog);
    return m.join(' · ');
  }
  function lista() {
    var ul = $('#lista'); ul.textContent = '';
    var q = filtro, todos = [];
    (region ? [region] : ZONAS).filter(zonaVisible).forEach(function (z) {
      items(z).forEach(function (it) {
        if (q && [temaDe(it), it.valor, it.texto, it.dimension].join(' ').toLowerCase().indexOf(q) < 0) return;
        todos.push([z, it]);
      });
    });
    todos.slice(0, limite).forEach(function (p) {
      var z = p[0], it = p[1], li = el('li', 'hecho'); li.tabIndex = 0;
      li.style.setProperty('--c', 'var(--r-' + z + ')');
      li.append(el('span', 'h-tema', temaDe(it)), el('span', 'h-valor', it.valor), el('span', 'h-meta', meta(it)));
      li.onclick = function () { detalle(it, z); };
      li.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); detalle(it, z); } };
      ul.appendChild(li);
    });
    $('#lista-titulo').textContent = region ? nombreZona(region) : (q ? t('coincide') : t('todo'));
    var v = $('#lista-vacia');
    v.hidden = todos.length > 0;
    v.textContent = q ? t('sinRes', { q: filtro }) : region ? t('zonaVacia') : t('vacia');
    var mas = $('#mas'); mas.hidden = todos.length <= limite; mas.textContent = t('verMas', { n: todos.length - limite });
  }
  var ultimo = null;
  function detalle(it, z) {
    ultimo = [it, z];
    var d = $('#detalle'); d.hidden = false; d.style.setProperty('--c', 'var(--r-' + z + ')');
    $('#d-region').textContent = nombreZona(z);
    $('#d-tema').textContent = temaDe(it);
    $('#d-valor').textContent = it.valor;
    $('#d-dicho').hidden = !it.texto; $('#d-dicho').textContent = it.texto ? '«' + it.texto + '»' : '';
    var dl = $('#d-datos'); dl.textContent = '';
    var fila = function (k, v, priv) { if (!v) return; dl.append(el('dt', priv ? 'solo-dueno' : '', k), el('dd', priv ? 'solo-dueno' : '', v)); };
    fila(t('quien'), it.tipo === 'decision' ? t('fDecision') : it.tipo === 'regla' ? t('fRegla') : it.tipo === 'entrada' ? t('fEntrada') : (it.fuente === 'usuario' ? t('fUsuario') : it.fuente === 'agente' ? t('fAgente') : t('fDevlog')) + (it.estado === 'dudoso' ? t('fDudoso') : ''));
    fila(t('desde'), fecha(it.desde || it.creado));
    if (it.usos != null) fila(t('usado'), it.usos ? it.usos + ' ' + (it.usos === 1 ? t('vez') : t('veces')) + (it.ultimo_uso ? ' · ' + t('ultima', { f: fecha(it.ultimo_uso) }) : '') : t('todavia'), true);
    if (it.devlog) fila(t('enDevlog'), t('entradaN', { n: it.devlog }), true);
    var hi = $('#d-historia'), hh = (it.historia || []).filter(function (x) { return x.valor; });
    hi.textContent = ''; $('#d-historia-t').hidden = hh.length < 2; hi.hidden = hh.length < 2;
    hh.forEach(function (x) {
      var li = el('li', x.estado === 'activo' || x.estado === 'dudoso' ? '' : 'viejo');
      li.textContent = x.valor + ' · ' + fecha(x.desde) + ' → ' + (x.hasta ? fecha(x.hasta) : t('hoy')) + (x.estado === 'cerrado' ? ' (' + t('cerrado') + (x.nota ? ': ' + x.nota : '') + ')' : '');
      hi.appendChild(li);
    });
    var en = $('#d-enlaces'), ee = it.enlaces || []; en.textContent = ''; $('#d-enlaces-t').hidden = !ee.length; en.hidden = !ee.length;
    ee.forEach(function (x) { en.appendChild(el('li', '', x.tema + ': ' + x.valor)); });
    var cmd = $('#d-cmd'), linea = '';
    if (D.cli && it.tipo === 'hecho') linea = (/^(objetivo|pendiente)\./.test(it.dimension) && it.estado === 'activo' ? 'node "' + D.cli + '" --resolver ' + it.id + ' --como "…"' + '\n' : '') + 'node "' + D.cli + '" --olvidar ' + it.id;
    if (it.tipo === 'decision' || it.tipo === 'regla') linea = t('cmdDecision');
    cmd.textContent = linea; $('#d-cmd-p').hidden = !linea;
    if (innerWidth < 860 && d.scrollIntoView) d.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function cambios() {
    var ul = $('#cambios-l'); ul.textContent = '';
    var l = D.cambios.filter(visible);
    $('#cambios-v').hidden = l.length > 0;
    l.forEach(function (c) {
      var li = el('li'); li.style.setProperty('--c', 'var(--r-' + c.zona + ')');
      // sin repetir el tema si el texto ya lo dice («Horizon: Horizon necesita…»)
      var ya = !c.antes && c.ahora && String(c.ahora).toLowerCase().indexOf(String(c.tema).toLowerCase()) >= 0;
      var s = el('span', '', (ya ? '' : c.tema + ': ') + (c.antes ? c.antes + ' → ' : '') + (c.ahora || ''));
      s.appendChild(el('small', '', fecha(c.fecha) + ' · ' + t('tipos.' + c.tipo) + (c.nota ? ' · ' + c.nota : '')));
      li.appendChild(s); ul.appendChild(li);
    });
    var ua = $('#abiertos-l'); ua.textContent = '';
    var a = D.abiertos.filter(visible); $('#abiertos-s').hidden = !a.length;
    a.forEach(function (x) {
      var li = el('li'); li.style.setProperty('--c', 'var(--r-' + x.zona + ')');
      var s = el('span', '', x.valor); s.appendChild(el('small', '', (x.dias === 0 ? t('desdeHoy') : t('abiertoHace', { n: x.dias, d: x.dias === 1 ? t('dia') : t('dias') })) + (x.progreso === 'en-curso' ? ' · ' + t('enCurso') : '')));
      li.appendChild(s); ua.appendChild(li);
    });
  }
  function todo() { cabecera(); regiones(); lista(); cambios(); if (tresD) tresD.dibujar(); }

  $$('[data-region]').forEach(function (e) {
    if (e.tagName.toLowerCase() === 'path') { e.setAttribute('role', 'button'); e.setAttribute('tabindex', '0'); }
    var ir = function () { var z = e.getAttribute('data-region'); if (!zonaVisible(z)) return; region = region === z ? null : z; limite = PAGINA; todo(); };
    e.addEventListener('click', ir);
    e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ir(); } });
  });
  // F11: traduce la búsqueda a cuántos datos coinciden por zona y se lo pasa al 3D (enciende solo esos nodos)
  function focoBusqueda() {
    if (!tresD) return;
    var cuentas = null;
    if (filtro) {
      cuentas = {};
      (region ? [region] : ZONAS).filter(zonaVisible).forEach(function (z) {
        var n = items(z).filter(function (it) { return [temaDe(it), it.valor, it.texto, it.dimension].join(' ').toLowerCase().indexOf(filtro) >= 0; }).length;
        if (n) cuentas[z] = n;
      });
    }
    tresD.buscar(cuentas);
  }
  $('#buscar').addEventListener('input', function (e) { filtro = e.target.value.trim().toLowerCase(); limite = PAGINA; lista(); focoBusqueda(); });
  $('#mas').addEventListener('click', function () { limite += PAGINA * 3; lista(); });
  $('#cerrar').addEventListener('click', function () { $('#detalle').hidden = true; });
  var tema = $('#tema');
  tema.addEventListener('click', function () {
    var oscuro = raiz.getAttribute('data-theme') === 'light';
    raiz.setAttribute('data-theme', oscuro ? 'dark' : 'light');
    tema.textContent = oscuro ? t('claro') : t('oscuro'); todo();
  });
  // Embebido en la web (mismo origen → comparte localStorage): el Cortex SIGUE el tema de la web (clave 'theme';
  // 'light' = claro, si no oscuro) para no quedar como una caja negra sobre una página clara (ni texto ilegible en el
  // hero transparente). Reacciona al toggle de la web por el evento 'storage'.
  function temaWeb() { try { return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'; } catch (e) { return null; } }
  function aplicarTemaWeb() { var w = temaWeb(); if (!w) return; raiz.setAttribute('data-theme', w); try { tema.textContent = w === 'light' ? t('oscuro') : t('claro'); } catch (e) {} }
  aplicarTemaWeb();
  window.addEventListener('storage', function (e) { if (e.key === 'theme') { aplicarTemaWeb(); todo(); } });
  var cli = $('#cliente');
  if (cli) cli.addEventListener('click', function () {
    previa = !previa; if (previa && region === 'temporal') region = null;
    if (previa) raiz.setAttribute('data-cliente', ''); else raiz.removeAttribute('data-cliente');
    cli.setAttribute('aria-pressed', String(previa)); $('#detalle').hidden = true; todo();
  });
  var pb = $('#piensa'); if (pb) pb.addEventListener('click', pensar);

  // ---------------- Panel lateral colapsable (se recuerda por visor, sin tocar la memoria)
  try { if (localStorage.getItem('cortex-panel') === 'off') raiz.setAttribute('data-panel', 'off'); } catch (e) {}
  function panel(off) {
    if (off) raiz.setAttribute('data-panel', 'off'); else raiz.removeAttribute('data-panel');
    try { localStorage.setItem('cortex-panel', off ? 'off' : 'on'); } catch (e) {}
  }
  var ptog = $('#panel-toggle'); if (ptog) ptog.addEventListener('click', function () { panel(true); });
  var pabr = $('#panel-abrir'); if (pabr) pabr.addEventListener('click', function () { panel(false); });

  // ---------------- 3D: un cerebro de verdad hecho de puntos, con neuronas que se encienden
  // Cada hemisferio es la UNIÓN de elipsoides (cuerpo, polo frontal, polo occipital, lóbulo temporal y cerebelo); de
  // cada uno se toman puntos de su superficie que no caen dentro de otro: queda la piel del cerebro. Entre hemisferios,
  // la cisura longitudinal; sobre el temporal, la de Silvio (una franja sin puntos). Las circunvoluciones salen de un
  // ruido determinista: donde vale casi cero hay surco (puntos más oscuros). Encima, una red de neuronas por zona:
  // impulsos que viajan por sus conexiones (más cuanto más se usa la zona, y más aún si está elegida) y se encienden
  // al llegar. Giro libre de 360° (arrastre con inercia, flechas, doble clic) y etiquetas de cada zona.
  var tresD = null;
  function cerebro3D(cv) {
    var ctx = cv.getContext('2d'), pts = [], nodos = [], enl = [], pulsos = [], destellos = [], foco = null, focoBase = [], nodosPorZona = {};
    var ang = 0.38, cab = 0.12, vx = 0, vy = 0, vivo = false, arr = null;
    var quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var s = 7, rnd = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
    var gauss = function () { return Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd()); };
    // [cx, cy, cz, rx, ry, rz, parte]   (x: delante -1 → atrás 1; y: hacia abajo; z: hemisferio)
    var PIEZAS = [
      [0.02, -0.14, 0.24, 0.92, 0.5, 0.34, 'c'],
      [-0.52, 0.02, 0.22, 0.44, 0.44, 0.31, 'c'],
      [0.58, -0.02, 0.2, 0.4, 0.42, 0.27, 'c'],
      [0.04, 0.24, 0.3, 0.56, 0.2, 0.25, 't'],
      [0.66, 0.44, 0.15, 0.27, 0.15, 0.2, 'b']
    ];
    var CUANTOS = { c: [9000, 2800, 2600], t: 4200, b: 2600 };
    var dist = function (k, sg, x, y, z) { var p = PIEZAS[k]; var a = (x - p[0]) / p[3], b = (y - p[1]) / p[4], c = (z - sg * p[2]) / p[5]; return Math.sqrt(a * a + b * b + c * c); };
    var surcoDe = function (x, y, z) { return Math.sin(9 * x + 2 * Math.sin(6 * y)) * Math.sin(8 * y + 2 * Math.sin(7 * z)) * Math.sin(9 * z + 2 * Math.sin(5 * x)); };
    [1, -1].forEach(function (sg) {
      PIEZAS.forEach(function (p, k) {
        var n = p[6] === 'c' ? CUANTOS.c[k] : CUANTOS[p[6]];
        for (var i = 0; i < n; i++) {
          var a = gauss(), b = gauss(), c = gauss(), m = Math.sqrt(a * a + b * b + c * c) || 1;
          // reparto por SUPERFICIE (no por dirección): si no, la cara lateral, la grande, quedaba rala
          var ux = a / m, uy = b / m, uz = c / m;
          if (rnd() > Math.min(p[3], p[4], p[5]) * Math.sqrt(ux * ux / (p[3] * p[3]) + uy * uy / (p[4] * p[4]) + uz * uz / (p[5] * p[5]))) continue;
          var x = p[0] + p[3] * ux, y = p[1] + p[4] * uy, z = sg * p[2] + p[5] * uz;
          var dentro = false;
          for (var j = 0; j < PIEZAS.length && !dentro; j++) {
            if (j !== k && dist(j, sg, x, y, z) < 1) dentro = true;
            if (p[6] !== 'b' && PIEZAS[j][6] !== 'b' && dist(j, -sg, x, y, z) < 1) dentro = true;   // la cara interna, tapada por el otro hemisferio
          }
          if (dentro) continue;
          if (p[6] !== 'b' && Math.abs(z) < 0.035) continue;                    // cisura longitudinal
          if (p[6] === 'c' && dist(3, sg, x, y, z) < 1.14) continue;            // cisura de Silvio, sobre el temporal
          if (p[6] === 'c' && y > 0.22 && x > -0.2 && x < 0.5) continue;         // la base del cerebro, tapada por el temporal
          var zona = p[6] === 't' ? 'temporal' : p[6] === 'b' ? 'neutro' : x < -0.3 ? 'frontal' : x > 0.45 ? 'occipital' : 'parietal';
          // campo de pliegues: donde vale ~0 hay surco. Con el se MODULA el radio (surco hacia dentro, circunvolucion
          // hacia fuera) a lo largo de la normal lisa: relieve de verdad, no solo puntos mas oscuros.
          var fold = p[6] === 'b' ? Math.sin(38 * (y - 0.44) + 3 * x) : surcoDe(x, y, z);
          var surco = Math.abs(fold) < (p[6] === 'b' ? 0.3 : 0.11);
          // normal LISA del elipsoide: direccion de la piel, para desplazar y para tapar lo de detras
          var sx = (x - p[0]) / (p[3] * p[3]), sy = (y - p[1]) / (p[4] * p[4]), sz = (z - sg * p[2]) / (p[5] * p[5]), sn0 = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
          sx /= sn0; sy /= sn0; sz /= sn0;
          var disp = (p[6] === 'b' ? 0.03 : 0.06) * (Math.abs(fold) - 0.42);
          x += sx * disp; y += sy * disp; z += sz * disp;
          // normal de SOMBREADO = la lisa inclinada por el gradiente del pliegue (diferencias finitas): asi los lomos
          // cogen luz y los surcos caen en sombra (sin esto el relieve no se lee aunque los puntos se muevan)
          var nx = sx, ny = sy, nz = sz;
          if (p[6] !== 'b') {
            var e = 0.012, kp = 0.05;
            nx -= ((surcoDe(x + e, y, z) - surcoDe(x - e, y, z)) / (2 * e)) * kp;
            ny -= ((surcoDe(x, y + e, z) - surcoDe(x, y - e, z)) / (2 * e)) * kp;
            nz -= ((surcoDe(x, y, z + e) - surcoDe(x, y, z - e)) / (2 * e)) * kp;
            var rn = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= rn; ny /= rn; nz /= rn;
          }
          pts.push({ x: x, y: y, z: z, r: zona, s: surco, h: sg, nx: nx, ny: ny, nz: nz });
        }
      });
      for (var i = 0; i < 260; i++) {   // tronco del encéfalo
        var tt = rnd(), a2 = rnd() * Math.PI * 2;
        if (sg < 0) break;
        pts.push({ x: 0.36 + tt * 0.06 + Math.cos(a2) * 0.09, y: 0.3 + tt * 0.62, z: Math.sin(a2) * 0.09, r: 'neutro', s: false, h: 1, nx: Math.cos(a2), ny: 0, nz: Math.sin(a2) });
      }
      for (var k2 = 0; k2 < 260; k2++) {   // hipocampo: un caballito de mar por dentro de cada temporal
        var u = rnd();
        pts.push({ x: -0.18 + u * 0.56, y: 0.22 - Math.sin(u * Math.PI) * 0.08 + (rnd() - 0.5) * 0.035, z: sg * (0.22 + (rnd() - 0.5) * 0.05), r: 'hipocampo', s: false, h: sg, hipo: true });
      }
    });
    // ---- neuronas: nodos por zona, cada uno unido a sus dos vecinos; y de cada zona al hipocampo (consolidar)
    ZONAS.forEach(function (z) {
      var cand = pts.filter(function (p) { return p.r === z && !p.s; });
      for (var i = 0; i < (z === 'hipocampo' ? 14 : 26) && cand.length; i++) nodos.push(cand[Math.floor(rnd() * cand.length)]);
    });
    nodos.forEach(function (a, i) {
      var cerca = nodos.map(function (b, j) { return [j, (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) + (a.z - b.z) * (a.z - b.z)]; })
        .filter(function (q) { return q[0] !== i && nodos[q[0]].r === a.r; }).sort(function (p, q) { return p[1] - q[1]; }).slice(0, 2);
      cerca.forEach(function (q) { enl.push([i, q[0]]); });
    });
    var hipos = nodos.map(function (n, i) { return n.r === 'hipocampo' ? i : -1; }).filter(function (i) { return i >= 0; });
    nodos.forEach(function (n, i) { if (n.r !== 'hipocampo' && hipos.length && rnd() < 0.14) enl.push([i, hipos[Math.floor(rnd() * hipos.length)]]); });
    nodos.forEach(function (n, i) { (nodosPorZona[n.r] = nodosPorZona[n.r] || []).push(i); });   // F11: nodos por zona, para encender el dato buscado
    // ---- etiquetas: el centro de cada zona en cada hemisferio (se usa el que mira a la cámara)
    var centros = {};
    ZONAS.forEach(function (z) {
      centros[z] = [1, -1].map(function (sg) {
        var l = pts.filter(function (p) { return p.r === z && p.h === sg && !p.hipo; });
        if (z === 'hipocampo') l = pts.filter(function (p) { return p.hipo && p.h === sg; });
        var c = l.reduce(function (a, p) { return [a[0] + p.x, a[1] + p.y, a[2] + p.z]; }, [0, 0, 0]);
        return l.length ? { x: c[0] / l.length, y: c[1] / l.length + (z === 'temporal' ? 0.06 : 0), z: c[2] / l.length * (z === 'hipocampo' ? 1 : 1.25) } : null;
      });
    });
    var actividad = function (z) { return 0.15 + 0.85 * nivel(z) + (chispa[z] ? 2.5 : 0); };
    function proyectar(p, w, h, esc, c, sn, cp, sp) {
      var y0 = p.y - 0.12, x1 = p.x * c - p.z * sn, z1 = p.x * sn + p.z * c, y2 = y0 * cp - z1 * sp, z2 = y0 * sp + z1 * cp, f = 3 / (3 + z2);
      return { x: w / 2 + x1 * esc * f, y: h * 0.48 + y2 * esc * f, z: z2, f: f };
    }
    function dibujar() {
      var w = cv.clientWidth, h = cv.clientHeight, dpr = window.devicePixelRatio || 1;
      if (!w || !h) return;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      var claro = raiz.getAttribute('data-theme') === 'light';
      var col = { neutro: css('--suave') }; ZONAS.forEach(function (k) { col[k] = css('--r-' + k); });
      var c = Math.cos(ang), sn = Math.sin(ang), cp = Math.cos(cab), sp = Math.sin(cab), esc = Math.min(w * 0.42, h * 0.56);
      var fuera = function (z) { return z !== 'neutro' && (!zonaVisible(z) || (region !== null && region !== z)); };
      // luz desde arriba, a la izquierda y por delante; lo que mira hacia atrás apenas se ve (tres pasadas: detrás,
      // delante y, encima, el hipocampo, que brilla «a través» del temporal)
      var LX = -0.38, LY = -0.62, LZ = -0.69, atras = [], delante = [], hipo = [];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], q = proyectar(p, w, h, esc, c, sn, cp, sp); q.p = p;
        if (p.hipo) { hipo.push(q); continue; }
        var nx1 = p.nx * c - p.nz * sn, nz1 = p.nx * sn + p.nz * c, ny2 = p.ny * cp - nz1 * sp, nz2 = p.ny * sp + nz1 * cp;
        q.luz = Math.max(0, nx1 * LX + ny2 * LY + nz2 * LZ);
        (nz2 < 0 ? delante : atras).push(q);
      }
      var punto = function (q, a, r) { ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = col[q.p.r]; ctx.fillRect(q.x - r / 2, q.y - r / 2, r, r); };
      // lo que más usa, más vivo; lo que casi no usa, apagado; lo que se consulta ahora (cómo piensa), encendido
      var calor = {}, algunaChispa = !!pensando; ZONAS.forEach(function (z) { calor[z] = chispa[z] ? 1.45 : algunaChispa ? 0.3 : 0.3 + 0.7 * nivel(z); });
      var zonaA = function (p) { if (foco) return fuera(p.r) ? 0.05 : 0.12; return fuera(p.r) ? 0.07 : p.r === 'neutro' ? (claro ? 0.3 : 0.42) : (region !== null && p.r === region ? 1.2 : 1) * calor[p.r]; };
      for (var k = 0; k < atras.length; k += 4) punto(atras[k], (claro ? 0.1 : 0.07) * zonaA(atras[k].p), 1.2 * atras[k].f);   // detrás, solo una muestra
      delante.forEach(function (q) {
        var a = (0.4 + 0.6 * q.luz) * (q.p.s ? 0.3 : 1) * zonaA(q.p);
        punto(q, a, (q.p.s ? 1.5 : 2.5) * q.f);
      });
      hipo.forEach(function (q) { punto(q, (claro ? 0.85 : 0.9) * zonaA(q.p), 2.2 * q.f); });
      visibles = delante.concat(hipo);   // para elegir zona con un toque (X-T7)
      // conexiones, impulsos y destellos: luz que se suma en oscuro; en claro, tinta
      ctx.globalCompositeOperation = claro ? 'source-over' : 'lighter';
      var pn = nodos.map(function (n) { return proyectar(n, w, h, esc, c, sn, cp, sp); });
      enl.forEach(function (e) {
        var a = nodos[e[0]], b = nodos[e[1]];
        if (fuera(a.r) && fuera(b.r)) return;
        if (foco) ctx.globalAlpha = (foco[e[0]] && foco[e[1]]) ? (claro ? 0.5 : 0.6) : (foco[e[0]] || foco[e[1]]) ? (claro ? 0.22 : 0.28) : (claro ? 0.04 : 0.03);
        else ctx.globalAlpha = (claro ? 0.16 : 0.1) * (region !== null && (a.r === region || b.r === region) ? 2.2 : 1);
        ctx.strokeStyle = col[a.r]; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(pn[e[0]].x, pn[e[0]].y); ctx.lineTo(pn[e[1]].x, pn[e[1]].y); ctx.stroke();
      });
      pulsos.forEach(function (u) {
        var e = enl[u.e], A = pn[e[0]], B = pn[e[1]], x = A.x + (B.x - A.x) * u.t, y = A.y + (B.y - A.y) * u.t, z = nodos[e[0]].r;
        if (fuera(z)) return;
        ctx.fillStyle = col[z];
        ctx.globalAlpha = claro ? 0.25 : 0.22; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, claro ? 2.2 : 1.8, 0, 7); ctx.fill();
      });
      destellos.forEach(function (d) {
        var P = pn[d.n], z = nodos[d.n].r;
        if (fuera(z)) return;
        ctx.fillStyle = col[z]; ctx.globalAlpha = d.v * (claro ? 0.45 : 0.6);
        ctx.beginPath(); ctx.arc(P.x, P.y, 3 + (1 - d.v) * 9, 0, 7); ctx.fill();
      });
      if (foco) focoBase.forEach(function (i) {
        var P = pn[i], z = nodos[i].r; ctx.fillStyle = col[z];
        ctx.globalAlpha = claro ? 0.4 : 0.6; ctx.beginPath(); ctx.arc(P.x, P.y, 11, 0, 7); ctx.fill();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(P.x, P.y, claro ? 3 : 2.6, 0, 7); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      // etiquetas de las zonas (idioma elegido), en el lado que mira a la cámara: estilo data-art (mono, mayúsculas,
      // tracking, en el color de la zona) con marcador de anillo+punto y un conector fino. Más marca, menos «texto pelado».
      ctx.font = '600 10px ui-monospace, "Geist Mono", "SFMono-Regular", Menlo, monospace'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      try { ctx.letterSpacing = '1.4px'; } catch (e) { }
      ZONAS.forEach(function (z) {
        if (!zonaVisible(z)) return;
        var cc = centros[z].filter(Boolean).map(function (p) { return proyectar(p, w, h, esc, c, sn, cp, sp); }).sort(function (a, b) { return a.z - b.z; })[0];
        if (!cc) return;
        var txt = t('etq.' + z).toUpperCase();
        var at = region === null || region === z ? 1 : 0.3;
        // marcador: anillo + punto en el color de la zona
        ctx.globalAlpha = at;
        ctx.lineWidth = 1.5; ctx.strokeStyle = col[z]; ctx.beginPath(); ctx.arc(cc.x, cc.y, 4.5, 0, 7); ctx.stroke();
        ctx.fillStyle = col[z]; ctx.beginPath(); ctx.arc(cc.x, cc.y, 1.7, 0, 7); ctx.fill();
        // conector fino hacia el rótulo
        ctx.globalAlpha = at * 0.55; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cc.x + 6, cc.y); ctx.lineTo(cc.x + 12, cc.y); ctx.stroke();
        // rótulo en el color de la zona, con halo para legibilidad
        ctx.globalAlpha = at;
        ctx.lineWidth = 3.5; ctx.strokeStyle = css('--halo'); ctx.strokeText(txt, cc.x + 15, cc.y);
        ctx.fillStyle = col[z]; ctx.fillText(txt, cc.x + 15, cc.y);
      });
      ctx.globalAlpha = 1;
      try { ctx.letterSpacing = '0px'; } catch (e) { }
    }
    function latir() {   // nacen impulsos según la actividad de cada zona; avanzan; al llegar, destello
      if (quieto) return;
      ZONAS.forEach(function (z) {
        if (!zonaVisible(z)) return;
        var prob = 0.05 * actividad(z) * (region === z ? 3.5 : region !== null ? 0.4 : 1);
        if (rnd() < prob) {
          var cand = enl.map(function (e, i) { return nodos[e[0]].r === z ? i : -1; }).filter(function (i) { return i >= 0; });
          if (cand.length) pulsos.push({ e: cand[Math.floor(rnd() * cand.length)], t: 0, v: 0.018 + rnd() * 0.02 });
        }
      });
      pulsos = pulsos.filter(function (u) { u.t += u.v; if (u.t >= 1) { destellos.push({ n: enl[u.e][1], v: 1 }); return false; } return true; });
      destellos = destellos.filter(function (d) { d.v -= 0.04; return d.v > 0; });
    }
    function paso() {
      if (!vivo) return;
      if (!arr) { ang += vx; cab += vy; vx *= 0.94; vy *= 0.94; if (!quieto && Math.abs(vx) < 0.003) ang += 0.003; }
      latir(); dibujar(); requestAnimationFrame(paso);
    }
    cv.tabIndex = 0;
    // un toque (sin arrastrar) elige la zona del punto visible más cercano, como en el 2D; otro toque la suelta
    var visibles = [], inicio = null;
    function elegirEn(x, y) {
      var mejor = null, d = 196;   // 14 px como mucho
      visibles.forEach(function (q) { if (q.p.r === 'neutro' || !zonaVisible(q.p.r)) return; var dd = (q.x - x) * (q.x - x) + (q.y - y) * (q.y - y); if (dd < d) { d = dd; mejor = q.p.r; } });
      if (!mejor) return;
      region = region === mejor ? null : mejor; limite = PAGINA; todo();
    }
    cv.addEventListener('pointerdown', function (e) { inicio = { x: e.clientX, y: e.clientY }; });
    cv.addEventListener('click', function (e) {
      if (inicio && Math.abs(e.clientX - inicio.x) + Math.abs(e.clientY - inicio.y) > 5) return;   // fue un arrastre
      var c = cv.getBoundingClientRect(); elegirEn(e.clientX - c.left, e.clientY - c.top);
    });
    cv.addEventListener('pointerdown', function (e) { arr = { x: e.clientX, y: e.clientY }; vx = vy = 0; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) {
      if (!arr) return;
      var dx = (e.clientX - arr.x) * 0.01, dy = (e.clientY - arr.y) * 0.01;
      ang += dx; cab += dy; vx = dx; vy = dy; arr = { x: e.clientX, y: e.clientY };
      if (quieto) dibujar();
    });
    cv.addEventListener('pointerup', function () { arr = null; if (quieto) vx = vy = 0; });
    cv.addEventListener('dblclick', function () { ang = 0; cab = 0; vx = vy = 0; dibujar(); });
    cv.addEventListener('keydown', function (e) {
      var k = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, -0.2], ArrowDown: [0, 0.2] }[e.key];
      if (!k) return; e.preventDefault(); ang += k[0]; cab += k[1]; dibujar();
    });
    // al pensar, una ráfaga de impulsos en las zonas que se consultan
    function rafaga(zs) {
      if (quieto) return;
      zs.forEach(function (z) {
        var cand = enl.map(function (e, i) { return nodos[e[0]].r === z ? i : -1; }).filter(function (i) { return i >= 0; });
        for (var k = 0; k < 10 && cand.length; k++) pulsos.push({ e: cand[Math.floor(rnd() * cand.length)], t: rnd() * 0.3, v: 0.03 + rnd() * 0.03 });
      });
    }
    // F11: la búsqueda enciende SOLO los nodos del dato encontrado (+ sus vecinos) y atenúa el resto; impulsos en ellos
    function buscar(cuentas) {
      if (!cuentas) { foco = null; focoBase = []; dibujar(); return; }
      var set = {}, base = [];
      Object.keys(cuentas).forEach(function (z) {
        var ns = nodosPorZona[z] || [];
        for (var i = 0; i < Math.min(cuentas[z], ns.length); i++) { set[ns[i]] = 1; base.push(ns[i]); }
      });
      base.forEach(function (i) { enl.forEach(function (e) { if (e[0] === i) set[e[1]] = 1; else if (e[1] === i) set[e[0]] = 1; }); });
      foco = set; focoBase = base;
      if (!quieto) base.forEach(function (i) { enl.forEach(function (e, ei) { if (e[0] === i || e[1] === i) pulsos.push({ e: ei, t: 0, v: 0.02 + rnd() * 0.02 }); }); });
      dibujar();
    }
    return { dibujar: dibujar, rafaga: rafaga, buscar: buscar, empezar: function () { vivo = true; paso(); }, parar: function () { vivo = false; } };
  }
  var cv = $('#lienzo3d'), caja = $('[data-vista]');
  $$('[data-ir]').forEach(function (bt) {
    bt.addEventListener('click', function () {
      var v = bt.getAttribute('data-ir'); caja.setAttribute('data-vista', v);
      $$('[data-ir]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === bt)); });
      if (v === '3d') { tresD = tresD || cerebro3D(cv); tresD.empezar(); focoBusqueda(); } else if (tresD) tresD.parar();
    });
  });
  traducir();
  todo();
  if (raiz.hasAttribute('data-solo')) { var _b3 = $('[data-ir="3d"]'); if (_b3) _b3.click(); }   // incrustado: arranca en 3D
})();
`;

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// JSON dentro de <script type="application/json">: «<» escapado, así ningún valor puede cerrar la etiqueta
const json = o => JSON.stringify(o).replace(/</g, '\\u003c');

// F15-T8: panel de fiabilidad, server-rendered desde datos.salud (se lee sin JavaScript; las etiquetas se traducen por
// data-t, los números son neutros). Filas privadas (uso real, última sesión) con `solo-dueno`: ocultas en vista cliente.
function panelSalud(s, cliente, es) {
    if (!s) return '';
    const fam = Object.entries(s.hechos.porFamilia || {}).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${v}`).join(' · ');
    const fila = (clave, val, det, priv) => `<li${priv ? ' class="solo-dueno"' : ''}><span data-t="salud.${clave}">${es.salud[clave]}</span><b>${esc(String(val))}</b>${det ? `<small>${esc(det)}</small>` : ''}</li>`;
    const filas = [fila('hechos', s.hechos.activos, fam)];
    if (s.bateria) filas.push(fila('bateria', `${s.bateria.hit5}%`, `hit@5 · ${s.bateria.abstencion}% abst · ${s.bateria.ms} ms`));
    if (!cliente && s.uso) filas.push(fila('uso', s.uso.precision != null ? `${s.uso.precision}%` : '—', `${s.uso.usados}/${s.uso.inyectados}`, true));
    if (!cliente && s.ultimaSesion && s.ultimaSesion.fecha) filas.push(fila('sesion', s.ultimaSesion.guardo ? `+${s.ultimaSesion.guardo}` : '0',
        `${s.ultimaSesion.fecha}${s.ultimaSesion.hechos.length ? ' · ' + s.ultimaSesion.hechos.map(h => String(h.dimension).split('.')[0]).join(' ') : ''}`, true));
    return `<section class="salud" id="salud-s"><h2 data-t="salud.t">${es.salud.t}</h2><ul class="salud-l">${filas.join('')}</ul></section>`;
}

export function htmlCortex(datos, { cli = null, idioma = null, soloCerebro = false } = {}) {
    const cliente = !!datos.cliente;
    const solo = !!(datos.soloCerebro || soloCerebro);   // modo incrustable: solo el cerebro 3D, sin panel ni mandos
    const D = { ...datos, cli: cliente ? null : cli, idioma: idioma && TEXTOS[idioma] ? idioma : null };
    const es = TEXTOS.es;   // el HTML trae el castellano escrito (sin JavaScript también se lee); el programa lo traduce
    return `<!doctype html>
<!-- Corvusmem · the crow that remembers · author: Peterson Sena (r3v3rs3) · https://corvusmem.vercel.app -->
<html lang="es" data-theme="dark"${cliente ? ' data-cliente' : ''}${solo ? ' data-solo' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="author" content="Peterson Sena (r3v3rs3)">
<meta name="robots" content="noindex">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%278%27 fill=%27%230C0F13%27/%3E%3Cpath d=%27M7 18c-2-6 3-11 9-11s11 4 9 10c-1 4-5 6-9 6s-8-1-9-5z%27 fill=%27none%27 stroke=%27%233DD6C4%27 stroke-width=%272%27/%3E%3Cpath d=%27M12 19c2-3 6-3 8-1%27 fill=%27none%27 stroke=%27%239BE15D%27 stroke-width=%272%27 stroke-linecap=%27round%27/%3E%3C/svg%3E">
<title>Cortex · ${esc(datos.proyecto)}${cliente ? ' (cliente)' : ''}</title>
<style>${CSS}</style>
</head>
<body>
<div class="escena">
  <section class="lienzo">
    <div class="arriba">
      <div>
        <div class="marca"><img src="${CUERVO_SRC}" alt="" width="34" height="34" /><span>Cortex${cliente ? ` · <b data-t="vistaParaCliente">${es.vistaParaCliente}</b>` : ''}</span></div>
        <h1 id="titulo">${esc(es.titulo.replace('{p}', datos.proyecto))}</h1>
        <p class="cifras" id="cifras"></p>
      </div>
      <div class="mandos">
        <span role="group" data-t-aria="vista"><button type="button" data-ir="2d" aria-pressed="true">2D</button> <button type="button" data-ir="3d" aria-pressed="false">3D</button></span>
        ${cliente ? '' : `<button type="button" id="cliente" aria-pressed="false" data-t="vistaCliente" data-t-title="vistaClienteT">${es.vistaCliente}</button>`}
        ${datos.actividad && datos.actividad.pensamientos && datos.actividad.pensamientos.length ? `<button type="button" id="piensa" aria-pressed="false" data-t="piensa" data-t-title="piensaT">${es.piensa}</button>` : ''}
        <button type="button" id="tema">${es.claro}</button>
        <label><span class="sr" data-t="idioma">${es.idioma}</span><select id="idioma"></select></label>
      </div>
    </div>
    <div class="escenario" data-vista="2d">
      <div class="v2d">
        <div class="dibujo">${cerebro()}</div>
        <p class="pista" data-t="pista">${es.pista}</p>
      </div>
      <div class="v3d"><canvas id="lienzo3d" data-t-aria="aria3d"></canvas><p class="pista" data-t="pista3d">${es.pista3d}</p></div>
    </div>
    <p class="mente" id="mente" aria-live="polite"></p>
    <div class="chips" role="group" data-t-aria="ariaZonas">
      ${ZONAS.filter(([r]) => !(cliente && r === 'temporal')).map(([r]) => `<button type="button" data-region="${r}" style="color:var(--r-${r})"><i></i><span data-t="zonas.${r}">${es.zonas[r]}</span> <b data-cuenta="${r}"></b><u data-calor="${r}" aria-hidden="true"></u></button>`).join('\n      ')}
    </div>
  </section>
  <aside class="panel">
    <div class="panel-cab">
      <span class="panel-tit" data-t="panelTitulo">${es.panelTitulo}</span>
      <button type="button" class="panel-cerrar" id="panel-toggle" data-t-aria="panelOcultar" data-t-title="panelOcultar" aria-label="${es.panelOcultar}" title="${es.panelOcultar}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
    </div>
    <label class="busca"><span class="sr" data-t="buscarL">${es.buscarL}</span><svg class="lupa" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg><input id="buscar" type="search" data-t-ph="buscar" placeholder="${es.buscar}" autocomplete="off"></label>
    ${solo ? '' : panelSalud(datos.salud, cliente, es)}
    <section><h2 data-t="semana">${es.semana}</h2><ul class="cambios" id="cambios-l"></ul><p class="vacio" id="cambios-v" data-t="nadaSemana">${es.nadaSemana}</p></section>
    <section id="abiertos-s"><h2 data-t="sigueAbierto">${es.sigueAbierto}</h2><ul class="abiertos" id="abiertos-l"></ul></section>
    <section>
      <h2 id="lista-titulo" aria-live="polite">${es.todo}</h2>
      <ul id="lista" class="lista"></ul>
      <p class="vacio" id="lista-vacia" hidden></p>
      <button type="button" class="mas" id="mas" hidden></button>
    </section>
    <article id="detalle" class="detalle" hidden aria-live="polite">
      <button type="button" class="cerrar" id="cerrar" data-t-aria="cerrar">×</button>
      <p class="d-region" id="d-region"></p>
      <h3 id="d-tema"></h3>
      <p class="d-valor" id="d-valor"></p>
      <p class="d-dicho" id="d-dicho" hidden></p>
      <dl id="d-datos"></dl>
      <h4 id="d-historia-t" data-t="historia">${es.historia}</h4><ol id="d-historia" class="historia"></ol>
      <h4 id="d-enlaces-t" data-t="relacionado">${es.relacionado}</h4><ul id="d-enlaces" class="enlaces"></ul>
      <p class="solo-dueno cmd" id="d-cmd-p"><span data-t="cambiar">${es.cambiar}</span> <code id="d-cmd"></code></p>
    </article>
    <p class="pie" id="pie"></p>
  </aside>
  <button type="button" class="panel-abrir" id="panel-abrir" data-t-aria="panelVer" data-t-title="panelVer" aria-label="${es.panelVer}" title="${es.panelVer}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>
</div>
<script type="application/json" id="datos-cortex">${json(D)}</script>
<script type="application/json" id="textos-cortex">${json(TEXTOS)}</script>
<script>${APP}</script>
</body>
</html>
`;
}
