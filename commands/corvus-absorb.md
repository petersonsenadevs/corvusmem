---
description: Absorb the project's existing knowledge — agent files AND the whole docs tree (architecture, decisions, feature/node specs, devlog) — into Corvus, thoroughly, so the team's memory lives in Corvus instead of only in scattered markdown.
---

You are absorbing this project's **existing** knowledge into Corvus. The goal is concrete: **after this runs, the agent should be able to work on the project without re-reading the markdown docs**, because everything in them that matters is now in memory. If you only skim `CLAUDE.md` and save a handful of facts, you have FAILED — the team will keep opening their `.md` files and Corvus adds nothing. Be **exhaustive about what matters**, selective only about noise.

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

## 2. Read EVERYTHING, then distil (this is YOUR job, not the tool's)
Read **every `agent`-tier file** in full, and **open and read every `doc`-tier file too — not a sample**. Each file in the doc tier (architecture notes, ADRs, a devlog, and every feature / node / design spec) is listed because it likely holds durable knowledge. **Judge by the content inside, never the filename.** A large `docs/` tree is the whole point — read all of it; skip a file only after reading enough to see it is pure noise. Only **ask the user** when there are so many files that reading them all is genuinely impractical; otherwise read, don't ask.

**Expect many facts — this is the part people get wrong.** A substantial doc usually yields *several* facts: its purpose, each decision and its reason, each contract/interface, each gotcha or "what didn't work". A project with N feature/node specs should produce **well more than N facts** — dozens, often 100+ for a rich repo. **Thirty facts out of thirty-plus docs means you under-read: go back and read the specs you skipped.** The point of Corvus is that the agent stops needing the `.md` files — that only works if what matters is actually in memory.

Keep every piece of **durable memory** — what should still be true next week:

- decisions, with the reason behind them (one fact per distinct decision)
- rules and conventions the team must follow
- project facts (stack, architecture, components, domains, external services, environments)
- **per-feature / per-node contracts and behaviour** (what each one does, its inputs/outputs, its rules) — one or more facts per spec
- constraints, known gotchas, "what didn't work"
- user / team preferences, open goals, pending tasks

Leave out only the **noise**: install/run steps, step-by-step how-tos, API/parameter dumps you would re-read from the doc anyway, tool tutorials, generic boilerplate, anything obvious from the code, anything transient, and anything already covered by a fact you saved. **When in doubt whether something is durable, keep it** — storage is cheap and recall only ever surfaces the few relevant facts per message, so more good facts make memory richer, never noisier.

## 3. Save each item (deterministic sink)
For every item worth keeping, run one command:

```
npx corvusmem --save --dimension <family.topic> --value "<self-contained statement>" --keys "<term-en>,<term-native>" --source agente
```

- `family` is one of: `identity`, `preference`, `project`, `goal`, `pending`, `constraint`, `note`, `fact`, `learning`, `link`.
- Make `--value` stand on its own: name the thing and use absolute dates (e.g. "Payments go through Stripe with idempotent webhooks (one key per event)", not "we use it").
- `--keys`: a few search terms, including the user's own language.
- Add `--scope usuario` only for facts true across **all** the user's projects; the default is this project.
- Make each fact **atomic** (one idea) and give it good `--keys` — that is exactly what lets you store many facts without losing any to recall.
- Corvus de-duplicates by dimension, so re-running is safe — a repeated value is not stored twice.
- If you cannot tell which family a fact belongs to, or whether two notes are the same fact, **ask the user** instead of guessing.

## 4. Report — and check coverage
Finish with: how many documents you read (out of how many `import` found), how many facts you saved (grouped by family), and — importantly — **confirm every doc-tier file contributed at least one fact**, or name the ones that did not and why. If a substantial spec produced zero facts, you skipped it: go back and read it. **Do not delete or modify the original files** — they stay as they are.
