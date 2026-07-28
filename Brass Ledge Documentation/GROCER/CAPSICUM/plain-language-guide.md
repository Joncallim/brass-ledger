---
type: copy-standard
project: Brass Ledger
area: product-language
status: active
tags:
  - CAPSICUM
  - copy
  - user-interface
---

# Plain Language Guide

Backlink: [[README]]

Related: [[../POTATO/game-engine-review/05-browser-design-system]], [[../POTATO/s1-s5-user-interface-model]]

This governs every string a player can read: headings, navigation, buttons, labels, help text, status, tables, tooltips, dialogs, empty states, warnings, and errors. It does not govern source comments, test names, log messages, enum values, database or API field names, or internal identifiers.

## Voice

Clear, calm, direct, competent, precise. Serious without being bureaucratic; accessible without being childish.

The player should feel the app is helping them decide, not testing whether they know its vocabulary.

Do not write corporate jargon, academic abstraction, staff-officer padding, drama, generic encouragement, or whimsy. The one deliberate exception is chief dialogue in the conversation sheet, which is written in character and should stay that way.

## Principles

1. **Write from the player's side.** Say what is happening, why it matters, what they can do, and what happens next. Do not just describe engine state.
2. **Be concrete.** "You cannot commit yet: 2 of 3 staff warnings are still unaccepted", not "Resource sufficiency constraints have not been satisfied".
3. **Use active voice.** "The convoy needs 20 more units of fuel", not "An additional fuel requirement has been identified".
4. **Turn abstract nouns back into verbs.** choose, allocate, assess, resolve, continue — not make a selection, perform an allocation, conduct an assessment, achieve resolution, initiate progression.
5. **Never print an internal identifier.** Map ids, enums, and codes to their scenario label. Web screens read these from `apps/web/src/lib/labels.ts`; engine-side prose uses `directorateLabel()` and the scenario's own `label` fields.
6. **Do not trade accuracy for simplicity.** Never blur proposed, approved, committed, executed, completed, failed, blocked, or unavailable. Never restate a number in a way that changes what it means.
7. **Explain a specialist term the first time it appears on a screen**, in one short line, then use it consistently.

## Canonical terms

Use these exact words. Do not introduce synonyms.

| Term | Means | Notes |
| --- | --- | --- |
| Month | One turn of play | The player-facing unit. The engine field stays `turn`; never show "turn" in the browser UI. |
| Campaign | One playthrough | Not "session", "save", or "game" in player-facing text. The engine field stays `session`. |
| Decision memo | One decision the player must take this month | Short form "memo" is fine after first use. |
| Option / course of action | One choice inside a memo | Buttons say "choose", not "select an option". |
| Burden | Points of work a choice loads onto a directorate | Always explain against capacity: "3/4 burden". |
| Capacity | What a staff function can absorb in one month | |
| Staff function (S1–S5) | Personnel, Intelligence, Operations, Logistics, Plans | Keep the S-codes; they are the game board. |
| Directorate | The six internal offices burden is charged to | People, Intelligence, Operations, Sustainment, Plans, Training. |
| Chief | The officer who speaks for a directorate | |
| Trust | How much a chief trusts the player, 0–100 | |
| Commitment | A promise already made and not yet closed out | |
| Accepted risk | A staff warning the player confirmed before committing | The confirmation is required; say so. |
| Replay check | Re-running a campaign from its history to confirm it still matches | Not "validation". |

### Terms that must not be simplified away

S1–S5, burden, capacity, directorate, accepted risk, commitment, escalation, deterrence, sustainment, cabinet cover, alliance alignment, incident ladder. Each is a distinct modelled thing. Explain them; do not replace them.

## Status words

| Staff function | ready · strained · overloaded · compromised |
| --- | --- |
| Metric reading | Healthy · Watch · At risk |
| Chief position | Supports · Accepts the risk · Wants conditions · Objects |
| Support for an option | Supported · Conditional · Contested · Contested + strained |
| Campaign | In progress · Won · Lost |

"Contested + strained" means a chief objects *and* the staff lane the option needs is already stretched. None of the support states prevent committing — never imply otherwise.

Two registers for the worst metric reading are intentional and should not be "unified": a badge or table cell reads **At risk**; a warning sentence reads **"… is in the risk band."** The sentence form is direction-neutral, which matters because some measures are worse when high (reserve strain, deception risk) and others when low. Do not rewrite the sentence to "has fallen to" or "is at risk of".

## Action verbs

Prefer: Choose · Commit · Continue · Open · Accept · Talk to · Check · Save to file · Delete · Start · Keep.

Buttons name the action and its object: "Commit the month", "Open decision memos", "Check replay". Never "Proceed with the commitment of this month" or "Initiate the review process".

## Errors, warnings, and blocked states

Answer as many of these as apply, in this order:

1. What went wrong.
2. Why it happened.
3. What the player must change.
4. Where they change it.

Example: "You cannot commit yet: 2 of 3 staff warnings are still unaccepted. Tick each one in *Staff risk warnings* above to confirm you are going ahead knowing the risk."

Rules:

- Never surface a raw exception. `apps/server/src/index.ts` keeps the operator's log message separate from the player's message; keep that split.
- Never surface a bare network failure. `describeError()` in `apps/web/src/lib/api.ts` handles that.
- Say what state the player's work is in: "The month was not committed. Your choices are still here."
- Destructive confirmations name the consequence: "Delete for good?" / "Yes, delete" / "Keep it".

## Empty states

Say what is missing, why, and the one action that fixes it. "No chief has a position yet, because no option is selected. Go back to the memos and choose an option." Not "No data".

## Phrases to avoid

resolve the outstanding decision state · non-actionable · materialise · operational posture (as a UI label) · leverage · utilise · docket · packet (as a UI label) · surface (as a verb) · the room (in UI chrome — fine inside chief dialogue) · lane (as a UI label) · projected (prefer "forecast") · validate (prefer "check").

## Before you ship a string

- Would someone who has never read the code know what to do next?
- Does it name a real thing the player can see on screen?
- Does it change any number, condition, or state distinction? If so, stop.
- Is it the same word this guide already uses for that concept?
