---
type: implementation-spec
project: Brass Ledger
area: browser-interface
status: proposed
tags:
  - POTATO
  - plain-language
  - staff-readouts
  - explainability
---

# Plain-language contract follow-up

## Decision

The next implementation should close two remaining contract failures exposed by the plain-language rewrite:

1. `StaffFunctionReadout.consequence` still conflates a live warning with static doctrine copy.
2. The briefing still renders raw active event IDs, despite the new rule that player-facing screens must never expose internal identifiers.

These should be fixed together because both are failures at the boundary between the engine's data contract and the browser's player-facing explanation layer. This is not another general copy pass.

## Why this is next

PR #67 substantially improved the language, but it also established explicit product rules that the current implementation still breaks:

- player-facing state must distinguish current conditions from standing background information;
- internal IDs must be mapped to scenario labels;
- warnings must tell the player what is happening now and why it matters;
- neutral explanatory copy must not inherit warning styling.

Until these are corrected, the browser can present static doctrine as if it were a current problem and can expose opaque event codes in the monthly briefing.

## Scope

### 1. Replace the ambiguous staff readout field

In `packages/shared/src/index.ts`, replace:

```ts
consequence: string
```

with explicit fields:

```ts
activeWarning: string | null
standingRemit: string
```

`warnings` remains the complete ordered warning list. `activeWarning` is a convenience field for the highest-priority warning and must always equal `warnings[0] ?? null`. `standingRemit` must always equal the corresponding `StaffFunctionDefinition.doctrineNote`.

Do not retain `consequence` as a compatibility alias. This is an internal pre-release contract and keeping the ambiguous field would allow new consumers to continue using it incorrectly.

### 2. Update the readout builder

In `buildStaffFunctionReadouts`:

```ts
activeWarning: warnings[0] ?? null,
standingRemit: definition.doctrineNote,
```

The builder must preserve warning order and all existing status, burden, capacity, metric, and failure-mode calculations.

Add an invariant-level test proving:

- no warning: `activeWarning === null` and `standingRemit` is present;
- one warning: `activeWarning === warnings[0]`;
- multiple warnings: `activeWarning` remains the first warning and `warnings` retains all entries;
- doctrine copy never changes based on current status.

### 3. Render staff state and remit distinctly

#### `apps/web/src/screens/BriefingScreen.tsx`

Replace the single `What to watch` cell with state-aware rendering:

- when `activeWarning` exists, show it as the primary line with warning semantics;
- always show `standingRemit` as a secondary neutral line labelled `Role` or otherwise visually distinguished from the current warning;
- when there is no warning, show a concise neutral state such as `No current warning.` before the standing remit;
- do not use warning colour for the standing remit.

The table must remain scannable at desktop width and usable on narrow screens. Do not solve this by concatenating both strings into one undifferentiated paragraph.

#### `apps/web/src/components/StaffFunctionDetail.tsx`

Remove every fallback from warning content to doctrine content. The detail panel should expose separate sections:

- `Current warnings`, omitted or replaced by a clear no-warning empty state when empty;
- `Staff role`, always populated from `standingRemit`.

#### `apps/web/src/screens/AfterActionScreen/StaffConsequences.tsx`

After-action content should only present actual consequences or warnings caused by the completed month. It must not substitute `standingRemit` when no warning exists.

When there are no warnings for a function, either omit that function from the consequence list or render an explicit neutral outcome such as `No new staff warning this month.` The choice should follow the existing information hierarchy of the screen, but doctrine copy must not appear as an after-action consequence.

### 4. Stop exposing active event IDs

`BriefingScreen.tsx` currently renders each `state.activeEventIds` value directly. Replace this with scenario-backed event labels.

Extend `ScenarioLabels` in `apps/web/src/lib/labels.ts` with an event lookup constructed from `scenario.events`:

```ts
event(id: string): string
```

The lookup must return the event's player-facing `title`. Unknown IDs must use a safe generic fallback such as `Unknown active event`, not echo the raw identifier.

Update the briefing section:

- heading remains player-facing, e.g. `Events still in play`;
- render the event title rather than the event ID;
- include the event summary only when it adds useful current context and does not repeat the prior after-action report excessively;
- remove the sentence that tells the player events are shown by event code;
- do not render IDs in `title`, accessibility labels, test snapshots, or error fallbacks.

Search all browser code for direct rendering of IDs and cover any equivalent player-facing leak found during implementation, limited to event, program, constraint, memo, option, chief, directorate, and campaign identifiers. Do not broaden this into another prose rewrite.

### 5. Migration and persistence impact

`StaffFunctionReadout` is derived data inside previews and turn results, and historical `TurnResult` values are persisted in campaign saves. Therefore this schema change affects saved campaigns.

Implementation must make an explicit migration decision rather than allowing old saves to fail Zod parsing accidentally.

Preferred approach:

- increment `saveFormatVersion` from `5` to `6`;
- add a deterministic v5-to-v6 migration for historical `staffFunctions` and projected readouts;
- derive `standingRemit` by matching `StaffFunctionReadout.id` to the scenario's staff-function definition;
- derive `activeWarning` from `warnings[0] ?? null`;
- remove `consequence` from migrated records;
- preserve replay hashes and deterministic replay behaviour, or document and test why a replay-hash version transition is required.

Do not infer `standingRemit` from the old `consequence` value because that value may contain either doctrine or a warning.

If the repository's current migration architecture cannot safely inject scenario definitions, the implementer may instead avoid persisting derived readouts and regenerate them on load. That is a larger change and must be justified in the PR description with compatibility tests.

### 6. Tests

Add or update tests covering:

- schema validation for the new readout shape;
- `buildStaffFunctionReadouts` invariants above;
- v5 campaign migration to v6, including both warned and un-warned staff functions;
- imported v6 saves and replay validation;
- briefing rendering with warning and no-warning states;
- after-action rendering with no warnings, ensuring doctrine text is absent from consequence output;
- active event titles rendered from scenario content;
- unknown active event IDs do not leak the raw ID;
- a browser-level assertion or focused component test that no known internal IDs appear in the rendered workflow fixture.

A snapshot-only test is insufficient for the semantic distinctions. Assertions must explicitly check which text is shown under which state.

## Non-goals

- changing staff mechanics, warning thresholds, burden calculations, or event activation;
- rewriting scenario prose again;
- redesigning the whole briefing or after-action screen;
- removing S1-S5 terminology;
- changing event IDs or save identity fields;
- introducing a generic localization framework.

## Acceptance criteria

- `StaffFunctionReadout` no longer contains `consequence`.
- Every readout contains an unconditional `standingRemit` and nullable `activeWarning` consistent with `warnings`.
- The briefing visibly distinguishes a current warning from the function's standing role.
- The after-action screen never presents standing doctrine as a consequence of the completed month.
- No raw active event ID is visible anywhere in the browser UI, including fallback states and accessibility text.
- Existing v5 campaign files migrate deterministically or the alternative persistence strategy is fully tested and justified.
- Replay validation remains deterministic after migration.
- `npm run build`, `npm test`, `npm run lint:content`, and `npm run lint:grocer` pass.
- The implementer documents a manual browser walkthrough for warning/no-warning staff rows and known/unknown active events.

## Implementation sequence

1. Add failing shared-contract tests.
2. Change the schema and readout builder.
3. Implement save migration and replay compatibility.
4. Update all TypeScript consumers until no `consequence` reference remains.
5. Add event title lookup with a non-leaking fallback.
6. Update browser component tests.
7. Run a repository-wide search for player-visible raw IDs.
8. Complete the full build, test, content lint, documentation lint, and browser walkthrough.

## Reviewer focus

The reviewer should specifically reject the implementation if it:

- merely renames `consequence` while preserving its dual meaning;
- keeps `consequence` as a deprecated alias;
- uses old `consequence` text to infer doctrine during migration;
- renders `standingRemit` with warning styling;
- echoes an unknown event ID as a fallback;
- silently invalidates existing v5 saves;
- changes mechanics or scenario values while claiming a presentation-only fix.
