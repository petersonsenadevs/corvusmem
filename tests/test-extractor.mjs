#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// F17-T8: el extractor determinista (src/extractor.mjs) saca {dimension, valor, claves} CANÓNICO de una frase con
// forma de hecho, solo cuando la dimensión es inequívoca, y CALLA en preguntas, ruido y hechos ambiguos (cifra de
// proveedor): es un SUBCONJUNTO de esHechoGuardable. Misma entrada → misma salida; sin LLM ni red.
//   node tests/test-extractor.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { extraerHecho } = await import(pathToFileURL(path.join(ROOT, 'src', 'extractor.mjs')).href);
const { esHechoGuardable, comandoGuardado } = await import(pathToFileURL(path.join(ROOT, 'src', 'live-memory.mjs')).href);
const { dimensionConvencional } = await import(pathToFileURL(path.join(ROOT, 'src', 'facts.mjs')).href);

let casos = 0, fallos = 0;
const ok = (c, n, d = '') => { casos++; if (!c) { fallos++; process.stdout.write(`FAIL ${n}${d ? ' -> ' + d : ''}\n`); } };

// 1. EXTRAE dimensión+valor correctos donde la dimensión es inequívoca
const EXTRAE = [
  ['ahora vivo en Valencia', 'identidad.ubicacion', 'Valencia'],
  ['vivía en Madrid antes', 'identidad.ubicacion', 'Madrid'],
  ['resido en Sevilla', 'identidad.ubicacion', 'Sevilla'],
  ['la oficina está en Bilbao', 'proyecto.sede', 'Bilbao'],
  ['la sede está en Barcelona', 'proyecto.sede', 'Barcelona'],
  ['usamos pnpm', 'preferencia.gestor-paquetes', 'pnpm'],
  ['we use pnpm for everything', 'preferencia.gestor-paquetes', 'pnpm'],
  ['trabajamos con React', 'proyecto.stack', 'React'],
  ['usamos vscode', 'preferencia.editor', 'vscode'],
];
for (const [t, dim, val] of EXTRAE) {
  const r = extraerHecho(t);
  ok(r !== null, 'extrae un hecho', JSON.stringify(t));
  if (r) {
    ok(r.dimension === dim, `dimensión ${dim}`, `${JSON.stringify(t)} dio ${r.dimension}`);
    ok(r.valor === val, `valor ${val}`, `${JSON.stringify(t)} dio ${JSON.stringify(r.valor)}`);
    ok(Array.isArray(r.claves) && r.claves.length > 0, 'trae claves', JSON.stringify(t));
  }
}

// 2. La dimensión que sale YA es canónica (pasarla otra vez por la convención no la cambia): paridad de formato
for (const [t] of EXTRAE) {
  const r = extraerHecho(t);
  if (r) ok(dimensionConvencional(r.dimension).dimension === r.dimension, 'dimensión ya canónica', `${JSON.stringify(t)} -> ${r.dimension}`);
}

// 3. CALLA en preguntas (regla de oro: una pregunta nunca es un hecho)
const PREGUNTAS = ['¿dónde vivo?', 'where do we live?', '¿qué gestor usamos?', 'which package manager do we use?'];
for (const t of PREGUNTAS) ok(extraerHecho(t) === null, 'calla en pregunta', JSON.stringify(t));

// 4. CALLA en ruido conversacional
const RUIDO = ['hazla la t3', 'sigamos', 'vale, gracias', 'ok perfecto', 'empieza por favor'];
for (const t of RUIDO) ok(extraerHecho(t) === null, 'calla en ruido', JSON.stringify(t));

// 5. Es SUBCONJUNTO del detector: todo lo que el extractor saca, el detector también lo veía como hecho
for (const [t] of EXTRAE) ok(esHechoGuardable(t) !== null, 'lo extraído también lo detecta esHechoGuardable', JSON.stringify(t));

// 6. Hecho AMBIGUO (cifra de proveedor): el detector lo ve, pero el extractor NO fuerza dimensión (deja al agente)
const AMBIGUOS = ['Marco Bianchi cobra 600 € al mes', 'the photographer charges 600 €'];
for (const t of AMBIGUOS) {
  ok(esHechoGuardable(t) !== null, 'el detector SÍ ve el hecho ambiguo', JSON.stringify(t));
  ok(extraerHecho(t) === null, 'el extractor NO lo dimensiona (precisión > recall)', JSON.stringify(t));
}

// 7. Determinista: misma entrada → misma salida
for (const [t] of EXTRAE) {
  const a = JSON.stringify(extraerHecho(t)), b = JSON.stringify(extraerHecho(t));
  ok(a === b, 'determinista', JSON.stringify(t));
}

// 8. T8c — el nudge de live-memory usa la sugerencia: comando YA destilado cuando la dimensión es inequívoca,
//    placeholder familia.tema cuando no (ambiguo o ruido). Así el agente deja de inventar la clave.
const CLI = 'node cli/corvusmem.mjs';
{
  const c = comandoGuardado('ahora vivo en Valencia', CLI);
  ok(c.includes('--dimension identidad.ubicacion'), 'nudge: dimensión destilada', c);
  ok(c.includes('--valor "Valencia"'), 'nudge: valor destilado', c);
  ok(!c.includes('familia.tema'), 'nudge destilado NO deja el placeholder', c);
}
ok(comandoGuardado('usamos pnpm', CLI).includes('--dimension preferencia.gestor-paquetes'), 'nudge: destila la herramienta');
ok(comandoGuardado('Marco Bianchi cobra 600 € al mes', CLI).includes('familia.tema'), 'nudge: el ambiguo cae al placeholder (agente destila)');
ok(comandoGuardado('sigamos', CLI).includes('familia.tema'), 'nudge: el ruido cae al placeholder');
ok(comandoGuardado('ahora vivo en Valencia', CLI) === comandoGuardado('ahora vivo en Valencia', CLI), 'comandoGuardado determinista');

process.stdout.write(`\nextractor determinista (F17-T8) -> Casos: ${casos}  Fallos: ${fallos}\n`);
process.exit(fallos ? 1 : 0);
