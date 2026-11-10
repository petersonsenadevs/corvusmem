#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// F15-T8: `--health` y el panel de fiabilidad del Cortex salen de UNA sola fuente (datosSalud). El panel se lee sin
// JavaScript; las filas privadas (uso real, última sesión) van con `solo-dueno` y NO viajan al HTML/JSON del cliente.
//   node tests/test-health.mjs

import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { datosSalud } = await import(pathToFileURL(path.join(ROOT, 'src', 'facts.mjs')).href);
const { htmlCortex } = await import(pathToFileURL(path.join(ROOT, 'cortex', 'cortex.mjs')).href);
let casos = 0, fallos = 0;
const ok = (c, n, d = '') => { casos++; if (!c) { fallos++; process.stdout.write(`FAIL ${n}${d ? ' -> ' + d : ''}\n`); } };

// 1. datosSalud: forma básica sobre la memoria real del repo (la batería existe porque es el repo, no una instalación)
const s = datosSalud(ROOT, { dias: 30 });
ok(s && typeof s.hechos.activos === 'number', 'datosSalud da el número de hechos activos');
ok('uso' in s && 'ultimaSesion' in s && 'bateria' in s, 'datosSalud trae uso, ultimaSesion y bateria');
ok(s.bateria && typeof s.bateria.hit5 === 'number', 'en el repo, la batería (eval) está disponible', JSON.stringify(s.bateria));

// 2. Panel del Cortex: con uso + última sesión, el DUEÑO ve esas filas (marcadas solo-dueno); el CLIENTE no las ve
const salud = {
    generado: '2026-11-10',
    hechos: { activos: 5, dudosos: 1, historico: 2, abiertos: 1, porFamilia: { preferencia: 3, proyecto: 2 } },
    uso: { dias: 30, mensajes: 4, inyectados: 10, usados: 7, ignorados: 3, precision: 70 },
    bateria: { fecha: '2026-11-09', hit5: 100, abstencion: 100, duplicados: 100, ms: 0.7, consultas: 15 },
    ultimaSesion: { fecha: '2026-11-09', guardo: 2, hechos: [{ dimension: 'preferencia.editor', valor: 'vim' }], archivos: 4 },
};
const base = { proyecto: 'Demo', generado: '2026-11-10', zonas: { frontal: [], parietal: [], occipital: [], temporal: [], hipocampo: [] }, cambios: [], abiertos: [], actividad: { zonas: {}, pensamientos: [], consultas: 0 } };
const dueno = htmlCortex({ ...base, cliente: false, salud });
const clienteSalud = { generado: salud.generado, hechos: salud.hechos, bateria: salud.bateria };   // lo que datosCortex pasa con --cliente
const cliente = htmlCortex({ ...base, cliente: true, salud: clienteSalud });

ok(dueno.includes('id="salud-s"'), 'el panel de fiabilidad está en el HTML (dueño)');
ok(dueno.includes('>5<'), 'el panel muestra los hechos activos (5)');
ok(dueno.includes('70%'), 'el panel muestra la precisión real del uso (70%)');
ok(/<li class="solo-dueno"><span data-t="salud\.uso"/.test(dueno), 'la fila de uso real va marcada solo-dueno');
ok(/<li class="solo-dueno"><span data-t="salud\.sesion"/.test(dueno), 'la fila de última sesión va marcada solo-dueno');

ok(cliente.includes('data-t="salud.hechos"') && cliente.includes('data-t="salud.bateria"'), 'el cliente ve hechos y batería');
ok(!cliente.includes('data-t="salud.uso"') && !cliente.includes('data-t="salud.sesion"'), 'el cliente NO ve uso ni última sesión (filas)');
ok(!/ultimaSesion/.test(cliente) && !/"uso":\{/.test(cliente), 'uso y última sesión NO viajan en el JSON del cliente (sin fuga)');

// 3. La etiqueta de un idioma sin traducir cae a inglés (nunca undefined): el panel usa data-t, no texto incrustado suelto
ok(dueno.includes('data-t="salud.t"'), 'las etiquetas del panel se traducen por data-t (fallback es→en garantizado por t())');

// 4. CLI: `corvusmem --health --json` termina en 0 y produce JSON parseable
const r = spawnSync(process.execPath, [path.join(ROOT, 'cli', 'corvusmem.mjs'), '--health', '--json'], { encoding: 'utf8' });
ok(r.status === 0, 'corvusmem --health --json termina en 0', `status=${r.status}`);
let parsed = null; try { parsed = JSON.parse(r.stdout); } catch {}
ok(parsed && parsed.hechos && typeof parsed.hechos.activos === 'number', 'la salida de --health --json es JSON válido con hechos.activos');

process.stdout.write(`\nhealth + panel (F15-T8) -> Casos: ${casos}  Fallos: ${fallos}\n`);
process.exit(fallos ? 1 : 0);
