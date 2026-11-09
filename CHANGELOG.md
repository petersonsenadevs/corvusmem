# Changelog

All notable changes to **Corvusmem** are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/); versions follow [SemVer](https://semver.org/).

## [Unreleased]
### Improved
- **Clearer bar for what to save (less agent variance).** The save prompt is now one concrete, positive checklist
  (`save.criterios`) — decision made, limit/constraint found, stable preference, external fact with a name/figure,
  a gotcha and its cause, a goal/pending — with the test "would you need it next time and it's not in the code?".
  The same bar is shown at session start and at the close nudge (it replaced the vague "did the user say anything
  stable?" that invited a "no"), so different agents converge on saving the same things.
- **Recall understands more paraphrases, deterministically.** The concept lexicon that already powers cross-language
  recall gained the missing concepts (`indentation`, `office`, `deploy`, `fee/charge`), so a query phrased differently
  from the stored fact (`sangrar`≈indent, `publicar`≈deploy, `sede`≈office, `charge`≈cobra) now finds it — no
  embeddings, no network. On the adversarial battery: injected hit@5 **63.6 % → 90.9 %** with **abstention held at
  100 %** (never recall more by inventing more). The one query that still misses is one the engine *should* decline —
  it names something memory never heard (`API`), so it stays silent on purpose ("knows what it doesn't know"); the
  battery now tracks that as an abstention check, not a recall miss.
### Added
- **The memory battery is now a CI gate.** `npm test` runs `eval-memoria --gate`, which fails the build if recall or
  honesty regress: injected hit@5 must stay ≥ 90 %, abstention must stay 100 %, near-duplicate guard 100 %, and the
  battery can't be gutted (a minimum case count). The reliability work can't silently rot.
- **Memory reliability battery (`tools/eval-memoria/`).** A deterministic, LLM-free adversarial eval of the recall
  engine — paraphrase, synonyms, cross-language, temporal and trap queries — that reports **hit@5**, **injected hit@5**
  (≥ threshold), **abstention precision**, **near-duplicate guard** and **ms/query**, and writes `resultados.json`.
  This is the baseline and, later, the regression gate for the F15 "reliable memory" work. First baseline
  (2026-11-09): hit@5 81.8 % · injected 63.6 % · abstention 100 % · dedup 100 % · ~2 ms/query.

## [0.5.3] — 2026-11-09
### Added
- **Ready for the Anthropic plugin directory.** The generated plugin now ships a square listing **icon**
  (`.claude-plugin/icon.png` — the crow on a dark background), a `displayName`, and a plain `https://` `repository`
  URL (the directory drops `git+…`/`.git`). `claude plugin validate --strict ./plugins/corvusmem` now passes clean,
  so Corvusmem can be submitted to the directory at claude.ai/directory/manage (the git marketplace still works as-is).
### Added
- **`/corvus-install` — bake Corvusmem into a project, as a command.** A new slash command (bundled in the plugin and
  in `.claude/commands/`) installs the hooks into the **current** project so it carries its own memory. Commit
  `.corvusmem/` and `.claude/settings.json` and a teammate who receives the project gets Corvus firing in Claude Code
  or Codex **with nothing to install**. `install.mjs` now ships inside the plugin and runs from it (the core is resolved
  from `hooks/` when there is no `src/`), so the command works natively — `npx corvusmem install` stays as the fallback.
- **Collapsible Cortex side panel.** The Cortex's right panel now has a header and a collapse button; hide it and the
  brain fills the width, with a floating button to bring it back (remembered per viewer). The panel also got a lighter
  touch: a search icon, section dividers and a cleaner header.
### Fixed
- **`corvusmem import` ran only from the repo, not the plugin** — `cli/import.mjs` imported the engine from `../src/`,
  which does not exist inside the plugin (the core is in `hooks/`), so `/corvus-absorb` crashed when Corvus was
  installed as a plugin. It now resolves the engine from `src/` or `hooks/`, whichever is present.
- **The Cortex was written to a loose `cortex/` folder at the project root.** It now always renders inside
  `.corvusmem/cortex/`, next to the memory it draws — never a stray folder in the root (or in `senzu/`).

## [0.5.1] — 2026-11-08
### Changed
- **The Cortex gets a header with the crow.** The full Cortex (`/corvus-cortex`) now shows the Corvusmem crow in its
  header beside the wordmark (with a soft amber glow), and the dark palette is lifted to a slightly warmer neutral —
  subtle and un-saturated. The brain itself (2D and 3D) is unchanged. The footer now credits **Corvusmem** (it said
  "Senzu") in all six languages.
### Added
- **Authorship across the codebase.** Author byline in every core source file (`src/`, `cli/`, `cortex/`, `install.mjs`),
  `author` in `package.json`, a credit in the README, and an `author` meta tag plus a visible footer credit in the
  generated Cortex HTML.

## [0.5.0] — 2026-11-08
### Added
- **Install Corvus as a native plugin — Claude Code and Codex.** The repo is now a Claude Code **marketplace**
  (`.claude-plugin/marketplace.json` + a committed `plugins/corvusmem/`), so you install it the way you install any
  plugin instead of wiring hooks into a project:
  ```
  /plugin marketplace add petersonsenadevs/corvusmem
  /plugin install corvusmem@corvusmem
  ```
  The hooks fire natively (the host's own plugin mechanism), everywhere, with nothing to maintain. Codex consumes the
  **same** plugin (`hooks/hooks.json` uses `${CLAUDE_PLUGIN_ROOT}`; edits arrive as `apply_patch`). `npx corvusmem install`
  stays as the path for agents without plugin support, or a quick trial. Generate/refresh both with
  `node install.mjs --marketplace` (the release flow runs it so the plugin always carries the current version and hooks).
- **`/corvus-cortex` — open the Cortex as a command, not an `npx` call.** A new slash command (bundled in the plugin
  and in `.claude/commands/`) opens your memory as a local HTML "brain" via the local CLI, falling back to `npx` only
  when nothing is installed. The Cortex renderer (`cortex/`) now ships with the plugin and the install, so `--cortex`
  runs locally without `npx`.
- **Fast save/recall — no more `npx` cold start.** The memory CLI now ships *next to* the hooks — in the plugin
  (`$CLAUDE_PLUGIN_ROOT/cli/`), in a per-project install (`.corvusmem/cli/`) and in a global one
  (`~/.config/corvusmem/cli/`). The hooks pick the fastest available invocation (`node ".../cli/corvusmem.mjs"`) and
  fall back to `npx corvusmem` only for an agent that has none of it installed. So once Corvus is installed, the agent
  saving a fact no longer pays npm's resolve-and-spawn cost on every call.

## [0.4.0] — 2026-11-08
### Changed
- **Corvus is the memory owner — its hooks are the ones that fire, Senzu defers to it.** When Corvus is installed
  (per-project or global), it OWNS the memory: its hooks inject and capture as normal, and Senzu steps back from memory
  (its recall/capture/facts hooks yield to Corvus, and its session-start drops the facts block) while keeping everything
  else — method, plan, devlog, guards. Before, both layers shared a first-wins handshake and Senzu (listed first) won,
  so Corvus looked like it "did nothing". Now the split is deterministic and Corvus's memory is what you see.
  *(Requires the matching Senzu release that defers to Corvus; update the Senzu plugin too.)*
- **One stable store, and it adopts what Senzu had.** Project facts always live in Corvus's own
  `.corvusmem/memory/facts.jsonl` (English, visible) — never in `senzu/memoria/hechos.jsonl`, and the location never
  flips when Senzu is added or removed. When Corvus lands on a project that already used Senzu, it **adopts** the facts
  from `senzu/memoria/hechos.jsonl` into its own store once (a copy, so nothing is lost and it is reversible), and never
  clobbers facts it already has.
- **The installer says so.** Installing into a project that already uses Senzu now prints that Corvus owns the memory
  there (it adopts Senzu's facts and Senzu defers), and to update the Senzu plugin so it steps back.

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
