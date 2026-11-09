#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// F15-T3: el detector de frases «con forma de hecho» (live-memory) dispara en afirmaciones con un dato reusable y
// CALLA en preguntas/trampas. La precisión manda: 0 falsos positivos sobre TODAS las consultas de la batería
// adversarial (que son preguntas), aunque contengan el verbo («qué framework usamos…», «cuánto paga…»).
//   node tests/test-hecho-detector.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { esHechoGuardable } = await import(pathToFileURL(path.join(ROOT, 'src', 'live-memory.mjs')).href);
let casos = 0, fallos = 0;
const ok = (c, n, d = '') => { casos++; if (!c) { fallos++; process.stdout.write(`FAIL ${n}${d ? ' -> ' + d : ''}\n`); } };

// 1. DISPARA en afirmaciones fuertes con un dato reusable (herramienta, cifra+moneda, ubicación, sede)
const FUERTES = [
    'usamos pnpm',
    'we use pnpm for everything',
    'ahora vivo en Valencia',
    'vivía en Madrid antes',
    'Marco Bianchi cobra 600 € al mes',
    'the photographer charges 600 €',
    'la oficina está en Bilbao',
    'la sede está en Barcelona',
];
for (const t of FUERTES) ok(esHechoGuardable(t) !== null, `dispara en hecho fuerte`, JSON.stringify(t));

// 2. CALLA en TODAS las consultas de la batería (son preguntas o trampas) — regla de oro: 0 falsos positivos
const bateria = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'eval-memoria', 'casos.json'), 'utf8'));
const preguntas = (bateria.recall || []).flatMap(g => (g.consultas || []).map(c => c.q));
ok(preguntas.length >= 12, 'la batería aporta suficientes consultas para probar la abstención', `n=${preguntas.length}`);
for (const q of preguntas) ok(esHechoGuardable(q) === null, `calla en consulta de la batería`, JSON.stringify(q));

// 3. CALLA en ruido conversacional (ni hecho ni pregunta: lo del día a día)
const RUIDO = ['hazla la t3', 'sigamos', 'vale, gracias', 'empieza por favor', 'qué sigue?', 'ok perfecto'];
for (const t of RUIDO) ok(esHechoGuardable(t) === null, `calla en ruido conversacional`, JSON.stringify(t));

// 4. El nudge de CIERRE nunca bloquea: la sección 2b de session-state usa systemMessage y NO decision:'block'
const srcState = fs.readFileSync(path.join(ROOT, 'src', 'session-state.mjs'), 'utf8');
const seccion2b = srcState.slice(srcState.indexOf('2b.'));
ok(/hecho-pendiente/.test(seccion2b), 'session-state tiene el aviso de cierre de hecho (hecho-pendiente)');
ok(/systemMessage/.test(seccion2b) && !/decision:\s*'block'/.test(seccion2b) && !/decision:\s*"block"/.test(seccion2b),
    'el aviso de cierre de hecho NO bloquea (solo systemMessage)');

// 5. live-memory expone el detector y el guardián de preguntas (puros, sin montar el hook)
const srcLive = fs.readFileSync(path.join(ROOT, 'src', 'live-memory.mjs'), 'utf8');
ok(/export\s+function\s+esHechoGuardable/.test(srcLive), 'esHechoGuardable se exporta (testeable)');
ok(/export\s+const\s+PREGUNTA/.test(srcLive), 'el guardián PREGUNTA se exporta');

process.stdout.write(`\ndetector de hechos (F15-T3) -> Casos: ${casos}  Fallos: ${fallos}\n`);
process.exit(fallos ? 1 : 0);
