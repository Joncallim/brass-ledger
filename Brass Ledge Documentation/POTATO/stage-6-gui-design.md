---
type: design-document
area: browser-interface
status: active
priority: P1
tags:
  - POTATO
  - stage-6
  - gui
  - browser
---

# Stage 6: Browser Interface Design

Backlink: [[POTATO]]

References: [[s1-s5-user-interface-model]], [[game-engine-review/05-browser-design-system]], [[development-stages]]

## Overview

Stage 6 rebuilds the browser interface from its current engine workbench (a single monolithic `App.tsx` that renders raw JSON) into a fully playable game UI. The interface must consume engine contracts without implementing any rule logic itself. Everything displayed is derived from `@brass-ledger/shared` types: `StaffFunctionReadout`, `DecisionMemo`, `TurnPreview`, `TurnResult`, `ChiefPositionEntry`, and `ExplainabilityEntry`. The server is authoritative; the browser submits intent and renders results.

The experience should feel like a serious staff notebook and command brief — dense, legible, restrained, practical. Not a sci-fi dashboard.

---

## Screens

Six screens form the player experience. They are traversed sequentially within a turn, with the ability to return to earlier steps before committing.

| Screen | Route | Primary API call | Player action |
|--------|-------|-----------------|---------------|
| Session Hub | `/` | `GET /api/sessions` | Load, resume, or create a campaign |
| Briefing | `/session/:id` | `GET /api/sessions/:id` | Read situation, review objectives and S1-S5 current state |
| Decision Memos | `/session/:id/memos` | `POST /api/sessions/:id/preview-turn` | Select courses of action, review burden forecast |
| Chiefs Paper | `/session/:id/chiefs` | (preview data, no new call) | Review chief positions, coalitions, and S1-S5 evidence |
| Pre-Commit | `/session/:id/commit` | `POST /api/sessions/:id/chiefs/:id/respond` (optional) | Accept risk overrides, optionally negotiate staff burden or complete chief conversations |
| After Action | `/session/:id/result` | `POST /api/sessions/:id/resolve-turn` | Commit turn, read consequences, see S1-S5 changes |

The Records screen is accessible from the Session Hub and from the header strip on any screen.

---

## Shell Layout

```
+----------------------------------------------------------+
|  BRASS LEDGER          Turn 3/12  o  Cabinet cover: 48  |  <- App header strip (compact)
+----------+-----------------------------------------------+
|          |                                               |
|  S1-S5   |   Primary work area                          |
|  rail    |                                               |
|          |   (changes per screen)                        |
|  [S1]    |                                               |
|  [S2]    |                                               |
|  [S3]    |                                               |
|  [S4]    |                                               |
|  [S5]    |                                               |
|          |                                               |
|  ------  |                                               |
|  [Docs]  |                                               |
+----------+-----------------------------------------------+
```

**Header strip** (always visible): scenario title, current turn / max turns, current campaign status, and one key risk metric (whichever objective is most at-risk). No hamburger menus. No decorative chrome.

**S1-S5 rail** (always visible): one compact badge per function showing id, status color, and current burden. Clicking expands a detail drawer without leaving the current screen. The rail is the persistent anchor — the player always knows where the staff stands.

**Primary work area**: swaps content per screen. Never a card grid. Uses one main column with expandable detail rows.

---

## Component Hierarchy

```
App
+-- AppShell
    +-- HeaderStrip
    +-- StaffRail
    |   +-- StaffFunctionBadge (x5)
    +-- RouterOutlet
        +-- SessionHub
        +-- BriefingScreen
        +-- MemosScreen
        |   +-- MemoPanel (x4-5 memos)
        |   |   +-- OptionRadio (x3-4 options)
        |   +-- BurdenForecastBar
        |   +-- PreviewSummary
        +-- ChiefsPaperScreen
        |   +-- ChiefPositionCard (x6 chiefs)
        |   |   +-- StaffReadoutEvidence
        |   +-- CoalitionSummary
        +-- PreCommitScreen
        |   +-- AcceptedRiskDocket
        |   +-- StaffNegotiationPanel
        |   +-- CommitButton
        +-- AfterActionScreen
        |   +-- TurnSummaryHeader
        |   +-- StaffFunctionConsequences (x5)
        |   +-- EventList
        |   +-- ProgramProgress
        |   +-- ExplainabilityDrawer
        +-- RecordsScreen
            +-- SessionTable
            +-- SessionActions (export, import, validate, delete)
```

---

## Screen Specifications

### Session Hub

**Purpose**: entry point. Load an existing campaign or start a new one.

**Layout**:
- Campaign name and turn status for each saved session, in a compact table
- One primary button: "Resume" (most recent) or "New campaign"
- Secondary: "Import save", "Validate replay"
- Scenario description in a small collapsible block

**State**: entirely from `GET /api/sessions` and `GET /api/scenario`.

**No player decisions here**. This is purely navigation and session management.

---

### Briefing Screen

**Purpose**: the monthly brief. Player reads the situation before choosing guidance.

**Content sections** (in order):

1. **Month header**: "Month 3 of 12 -- Campaign active" in plain type. Objective risk snapshot: which of the four objectives (readiness, alliance, politics, escalation) is closest to its threshold. Color: red for at-risk, amber for watch, none for healthy.

2. **S1-S5 current read**: five rows in a compact table. Each row: function label, status badge, current burden / capacity, consequence text from `StaffFunctionReadout.consequence`, and failure mode from `StaffFunctionReadout.failureMode`. This is read-only current state -- not a forecast.

3. **Active commitments**: compact list of open commitments from `session.state.activeCommitments`. Show type, label, and how many turns old. If none: "No open commitments."

4. **Tech and industry sidebar** (right column or expandable): internal capability phases and external constraint levels from `session.state.internalTech` and `session.state.externalTech`. Show program name, phase, S2 estimate status, and confidence for each node.

5. **Events in play** (if any): active event IDs with their summary text from scenario event definitions.

**Navigation**: "Proceed to memos" button at bottom. S1-S5 rail always visible.

**Data sources**: `GET /api/sessions/:id` returning `session.state`, memos, and scenario definitions.

---

### Decision Memos Screen

**Purpose**: the core decision loop. Player selects a course of action for each memo; the burden forecast updates in response.

**Layout**: two-column.

- **Left column**: memo list. Each memo is an expandable panel showing the problem statement, options as radio buttons, and option detail on hover/focus. Optional memos include a toggle before the radio group.
- **Right column** (sticky): burden forecast. Shows projected S1-S5 burden based on current selections. Updates on every selection change via debounced `POST /api/sessions/:id/preview-turn`. On first render this column shows current state; after a valid preview it shows the projected state.

**Memo panel anatomy**:

```
+------------------------------------------+
| POSTURE GUIDANCE   [required]            |
| Monthly posture and exercise emphasis.   |
|                                          |
| o Measured deterrence posture            |
|   ops 2, training 1, people 1            |
|   Tags: deterrence * training * recovery |
|                                          |
| o Quiet recovery posture                 |
|   people 2, training 2, ops 1            |
|                                          |
| * Deliberate tempo hold  <- selected     |
|   people 1, ops 1   [no training cost]   |
|   Tags: recovery * retention * slow-burn |
|                                          |
+------------------------------------------+
```

Burden shown per option as directorate labels with point counts. Zero-burden directorates not shown. Tags shown in muted type below the burden line.

**Burden forecast column**:

```
+----------------------------------+
| PROJECTED S1-S5 BURDEN           |
|                                  |
| S1 Personnel   ||||. 3/3  strained
| S2 Intelligence ||...  2/3  ready |
| S3 Operations  ||||.  4/4  strained
| S4 Logistics   |||..  3/4  ready  |
| S5 Plans       ||||| 5/5  overloaded
|                                  |
| [2 warnings projected]           |
+----------------------------------+
```

Each S-function row shows: label, burden bar (filled segments = burden / capacity), raw numbers, and status badge. Overloaded in red, strained in amber, ready in neutral.

**Preview trigger**: preview fires automatically 400ms after any selection change (debounced). A subtle "Updating..." indicator in the forecast column while in flight. The player should not need to press a Preview button.

**Navigation**: "Review chiefs paper" enabled once a preview has been received for the current selection state.

**Data sources**: `POST /api/sessions/:id/preview-turn` with current selection state.

---

### Chiefs Paper Screen

**Purpose**: the player reads chief support, objections, and the S1-S5 evidence behind each position before committing.

**Layout**: one column, chiefs listed in S-function order (S1 through S5).

**Chief card anatomy**:

```
+---------------------------------------------+
| [portrait]  Maj. Gen. Ruth Warden  S1       |
|             Chief of People                 |
| ------------------------------------------- |
| POSTURE MEMO: ^ Support -- "Tempo hold     |
| protects the force. Recovery first."        |
|                                             |
| Evidence: S1 personnel -- reserve strain 62 |
| [strained] burden 4/3 -- "Surge options    |
| borrow from next month's manpower."         |
|                                             |
| [Talk to Warden]                           |
+---------------------------------------------+
```

Position badge: ^ Support, ~ Conditional, v Objection. Position text is one sentence from `ChiefPositionEntry.reasoning`. Evidence line shows the S-function, metric, value, status, and the rationale from `staffReadoutEvidence`.

**Coalition summary** at top of screen: compact block showing which options are supported by majority, conditional, and objection coalitions. Drives awareness of the staff split before reading individual cards.

**Chief conversation** (optional, accessible from chief card): opens a side sheet. Does not block the main flow. Player can talk to a chief, create a commitment, or close. Conversation history shown in the sheet. Uses `POST /api/sessions/:id/chiefs/:chiefId/respond`.

**Navigation**: "Proceed to commit". Back button returns to memos.

---

### Pre-Commit Screen

**Purpose**: final gate before turn resolution. Player acknowledges projected risks, optionally negotiates staff burden, then commits.

**Layout**: three stacked sections.

**1. Accepted Risk Docket**

Lists every projected S1-S5 warning from `previewTurn.acceptedRiskCandidates`. Each warning is a checkbox. The player must check all boxes before the commit button activates.

```
[ ] S3 Operations -- Posture is executable but visible training throughput will decline.
[ ] S5 Plans -- Strategic coherence will fall below 55 if no alliance option is selected.
```

If no warnings projected: "No risk warnings projected. Ready to commit."

**2. Staff Negotiations** (only shown if strained/overloaded directorates exist in coalitions)

Checkboxes for each overloaded directorate identified in `chiefCoalitions.staffConstraintDirectorates`. Each negotiation relieves 1 burden point at a declared cost (political cover, readiness margin, or budget authority).

```
[ ] Plans directorate -- Relieve 1 burden point (cost: political cover)
```

Selecting a negotiation triggers a re-preview automatically.

**3. Commit Button**

Disabled until all risk docket items are accepted. Shows a summary line: "Turn 3 * 4 options selected * 2 risks accepted". When clicked, calls `POST /api/sessions/:id/resolve-turn`.

**Navigation**: Back to chiefs paper. No forward navigation until commit fires.

---

### After Action Screen

**Purpose**: the player reads what happened, why, and what it means for next month.

**Sections** (in severity order):

1. **Turn result header**: turn number, replay hash (collapsible), campaign status. If campaign ended: win/loss banner with score and final objective check.

2. **S1-S5 consequences**: one row per function. Shows previous vs. new status, the consequence text, and one-sentence explanation of what changed and why. Derived from `TurnResult.afterAction` categorized by S-function.

3. **Events triggered**: list of triggered events with title and summary. Empty state: "No events this month."

4. **Program and industry updates**: internal capability phase changes and external constraint level shifts, with their causal tags.

5. **Explainability drawer** (expandable): raw causal references from `TurnResult.explainability`. Default collapsed.

6. **Commitment updates**: newly created, fulfilled, or broken commitments from `session.state.activeCommitments`. Broken commitments shown in red with the breach reason.

**Navigation**: "Next month" returns to the Briefing screen for turn+1. "Review records" goes to the Records screen.

---

### Records Screen

**Purpose**: campaign management -- export, import, replay, validate, delete.

**Layout**: compact table of saved sessions. Columns: name/id, turn, status, last modified, score (if ended).

**Actions per session**: Load, Export JSON, Validate replay, Delete.

**Page-level actions**: Import session (file picker), New campaign.

**No game UI here**. This is a records room, not a decision screen.

---

## State Management

No external state library. The turn cycle fits naturally into React state and URL routing:

```typescript
// Global session state -- survives screen transitions within a turn
type TurnCycleState = {
  session: GameSession;
  memos: DecisionMemo[];
  selections: MemoSelection[];
  preview: (TurnPreview & { projectedResult: TurnResult }) | null;
  acceptedRiskChoices: Record<string, boolean>;
  staffNegotiations: StaffNegotiation[];
  latestResult: TurnResult | null;
};
```

State lives at the screen group level (all turn-cycle screens share it). Between turns it resets. The S1-S5 rail derives from `preview?.projectedResult.staffFunctions ?? currentStaffFunctions(session)`.

---

## Routing

Use in-memory routing without a router library for now, since the SPA is served from a single server. Three top-level paths:

```
/              -- SessionHub
/session/:id   -- TurnCycleLayout (wraps Briefing through AfterAction)
/records       -- RecordsScreen
```

Within `/session/:id`, the current screen is a state variable (`"briefing" | "memos" | "chiefs" | "commit" | "after-action"`), not a URL segment. The URL identifies the session; the step is UI state. This avoids deep-linking complexity while keeping the session accessible by URL.

---

## API Integration Points

All API calls are typed against `@brass-ledger/shared` exports. No type inference from raw JSON.

| Screen | Call | Key output used |
|--------|------|-----------------|
| Session Hub | `GET /api/sessions` | `sessions[]` list |
| Session Hub | `POST /api/sessions` | `session`, `memos` |
| Briefing | `GET /api/sessions/:id` | `session.state`, `memos` |
| Memos | `POST /api/sessions/:id/preview-turn` | `TurnPreview`, `projectedResult.staffFunctions`, `chiefCoalitions`, `acceptedRiskCandidates` |
| Chiefs Paper | (preview data already in state) | `chiefPositions`, `chiefCoalitions` |
| Chiefs Paper | `POST /api/sessions/:id/chiefs/:id/conversation/open` | `conversationRecord` |
| Chiefs Paper | `POST /api/sessions/:id/chiefs/:id/respond` | updated `conversationRecord`, trust delta |
| Pre-Commit | (preview data + player choices) | derived from state |
| After Action | `POST /api/sessions/:id/resolve-turn` | `TurnResult`, updated `session`, `memos` |
| Records | `GET /api/sessions/:id/export` | `SessionExport` |
| Records | `POST /api/sessions/import` | `session` |
| Records | `GET /api/sessions/:id/replay` | `ReplayValidation` |

---

## Visual Language Implementation

Tailwind utility classes throughout. No CSS-in-JS. Extend `tailwind.config.js` for design tokens.

**Color tokens**:

```js
colors: {
  brass:      { DEFAULT: '#b5882e', light: '#d4a84b', muted: '#8c6a22' },
  olive:      { DEFAULT: '#6b7c45', light: '#8a9e5a' },
  escalation: { DEFAULT: '#c0392b', muted: '#922b21' },
  recovery:   { DEFAULT: '#27ae60', muted: '#1e8449' },
  intel:      { DEFAULT: '#2e6da4', muted: '#245986' },
  paper:      { DEFAULT: '#f5f0e8', dark: '#1a1a17' },
  ink:        { DEFAULT: '#1c1c1a', muted: '#555550' },
  border:     { DEFAULT: '#c8c0b0', strong: '#9a9080' },
}
```

**Status colors** (consistent throughout):
- `ready` -- neutral ink
- `strained` -- amber / `text-yellow-700 border-yellow-500`
- `overloaded` -- red / `text-red-700 border-red-500`
- `compromised` -- red background / `bg-red-50 text-red-900`

**Typography**:
- UI text: system sans (Tailwind default stack)
- Data / logs / hashes: `font-mono text-sm`
- Headings: `font-semibold tracking-tight`
- Kicker lines: `text-xs uppercase tracking-widest text-ink/60`

**Borders and spacing**:
- Border radius: 4px (`rounded`)
- All panels: `border border-border`
- Panel padding: `p-4` standard, `p-6` for primary work area
- Rail width: `w-48 shrink-0 border-r border-border`

**Motion**: `transition-colors` for status changes only. No keyframe animations. No skeleton loaders.

---

## Accessibility

- All memo options use `<input type="radio">` inside `<fieldset>/<legend>`.
- Optional memo toggle uses `<input type="checkbox">`.
- Risk docket uses `<input type="checkbox">` with explicit `<label>`.
- Side sheet (chief conversation) uses `role="dialog"` with `aria-labelledby` and focus trap.
- S1-S5 status badges use both color and a text label (never color-only).
- Portrait images use descriptive `alt` text: `"${displayName} -- ${title}"`.
- Tables use `<th scope="col">` headers.
- All interactive elements reachable by keyboard; Tab order follows reading order.

---

## Implementation Order

Phases are ordered by core mechanic first, then enrichment. Each phase produces a shippable increment.

### Phase 1: Shell and S1-S5 Rail

**Deliverables**: App shell, routing stub, S1-S5 rail, Session Hub (load/create only).

Tasks:
1. Restructure `apps/web/src/` into `components/`, `screens/`, `hooks/`, `lib/`
2. Create `AppShell` with header strip and S1-S5 rail
3. Create `StaffFunctionBadge` component consuming `StaffFunctionReadout`
4. Create `SessionHub` with session list table and create/load actions
5. Stub remaining screens as empty placeholders with navigation links
6. Update `tailwind.config.js` with design tokens
7. Wire `useSession` hook for API calls

Exit: app loads, sessions can be created and loaded, S1-S5 rail shows current state.

### Phase 2: Briefing and Memo Selection

**Deliverables**: Briefing screen, Decision Memos screen with live burden preview.

Tasks:
1. Build `BriefingScreen` with S1-S5 current read, objectives, commitments, tech sidebar
2. Build `MemosScreen` with `MemoPanel` and `OptionRadio` components
3. Build `BurdenForecastBar` consuming projected `staffFunctions` from preview
4. Implement debounced auto-preview on selection change
5. Implement `usePreview` hook calling `POST /sessions/:id/preview-turn`
6. Add forward navigation guard: memos screen requires at least one preview

Exit: player can read the brief, select options, and see live burden forecast.

### Phase 3: Chiefs Paper

**Deliverables**: Chiefs Paper screen with positions, evidence, coalitions, and conversation side sheet.

Tasks:
1. Build `ChiefsPaperScreen` with `ChiefPositionCard` components ordered by S-function
2. Build `StaffReadoutEvidence` block inside each chief card
3. Build `CoalitionSummary` at top of screen
4. Build `ChiefConversationSheet` side panel with conversation flow
5. Wire conversation API calls (`open`, `respond`)
6. Show trust delta indicators in conversation

Exit: player can read all chief positions with evidence, optionally open a conversation.

### Phase 4: Pre-Commit and After Action

**Deliverables**: Pre-Commit screen, After Action screen, full turn cycle playable end-to-end.

Tasks:
1. Build `PreCommitScreen` with `AcceptedRiskDocket`, `StaffNegotiationPanel`, and `CommitButton`
2. Implement commit guard: all risk items must be accepted before commit enables
3. Wire staff negotiation re-preview on toggle change
4. Build `AfterActionScreen` with S1-S5 consequence rows, event list, program updates
5. Build `ExplainabilityDrawer` (collapsible)
6. Wire `POST /sessions/:id/resolve-turn` from commit button
7. Campaign end state: win/loss banner on AfterActionScreen

Exit: full turn cycle is playable end-to-end.

### Phase 5: Records and Polish

**Deliverables**: Records screen, full export/import/validate flow, accessibility pass, visual polish.

Tasks:
1. Build `RecordsScreen` with session table and actions
2. Implement export (file download) and import (file picker + `POST /sessions/import`)
3. Implement replay validation display
4. Accessibility audit: keyboard navigation, color contrast, ARIA labels
5. Error states: API error boundary, session-not-found handling
6. Loading states: subtle indicators during in-flight API calls
7. Responsive layout: rail collapses to bottom bar at narrow widths

Exit: Stage 6 complete. All screens playable, accessible, exportable.

---

## Files To Create / Modify

**New structure for `apps/web/src/`**:

```
src/
+-- lib/
|   +-- api.ts              -- fetchJson, typed API wrappers
|   +-- types.ts            -- local type aliases from @brass-ledger/shared
+-- hooks/
|   +-- useSession.ts       -- session load/create/save
|   +-- usePreview.ts       -- debounced preview-turn call
|   +-- useChief.ts         -- conversation state
+-- components/
|   +-- AppShell.tsx
|   +-- HeaderStrip.tsx
|   +-- StaffRail.tsx
|   +-- StaffFunctionBadge.tsx
|   +-- StaffFunctionDetail.tsx
|   +-- BurdenBar.tsx
|   +-- StatusBadge.tsx
|   +-- ChiefPortrait.tsx
|   +-- ExplainabilityDrawer.tsx
+-- screens/
|   +-- SessionHub.tsx
|   +-- BriefingScreen.tsx
|   +-- MemosScreen/
|   |   +-- index.tsx
|   |   +-- MemoPanel.tsx
|   |   +-- OptionRadio.tsx
|   +-- ChiefsPaperScreen/
|   |   +-- index.tsx
|   |   +-- ChiefPositionCard.tsx
|   |   +-- StaffReadoutEvidence.tsx
|   |   +-- CoalitionSummary.tsx
|   |   +-- ChiefConversationSheet.tsx
|   +-- PreCommitScreen/
|   |   +-- index.tsx
|   |   +-- AcceptedRiskDocket.tsx
|   |   +-- StaffNegotiationPanel.tsx
|   +-- AfterActionScreen/
|   |   +-- index.tsx
|   |   +-- StaffConsequences.tsx
|   |   +-- EventList.tsx
|   |   +-- ProgramProgress.tsx
|   +-- RecordsScreen.tsx
+-- App.tsx                 -- shell assembly + routing state
+-- main.tsx                -- unchanged
```

**Files to retire**: the current `App.tsx` (452 lines) and `acceptedRiskUi.ts` (57 lines). Their logic is redistributed into `hooks/usePreview.ts`, `screens/PreCommitScreen/AcceptedRiskDocket.tsx`, and `screens/PreCommitScreen/StaffNegotiationPanel.tsx`.

**No new packages or build dependencies**: Tailwind already installed. React 19 already installed. No router library needed. No state management library needed.

---

## What Stage 6 Does Not Include

- Bitmap sprite generation pipeline (Stage 7+ concern)
- Sound or animation beyond CSS transitions
- Mobile-native app (desktop-primary layout, tablet-readable)
- AI-driven dialogue generation (chief dialogue is authored text assembled by the engine)
- Dark mode (single paper-light theme for now)
- Scenario editor

---

## Exit Criteria

- All six screens are playable end-to-end: session hub, brief, memos, chiefs, commit, after action, next month, campaign end.
- S1-S5 rail visible and accurate on every screen.
- Chief positions with evidence readable before commit.
- Accepted-risk docket enforced: commit button disabled until all warnings are acknowledged.
- Records screen allows export, import, and replay validation.
- No browser-only rule logic: all decisions flow through the server API.
- Keyboard navigation works for the memo selection and commit flow.
- No color-only status indicators.
