#!/usr/bin/env node
// `corvusmem import` — list the memory documents already in this project, in two tiers, so the agent
// (via /corvus-absorb) can read them and save what matters. Deterministic, offline, READ-ONLY: it writes
// nothing to memory. `--json` prints the machine-readable contract the command consumes.
import { escanearMemoria } from '../src/import.mjs';

const argv = process.argv.slice(2);
const json = argv.includes('--json');
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const r = escanearMemoria(root);

if (json) { process.stdout.write(JSON.stringify(r, null, 2) + '\n'); process.exit(0); }

if (!r.total) {
    process.stdout.write('No existing memory documents found (CLAUDE.md, AGENTS.md, MEMORIA.md, Cursor rules, docs/*.md…).\n');
    process.exit(0);
}
const KIND = { claude: 'Claude', agents: 'AGENTS.md', gemini: 'Gemini', copilot: 'Copilot', cursor: 'Cursor', windsurf: 'Windsurf', senzu: 'Senzu', markdown: 'markdown' };
const line = f => `  • ${f.rel}  (${KIND[f.kind] || f.kind}, ${f.lines} lines)\n`;
const agent = r.files.filter(f => f.tier === 'agent');
const docs = r.files.filter(f => f.tier === 'doc');

process.stdout.write(`Found ${r.total} document${r.total > 1 ? 's' : ''} Corvus can absorb:\n\n`);
if (agent.length) { process.stdout.write(`Agent memory (${agent.length}):\n`); for (const f of agent) process.stdout.write(line(f)); }
if (docs.length) {
    if (agent.length) process.stdout.write('\n');
    process.stdout.write(`Other markdown that may hold memory (${docs.length}):\n`);
    for (const f of docs) process.stdout.write(line(f));
    if (r.truncated) process.stdout.write('  … more not shown\n');
}
process.stdout.write('\nRun /corvus-absorb inside Claude Code to read them and save what matters into memory.\n');
process.exit(0);
