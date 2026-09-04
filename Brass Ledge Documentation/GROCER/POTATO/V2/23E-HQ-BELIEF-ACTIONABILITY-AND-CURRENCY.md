---
type: v2-hq-belief-actionability-currency-contract
status: active
---

# HQ Belief Actionability And Currency

Backlink: [[README]]

This document closes the player-actionability consequences of evidence currency. It is narrower than general wording in [[23-HQ-BELIEF-AND-EVIDENCE]], [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] and [[23D-HQ-BELIEF-TOTALITY-AND-ORIGIN-RULES]].

# 1. Why this contract exists

A current corroborated public case can depend on a report whose current-relevance window ends after the present command.

If the player chooses to hold the source, the case may no longer be available next cycle even though the source itself remains unspent.

Hiding that distinction would create a trap:

> “Hold” would appear to preserve an opportunity that the analytical basis is about to lose.

The player must know the **current case** and the **source-use state** are different things.

# 2. Exact credible-case currency

Extend the internal credible public-case result with:

```ts
type V2HqCrediblePublicCaseBasis = {
  state: "credible-source-sensitive"
  direction: "preparation" | "coercion"
  supportingEvidenceInstanceIds: readonly [string, string]
  supportingCorroborationGroupIds: readonly [string, string]
  currentThroughCycle: 4 | 5 | 6
}
```

`currentThroughCycle` is the minimum current-through cycle of the two selected supporting occurrences.

It means:

> **If no new evidence arrives and neither support item is replaced, this exact public case remains analytically current through this cycle.**

It is not a prediction that the case will remain credible; contrary evidence can still appear earlier.

A credible case returned at Q must satisfy `currentThroughCycle >= Q`.

# 3. At-risk case flag

For a current credible case at query cycle Q < 6:

```text
caseAtRiskAfterCurrentCycle =
  currentThroughCycle == Q
```

This is safe player knowledge because it derives only from the relevance of evidence already shown to HQ.

It does not inspect future evidence or hidden world state.

# 4. C5 disclosure

When C5 public attribution is available, the player-facing action panel must show:

- the exact preparation/coercion claim;
- the exact two supporting report summaries;
- source/method and limitation for each;
- one-shot source-exposure cost;
- current authority requirement;
- whether the current case is at risk after C5.

If `caseAtRiskAfterCurrentCycle = true`, render ordinary language equivalent to:

> **This case relies on reporting that will be too old to carry the same weight after this command window unless new collection replaces or corroborates it. Holding the source does not guarantee the case will still be available next time.**

Do not say the case will definitely disappear. A C5 Lattice task may produce new C6 evidence, but its result is not known yet.

If the current two-item basis remains current through C6, do not show a false expiry warning.

# 5. Hold semantics

`hold-attribution` means only:

- source use remains `unspent`;
- no public claim is made now.

It does **not**:

- persist/freeze the current case;
- extend evidence currency;
- reserve the same claim direction;
- guarantee a C6 Hold And Expose route.

At C6, current case availability is freshly derived from all C6-current evidence plus unspent source state.

# 6. Staff recommendation and dissent

C5 staff still recommends Hold because Use is commander-only.

However, when the current case is at risk after C5, Political/Intelligence reasons must include a bounded concern equivalent to:

> **The present case may not survive another reporting cycle. Holding preserves the source, not the current evidentiary window.**

This is not a recommendation to auto-use the source. It makes the commander-only timing trade explicit.

# 7. Consequence and terminal debrief

If the player Holds a C5 case and it is no longer credible at C6:

- consequence/reveal explains whether the cause was staleness, supersession, new contrary evidence, or a combination;
- it does not say the source was “lost” or “spent”;
- source state remains unspent;
- the debrief retains the exact C5 case and support basis as historical truth.

If a new C6 report refreshes/replaces the basis, show the new current basis and preserve the old one historically.

# 8. Tentative-case disclosure

At C5/C6, when a public action would be salient but the case is tentative, safe copy may expose the primary bounded blocker from [[23D-HQ-BELIEF-TOTALITY-AND-ORIGIN-RULES]]:

- no diagnostic basis;
- no independent corroboration;
- current contrary evidence;
- competing public cases.

Do not display the internal enum or a progress bar.

The purpose is to explain why public attribution is unavailable, not to turn the screen into a prosecution checklist.

# 9. Required tests

At minimum:

- credible basis current-through is the minimum of its two support items;
- current-through can never precede query cycle;
- C5 focused-empty-supported credible case is flagged at risk where the other support persists;
- a C5 case whose two supports remain current through C6 is not flagged;
- Hold leaves source unspent and freezes no current-case fields;
- C6 re-derives case from current evidence;
- staleness can remove a held case without changing source-use state;
- C5 task result can replace/corroborate at C6 without being predicted at C5;
- action panel support summaries deep-equal the exact support IDs later frozen if Use is selected;
- at-risk concern appears in staff reasons but never changes Use into a recommendation;
- no hidden future fact enters the at-risk flag;
- terminal debrief reproduces the earlier C5 basis after the current case changes.

# 10. Rejection conditions

Reject the implementation if it:

- tells the player Hold guarantees the current case;
- persists a case merely because the source was held;
- hides known evidence expiry from a timing-sensitive commander-only choice;
- predicts unknown C6 collection results;
- changes source use from unspent when evidence becomes stale;
- auto-recommends or auto-executes source use because the case is expiring;
- rewrites the historical C5 case after C6 evidence arrives.
