---
description: Absorb the project's existing memory (CLAUDE.md, AGENTS.md, Cursor rules, a Senzu MEMORIA.md) into Corvus so nothing the team already wrote is lost.
---

You are absorbing this project's **existing** memory into Corvus. The goal: a teammate adopting Corvus keeps everything they already wrote, instead of starting from scratch.

**Speak the user's language.** Every question, confirmation and the final report go in the language the user writes to you in (Spanish, etc.) — only this command's name and the saved `--keys` identifiers stay in English (and `--keys` should also include the user's own language).

## 1. Find the documents (deterministic — let the tool do this)
Run:

```
npx corvusmem import --json
```

It returns the memory documents already in the repo in two tiers (`{ agent, docs, truncated, files: [{ tier, kind, rel, lines }] }`):

- **`tier: "agent"`** — known agent-memory files (CLAUDE.md, AGENTS.md, Cursor/Copilot/Gemini rules, a Senzu MEMORIA.md). High confidence: read and absorb these.
- **`tier: "doc"`** — other markdown that *may* hold memory, found in subfolders (e.g. `docs/architecture.md`, `notes/decisions.md`). These are candidates, not certainties.

If the list is empty, say so and stop. If `truncated` is true, mention that more markdown exists than was shown.

## 2. Read and judge (this is YOUR job, not the tool's)
Read every **`agent`**-tier file. For **`doc`**-tier files, open the ones whose name or location suggests memory (architecture, decisions, conventions, ADRs, domain notes); **when it is unclear whether a `doc` file is worth absorbing, ask the user** — list the file(s) and ask which to include, rather than guessing or dumping everything.

From whatever you read, keep **only durable memory** — what should still be true next week:

- decisions, with the reason behind them
- rules and conventions the team must follow
- user / team preferences
- project facts (stack, architecture, domains, external services, environments)
- constraints, known gotchas, "what didn't work"
- open goals or pending tasks

Ignore the noise: install/run steps, generic boilerplate, tool tutorials, anything obvious from the code, and anything transient.

## 3. Save each item (deterministic sink)
For every item worth keeping, run one command:

```
npx corvusmem --save --dimension <family.topic> --value "<self-contained statement>" --keys "<term-en>,<term-native>" --source agente
```

- `family` is one of: `identity`, `preference`, `project`, `goal`, `pending`, `constraint`, `note`, `fact`, `learning`, `link`.
- Make `--value` stand on its own: name the thing and use absolute dates (e.g. "Payments go through Stripe with idempotent webhooks (one key per event)", not "we use it").
- `--keys`: a few search terms, including the user's own language.
- Add `--scope usuario` only for facts true across **all** the user's projects; the default is this project.
- Corvus de-duplicates by dimension, so re-running is safe — a repeated value is not stored twice.
- If you cannot tell which family a fact belongs to, or whether two notes are the same fact, **ask the user** instead of guessing.

## 4. Report
Finish with a short summary: how many documents you read, how many facts you saved (grouped by family), and anything you deliberately skipped and why. **Do not delete or modify the original files** — they stay as they are.
