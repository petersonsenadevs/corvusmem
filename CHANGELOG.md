# Changelog

All notable changes to **Corvusmem** are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

## [0.4.0] — 2026-11-08
### Changed
- **Corvus now owns one stable memory store, and never fights Senzu.** Project facts always live in Corvus's own
  `.corvusmem/memory/facts.jsonl` (English, visible) — Corvus no longer writes into Senzu's `senzu/memoria/hechos.jsonl`
  when Senzu is present. Before, the store location *flipped* with Senzu's presence, so memory jumped folders (and was
  orphaned) whenever Senzu was added to or removed from a project. The store is now fixed: add Senzu, remove Senzu —
  the facts stay put in `.corvusmem/` and are never lost.
- **No double hooks, no split memory — deterministic.** When a **real** Senzu install is present (its `senzu.json`
  marker, or a legacy `.dev-standards.json`), Corvus's memory hooks **stand down** (session-start, live-recall,
  live-memory, file-memory, facts-guard, session-state): Senzu runs the very same engine, so it becomes the single
  injector. No more racing hand-off where either layer might win and inject a second memory block. A **stray** `senzu/`
  folder without a marker does not trigger this — a globally-installed Senzu can't silence a standalone Corvus. Corvus
  keeps its own `.corvusmem/` store the whole time, so if Senzu is ever removed, Corvus wakes up with its memory intact.
- **The installer says so.** Installing into a project that already uses Senzu now prints a note that Corvus will stand
  its hooks down there (and take over automatically if Senzu is removed). The hooks are still registered so nothing
  breaks on that transition. (`--global` does not warn — it can't know which projects will have Senzu.)

## [0.3.4] — 2026-11-07
### Changed
- **`/corvus-absorb` is now exhaustive by design.** The command states its real goal up front — *after it runs, the
  agent should be able to work without re-reading the markdown docs* — and instructs the agent to open and read
  **every** doc-tier file (not a sample), expect **many facts** (dozens, often 100+ for a rich repo; one or more per
  feature/node spec), and **check coverage** at the end (every substantial doc must contribute at least one fact). It
  also corrects the misconception that fewer facts is better: the per-message cap is on *injection*, not *storage*, so
  more good atomic facts make memory richer, never noisier. Still skips noise (how-tos, API dumps, boilerplate).

## [0.3.3] — 2026-11-07
### Fixed
- **A stray `senzu/` folder no longer hijacks Corvus's standalone memory.** Corvus coupled to Senzu whenever a
  `senzu/` directory existed — but a **globally-installed Senzu** writes `senzu/memoria/` into *any* project its
  hooks touch, so in a Corvus-only project the memory got split between `senzu/` and `.corvusmem/` and never
  migrated to English. Corvus now couples only to a **real Senzu install** (its `senzu.json` marker, or a legacy
  `.dev-standards.json`/root `devlog` layout); a bare `senzu/` folder is ignored and Corvus keeps its own
  `.corvusmem/memory/`.

## [0.3.2] — 2026-11-07
### Changed
- **`/corvus-absorb` now mines the whole doc tier, not just `CLAUDE.md`.** The command was too conservative with
  `doc`-tier files (it judged by filename and asked/skipped by default), so a repo with a rich `docs/` tree —
  architecture notes, ADRs, a devlog, per-feature specs — yielded only the handful of facts in `CLAUDE.md`. It now
  **reads** the architecture/decisions/devlog/feature docs and extracts every distinct durable decision, rule and
  gotcha (dozens for a rich project), asking the user only as an exception — while still skipping tutorials,
  how-tos, API dumps and boilerplate. No engine change; the judgment stays the agent's.

## [0.3.1] — 2026-11-07
### Fixed
- **Standalone memory folder is now English.** When Corvus runs on its own (no Senzu), project facts live in
  `.corvusmem/memory/facts.jsonl` (and corrupted lines in `facts.corrupt.jsonl`) instead of the Spanish
  `memoria/hechos.jsonl` — consistent with the English-first product. **Coupled to Senzu it is unchanged**
  (`senzu/memoria/hechos.jsonl`, shared with Senzu), and the user-global memory is unchanged too. Existing
  standalone installs are **migrated automatically and idempotently** on first read or write: the old
  `.corvusmem/memoria/` is renamed to `.corvusmem/memory/` with the facts intact, so nothing is lost.

## [0.3.0] — 2026-11-05
### Added
- **Standalone project folder.** In a project without Senzu, Corvus now keeps its memory in its own
  `.corvusmem/` directory (facts + `MEMORIA.md`) instead of `senzu/`. With Senzu present it still couples to
  `senzu/` (expected); an existing `.corvusmem/` is kept, and legacy Senzu layouts are untouched.
- **`corvusmem import`.** Deterministic, offline, read-only discovery of the memory documents already in a project,
  in two tiers: `agent` — known agent-memory files (`CLAUDE.md`/`CLAUDE.local.md` incl. nested, `AGENTS.md`, `GEMINI.md`,
  `.github/copilot-instructions.md`, Cursor rules, a Senzu `MEMORIA.md`) — and `doc` — any other markdown in subfolders
  that may hold memory (e.g. `docs/architecture.md`, `notes/decisions.md`), minus boilerplate (README, CHANGELOG, LICENSE…).
  `--json` prints the machine contract.
- **`/corvus-absorb` command.** Installed into `.claude/commands/` (and bundled in the Codex/Claude plugin). It reads
  the documents `import` finds, judges what is durable memory, **asks the user when a `doc`-tier file or a fact's family
  is unclear**, and saves the rest with `corvusmem --save` — so teammates keep what they already wrote instead of
  starting over. The engine stays deterministic; the judgment is the agent's.

## [0.2.2] — 2026-11-05
### Fixed
- **Portable, durable hook paths.** `install` now copies the hook files into a stable location (`.corvusmem/hooks/`
  per project, `~/.config/corvusmem/hooks/` for a global install) and references them with `${CLAUDE_PROJECT_DIR}`
  (per-project) or an absolute path (global) — instead of the ephemeral `npx` cache path (`…/_npx/<hash>/…`). This
  fixes hooks silently not running after npx clears its cache, on a fresh reinstall, or when a committed project
  `.claude/settings.json` + `.corvusmem/` is shared with a teammate (now portable across machines and OSes). A
  reinstall also removes any old npx-path entries. `uninstall` removes the copied hooks but keeps your memory.

## [0.2.1] — 2026-11-05
### Changed
- The memory-map **zone names** now follow the UI language (English by default, Spanish with `CORVUS_LANG`/marker
  `lang`), closing the last Spanish label in the injected memory map.

## [0.2.0] — 2026-11-05
### Changed
- **Standalone context is now memory-only and English-first.** When Corvusmem is installed on its own, the
  `SessionStart` hook injects **only memory** (facts, open goals/todos, obsolescence/contradiction notices, the memory
  map and last-session continuity) — the work-method block (plan, skills, devlog, stack, design system, conventions)
  is gone. Output defaults to **English** via the message catalog (`CORVUS_LANG`/marker `lang` switch it back to
  Spanish). The per-message recall hook is rebranded `[Corvusmem]` and in-context hints now use `npx corvusmem`.
- **Family labels shown in English** (`identity`, `preference`, `project`, `goal`, `pending`, `constraint`, `note`,
  `fact`, `learning`, `link`) in the CLI and the injected context. The internal canonical keys and the `.jsonl` files
  are unchanged, and input still accepts both English and Spanish family names.

## [0.1.3] — 2026-11-04
### Added
- README: badges (npm, node, zero-deps, offline, license), a **Why Corvusmem** list, a **Usage** section with the
  everyday commands, and Website/Docs/Benchmarks/npm links.
### Changed
- Docs (README + `docs.md`): clarified that **per-project vs global only decides where the hooks turn on**, not where
  memory lives (project facts always land in the repo's `.corvusmem/`), plus a **team-sharing recipe** (commit
  `.corvusmem/` and, for a per-project install, `.claude/settings.json`; never commit `~/.config/corvusmem/`).

## [0.1.2] — 2026-11-03
### Fixed
- `homepage` points to the live site `https://corvusmem.vercel.app` (the `.com` domain isn't registered yet).

## [0.1.1] — 2026-11-03
### Fixed
- `LICENSE` now names **Corvusmem** (the rename had missed it — it was still "Hemispheric").
- `repository`, `bugs` and the README crow image point to `petersonsenadevs/corvusmem`.
### Added
- Release flow: `test:core` (deterministic suites, no browser) + `preversion`/`prepublishOnly` gates, and this CHANGELOG.

## [0.1.0] — 2026-11-03
### Added
- First public release: **deterministic, offline, zero-dependency memory** for AI coding agents (Claude Code, Codex) and a standalone CLI.
- `corvusmem install` / `corvusmem uninstall` — merge-safe and idempotent; registers the brain hooks (capture, recall, session memory).
- **Facts engine**: dated substitution, two-hop recall, keys in any language, and **per-author memory** so teammates on a shared project don't overwrite each other.
- **The Cortex**: your memory as a local HTML brain (`corvusmem --cortex`); offline, and it follows the host page's light/dark theme.
- **Dual license**: PolyForm Noncommercial (free for noncommercial use) + a separate paid commercial license (`COMMERCIAL.md`).

---

<!--
Releasing a new version:
  1. Move the notes under "## [Unreleased]" into a new "## [x.y.z] — YYYY-MM-DD" section.
  2. npm version patch | minor | major     (bumps package.json, runs test:core, creates a git tag)
  3. git push --follow-tags
  4. npm publish --access public            (runs test:core first via prepublishOnly)
SemVer: patch = fix · minor = backwards-compatible feature · major = breaking change.
-->
