#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// BENCH de PRECISIÓN DE INYECCIÓN (F17-T9). Arena distinta a LongMemEval/LoCoMo (esos miden el RECALL del motor: si
// el dato está en el top-k). Esto mide lo contrario: de lo que la memoria INYECTA en el contexto del agente con cada
// mensaje, cuánto SIRVE y cuánto es ruido. La verdad-de-campo son las etiquetas reales usado/ignorado que se acumulan
// solas en senzu/.estado/recuerdo-uso.jsonl (privado). Replay determinista, sin LLM ni red.
//
// Reporta, por proyecto, la precisión ANTES (lo que se inyectó de verdad) y DESPUÉS (contrafactual: aplicando el suelo
// del diario 0,25 × escala que T9 metió en el motor). «Después» asume que quitar un item de ruido no cambia si otro
// item distinto se usó o no — supuesto sólido para estimar el efecto del suelo.
//
//   node tools/eval-precision-inyeccion.mjs [ruta-proyecto ...]   (sin args: el proyecto actual)
//   node tools/eval-precision-inyeccion.mjs D:/dev-standards D:/hemispheric

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const m = await import(pathToFileURL(path.join(ROOT, 'src', 'facts.mjs')).href);
const { escalaDiario, pisoDiario, rutaUso } = m;   // pisoDiario = la misma fuente del suelo que usa el hook

const roots = process.argv.slice(2);
if (!roots.length) roots.push(process.cwd());

function lineasUso(root) {
    let raw = ''; try { raw = fs.readFileSync(rutaUso(root), 'utf8'); } catch { return []; }
    return raw.split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } })
        .filter(x => x && x.origen !== 'consulta');
}
const esDiario = it => it.fuente === 'devlog' || it.fuente === 'memoria';
const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '—';

for (const root of roots) {
    const L = lineasUso(root);
    const items = L.flatMap(l => (l.items || []).filter(it => it.usado === true || it.usado === false));
    if (!items.length) { console.log(`\n### ${root}\n  sin registro de uso todavía (se llena solo al hablar con el agente).`); continue; }
    const piso = pisoDiario(root);

    const usados = items.filter(i => i.usado).length;
    const antes = { iny: items.length, usados, ignorados: items.length - usados };
    // DESPUÉS: fuera los items de diario con puntuacion por debajo del suelo (lo que el motor ya no inyectaría)
    const quitados = items.filter(i => esDiario(i) && i.puntuacion != null && i.puntuacion < piso);
    const quedan = items.filter(i => !(esDiario(i) && i.puntuacion != null && i.puntuacion < piso));
    const u2 = quedan.filter(i => i.usado).length;
    const despues = { iny: quedan.length, usados: u2, ignorados: quedan.length - u2 };
    const ruidoCortado = quitados.filter(i => !i.usado).length, utilesPerdidos = quitados.filter(i => i.usado).length;

    console.log(`\n### ${root}`);
    console.log(`  escala del diario (p90) = ${escalaDiario(root).toFixed(2)}  →  suelo = ${piso.toFixed(2)}${piso === 0 ? '  (sin historial suficiente: el suelo aún no actúa)' : ''}`);
    console.log(`  ANTES   : ${antes.iny} inyectados · ${antes.usados} usados · ${antes.ignorados} ignorados · precisión ${pct(antes.usados, antes.iny)}`);
    console.log(`  DESPUÉS : ${despues.iny} inyectados · ${despues.usados} usados · ${despues.ignorados} ignorados · precisión ${pct(despues.usados, despues.iny)}`);
    console.log(`  EFECTO  : ruido cortado ${ruidoCortado} · útiles perdidos ${utilesPerdidos} · relación ${utilesPerdidos ? (ruidoCortado / utilesPerdidos).toFixed(1) + ':1' : '∞'}`);
}
console.log('');
