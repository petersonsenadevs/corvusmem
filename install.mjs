#!/usr/bin/env node
// Instalador de Corvusmem (F10-T2). Registra los hooks del núcleo y prepara las carpetas de memoria, sin
// dependencias y sin red. Determinista, merge-safe (no pisa lo que el usuario ya tenga) e idempotente.
//
//   node install.mjs [opciones]
//     --project <dir>   proyecto destino (por defecto: el directorio actual)
//     --home <dir>      HOME para la memoria global y los ajustes de usuario (por defecto: el del sistema)
//     --global          registra los hooks en el HOME (todos los proyectos) en vez de en el proyecto
//     --uninstall       quita los hooks de Corvusmem (deja intacto lo demás)
//     --dry-run         enseña lo que haría, sin escribir
//     --plugin <dir>    empaqueta un PLUGIN autocontenido (Claude/Codex) en <dir> y sale (no toca settings.json)
//
// Claude: registra los hooks en .claude/settings.json (o ~/.claude/settings.json con --global), fusionando.
// Codex: ejecuta los hooks por la vía de PLUGIN. Con `--plugin <dir>` se genera ese plugin en el MISMO formato que el
//   plugin de Senzu que Codex ya consume: .claude-plugin/plugin.json + hooks/hooks.json (con ${CLAUDE_PLUGIN_ROOT}) +
//   los .mjs del núcleo. El usuario lo publica en un marketplace de Codex, lo instala y aprueba los hooks en la app
//   (quedan en ~/.codex/config.toml -> hooks.state). Sin --plugin, el instalador deja el manifiesto .corvusmem/hooks.json.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esSenzu } from './src/lib.mjs';   // para el aviso de proyecto con Senzu

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, 'src');                       // donde viven los hooks del núcleo (ruta absoluta)
const CMDS_SRC = path.join(AQUI, 'commands');             // slash-command templates (/corvus-absorb)
const CLI_SRC = path.join(AQUI, 'cli');                   // el CLI de la memoria (corvusmem.mjs + subcomandos): se empaqueta para el guardado RÁPIDO (sin npx)
const CORTEX_SRC = path.join(AQUI, 'cortex');             // el render del Cortex (cortex.mjs + cortex-text.mjs): se empaqueta para que --cortex funcione en local (sin npx)
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : null; };
const has = n => args.includes(n);

const PROYECTO = path.resolve(opt('--project') && opt('--project') !== true ? String(opt('--project')) : process.cwd());
const HOME = path.resolve(opt('--home') && opt('--home') !== true ? String(opt('--home')) : os.homedir());
const GLOBAL = has('--global');
const DRY = has('--dry-run');
const log = s => process.stdout.write(s + '\n');

// El conjunto de hooks de CEREBRO (sin el método Senzu: ni router, ni guards, ni skill-reminders).
const HOOKSET = {
    SessionStart:     [{ files: ['session-start.mjs'] }],
    UserPromptSubmit: [{ files: ['live-memory.mjs', 'live-recall.mjs'] }],
    PreToolUse:       [{ matcher: 'Edit|Write|MultiEdit|NotebookEdit|apply_patch', files: ['file-memory.mjs'] }],
    PostToolUse:      [{ matcher: 'Edit|Write|MultiEdit|apply_patch', files: ['facts-guard.mjs'] },
                       { matcher: 'Bash|PowerShell', files: ['facts-guard.mjs'] }],
    Stop:             [{ files: ['session-state.mjs', 'facts-guard.mjs'] }],
    SessionEnd:       [{ files: ['session-end.mjs'] }],
};

// Los hooks del nucleo se COPIAN a un sitio DURABLE (NO la ruta efimera de npx `_npx/<hash>` ni node_modules): el
// proyecto (.corvusmem/hooks) o el HOME global (~/.config/corvusmem/hooks). El comando del settings.json apunta ahi,
// asi sobrevive a que npx limpie su cache y cada instalacion queda autocontenida.
const hooksDir = GLOBAL ? path.join(HOME, '.config', 'corvusmem', 'hooks') : path.join(PROYECTO, '.corvusmem', 'hooks');
// En PROYECTO, $CLAUDE_PROJECT_DIR hace el settings.json PORTABLE: al commitear .corvusmem/ y .claude/settings.json,
// vale para todo el equipo en cualquier maquina/OS. En GLOBAL, ruta absoluta al HOME (los settings globales no se
// comparten entre maquinas).
const cmdDe = file => GLOBAL
    ? `node "${path.join(hooksDir, file).replace(/\\/g, '/')}"`
    : `node "\${CLAUDE_PROJECT_DIR}/.corvusmem/hooks/${file}"`;   // forma braceada documentada (portable Win/Mac/Linux)
// Nuestras entradas (para fusionar sin pisar las del usuario y para MIGRAR las viejas con ruta de npx): cualquier
// comando que mencione corvusmem y uno de nuestros ficheros de hook.
const NUESTROS_HOOKS = new Set(Object.values(HOOKSET).flat().flatMap(g => g.files));
const esNuestro = cmd => typeof cmd === 'string' && /corvusmem/i.test(cmd) && [...NUESTROS_HOOKS].some(f => cmd.includes(f));
// Copia los .mjs del nucleo (hooks + dependencias del mismo directorio: autocontenido) al sitio durable. Devuelve n.
function copiarHooks(dir) {
    if (DRY) { log(`  [dry-run] would copy core hook files to ${dir}`); return 0; }
    fs.mkdirSync(dir, { recursive: true });
    let n = 0;
    for (const f of fs.readdirSync(SRC)) if (f.endsWith('.mjs')) { fs.copyFileSync(path.join(SRC, f), path.join(dir, f)); n++; }
    return n;
}
// Copia el CLI de memoria (corvusmem.mjs + subcomandos) a <baseDir>/cli/, HERMANO de hooks/. Así el agente guarda y
// recuerda con `node "<baseDir>/cli/corvusmem.mjs" --save …` — rápido y nativo, SIN el arranque en frío de npx. cli/memory.mjs
// resuelve el motor en ../hooks/facts.mjs (ver su `motor()`). El `npx corvusmem` sigue valiendo como fallback.
function copiarCli(baseDir) {
    if (DRY) { log(`  [dry-run] would copy the memory CLI to ${path.join(baseDir, 'cli')}`); return 0; }
    const dir = path.join(baseDir, 'cli');
    fs.mkdirSync(dir, { recursive: true });
    let n = 0;
    for (const f of fs.readdirSync(CLI_SRC)) if (f.endsWith('.mjs')) { fs.copyFileSync(path.join(CLI_SRC, f), path.join(dir, f)); n++; }
    return n;
}
// El render del Cortex a <baseDir>/cortex/ (hermano de cli/): cli/memory.mjs lo carga en ../cortex/cortex.mjs, así
// `/corvus-cortex` (o --cortex) dibuja el cerebro HTML con node LOCAL, sin npx.
function copiarCortex(baseDir) {
    if (DRY) { log(`  [dry-run] would copy the Cortex to ${path.join(baseDir, 'cortex')}`); return 0; }
    const dir = path.join(baseDir, 'cortex');
    fs.mkdirSync(dir, { recursive: true });
    let n = 0;
    try { for (const f of fs.readdirSync(CORTEX_SRC)) if (f.endsWith('.mjs')) { fs.copyFileSync(path.join(CORTEX_SRC, f), path.join(dir, f)); n++; } } catch { }
    return n;
}

// Slash commands (e.g. /corvus-absorb) go to .claude/commands/ — per project, or the HOME with --global.
function instalarComandos(quitar) {
    let files = [];
    try { files = fs.readdirSync(CMDS_SRC).filter(f => f.endsWith('.md')); } catch { return; }
    if (!files.length) return;
    const destDir = path.join(GLOBAL ? HOME : PROYECTO, '.claude', 'commands');
    if (quitar) {
        if (!DRY) for (const f of files) { try { fs.rmSync(path.join(destDir, f), { force: true }); } catch {} }
        log(`  [commands] removed ${files.length} command(s) from ${destDir.replace(/\\/g, '/')}`);
        return;
    }
    if (DRY) { log(`  [dry-run] would copy ${files.length} command(s) to ${destDir}`); return; }
    fs.mkdirSync(destDir, { recursive: true });
    for (const f of files) fs.copyFileSync(path.join(CMDS_SRC, f), path.join(destDir, f));
    log(`  [commands] ${files.length} command(s) copied to ${destDir.replace(/\\/g, '/')}`);
}

// Para EMPAQUETAR como plugin (Claude/Codex): el comando apunta al propio plugin, no a una ruta de la maquina.
const cmdPlugin = file => `node "\${CLAUDE_PLUGIN_ROOT}/hooks/${file}"`;
function gruposPlugin(ev) {
    return HOOKSET[ev].map(g => {
        const grp = {};
        if (g.matcher) grp.matcher = g.matcher;
        grp.hooks = g.files.map(f => ({ type: 'command', command: cmdPlugin(f), timeout: ev === 'SessionEnd' ? 5 : 30 }));
        return grp;
    });
}

// Empaqueta Corvusmem como PLUGIN autocontenido (mismo formato que el plugin de Senzu que Codex ya consume):
// .claude-plugin/plugin.json + hooks/hooks.json (con ${CLAUDE_PLUGIN_ROOT}) + los .mjs del nucleo copiados a hooks/.
// El usuario lo publica en un marketplace de Codex, lo instala y APRUEBA los hooks en la app (quedan en
// ~/.codex/config.toml -> hooks.state). Vale igual como plugin de Claude.
function empaquetarPlugin(destino) {
    const dir = path.resolve(destino);
    let pkg = {}; try { pkg = JSON.parse(fs.readFileSync(path.join(AQUI, 'package.json'), 'utf8')); } catch {}
    if (DRY) { log(`  [dry-run] would package the plugin in ${dir}`); return; }
    const hooksDir = path.join(dir, 'hooks');
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.mkdirSync(path.join(dir, '.claude-plugin'), { recursive: true });
    // 1) hooks.json en formato de plugin (CLAUDE_PLUGIN_ROOT), mismos eventos que el HOOKSET
    const h = {}; for (const ev of Object.keys(HOOKSET)) h[ev] = gruposPlugin(ev);
    fs.writeFileSync(path.join(hooksDir, 'hooks.json'), JSON.stringify({ hooks: h }, null, 2) + '\n');
    // 2) los .mjs del nucleo (hooks + dependencias de mismo directorio: autocontenido, cero imports externos)
    let n = 0;
    for (const f of fs.readdirSync(SRC)) if (f.endsWith('.mjs')) { fs.copyFileSync(path.join(SRC, f), path.join(hooksDir, f)); n++; }
    // 2b) el CLI de memoria en <plugin>/cli/ (hermano de hooks/): para que el agente guarde/recuerde con node, sin npx
    const ncli = copiarCli(dir);
    // 2c) el render del Cortex en <plugin>/cortex/: para que /corvus-cortex dibuje el cerebro en local, sin npx
    const ncx = copiarCortex(dir);
    // 3) slash commands (/corvus-absorb) in the plugin's commands/ dir
    let nc = 0;
    try {
        const cmds = fs.readdirSync(CMDS_SRC).filter(f => f.endsWith('.md'));
        if (cmds.length) { fs.mkdirSync(path.join(dir, 'commands'), { recursive: true }); for (const f of cmds) { fs.copyFileSync(path.join(CMDS_SRC, f), path.join(dir, 'commands', f)); nc++; } }
    } catch { /* no commands/ */ }
    // 4) plugin.json
    const plugin = { name: 'corvusmem', description: pkg.description || 'Memoria determinista, offline y sin dependencias para agentes de IA.', version: pkg.version || '0.0.0', author: { name: 'Peterson Sena' }, homepage: pkg.homepage || 'https://corvusmem.vercel.app', repository: (pkg.repository && pkg.repository.url) || 'https://github.com/petersonsenadevs/corvusmem', license: 'SEE LICENSE IN LICENSE' };
    fs.writeFileSync(path.join(dir, '.claude-plugin', 'plugin.json'), JSON.stringify(plugin, null, 2) + '\n');
    log(`  [plugin] ${dir}: .claude-plugin/plugin.json + hooks/hooks.json + ${n} .mjs + ${ncli} cli + ${ncx} cortex${nc ? ` + ${nc} command(s)` : ''}`);
}

// Genera, DENTRO del repo, el plugin committeable `plugins/corvusmem/` y el `.claude-plugin/marketplace.json` de la
// raíz: el propio repo ES el marketplace de Claude Code (igual que Senzu). Tras esto:
//   Claude Code: /plugin marketplace add petersonsenadevs/corvusmem  ·  /plugin install corvusmem@corvusmem
//   Codex:       consume el MISMO plugin (hooks.json con ${CLAUDE_PLUGIN_ROOT}); se aprueban los hooks en la app.
// Se vuelve a ejecutar en cada release (lo hace el flujo de versión) para que el plugin lleve la versión y los hooks al día.
function generarMarketplace() {
    let pkg = {}; try { pkg = JSON.parse(fs.readFileSync(path.join(AQUI, 'package.json'), 'utf8')); } catch { }
    const pluginDir = path.join(AQUI, 'plugins', 'corvusmem');
    if (!DRY) fs.rmSync(pluginDir, { recursive: true, force: true });   // regenerar limpio
    empaquetarPlugin(pluginDir);
    const desc = pkg.description || 'Memoria determinista, offline y sin dependencias para agentes de IA (Claude Code, Codex).';
    const mkt = {
        name: 'corvusmem',
        owner: { name: 'Peterson Sena' },
        metadata: { version: pkg.version || '0.0.0', description: 'Marketplace de Corvusmem: memoria determinista, offline y sin dependencias para agentes de IA.' },
        plugins: [{
            name: 'corvusmem', source: './plugins/corvusmem', description: desc, version: pkg.version || '0.0.0',
            category: 'development', keywords: ['memory', 'memoria', 'hooks', 'offline', 'deterministic', 'facts', 'recall', 'claude', 'codex'],
        }],
    };
    if (!DRY) { fs.mkdirSync(path.join(AQUI, '.claude-plugin'), { recursive: true }); fs.writeFileSync(path.join(AQUI, '.claude-plugin', 'marketplace.json'), JSON.stringify(mkt, null, 2) + '\n'); }
    log(`  [marketplace] .claude-plugin/marketplace.json -> plugins/corvusmem (v${pkg.version || '0.0.0'})`);
}

// Construye los grupos de hooks de un evento en el formato de settings.json de Claude.
function gruposDe(ev) {
    return HOOKSET[ev].map(g => {
        const grp = {};
        if (g.matcher) grp.matcher = g.matcher;
        grp.hooks = g.files.map(f => ({ type: 'command', command: cmdDe(f), timeout: ev === 'SessionEnd' ? 5 : 30 }));
        return grp;
    });
}

function leerJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return {}; throw e; } }

// Fusiona en settings.json: quita SOLO lo nuestro (por la ruta) y, si no es --uninstall, vuelve a ponerlo.
function fusionar(settings, { quitar }) {
    const hooks = settings.hooks && typeof settings.hooks === 'object' ? settings.hooks : {};
    for (const ev of Object.keys(HOOKSET)) {
        const existentes = Array.isArray(hooks[ev]) ? hooks[ev] : [];
        // de los grupos que había, conserva los hooks que NO son nuestros (así no pisamos los del usuario)
        const ajenos = existentes
            .map(g => ({ ...g, hooks: (Array.isArray(g.hooks) ? g.hooks : []).filter(h => !esNuestro(h && h.command)) }))
            .filter(g => g.hooks.length);
        const nuevos = quitar ? [] : gruposDe(ev);
        const total = ajenos.concat(nuevos);
        if (total.length) hooks[ev] = total; else delete hooks[ev];
    }
    if (Object.keys(hooks).length) settings.hooks = hooks; else delete settings.hooks;
    return settings;
}

function escribir(file, obj) {
    if (DRY) { log(`  [dry-run] would write ${file}`); return; }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
}

function asegurarDir(dir) {
    if (DRY) { log(`  [dry-run] would create ${dir}`); return; }
    fs.mkdirSync(dir, { recursive: true });
}

function run() {
    if (!fs.existsSync(path.join(SRC, 'facts.mjs'))) { log(`Core not found in ${SRC}. Run install.mjs from the Corvusmem repo.`); process.exit(2); }

    // Modo empaquetar plugin (Claude/Codex): no toca settings.json; genera un plugin autocontenido en <dir>.
    const destinoPlugin = opt('--plugin');
    if (destinoPlugin && destinoPlugin !== true) {
        log(`Corvusmem · package plugin (Claude/Codex)${DRY ? ' (dry-run)' : ''}`);
        empaquetarPlugin(destinoPlugin);
        log('Done.');
        return;
    }

    // Modo marketplace: genera plugins/corvusmem/ + .claude-plugin/marketplace.json EN EL REPO (el repo es el marketplace).
    if (has('--marketplace')) {
        log(`Corvusmem · generate marketplace + committed plugin${DRY ? ' (dry-run)' : ''}`);
        generarMarketplace();
        log('Done.');
        return;
    }

    const quitar = has('--uninstall');
    log(`Corvusmem · ${quitar ? 'uninstall' : 'install'}${GLOBAL ? ' (global)' : ''}${DRY ? ' (dry-run)' : ''}`);

    // 0) Copias DURABLES de los hooks (o quitarlas). La MEMORIA (.corvusmem/memoria, ~/.config/corvusmem) no se toca.
    const cliBase = path.dirname(hooksDir);   // .corvusmem/ (proyecto) o ~/.config/corvusmem/ (global); el cli va junto a hooks
    if (quitar) {
        if (!DRY) { try { fs.rmSync(hooksDir, { recursive: true, force: true }); } catch {} try { fs.rmSync(path.join(cliBase, 'cli'), { recursive: true, force: true }); } catch {} try { fs.rmSync(path.join(cliBase, 'cortex'), { recursive: true, force: true }); } catch {} }
        log(`  [hooks] removed ${hooksDir}`);
    } else {
        const n = copiarHooks(hooksDir);
        const ncli = copiarCli(cliBase);
        const ncx = copiarCortex(cliBase);
        log(`  [hooks] ${n} core + ${ncli} CLI + ${ncx} Cortex file(s) copied to ${cliBase.replace(/\\/g, '/')} (fast save & cortex, no npx)`);
    }

    // 1) Claude: hooks en settings.json (proyecto o HOME)
    const settingsFile = GLOBAL ? path.join(HOME, '.claude', 'settings.json') : path.join(PROYECTO, '.claude', 'settings.json');
    let settings;
    try { settings = leerJson(settingsFile); }
    catch { log(`  [claude] WARNING: ${settingsFile} is not valid JSON; leaving it untouched (fix it and retry).`); process.exit(2); }
    escribir(settingsFile, fusionar(settings, { quitar }));
    log(`  [claude] ${quitar ? 'Corvusmem hooks removed from' : 'hooks registered in'} ${settingsFile}`);

    // 1b) Claude slash commands (/corvus-absorb)
    instalarComandos(quitar);

    // 2) Manifiesto portable de hooks (lo consume el plugin para Claude/Codex, F10-T4)
    const manifest = path.join(PROYECTO, '.corvusmem', 'hooks.json');
    if (quitar) { if (!DRY) { try { fs.rmSync(manifest, { force: true }); } catch {} } log(`  [manifest] removed ${manifest}`); }
    else { const h = {}; for (const ev of Object.keys(HOOKSET)) h[ev] = gruposDe(ev); escribir(manifest, { hooks: h }); log(`  [manifest] ${manifest} (used by the Codex/Claude plugin)`); }

    // 3) Carpetas de memoria (no se borran al desinstalar: son datos del usuario)
    if (!quitar) {
        asegurarDir(path.join(PROYECTO, '.corvusmem'));            // memoria del proyecto
        asegurarDir(path.join(HOME, '.config', 'corvusmem'));      // memoria global del usuario
        log('  [memory] .corvusmem/ (project) and ~/.config/corvusmem/ (global) ready');
    }

    // Heads-up: in a project that already uses Senzu, Corvus becomes the MEMORY owner — it adopts the facts Senzu had
    // in senzu/memoria/ into its own .corvusmem/memory/, and Senzu (updated to its latest) defers its memory hooks to
    // Corvus. Senzu keeps everything else (method, plan, devlog, guards). Update the global Senzu plugin so it defers.
    if (!quitar && !GLOBAL && esSenzu(PROYECTO)) {
        log('  [senzu] This project also uses Senzu. Corvus now OWNS the memory here: it adopts the facts from');
        log('          senzu/memoria/ into .corvusmem/memory/ and Senzu defers its memory hooks to Corvus.');
        log('          Update the Senzu plugin to its latest so it steps back from memory (it keeps method/devlog/guards).');
    }

    log('Done.' + (quitar ? '' : ' Codex: per-event hooks go through the plugin; in Claude they are already active.'));
}

run();
