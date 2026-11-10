#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://corvusmem.vercel.app
// Simula el efecto de un UMBRAL de recuperación a partir de UN run (con puntMax por pregunta, hecho con umbral 0): para
// cada umbral candidato cuenta cuántas preguntas SIN respuesta (cat5) se quedarían sin contexto (→ el contestador
// probablemente se abstiene = BIEN) y cuántas CON respuesta (cat1-4) perderían su contexto (→ probable fallo = MAL).
// Así se elige el umbral desde datos, con un solo run, sin barrer a ciegas contra Ollama.
//   node tools/eval-productos/umbral-scan.mjs resultados-....json [--umbrales 0,1,2,4,8]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
if (!file) { process.stderr.write('Uso: umbral-scan.mjs <fichero de resultados con puntMax> [--umbrales 0,1,2,4,8]\n'); process.exit(1); }
const iU = args.indexOf('--umbrales');
const umbrales = (iU >= 0 && args[iU + 1] ? args[iU + 1] : '0,0.5,1,1.5,2,3,4,6,8,12').split(',').map(Number).filter(n => !Number.isNaN(n));

const j = JSON.parse(fs.readFileSync(path.isAbsolute(file) ? file : path.join(HERE, file), 'utf8'));
const hechos = Object.values(j.hechos || {}).filter(h => !h.seco && h.puntMax != null);
if (!hechos.length) { process.stderr.write('El fichero no tiene puntMax por pregunta. Hazlo con el pipeline instrumentado (F16), umbral 0.\n'); process.exit(1); }
const esCat5 = h => h.abstencion === true || h.tipo === 'locomo-cat5';
const cat5 = hechos.filter(esCat5);
const resto = hechos.filter(h => !esCat5(h));
const mediana = arr => { if (!arr.length) return null; const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

process.stdout.write(`\nSimulación de umbral · ${hechos.length} preguntas con puntMax (cat5/sin-respuesta: ${cat5.length} · con-respuesta: ${resto.length})\n`);
process.stdout.write(`  puntMax mediana → cat5: ${mediana(cat5.map(h => h.puntMax))} · con-respuesta: ${mediana(resto.map(h => h.puntMax))}\n\n`);
process.stdout.write('  umbral   cat5 sin contexto (abstención↑ = BIEN)   con-respuesta sin contexto (recall↓ = MAL)\n');
for (const u of umbrales) {
    const c5 = cat5.length ? Math.round(1000 * cat5.filter(h => h.puntMax < u).length / cat5.length) / 10 : 0;
    const cr = resto.length ? Math.round(1000 * resto.filter(h => h.puntMax < u).length / resto.length) / 10 : 0;
    process.stdout.write(`  ${String(u).padStart(5)}        ${(c5 + '%').padStart(7)}                          ${(cr + '%').padStart(7)}\n`);
}
process.stdout.write('\n  Busca el umbral con cat5 ALTO y con-respuesta BAJO: ahí ganas abstención sin tirar recall.\n');
process.stdout.write('  Si ambos suben parejos, el umbral NO separa y toca otra palanca (prompt del contestador, señal de confianza…).\n\n');
