<p align="center">
  <img src="https://raw.githubusercontent.com/petersonsenadevs/corvusmem/main/assets/crow.png" alt="Corvusmem — the crow that remembers" width="200" />
</p>

# Corvusmem

<p align="center">
  <a href="https://www.npmjs.com/package/corvusmem"><img src="https://img.shields.io/npm/v/corvusmem?color=e07a33" alt="npm version" /></a>
  <img src="https://img.shields.io/node/v/corvusmem" alt="node" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero dependencies" />
  <img src="https://img.shields.io/badge/offline-yes-brightgreen" alt="offline" />
  <img src="https://img.shields.io/badge/license-PolyForm%20NC-blue" alt="license" />
</p>

**Deterministic, offline, zero-dependency memory for AI coding agents.** Corvusmem stores the stable facts your
agent learns, replaces and dates them, and recalls them the same way every time — in any language, with no network
and no servers. It plugs into where you already work: Claude Code / Codex (hooks) and a standalone CLI.

🌐 [Website](https://corvusmem.vercel.app) · 📖 [Docs](https://corvusmem.vercel.app/docs) · 📊 [Benchmarks](https://corvusmem.vercel.app/benchmarks) · 📦 [npm](https://www.npmjs.com/package/corvusmem)

<p align="center"><sub>Built by <b>Peterson Sena</b> (<a href="https://dev.to/r3v3rs3">r3v3rs3</a>) · the crow that remembers 🐦‍⬛</sub></p>

> **Narrative docs (what it is, the message, the Cortex, FAQ):** [`docs.md`](./docs.md). This README is the quick
> reference for structure and commands.

## Why Corvusmem
- **Deterministic** — same input, same result. No embeddings, no vector database, no model to run recall.
- **Offline & private** — the memory is a plain file you own. No server, no cloud, no API key, no telemetry.
- **Zero-dependency** — pure Node, identical on Windows, macOS and Linux.
- **Any language** — keys and values in any language; recall is language-agnostic.
- **Per-author** — on a shared project, teammates' personal facts never overwrite each other.
- **Bounded footprint** — a hard cap keeps the context cost flat (O(1), not O(n)) — see the [benchmarks](https://corvusmem.vercel.app/benchmarks).
- **See it** — the Cortex draws your whole memory as a local HTML brain.

## How it works
Your agent forgets everything between sessions. Corvusmem is a memory it keeps: facts live in a lightweight local
graph, retrieved by name, date and relevance with two-hop activation — no embeddings, no vector database, no API key.
Same input, same result. The whole memory is a file you own.

## Structure
- `src/` — the core: the facts engine (`facts.mjs`), shared base (`lib`, `messages`, `session-end`), host detection
  (`host.mjs`) and the brain hooks (`live-recall`, `session-start`, `session-state`, `live-memory`,
  `file-memory`, `facts-guard`). Same-directory imports only: self-contained, zero external dependencies.
- `cli/` — `memory.mjs`: the command line (`--save` / `--search` / `--recall` / `--context` / `--cortex`).
- `cortex/` — `cortex.mjs` + `cortex-text.mjs`: your memory as a local HTML page (the "Cortex"), no network.
- `tests/` — deterministic, LLM-free suites: `test-boundary` (clean core), `test-facts` (engine), `test-hard-recall`.

## Install

Two ways. **Install it as a plugin** if your agent supports plugins (Claude Code, Codex) — it is native, there is
nothing to wire into a project, and the memory CLI runs locally (no `npx` cold start). **Use the `npx` install** for
any agent that does not do plugins, or for a quick trial.

### As a plugin — Claude Code (recommended)
```
/plugin marketplace add petersonsenadevs/corvusmem
/plugin install corvusmem@corvusmem
```
The hooks fire natively (the same mechanism Claude uses for any plugin), everywhere, and saving/recalling runs as
`node "$CLAUDE_PLUGIN_ROOT/cli/corvusmem.mjs"` — no `npx`. Update later with `/plugin update corvusmem@corvusmem`.

### As a plugin — Codex
Add the same marketplace in the Codex app and approve the hooks (they live in `~/.codex/config.toml`). Codex consumes
the **same** plugin — `hooks/hooks.json` uses `${CLAUDE_PLUGIN_ROOT}`, and edits arrive as `apply_patch`, which the
hooks already understand.

### As an npx install (any agent, or a quick trial)
```
npx corvusmem install            # register the hooks in the current project's .claude/settings.json
npx corvusmem install --global   # for every project (~/.claude/settings.json)
npx corvusmem uninstall          # remove Corvusmem's hooks (leaves memory intact)
npx corvusmem install --dry-run  # show what it would do, without writing
```
Merge-safe (it never overwrites your hooks or permissions) and idempotent. It copies the hooks **and** the memory CLI
to a durable spot (`.corvusmem/hooks/` + `.corvusmem/cli/`, or `~/.config/corvusmem/` for `--global`), so the hooks and
the save/recall commands run via `node` — not `npx` — from then on. It also writes `.corvusmem/hooks.json` (a portable
manifest). The bare `npx corvusmem --save/--recall` still works for an agent with none of this set up (just slower).

**Per-project vs global only decides *where the hooks turn on*** — for one repo (config in that repo) or for every
project (`--global`, in your home). It does **not** change where memory lives: project facts always land in that repo's
`.corvusmem/`, your personal facts in `~/.config/corvusmem/`.

**Sharing with a team**: run **`/corvus-install`** (or `npx corvusmem install`) to bake the hooks into the current
project, then commit `.corvusmem/` (the shared project memory) and `.claude/settings.json` — teammates get Corvus firing
the moment they clone, with nothing to install. Never commit `~/.config/corvusmem/` — that is your private memory.

## Usage
Once installed, the agent captures and recalls memory on its own — you don't do a thing. Two slash commands come with
it (native — no `npx`):
- **`/corvus-cortex`** — open the Cortex: your whole memory as a local HTML "brain" (offline).
- **`/corvus-absorb`** — pull the knowledge already in the repo (CLAUDE.md, docs…) into memory, once.
- **`/corvus-install`** — bake Corvus into the current project (per-project), so you can commit it and share it.

To look at or steer memory from the **terminal** (handy for any agent, or no agent at all):
```
npx corvusmem --cortex                     # the same Cortex, from the shell
npx corvusmem --recall "stripe webhook"    # ask what it already knows
npx corvusmem --list                       # list every fact
npx corvusmem --save --dimension project.stack --value "Astro + Tailwind" --scope project
npx corvusmem --forget <id>                # drop one fact
```
The Cortex also takes `--client` (a shareable view with nothing private), `--output <dir>` and `--lang en|es|…`. Once
Corvus is installed (plugin or `npx corvusmem install`), those commands run from the local copy — no `npx` cold start.
Flags are English with Spanish aliases (`--save`/`--guardar`, `--recall`/`--recordar`); keys and values work in any
language — the memory is language-agnostic.

## Test
```
npm test
```
(or `node tests/test-boundary.mjs && node tests/test-facts.mjs && node tests/test-hard-recall.mjs`)

## License
Dual-licensed (© 2026 Peterson Sena):
- **Noncommercial use** (personal, study, hobby, nonprofit, education/public sector): free under **PolyForm
  Noncommercial 1.0.0** (`LICENSE`), keeping the credit (`Required Notice`).
- **Commercial use**: requires a separate **paid license** — see `COMMERCIAL.md` (petersonsena24@gmail.com).

This is not legal advice; for final commercial terms, consult a professional.
