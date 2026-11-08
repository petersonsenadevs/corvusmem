// Corvus memory import — DISCOVERY ONLY (deterministic, offline, zero-dependency).
// Finds the memory documents already in a project so nothing a teammate wrote is lost, in two tiers:
//   tier 'agent' — known agent-memory files (CLAUDE.md, AGENTS.md, Cursor/Copilot/Gemini rules, a Senzu
//                  MEMORIA.md): high confidence, absorb them.
//   tier 'doc'   — any OTHER markdown that may hold memory (e.g. docs/architecture.md, notes/decisions.md),
//                  minus obvious boilerplate (README, CHANGELOG, LICENSE…): the agent judges / asks the user.
//
// It does NOT decide what counts as "real" memory and it NEVER writes: that judgment belongs to the agent,
// via the /corvus-absorb command, which reads these files and calls `corvusmem --save` for what matters.
import fs from 'node:fs';
import path from 'node:path';
import { rutaNativa } from './lib.mjs';

// Well-known agent-memory files, by relative path. `kind` = which tool wrote it.
const FIJOS = [
    ['CLAUDE.md', 'claude'],
    ['CLAUDE.local.md', 'claude'],
    ['.claude/CLAUDE.md', 'claude'],
    ['AGENTS.md', 'agents'],
    ['GEMINI.md', 'gemini'],
    ['.github/copilot-instructions.md', 'copilot'],
    ['.cursorrules', 'cursor'],
    ['.windsurfrules', 'windsurf'],
    ['senzu/devlog/MEMORIA.md', 'senzu'],
];
// Agent-memory file names worth finding nested in subfolders (e.g. packages/*/CLAUDE.md).
const ANIDADOS = new Map([['CLAUDE.md', 'claude'], ['CLAUDE.local.md', 'claude'], ['AGENTS.md', 'agents'], ['GEMINI.md', 'gemini']]);
// Dirs we never walk into (heavy, generated, template-only, or Corvus/Senzu's own stores).
const NO_ENTRAR = new Set(['node_modules', '.git', '.corvusmem', 'senzu', '.claude', '.agents', '.github',
    '.vscode', '.idea', 'vendor', 'dist', 'build', 'out', '.next', '.astro', '.nuxt', '.svelte-kit',
    '.venv', 'venv', '__pycache__', 'coverage', '.cache', 'tmp', 'target']);
// Markdown that is almost never project memory -> kept out of the 'doc' tier.
const BOILERPLATE = new Set(['readme.md', 'changelog.md', 'change-log.md', 'changes.md', 'history.md',
    'license.md', 'licence.md', 'copying.md', 'contributing.md', 'code_of_conduct.md', 'security.md',
    'authors.md', 'maintainers.md', 'support.md', 'funding.md', 'notice.md', 'pull_request_template.md',
    'issue_template.md']);
const MAX_PROF = 5;    // bounded walk: deep enough for packages/*/app/docs, cheap enough to stay instant
const MAX_DOCS = 80;   // cap the generic-markdown tier so a huge repo stays readable

function meta(abs) {
    const txt = fs.readFileSync(abs, 'utf8');
    return { bytes: Buffer.byteLength(txt, 'utf8'), lines: txt ? txt.replace(/\r/g, '').replace(/\n$/, '').split('\n').length : 0 };
}
function esMd(name) { const l = name.toLowerCase(); return l.endsWith('.md') || l.endsWith('.mdc') || l.endsWith('.markdown'); }
function reg(root, abs, tier, kind) { return { tier, kind, rel: path.relative(root, abs).replace(/\\/g, '/'), ...meta(abs) }; }
function esFichero(abs) { try { return fs.statSync(abs).isFile(); } catch { return false; } }

function walk(root, dir, prof, vistos, agent, docs) {
    if (prof > MAX_PROF) return;
    let ents;
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
        if (e.isDirectory()) {
            if (NO_ENTRAR.has(e.name) || e.name === '.cursor') continue;
            walk(root, path.join(dir, e.name), prof + 1, vistos, agent, docs);
            continue;
        }
        if (!e.isFile()) continue;
        const abs = path.join(dir, e.name);
        if (vistos.has(abs)) continue;
        if (ANIDADOS.has(e.name)) { vistos.add(abs); agent.push(reg(root, abs, 'agent', ANIDADOS.get(e.name))); continue; }
        if (esMd(e.name) && !BOILERPLATE.has(e.name.toLowerCase())) { vistos.add(abs); docs.push(reg(root, abs, 'doc', 'markdown')); }
    }
}

// Returns { root, total, agent, docs, truncated, files: [{ tier, kind, rel, bytes, lines }] } in stable order.
export function escanearMemoria(root0) {
    const root = rutaNativa(root0);
    const agent = [], docs = [];
    const vistos = new Set();
    // 1. fixed well-known agent-memory locations
    for (const [rel, kind] of FIJOS) { const abs = path.join(root, rel); if (esFichero(abs) && !vistos.has(abs)) { vistos.add(abs); agent.push(reg(root, abs, 'agent', kind)); } }
    // 2. Cursor project rules (.cursor/rules/*.mdc)
    try {
        const rd = path.join(root, '.cursor', 'rules');
        for (const f of fs.readdirSync(rd)) if (esMd(f)) { const abs = path.join(rd, f); if (!vistos.has(abs)) { vistos.add(abs); agent.push(reg(root, abs, 'agent', 'cursor')); } }
    } catch { /* no .cursor/rules */ }
    // 3. bounded walk: nested agent files + any other markdown that may hold memory
    walk(root, root, 0, vistos, agent, docs);
    const porRel = (a, b) => a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0;
    agent.sort(porRel); docs.sort(porRel);
    const truncated = docs.length > MAX_DOCS;
    const docsOut = truncated ? docs.slice(0, MAX_DOCS) : docs;
    const files = [...agent, ...docsOut];
    return { root, total: files.length, agent: agent.length, docs: docsOut.length, truncated, files };
}
