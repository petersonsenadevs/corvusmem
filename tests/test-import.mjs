#!/usr/bin/env node
// Suite for memory import DISCOVERY (src/import.mjs): deterministic, offline, read-only.
// Two tiers: 'agent' (known agent-memory files, incl. nested) and 'doc' (other markdown in subfolders
// that may hold memory, minus boilerplate). It must skip heavy/own/template dirs, never duplicate, never
// write, respect the depth bound, and return a stable sorted order — the contract /corvus-absorb relies on.
//   node tests/test-import.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'corvus-import-'));
const { escanearMemoria } = await import(pathToFileURL(path.join(ROOT, 'src', 'import.mjs')).href);
let casos = 0, fallos = 0;
const ok = (c, n, d = '') => { casos++; if (!c) { fallos++; process.stdout.write(`FAIL ${n}${d ? ' -> ' + d : ''}\n`); } };
const write = (root, rel, txt = '# doc\n') => { const abs = path.join(root, rel); fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, txt); };
const mk = n => { const d = path.join(base, n); fs.mkdirSync(d, { recursive: true }); return d; };

// 0. empty project -> nothing found, never throws
const E = mk('empty');
let r = escanearMemoria(E);
ok(r.total === 0 && r.agent === 0 && r.docs === 0 && Array.isArray(r.files) && r.files.length === 0, 'empty project -> 0 docs', JSON.stringify(r));

// 1. full fixture tree
const P = mk('proj');
// agent-tier
write(P, 'CLAUDE.md', '# Claude memory\n\n- decision: use Vite\n');
write(P, 'AGENTS.md', '# Agents\n');
write(P, 'packages/app/CLAUDE.md', '# nested\n');                   // nested agent file
write(P, '.cursor/rules/style.mdc', '---\n# cursor rule\n');       // cursor rules
write(P, '.github/copilot-instructions.md', '# copilot\n');        // fixed path (though .github is skipped in walk)
write(P, 'senzu/devlog/MEMORIA.md', '# project memory\n');         // Senzu memory (fixed path)
// doc-tier (generic markdown in subfolders)
write(P, 'docs/architecture.md', '# architecture\n');
write(P, 'notes/decisions.md', '# decisions\n');
// must be EXCLUDED
write(P, 'README.md', '# readme\n');                               // boilerplate
write(P, 'CHANGELOG.md', '# changelog\n');                         // boilerplate
write(P, 'docs/README.md', '# readme\n');                          // boilerplate anywhere
write(P, 'node_modules/dep/CLAUDE.md', '# junk\n');                // heavy dir skipped
write(P, '.corvusmem/CLAUDE.md', '# own store\n');                 // own dir skipped
write(P, 'senzu/notes/CLAUDE.md', '# inside senzu\n');             // senzu/ not walked (only its fixed MEMORIA.md)
write(P, '.github/ISSUE_TEMPLATE/bug.md', '# template\n');         // .github skipped in walk
write(P, 'a/b/c/d/e/f/CLAUDE.md', '# too deep\n');                 // beyond MAX_PROF -> skipped
r = escanearMemoria(P);
const rels = r.files.map(f => f.rel);
const tier = rel => (r.files.find(f => f.rel === rel) || {}).tier;
const kind = rel => (r.files.find(f => f.rel === rel) || {}).kind;

// counts
ok(r.agent === 6, 'agent tier: 6 known agent-memory files', String(r.agent) + ' -> ' + rels.join(', '));
ok(r.docs === 2, 'doc tier: 2 generic markdown docs', String(r.docs));
ok(r.total === 8, 'total = agent + docs = 8', String(r.total));

// agent-tier membership + kind
ok(tier('CLAUDE.md') === 'agent' && kind('CLAUDE.md') === 'claude', 'CLAUDE.md -> agent/claude');
ok(tier('AGENTS.md') === 'agent' && kind('AGENTS.md') === 'agents', 'AGENTS.md -> agent/agents');
ok(tier('packages/app/CLAUDE.md') === 'agent', 'nested CLAUDE.md -> agent');
ok(tier('.cursor/rules/style.mdc') === 'agent' && kind('.cursor/rules/style.mdc') === 'cursor', 'cursor rule -> agent/cursor');
ok(tier('.github/copilot-instructions.md') === 'agent' && kind('.github/copilot-instructions.md') === 'copilot', 'copilot (fixed path) -> agent/copilot');
ok(tier('senzu/devlog/MEMORIA.md') === 'agent' && kind('senzu/devlog/MEMORIA.md') === 'senzu', 'Senzu MEMORIA.md -> agent/senzu');

// doc-tier membership + kind
ok(tier('docs/architecture.md') === 'doc' && kind('docs/architecture.md') === 'markdown', 'docs/architecture.md -> doc/markdown');
ok(tier('notes/decisions.md') === 'doc', 'notes/decisions.md -> doc');

// exclusions
ok(!rels.includes('README.md') && !rels.includes('CHANGELOG.md') && !rels.includes('docs/README.md'), 'boilerplate (README/CHANGELOG) excluded', rels.join(', '));
ok(!rels.some(x => x.includes('node_modules')), 'node_modules skipped');
ok(!rels.includes('.corvusmem/CLAUDE.md'), 'own .corvusmem/ skipped');
ok(!rels.includes('senzu/notes/CLAUDE.md'), 'senzu/ not walked (only its fixed MEMORIA.md)');
ok(!rels.some(x => x.includes('ISSUE_TEMPLATE')), '.github templates skipped');
ok(!rels.some(x => x.includes('a/b/c/d/e/f')), 'depth beyond MAX_PROF skipped');

// ordering: agent block first, docs block after, each sorted by rel
const esperado = ['.cursor/rules/style.mdc', '.github/copilot-instructions.md', 'AGENTS.md', 'CLAUDE.md',
    'packages/app/CLAUDE.md', 'senzu/devlog/MEMORIA.md', 'docs/architecture.md', 'notes/decisions.md'];
ok(JSON.stringify(rels) === JSON.stringify(esperado), 'stable order: agent (sorted) then doc (sorted)', rels.join(', '));
ok(JSON.stringify(escanearMemoria(P)) === JSON.stringify(r), 'same input -> identical output');
ok(rels.filter(x => x === 'CLAUDE.md').length === 1, 'root CLAUDE.md listed once (no dup)');

// read-only: scanning writes nothing
const antes = fs.readdirSync(P).sort().join(',');
escanearMemoria(P);
ok(fs.readdirSync(P).sort().join(',') === antes, 'scan is read-only (no new files/dirs)');

// 2. edge content: empty file, CRLF, BOM -> counted, no crash
const W = mk('weird');
write(W, 'CLAUDE.md', '');                                         // empty
write(W, 'docs/notes.md', '﻿line1\r\nline2\r\n');             // BOM + CRLF, 2 lines, doc tier
r = escanearMemoria(W);
ok(r.agent === 1 && r.docs === 1, 'weird files still discovered in both tiers', JSON.stringify(r.files));
ok((r.files.find(f => f.rel === 'CLAUDE.md') || {}).lines === 0, 'empty file -> 0 lines');
ok((r.files.find(f => f.rel === 'docs/notes.md') || {}).lines === 2, 'CRLF counted as 2 lines', String((r.files.find(f => f.rel === 'docs/notes.md') || {}).lines));

// 3. a directory named like a memory file must not be picked up as a file
const D = mk('dirtrap');
fs.mkdirSync(path.join(D, 'CLAUDE.md'), { recursive: true });      // a DIR called CLAUDE.md
write(D, 'docs/real.md');                                          // a real doc alongside
r = escanearMemoria(D);
ok(r.agent === 0 && r.docs === 1, 'a directory named CLAUDE.md is not a document', JSON.stringify(r.files));

fs.rmSync(base, { recursive: true, force: true });
process.stdout.write(`Casos: ${casos}  Fallos: ${fallos}\n`);
process.exit(fallos ? 1 : 0);
