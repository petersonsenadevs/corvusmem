---
description: Bake Corvusmem's hooks into the CURRENT project (not global), so the project carries its own memory and a teammate who receives it gets Corvus working with nothing to install. A local command, not an npx call.
---

Install **Corvusmem into this project** (per-project, not global). This writes the hooks and the memory CLI into the project's own `.corvusmem/` and wires `.claude/settings.json` with a portable `${CLAUDE_PROJECT_DIR}` path — so if the user **commits `.corvusmem/` and `.claude/settings.json`**, anyone who clones or receives the project has Corvus firing in Claude Code or Codex **without installing anything** (no plugin, no global setup).

Run it with the **fastest local path available** — do not default to `npx` (that is only the fallback for an agent with nothing installed). Use the first of these that applies:

- **Installed as a plugin** (the `CLAUDE_PLUGIN_ROOT` env var is set): `node "$CLAUDE_PLUGIN_ROOT/cli/corvusmem.mjs" install`
- **Nothing installed** (fallback only): `npx corvusmem install`

It is merge-safe (never overwrites the user's own hooks or permissions) and idempotent. Do **not** pass `--global` here — that would turn the hooks on for every project instead of baking them into this one. After it runs:

- Tell the user it installed into **this project only**, and that to share it they should commit `.corvusmem/` and `.claude/settings.json`.
- Note that `.corvusmem/cortex/` is generated (it ignores itself), and `.corvusmem/memory/` holds the project's facts — commit it to share the memory, or leave it out to keep each person's separate. Their personal memory lives in `~/.config/corvusmem/` and is never shared.

Pick the user's language for anything you say. Never invent what the command did — report what it actually printed.
