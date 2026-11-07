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
Read **every `agent`-tier file** in full.

For the **`doc`-tier**, **actually open and read** the files that usually carry durable memory — anything under `architecture/`, `decisions/`, `adr/`, `devlog/` or `notes/`, and design or feature specs (`features/…`, `*-design.md`, `*-spec.md`, `roadmap*`). **Judge by the content inside, not the filename**: do not skip a file just because it is not called `decisions.md`, and a large `docs/` tree is normal, not a reason to stop. **Prefer reading over skipping, and reading over asking.** Only **ask the user** when a file's relevance is genuinely ambiguous, or when there are so many candidates that reading them all is impractical — then list them and ask which to include. Asking is the exception.

From everything you read, keep **only durable memory** — what should still be true next week:

- decisions, with the reason behind them (one fact per distinct decision)
- rules and conventions the team must follow
- user / team preferences
- project facts (stack, architecture, domains, external services, environments)
- constraints, known gotchas, "what didn't work"
- open goals or pending tasks

Be **thorough**: a rich project may yield dozens of facts across its architecture, feature and devlog docs — capture each distinct decision, rule and gotcha, not just the ones in `CLAUDE.md`. But do **not** mirror the docs: skip install/run steps, step-by-step how-tos, API/parameter dumps, tool tutorials, generic boilerplate, anything obvious from the code, anything transient, and anything already covered by a fact you saved.

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
