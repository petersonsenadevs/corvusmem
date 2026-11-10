#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://corvusmem.vercel.app
// Estabilidad del bench (F16): corre el MISMO set N veces y mide si el veredicto POR PREGUNTA oscila (ruido del LLM
// local al contestar/juzgar y al ingerir) o es estable. Así se sabe si una diferencia de 1-2 puntos entre dos runs es
// SEÑAL (p. ej. un cambio real del motor) o RUIDO. Compara solo los ids comunes a TODOS los ficheros.
//   node tools/eval-productos/estabilidad.mjs a.json b.json [c.json...]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ficheros = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (ficheros.length < 2) { process.stderr.write('Hacen falta 2+ ficheros del MISMO set (p. ej. dos runs de cat5).\n'); process.exit(1); }

const runs = ficheros.map(f => {
    const ruta = path.isAbsolute(f) ? f : path.join(HERE, f);
    const j = JSON.parse(fs.readFileSync(ruta, 'utf8'));
    const hechos = Object.fromEntries(Object.entries(j.hechos || {}).filter(([, h]) => !h.seco));
    return { nombre: path.basename(ruta), hechos };
});

let comunes = Object.keys(runs[0].hechos);
for (const r of runs.slice(1)) { const s = new Set(Object.keys(r.hechos)); comunes = comunes.filter(id => s.has(id)); }
if (!comunes.length) { process.stderr.write('No hay preguntas comunes a todos los ficheros.\n'); process.exit(1); }

const pct = r => Math.round(1000 * comunes.filter(id => r.hechos[id]?.correcto).length / comunes.length) / 10;
// Una pregunta es INESTABLE si su veredicto (acierto/fallo) no es el mismo en TODOS los runs: eso es ruido puro.
let inestables = 0;
for (const id of comunes) { const v = runs.map(r => !!r.hechos[id]?.correcto); if (v.some(x => x !== v[0])) inestables++; }
const inst = Math.round(1000 * inestables / comunes.length) / 10;

process.stdout.write(`\nEstabilidad · ${comunes.length} preguntas comunes · ${runs.length} runs\n\n`);
for (const r of runs) process.stdout.write(`  ${String(pct(r)).padStart(5)}%   ${r.nombre}\n`);
process.stdout.write(`\n  Veredicto que CAMBIA entre runs: ${inestables}/${comunes.length} (${inst}%)  ← ruido del LLM local\n`);
process.stdout.write(inst <= 2 ? '  → Estable: las diferencias de % son ruido mínimo; el número es fiable.\n'
    : inst <= 8 ? '  → Algo de ruido: diferencias de 1-3 puntos entre runs son esperables; no leas < 2 pts como señal.\n'
    : '  → MUCHO ruido: el LLM local varía bastante; una diferencia pequeña NO es señal.\n');
