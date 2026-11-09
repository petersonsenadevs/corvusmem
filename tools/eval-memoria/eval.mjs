#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// Batería adversarial de memoria (F15-T1): mide el motor (src/facts.mjs) con DATOS, sin LLM y sin red.
// Métricas (baseline de la fase F15 "Memoria fiable"):
//   · hit@5          — de las consultas con respuesta, cuántas traen el hecho esperado en el top-5 (lo haya o no inyectado).
//   · hit@5 inyectado— además, con puntuación ≥ UMBRAL_RECUERDO (lo que de verdad llegaría al agente).
//   · abstención     — de las TRAMPAS (sin respuesta), cuántas callan de verdad (ningún hecho sobre el umbral).
//   · duplicados     — al guardar una variante casi-igual, ¿evita crear un hecho nuevo? (objetivo de F15-T4).
//   · ms/consulta    — coste medio de una búsqueda (el otro eje del producto).
// Regla de oro: subir hit@5 NUNCA a costa de bajar la abstención. Esto NO es una puerta todavía (eso es F15-T7):
// solo mide y deja tools/eval-memoria/resultados.json. Determinista: fechas fijas con T().
//   node tools/eval-memoria/eval.mjs   [--json]

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(AQUI, '..', '..');
const HOOKS = process.env.SENZU_HOOKS_DIR || path.join(ROOT, 'src');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'corvus-eval-mem-'));
process.env.SENZU_MEMORIA_USUARIO = path.join(base, 'usuario', 'memoria.md');
const m = await import(pathToFileURL(path.join(HOOKS, 'facts.mjs')).href);
const UMBRAL = m.UMBRAL_RECUERDO;

const casos = JSON.parse(fs.readFileSync(path.join(AQUI, 'casos.json'), 'utf8'));
const T = s => new Date(Date.UTC(2026, 0, 1) + s * 1000).toISOString();
let np = 0;
const proyecto = () => { const d = path.join(base, 'p' + (++np)); fs.mkdirSync(path.join(d, 'senzu'), { recursive: true }); fs.writeFileSync(path.join(d, 'senzu', 'senzu.json'), '{}'); return d; };
const coincide = (h, e) => h.dimension === e.dim && (!e.val || h.valor === e.val);

// ---- recall ----
const filas = [];              // una por consulta, con su resultado
let msTotal = 0, nConsultas = 0;
for (const esc of casos.recall) {
    const P = proyecto();
    esc.hechos.forEach((h, i) => m.guardarHecho(P, { dimension: h.dimension, valor: h.valor, texto: h.texto, claves: h.claves, desde: h.desde }, { ahora: T(h.tOffset ?? i) }));
    const ahoraDef = (esc.hechos.length + 10);
    for (const c of esc.consultas) {
        const t0 = process.hrtime.bigint();
        const res = m.buscarHechos(P, c.q, { historico: c.historico || false, futuro: c.futuro || false, limite: 5, ahora: T(c.ahoraOffset ?? ahoraDef) });
        msTotal += Number(process.hrtime.bigint() - t0) / 1e6; nConsultas++;
        const top = res.slice(0, 5);
        const trampa = c.espera === null;
        const maxPunt = top.length ? top[0].puntuacion : 0;
        let hit5 = false, hitInj = false;
        if (!trampa) {
            const match = top.find(x => coincide(x.hecho, c.espera));
            hit5 = !!match;
            hitInj = !!match && match.puntuacion >= UMBRAL;
        }
        const abstuvo = maxPunt < UMBRAL;   // nada se habría inyectado
        const okTrampa = trampa && abstuvo;
        filas.push({
            escenario: esc.nombre, q: c.q, cat: c.cat, trampa,
            ok: trampa ? okTrampa : hitInj, hit5, hitInj, abstuvo, maxPunt,
            top: top.map(x => ({ dim: x.hecho.dimension, val: x.hecho.valor, punt: x.puntuacion, debil: !!x.debil })),
        });
    }
}

// ---- duplicados (objetivo de F15-T4) ----
const dup = [];
for (const d of casos.duplicados) {
    const P = proyecto();
    m.guardarHecho(P, d.base, { ahora: T(0) });
    const r = m.guardarHecho(P, d.variante, { ahora: T(5) });
    const vivos = m.todosLosHechos(P).filter(h => h.dimension === d.variante.dimension && h.estado === 'activo').length;
    dup.push({ nombre: d.nombre, accion: r.accion, vivos, ok: r.accion !== 'nuevo' && vivos === 1 });
}

// ---- agregados ----
const porCat = {};
for (const f of filas) {
    const k = f.cat;
    (porCat[k] ||= { total: 0, hit5: 0, hitInj: 0, abst: 0, trampas: 0 });
    porCat[k].total++;
    if (f.trampa) { porCat[k].trampas++; if (f.abstuvo) porCat[k].abst++; }
    else { if (f.hit5) porCat[k].hit5++; if (f.hitInj) porCat[k].hitInj++; }
}
const conResp = filas.filter(f => !f.trampa), trampas = filas.filter(f => f.trampa);
const pct = (a, b) => b ? +(100 * a / b).toFixed(1) : null;
const global = {
    consultas: filas.length,
    conRespuesta: conResp.length,
    trampas: trampas.length,
    hit5: pct(conResp.filter(f => f.hit5).length, conResp.length),
    hit5_inyectado: pct(conResp.filter(f => f.hitInj).length, conResp.length),
    abstencion: pct(trampas.filter(f => f.abstuvo).length, trampas.length),
    duplicados_ok: pct(dup.filter(d => d.ok).length, dup.length),
    ms_por_consulta: +(msTotal / nConsultas).toFixed(2),
};
const fallos = filas.filter(f => !f.ok).map(f => ({ escenario: f.escenario, q: f.q, cat: f.cat, trampa: f.trampa, maxPunt: f.maxPunt, top: f.top.slice(0, 3) }));

const informe = { fecha: new Date().toISOString().slice(0, 10), umbral: UMBRAL, global, porCategoria: porCat, duplicados: dup, fallos };
fs.writeFileSync(path.join(AQUI, 'resultados.json'), JSON.stringify(informe, null, 2) + '\n');
fs.rmSync(base, { recursive: true, force: true });

// ---- salida ----
if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(informe, null, 2) + '\n'); process.exit(0); }
const L = s => process.stdout.write(s + '\n');
L(`\nBatería adversarial de memoria — baseline (umbral de inyección = ${UMBRAL})`);
L(`  Consultas: ${global.consultas}  (con respuesta: ${global.conRespuesta}, trampas: ${global.trampas})`);
L(`  hit@5 ............... ${global.hit5}%   (trae el hecho esperado en el top-5)`);
L(`  hit@5 INYECTADO ..... ${global.hit5_inyectado}%   (además ≥ umbral: lo que llega al agente)`);
L(`  abstención .......... ${global.abstencion}%   (trampas que callan de verdad)`);
L(`  duplicados OK ....... ${global.duplicados_ok}%   (variante casi-igual que NO duplica)`);
L(`  ms / consulta ....... ${global.ms_por_consulta} ms`);
L(`\n  Por categoría:`);
for (const [k, v] of Object.entries(porCat)) {
    if (v.trampas === v.total) L(`    ${k.padEnd(12)} abstención ${pct(v.abst, v.trampas)}%  (${v.abst}/${v.trampas})`);
    else L(`    ${k.padEnd(12)} hit@5 ${pct(v.hit5, v.total - v.trampas)}%  · inyectado ${pct(v.hitInj, v.total - v.trampas)}%  (${v.total - v.trampas} consultas)`);
}
if (fallos.length) {
    L(`\n  Fallos (${fallos.length}) — lo que F15-T4/T5/T6 deben levantar:`);
    for (const f of fallos) L(`    ✗ [${f.cat}] «${f.q}»${f.trampa ? ` → NO abstuvo (maxPunt ${f.maxPunt})` : ` → esperado no inyectado (maxPunt ${f.maxPunt}; top: ${f.top.map(t => t.dim).join(', ') || '∅'})`}`);
}
for (const d of dup) if (!d.ok) L(`    ✗ [duplicado] ${d.nombre} → acción '${d.accion}', ${d.vivos} vivos`);
L(`\n  Guardado en tools/eval-memoria/resultados.json`);
process.exit(0);
