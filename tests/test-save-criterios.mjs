#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// F15-T2: la VARA de qué guardar es explícita, concreta y de UNA sola fuente (save.criterios), usada tanto al iniciar
// la sesión como en el aviso de cierre. Así agentes distintos convergen en guardar lo mismo (baja la varianza).
//   node tests/test-save-criterios.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { msg } = await import(pathToFileURL(path.join(ROOT, 'src', 'messages.mjs')).href);
let casos = 0, fallos = 0;
const ok = (c, n, d = '') => { casos++; if (!c) { fallos++; process.stdout.write(`FAIL ${n}${d ? ' -> ' + d : ''}\n`); } };

// 1. El criterio existe en los dos idiomas base y enumera los disparadores concretos (no una pregunta vaga)
const es = msg('save.criterios', 'es');
const en = msg('save.criterios', 'en');
ok(typeof es === 'string' && es.length > 80, 'save.criterios(es) existe y no está vacío');
ok(typeof en === 'string' && en.length > 80, 'save.criterios(en) existe y no está vacío');
for (const t of ['decisión', 'límite', 'restricción', 'preferencia', 'objetivo', 'pendiente'])
    ok(es.toLowerCase().includes(t), `save.criterios(es) nombra el disparador "${t}"`);
for (const t of ['decision', 'limit', 'constraint', 'preference', 'goal', 'pending'])
    ok(en.toLowerCase().includes(t), `save.criterios(en) names the trigger "${t}"`);
// la vara ("¿servirá la próxima vez?") y el "qué NO guardar" (rutinario) están, no solo "lo estable"
ok(/pr[oó]xima/i.test(es) && /next/i.test(en), 'save.criterios fija la vara: ¿servirá la PRÓXIMA vez?');
ok(/rutinari/i.test(es) && /routine/i.test(en), 'save.criterios dice qué NO guardar (trabajo rutinario)');

// 2. Una sola fuente: el MISMO criterio se usa en el inicio de sesión Y en el aviso de cierre
const srcStart = fs.readFileSync(path.join(ROOT, 'src', 'session-start.mjs'), 'utf8');
const srcGuard = fs.readFileSync(path.join(ROOT, 'src', 'facts-guard.mjs'), 'utf8');
ok(/save\.criterios/.test(srcStart), 'session-start.mjs usa save.criterios (misma vara al empezar)');
ok(/save\.criterios/.test(srcGuard), 'facts-guard.mjs usa save.criterios (misma vara al cerrar)');

process.stdout.write(`\nsave.criterios (F15-T2) -> Casos: ${casos}  Fallos: ${fallos}\n`);
process.exit(fallos ? 1 : 0);
