# Changelog

All notable changes to **Corvusmem** are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

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
