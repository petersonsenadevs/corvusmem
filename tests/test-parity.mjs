#!/usr/bin/env node
// Paridad de inyección entre anfitriones (carve-out Corvusmem, F9-T4). El recall (recuerdo-vivo) y el arranque
// (session-start) deben salir IGUAL bajo Claude, Codex y standalone con los MISMOS hechos — salvo lo propio del
// anfitrión (rutas). Se corre cada hook de verdad con las señales de cada anfitrión (Claude: CLAUDE_PROJECT_DIR;
// Codex: sin esa variable, la raíz por cwd en la entrada; standalone: sin señales, cwd = proyecto) sobre proyectos
// sembrados idénticos, se normaliza la ruta del proyecto y se compara. Incluye recall multilingüe (es/en/pt/fr/de/it).
// Sesiones únicas por corrida para no chocar con el apretón de manos (F9-T3). Sin LLM, sin red, determinista.
//   node tools/test-paridad-inyeccion.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOOKS = process.env.SENZU_HOOKS_DIR || path.join(ROOT, 'src');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'senzu-par-'));
process.env.SENZU_MEMORIA_USUARIO = path.join(base, 'usuario', 'memoria.md');   // aislada; igual para los 3 anfitriones
const m = await import(pathToFileURL(path.join(HOOKS, 'facts.mjs')).href);

let casos = 0, fallos = 0;
const ok = (c, n, d = '') => { casos++; if (!c) { fallos++; process.stdout.write(`FAIL ${n}${d ? ' -> ' + d : ''}\n`); } };
const RUN = Date.now().toString(36);
const T = s => new Date(Date.UTC(2026, 9, 7, 9, 0, s)).toISOString();

// Siembra idéntica en un proyecto propio por anfitrión (así no se pisan los contadores de uso entre corridas)
function seembra(nombre) {
    const d = path.join(base, nombre);
    // Standalone Corvus project (no Senzu marker): the hooks run and inject. With a real senzu.json they would stand
    // down (cederASenzu) — that case is covered in test-facts; here we check Corvus's OWN hook output is host-agnostic.
    fs.mkdirSync(d, { recursive: true });
    m.guardarHecho(d, { dimension: 'identidad.ubicacion', valor: 'Valencia', texto: 'vivo en Valencia',
        claves: ['valencia', 'ciudad', 'city', 'cidade', 'ville', 'stadt', 'citta', 'vivo', 'live', 'moro', 'vis', 'wohne'] }, { ahora: T(0) });
    m.guardarHecho(d, { dimension: 'proyecto.stack', valor: 'Laravel', texto: 'el stack es Laravel',
        claves: ['stack', 'framework', 'laravel'] }, { ahora: T(1) });
    return d;
}

// Un anfitrión = cómo se lanza el hook. Claude: CLAUDE_PROJECT_DIR. Codex: sin esa var, raíz por cwd en la ENTRADA
// (y el proceso desde otra carpeta). Standalone: sin señales, el proceso corre dentro del proyecto.
const ANFITRIONES = {
    claude:     P => ({ env: { CLAUDE_PROJECT_DIR: P, SENZU_SIN_RED: '1' }, cwd: P, extra: {} }),
    codex:      P => ({ env: { CLAUDE_PROJECT_DIR: '', SENZU_SIN_RED: '1' }, cwd: base, extra: { cwd: P } }),
    standalone: P => ({ env: { CLAUDE_PROJECT_DIR: '', SENZU_SIN_RED: '1' }, cwd: P, extra: {} }),
};
const PROY = Object.fromEntries(Object.keys(ANFITRIONES).map(a => [a, seembra(a)]));

const contexto = r => { try { return JSON.parse(r.stdout).hookSpecificOutput.additionalContext || ''; } catch { return ''; } };
const norm = (s, P) => s.split(P).join('<P>').split(P.replace(/\\/g, '/')).join('<P>');   // la ruta del proyecto → <P>

function correr(hook, anfitrion, entradaBase) {
    const P = PROY[anfitrion];
    const cfg = ANFITRIONES[anfitrion](P);
    const r = spawnSync(process.execPath, [path.join(HOOKS, hook)], {
        input: JSON.stringify({ ...entradaBase, ...cfg.extra }), encoding: 'utf8', cwd: cfg.cwd,
        env: { ...process.env, ...cfg.env },
    });
    return norm(contexto(r), P);
}

// --- recall (recuerdo-vivo) idéntico entre anfitriones, en 6 idiomas ------------------------------------
const CONSULTAS = {
    es: 'ciudad donde vivo', en: 'city where i live', pt: 'cidade onde moro',
    fr: 'ville ou je vis', de: 'stadt wo ich wohne', it: 'citta dove vivo',
};
for (const [lang, prompt] of Object.entries(CONSULTAS)) {
    const sid = base => `pv-${RUN}-${lang}-${base}`;
    const outs = Object.keys(ANFITRIONES).map(a =>
        [a, correr('live-recall.mjs', a, { session_id: sid(a), hook_event_name: 'UserPromptSubmit', prompt })]);
    const ref = outs[0][1];
    ok(ref.includes('Valencia'), `recall ${lang}: recupera el hecho (no vacío)`, ref.slice(0, 80));
    for (const [a, o] of outs.slice(1)) ok(o === ref, `recall ${lang}: ${a} idéntico a ${outs[0][0]}`, `len ${o.length} vs ${ref.length}`);
}

// --- arranque (session-start) idéntico entre anfitriones (salvo la ruta, ya normalizada) ----------------
{
    const outs = Object.keys(ANFITRIONES).map(a =>
        [a, correr('session-start.mjs', a, { session_id: `ps-${RUN}-${a}`, hook_event_name: 'SessionStart' })]);
    const ref = outs[0][1];
    ok(ref.includes('FACTS you already know') && ref.includes('Valencia'), 'arranque: inyecta el bloque de memoria (EN por defecto)', ref.slice(0, 80));
    for (const [a, o] of outs.slice(1)) ok(o === ref, `arranque: ${a} idéntico a ${outs[0][0]}`, `len ${o.length} vs ${ref.length}`);
}

// --- Corvus MANDA la memoria: sus hooks inyectan igual haya o no un marcador de Senzu (Corvus es el dueño; es Senzu
//     quien le cede la memoria, en su propio lado). Antes cedía Corvus; ya no. -------------------------------------
{
    const run = (hook, P, inp) => spawnSync(process.execPath, [path.join(HOOKS, hook)],
        { input: JSON.stringify(inp), encoding: 'utf8', cwd: P, env: { ...process.env, CLAUDE_PROJECT_DIR: P, SENZU_SIN_RED: '1' } });
    const sed = (nombre, conSenzu) => {
        const d = path.join(base, nombre); fs.mkdirSync(d, { recursive: true });
        if (conSenzu) { fs.mkdirSync(path.join(d, 'senzu'), { recursive: true }); fs.writeFileSync(path.join(d, 'senzu', 'senzu.json'), '{}'); }
        m.guardarHecho(d, { dimension: 'proyecto.stack', valor: 'Deno', claves: ['stack', 'deno'] }, { ahora: T(0) });
        return d;
    };
    const conSenzu = sed('corvus-con-senzu', true), sinSenzu = sed('corvus-sin-senzu', false);
    const rr = run('live-recall.mjs', conSenzu, { session_id: `cd-${RUN}-r`, hook_event_name: 'UserPromptSubmit', prompt: 'what stack deno' });
    ok(contexto(rr).includes('Deno'), 'con Senzu presente, live-recall de Corvus SÍ inyecta (Corvus manda la memoria)', contexto(rr).slice(0, 80));
    const rs = run('session-start.mjs', conSenzu, { session_id: `cd-${RUN}-s`, hook_event_name: 'SessionStart' });
    ok(rs.stdout.includes('Deno'), 'con Senzu presente, session-start de Corvus SÍ inyecta el bloque de memoria', rs.stdout.slice(0, 80));
    const cr = run('live-recall.mjs', sinSenzu, { session_id: `cd-${RUN}-r2`, hook_event_name: 'UserPromptSubmit', prompt: 'what stack deno' });
    ok(contexto(cr).includes('Deno'), 'sin Senzu, live-recall también recupera el hecho (control)', contexto(cr).slice(0, 80));
}

// --- DOS CAPAS a la vez (plugin GLOBAL + install de PROYECTO): comparten el apretón de manos, así que SOLO UNO
//     inyecta por turno, pero el que gana trae SIEMPRE las dos tiendas (proyecto + personal/GLOBAL). La clave del
//     apretón depende de la RAÍZ, no de qué instalación, y ambos corren el MISMO motor (todosLosHechos lee proyecto
//     + usuario). Responde: ¿si no salta el hook global, se pierden los recuerdos globales? NO. -------------------
{
    const run = (hook, P, inp) => spawnSync(process.execPath, [path.join(HOOKS, hook)],
        { input: JSON.stringify(inp), encoding: 'utf8', cwd: P, env: { ...process.env, CLAUDE_PROJECT_DIR: P, SENZU_SIN_RED: '1' } });
    const P = path.join(base, 'dos-capas'); fs.mkdirSync(P, { recursive: true });
    m.guardarHecho(P, { dimension: 'proyecto.stack', valor: 'Deno', claves: ['stack', 'deno'] }, { ahora: T(0) });
    m.guardarHecho(P, { dimension: 'identidad.nombre', valor: 'Peterson', alcance: 'usuario', claves: ['nombre', 'name', 'peterson'] }, { ahora: T(1) });
    const sid = `dos-${RUN}`;
    const a = run('session-start.mjs', P, { session_id: sid, hook_event_name: 'SessionStart' });   // 1.ª capa (p.ej. el plugin global)
    const b = run('session-start.mjs', P, { session_id: sid, hook_event_name: 'SessionStart' });   // 2.ª capa (install del proyecto), MISMA sesión
    ok(a.stdout.includes('Deno') && a.stdout.includes('Peterson'),
        'dos capas: el que GANA el apretón trae proyecto Y global (nada se pierde)', a.stdout.slice(0, 90));
    ok(contexto(b) === '',
        'dos capas: la 2.ª capa NO re-inyecta en el mismo turno (sin doble memoria)', contexto(b).slice(0, 60));
    // Proyecto VACÍO de hechos: la memoria GLOBAL se inyecta igual (no depende de que "salte" ningún hook global)
    const V = path.join(base, 'solo-global'); fs.mkdirSync(V, { recursive: true });
    const g = run('session-start.mjs', V, { session_id: `solo-${RUN}`, hook_event_name: 'SessionStart' });
    ok(g.stdout.includes('Peterson'), 'proyecto vacío: los recuerdos GLOBALES se inyectan igual', g.stdout.slice(0, 90));
}

// --- el standalone por el MOTOR coincide con lo que inyecta el hook (engine ≡ hook) --------------------
{
    const P = PROY.standalone;
    const rec = m.recuerdo(P, 'ciudad donde vivo', { limite: 10 });
    const textos = rec.filter(x => x.fuente === 'hecho').map(x => x.texto);
    ok(textos.some(t => /Valencia/.test(t)), 'motor (standalone): recuerdo() trae el mismo hecho que el hook', textos.join(' | '));
}

fs.rmSync(base, { recursive: true, force: true });
process.stdout.write(`Casos: ${casos}  Fallos: ${fallos}\n`);
process.exit(fallos ? 1 : 0);
