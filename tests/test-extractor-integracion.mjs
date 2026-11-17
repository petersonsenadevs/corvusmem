#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// F17-T8d: cierra el lazo EXTRACTOR → MOTOR. No basta con que el extractor dé la dimensión correcta (eso lo prueba
// test-extractor); hay que comprobar que el hecho que produce, guardado tal cual, el motor lo ACEPTA, lo RECUPERA y
// —lo que de verdad aporta el régimen comprimido— lo SUSTITUYE cuando llega un dato nuevo de la misma dimensión.
// Determinista, sin LLM ni red (mismo arnés que tools/eval-memoria/eval.mjs).
//   node tests/test-extractor-integracion.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'corvus-t8d-'));
process.env.SENZU_MEMORIA_USUARIO = path.join(base, 'usuario', 'memoria.md');
const m = await import(pathToFileURL(path.join(ROOT, 'src', 'facts.mjs')).href);
const { extraerHecho } = await import(pathToFileURL(path.join(ROOT, 'src', 'extractor.mjs')).href);

const T = s => new Date(Date.UTC(2026, 0, 1) + s * 1000).toISOString();
let np = 0;
const proyecto = () => { const d = path.join(base, 'p' + (++np)); fs.mkdirSync(path.join(d, 'senzu'), { recursive: true }); fs.writeFileSync(path.join(d, 'senzu', 'senzu.json'), '{}'); return d; };
const guardarExtraido = (P, frase, tOff) => { const s = extraerHecho(frase); if (!s) return null; return m.guardarHecho(P, { dimension: s.dimension, valor: s.valor, claves: s.claves }, { ahora: T(tOff) }); };

let casos = 0, fallos = 0;
const ok = (c, n, d = '') => { casos++; if (!c) { fallos++; process.stdout.write(`FAIL ${n}${d ? ' -> ' + d : ''}\n`); } };

// 1. extraer → guardar → el motor lo ACEPTA (dimensión canónica) y lo RECUPERA en el top-5 con una pregunta que
//    comparte términos con sus claves (no se mide recall fino aquí: que el hecho extraído sea recuperable).
const RECALL = [
  { frase: 'ahora vivo en Valencia', q: 'en qué ciudad vivo', dim: 'identidad.ubicacion', val: 'Valencia' },
  { frase: 'usamos pnpm', q: 'qué gestor de paquetes usamos', dim: 'preferencia.gestor-paquetes', val: 'pnpm' },
  { frase: 'trabajamos con React', q: 'qué framework del stack usamos', dim: 'proyecto.stack', val: 'React' },
  { frase: 'la sede está en Bilbao', q: 'dónde está la sede u oficina', dim: 'proyecto.sede', val: 'Bilbao' },
];
for (const c of RECALL) {
  const P = proyecto();
  const r = guardarExtraido(P, c.frase, 0);
  ok(r && r.accion !== 'error', 'el motor acepta el hecho extraído', `${JSON.stringify(c.frase)} -> ${r && r.accion}`);
  const res = m.buscarHechos(P, c.q, { limite: 5, ahora: T(10) });
  const match = res.slice(0, 5).find(x => x.hecho.dimension === c.dim && x.hecho.valor === c.val);
  ok(!!match, 'recupera el hecho extraído en el top-5', `${JSON.stringify(c.q)} -> ${res.slice(0, 3).map(x => x.hecho.dimension + '=' + x.hecho.valor).join(' | ') || '∅'}`);
}

// 2. SUSTITUCIÓN cronológica con hechos EXTRAÍDOS: un dato nuevo de la misma dimensión pisa al viejo (identidad y
//    preferencia son de valor único). Es lo que knowledge-update necesita y lo que el régimen comprimido aporta.
{
  const P = proyecto();
  guardarExtraido(P, 'vivía en Madrid antes', 0);
  guardarExtraido(P, 'ahora vivo en Valencia', 5);
  const vivos = m.todosLosHechos(P).filter(h => h.dimension === 'identidad.ubicacion' && h.estado === 'activo');
  ok(vivos.length === 1 && vivos[0].valor === 'Valencia', 'la ubicación nueva SUSTITUYE a la vieja', `vivos=${vivos.map(h => h.valor).join(',')}`);
  const histo = m.todosLosHechos(P).filter(h => h.dimension === 'identidad.ubicacion' && h.estado === 'sustituido');
  ok(histo.some(h => h.valor === 'Madrid'), 'la ubicación vieja queda en el histórico (no se pierde)', `histo=${histo.map(h => h.valor).join(',')}`);
}
{
  const P = proyecto();
  guardarExtraido(P, 'usamos npm', 0);
  guardarExtraido(P, 'usamos pnpm', 5);
  const vivos = m.todosLosHechos(P).filter(h => h.dimension === 'preferencia.gestor-paquetes' && h.estado === 'activo');
  ok(vivos.length === 1 && vivos[0].valor === 'pnpm', 'el gestor nuevo SUSTITUYE al viejo', `vivos=${vivos.map(h => h.valor).join(',')}`);
}

// 3. El mismo dato dos veces NO duplica (dedupe del motor sobre un hecho extraído)
{
  const P = proyecto();
  guardarExtraido(P, 'ahora vivo en Valencia', 0);
  const r2 = guardarExtraido(P, 'ahora vivo en Valencia', 5);
  const vivos = m.todosLosHechos(P).filter(h => h.dimension === 'identidad.ubicacion' && h.estado === 'activo');
  ok(r2.accion !== 'nuevo' && vivos.length === 1, 'el mismo hecho extraído dos veces NO duplica', `accion=${r2.accion} vivos=${vivos.length}`);
}

fs.rmSync(base, { recursive: true, force: true });
process.stdout.write(`\nintegración extractor→motor (F17-T8d) -> Casos: ${casos}  Fallos: ${fallos}\n`);
process.exit(fallos ? 1 : 0);
