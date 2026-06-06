---
type: backend-review-note
reviewed_on: 2026-06-06
tags:
  - backend-review
  - state
  - replay
---

Backlink: [[POTATO]]


# State And Replay Model

## Session Structure

`GameSession` contains:

- `id`, `saveFormatVersion`, `scenarioId`, `contentVersion`, `updatedAt`
- `advisorRoster`
- `initialState`
- current `state`
- `turnInputs`
- `history`

This is a clear replay model: `initialState + turnInputs -> history -> current state`.

## Simulation Pipeline

`resolveTurn` performs the following sequence:

1. Rejects wrong turn number or ended campaigns.
2. Derives current memos.
3. Validates selections for duplicates, known memo/option ids, and required memos.
4. Seeds a deterministic RNG from seed, turn, and selection count.
5. Applies option deltas to strategic/resources state.
6. Selects eligible events.
7. Applies event deltas.
8. Applies directorate burden penalties.
9. Updates chief positions, programs, constraints, trust, event flags, briefing, score, and outcome.
10. Hashes normalized previous state, input, and next state.

## Replay Validation

`validateReplaySession` reconstructs turns from `initialState` and `turnInputs`, compares each stored `history` item by replay hash and normalized `nextState`, then compares the reconstructed final state with `session.state`.

That is the right primitive for detecting tampering and simulation drift. The main gap is that persistence paths do not consistently require it before accepting state, and the validator assumes `history[index]` exists for every input.

## Invariant Checklist

The following invariants should be enforced before any session is persisted:

- `session.scenarioId === soloScenario.id`
- `session.contentVersion === soloScenario.contentVersion`
- `session.saveFormatVersion === "5"`
- `session.initialState` is canonical for the scenario, or an explicitly supported migrated equivalent
- `session.turnInputs.length === session.history.length`
- every `history[index].input` equals `turnInputs[index]`
- `validateReplaySession(...).ok === true`
- `state.turn === initialState.turn + turnInputs.length`
- terminal states cannot accept more turns
- scalar metrics are finite and within their intended ranges
