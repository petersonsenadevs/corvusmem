#!/usr/bin/env node
// Corvusmem · author: Peterson Sena (r3v3rs3) · https://github.com/petersonsenadevs/corvusmem
// F17-T9b: la ESCALA del diario y el suelo absoluto. escalaDiario(root) = p90 del mejor acierto de diario por
// consulta en el historial (recuerdo-uso.jsonl); sin muestra suficiente → 0 (sin suelo, no se daña a un proyecto
// nuevo). El suelo que aplica live-recall es 0,25 × escala para devlog+memoria (NO hechos). Determinista, sin red.
//   node tests/test-recall-piso.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'corvus-t9b-'));
process.env.SENZU_MEMORIA_USUARIO = path.join(base, 'usuario', 'memoria.md');
const m = await import(pathToFileURL(path.join(ROOT, 'src', 'facts.mjs')).href);

let casos = 0, fallos = 0;
const ok = (c, n, d = '') => { casos++; if (!c) { fallos++; process.stdout.write(`FAIL ${n}${d ? ' -> ' + d : ''}\n`); } };

// Siembra un recuerdo-uso.jsonl con un MEJOR de diario conocido por consulta. p90 de [1..N] sale del propio índice.
function sembrar(P, maximos) {
    const f = m.rutaUso(P);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const lineas = maximos.map((mx, i) => JSON.stringify({
        t: new Date(Date.UTC(2026, 0, 1) + i * 1000).toISOString(), sid: 's', origen: 'mensaje', consulta: 'q' + i,
        items: [{ fuente: 'devlog', id: 'd' + i, texto: 'entrada ' + i, puntuacion: mx, usado: false },
                { fuente: 'hecho', id: 'h' + i, texto: '[nota.x] algo', puntuacion: 99, usado: true }],   // el hecho NO cuenta para la escala
    }));
    fs.writeFileSync(f, lineas.join('\n') + '\n');
}
let np = 0; const proyecto = () => { const d = path.join(base, 'p' + (++np)); fs.mkdirSync(d, { recursive: true }); return d; };

// 1. Con muestra suficiente, escala = p90 del mejor de diario por consulta. 25 consultas con máximos 1..25:
//    índice p90 = floor(25*0.9)=22 → valor 23 (ordenado ascendente, 1-based 23).
{
    const P = proyecto();
    sembrar(P, Array.from({ length: 25 }, (_, i) => i + 1));
    const e = m.escalaDiario(P);
    ok(e === 23, 'escala = p90 del mejor de diario por consulta', `escala=${e} (esperado 23)`);
    ok(0.25 * e === 5.75, 'el suelo es 0,25 × escala', `piso=${0.25 * e}`);
}

// 2. El HECHO (puntuacion 99) no infla la escala: si quito los devlog, la escala de diario no debe mirar los hechos.
{
    const P = proyecto();
    const f = m.rutaUso(P); fs.mkdirSync(path.dirname(f), { recursive: true });
    const lineas = Array.from({ length: 25 }, (_, i) => JSON.stringify({
        t: new Date(Date.UTC(2026, 0, 1) + i * 1000).toISOString(), sid: 's', origen: 'mensaje', consulta: 'q',
        items: [{ fuente: 'hecho', id: 'h' + i, texto: '[x] y', puntuacion: 99, usado: true }],
    }));
    fs.writeFileSync(f, lineas.join('\n') + '\n');
    ok(m.escalaDiario(P) === 0, 'sin items de diario, escala = 0 (los hechos no cuentan)', `escala=${m.escalaDiario(P)}`);
}

// 3. Muestra insuficiente (< 20 consultas con diario) → 0 (sin suelo; proyecto nuevo no se daña).
{
    const P = proyecto();
    sembrar(P, Array.from({ length: 15 }, () => 10));
    ok(m.escalaDiario(P) === 0, 'con < 20 consultas de diario, escala = 0 (fallback sin suelo)', `escala=${m.escalaDiario(P)}`);
}

// 4. Sin historial (sin archivo) → 0.
{
    const P = proyecto();
    ok(m.escalaDiario(P) === 0, 'sin historial, escala = 0', `escala=${m.escalaDiario(P)}`);
}

// 5. Las consultas de tipo 'consulta' (búsquedas del agente) NO cuentan para la escala.
{
    const P = proyecto();
    const f = m.rutaUso(P); fs.mkdirSync(path.dirname(f), { recursive: true });
    const lineas = Array.from({ length: 25 }, (_, i) => JSON.stringify({
        t: new Date(Date.UTC(2026, 0, 1) + i * 1000).toISOString(), sid: 's', origen: 'consulta', consulta: 'q',
        items: [{ fuente: 'devlog', id: 'd' + i, texto: 'e', puntuacion: 10, usado: false }],
    }));
    fs.writeFileSync(f, lineas.join('\n') + '\n');
    ok(m.escalaDiario(P) === 0, 'las búsquedas del agente (origen=consulta) no cuentan', `escala=${m.escalaDiario(P)}`);
}

// 6. El suelo = 0,25 × escala separa un item flojo de uno fuerte (la decisión que toma live-recall para diario).
{
    const P = proyecto();
    sembrar(P, Array.from({ length: 25 }, () => 20));   // escala p90 = 20 → piso = 5
    const piso = 0.25 * m.escalaDiario(P);
    ok(piso === 5, 'piso concreto = 5 con escala 20', `piso=${piso}`);
    const pasa = p => p > 0 && p >= piso;   // la parte de suelo del filtro de live-recall para diario+memoria
    ok(!pasa(4), 'un acierto de diario flojo (4 < piso 5) se descarta', '');
    ok(pasa(8), 'un acierto de diario fuerte (8 ≥ piso 5) pasa', '');
}

fs.rmSync(base, { recursive: true, force: true });
process.stdout.write(`\nsuelo del diario (F17-T9b) -> Casos: ${casos}  Fallos: ${fallos}\n`);
process.exit(fallos ? 1 : 0);
