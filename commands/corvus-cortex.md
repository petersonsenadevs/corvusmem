---
description: Open the Cortex — the user's Corvusmem memory drawn as a local, offline HTML "brain" (facts, goals, decisions, each in its zone). A local command, not an npx call.
---

Open the **Cortex** for the user: Corvusmem's whole memory (project facts, open goals, decisions, the memory map) rendered as a single local HTML "brain" that works offline and follows the page's light/dark theme.

Run it with the **fastest local path available** — do not default to `npx` (that is only the fallback for an agent with nothing installed). Use the first of these that applies:

- **Installed as a plugin** (the `CLAUDE_PLUGIN_ROOT` env var is set): `node "$CLAUDE_PLUGIN_ROOT/cli/corvusmem.mjs" --cortex`
- **Per-project install** (`.corvusmem/cli/corvusmem.mjs` exists): `node "$CLAUDE_PROJECT_DIR/.corvusmem/cli/corvusmem.mjs" --cortex`
- **Global install** (`~/.config/corvusmem/cli/corvusmem.mjs` exists): `node "<that path>" --cortex`
- **Nothing installed** (fallback only): `npx corvusmem --cortex`

Pick the user's language for anything you say. The command writes a local HTML file and prints its path — tell the user the path so they can open it. Add `--cliente` for a client-facing view, or `--idioma en|es` to force the language. It renders only what is actually stored; never invent memory that is not there.
