#!/usr/bin/env node
// Empaquetado como plugin (Claude/Codex): `node install.mjs --plugin <dir>` produce un plugin autocontenido en el
// MISMO formato que el plugin de Senzu que Codex ya consume: .claude-plugin/plugin.json + hooks/hooks.json (con
// ${CLAUDE_PLUGIN_ROOT}) + los .mjs del nucleo. Esto es el "adaptador de Codex" (X-T25).
//   node tests/test-plugin.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INSTALL = path.join(ROOT, 'install.mjs');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hemi-plugin-'));
let casos = 0, fallos = 0;
const ok = (c, n, d = '') => { casos++; if (!c) { fallos++; process.stdout.write(`FALLO ${n}${d ? ' -> ' + d : ''}\n`); } };

const dir = path.join(base, 'plugin');
const r = spawnSync(process.execPath, [INSTALL, '--plugin', dir], { encoding: 'utf8' });
ok(r.status === 0, 'empaqueta sin error', r.stderr ? r.stderr.slice(0, 120) : `status=${r.status}`);

// plugin.json
const pj = path.join(dir, '.claude-plugin', 'plugin.json');
ok(fs.existsSync(pj), 'existe .claude-plugin/plugin.json');
const plugin = fs.existsSync(pj) ? JSON.parse(fs.readFileSync(pj, 'utf8')) : {};
ok(plugin.name === 'corvusmem', 'plugin.json name = corvusmem', plugin.name);
ok(typeof plugin.version === 'string' && plugin.version.length > 0, 'plugin.json tiene version');

// hooks.json
const hj = path.join(dir, 'hooks', 'hooks.json');
ok(fs.existsSync(hj), 'existe hooks/hooks.json');
const hooks = fs.existsSync(hj) ? JSON.parse(fs.readFileSync(hj, 'utf8')).hooks : {};
for (const ev of ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'Stop', 'SessionEnd']) {
    ok(Array.isArray(hooks[ev]) && hooks[ev].length > 0, `hooks.json tiene el evento ${ev}`);
}
// todos los comandos apuntan al plugin (CLAUDE_PLUGIN_ROOT), ninguno a una ruta de la maquina
const cmds = Object.values(hooks).flat().flatMap(g => (g.hooks || []).map(h => h.command));
ok(cmds.length > 0 && cmds.every(c => c.includes('${CLAUDE_PLUGIN_ROOT}/hooks/')), 'todos los comandos usan ${CLAUDE_PLUGIN_ROOT}/hooks/', cmds[0]);
ok(!cmds.some(c => c.includes(':') && /[A-Za-z]:\//.test(c)), 'ningun comando lleva una ruta absoluta de la maquina');
// el matcher de edicion incluye apply_patch (Codex)
const pre = (hooks.PreToolUse || []).map(g => g.matcher).join('|');
ok(/apply_patch/.test(pre), 'PreToolUse acepta apply_patch (Codex)', pre);

// los .mjs del nucleo estan copiados (hooks + dependencias de mismo directorio)
for (const f of ['session-start.mjs', 'live-memory.mjs', 'live-recall.mjs', 'file-memory.mjs', 'facts-guard.mjs', 'session-state.mjs', 'session-end.mjs', 'facts.mjs', 'host.mjs', 'lib.mjs', 'messages.mjs']) {
    ok(fs.existsSync(path.join(dir, 'hooks', f)), `copiado hooks/${f}`);
}
// cada comando apunta a un fichero que existe en el paquete
for (const c of cmds) {
    const m = /hooks\/([\w.-]+\.mjs)/.exec(c);
    ok(m && fs.existsSync(path.join(dir, 'hooks', m[1])), `el comando apunta a un .mjs que existe (${m ? m[1] : c})`);
}

// idempotente: re-empaquetar da el mismo hooks.json
const antes = fs.readFileSync(hj, 'utf8');
spawnSync(process.execPath, [INSTALL, '--plugin', dir], { encoding: 'utf8' });
ok(fs.readFileSync(hj, 'utf8') === antes, 're-empaquetar es idempotente (hooks.json igual)');

// --- el CLI de memoria va EMPAQUETADO en el plugin: guardar/recordar sin npx ---
for (const f of ['corvusmem.mjs', 'memory.mjs', 'search.mjs', 'import.mjs', 'memory-check.mjs']) {
    ok(fs.existsSync(path.join(dir, 'cli', f)), `copiado cli/${f}`);
}
{   // guardado rápido por plugin de punta a punta (node <plugin>/cli/corvusmem.mjs --save, cero npx)
    const proj = path.join(base, 'proj1'); fs.mkdirSync(proj, { recursive: true });
    const env = { ...process.env, CLAUDE_PLUGIN_ROOT: dir, SENZU_SIN_RED: '1' };
    const s = spawnSync(process.execPath, [path.join(dir, 'cli', 'corvusmem.mjs'), '--path', proj, '--save', '--dimension', 'proyecto.stack', '--valor', 'Astro', '--claves', 'stack'], { encoding: 'utf8', env });
    ok(s.status === 0 && /Guardado/.test(s.stdout), 'plugin: node cli/corvusmem.mjs --save guarda (sin npx)', (s.stdout || s.stderr || '').slice(0, 100));
    ok(fs.existsSync(path.join(proj, '.corvusmem', 'memory', 'facts.jsonl')), 'plugin: el guardado escribe en .corvusmem/memory/facts.jsonl');
    const rc = spawnSync(process.execPath, [path.join(dir, 'cli', 'corvusmem.mjs'), '--path', proj, '--recordar', 'stack'], { encoding: 'utf8', env });
    ok(/Astro/.test(rc.stdout), 'plugin: --recordar recupera el hecho', rc.stdout.slice(0, 80));
}

// --- marketplace committeado en el repo (el repo ES el marketplace de Claude Code) ---
{
    const mkt = path.join(ROOT, '.claude-plugin', 'marketplace.json');
    ok(fs.existsSync(mkt), 'el repo lleva .claude-plugin/marketplace.json committeado (node install.mjs --marketplace)');
    if (fs.existsSync(mkt)) {
        const m = JSON.parse(fs.readFileSync(mkt, 'utf8'));
        ok(m.name === 'corvusmem' && Array.isArray(m.plugins) && m.plugins[0] && m.plugins[0].name === 'corvusmem', 'marketplace.json: lista el plugin corvusmem');
        const src = m.plugins[0] && m.plugins[0].source;
        ok(src && fs.existsSync(path.join(ROOT, src, '.claude-plugin', 'plugin.json')), 'marketplace.json: source apunta a un plugin con plugin.json', src);
        ok(src && fs.existsSync(path.join(ROOT, src, 'cli', 'corvusmem.mjs')), 'el plugin committeado lleva el cli (guardado rápido)');
        ok(src && fs.existsSync(path.join(ROOT, src, 'hooks', 'hooks.json')), 'el plugin committeado lleva hooks/hooks.json');
    }
}

// --- rutaCliMemoria: plugin > proyecto > global > npx (fallback para agentes sin estándares) ---
{
    const lib = await import(pathToFileURL(path.join(ROOT, 'src', 'lib.mjs')).href);
    const tmp = path.join(base, 'sincli'); fs.mkdirSync(tmp, { recursive: true });
    delete process.env.CLAUDE_PLUGIN_ROOT;
    ok(lib.rutaCliMemoria(tmp) === 'npx corvusmem', 'rutaCliMemoria sin instalación -> npx (fallback)', lib.rutaCliMemoria(tmp));
    fs.mkdirSync(path.join(tmp, '.corvusmem', 'cli'), { recursive: true });
    fs.writeFileSync(path.join(tmp, '.corvusmem', 'cli', 'corvusmem.mjs'), '');
    ok(/\$\{CLAUDE_PROJECT_DIR\}\/\.corvusmem\/cli\/corvusmem\.mjs/.test(lib.rutaCliMemoria(tmp)), 'rutaCliMemoria con install de proyecto -> node .corvusmem/cli (portable)', lib.rutaCliMemoria(tmp));
    process.env.CLAUDE_PLUGIN_ROOT = dir;
    ok(lib.rutaCliMemoria(tmp).startsWith('node ') && lib.rutaCliMemoria(tmp).includes('cli/corvusmem.mjs') && lib.rutaCliMemoria(tmp).includes(dir.replace(/\\/g, '/')), 'rutaCliMemoria con plugin -> node <plugin>/cli/corvusmem.mjs (gana al proyecto)', lib.rutaCliMemoria(tmp));
    delete process.env.CLAUDE_PLUGIN_ROOT;
}

process.stdout.write(`\nPlugin (Codex/Claude) -> Casos: ${casos}  Fallos: ${fallos}\n`);
process.exit(fallos ? 1 : 0);
