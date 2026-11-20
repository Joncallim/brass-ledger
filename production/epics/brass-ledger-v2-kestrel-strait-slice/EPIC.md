# Epic: Brass Ledger — V2 Kestrel Strait slice

> **Source**: `design/game-brief.md` (a pointer to the canonical GROCER V2 contracts in
> `Brass Ledge Documentation/GROCER/POTATO/V2/`; where they differ, the contracts win)
> **Workflow tier**: minimal (no GDDs, ADRs or control manifest)
> **Created**: 2026-11-18

## Goal

You command a coalition HQ holding the Beacon Channel relay for six cycles against
Ravellan: staff runs the routine, and you change only the exceptions that matter.

## Scope

The brief's unbuilt Features, in its Build order (`50-EXECUTION-PLAN.md`), then its two
`later` systems:

1. #101 persistent consequences and irreversible source use
2. #102 Lattice capability and collection tasks
3. #98 belief- and state-aware staff recommendation and dissent
4. #103/#104 complete six-cycle headless run with content identity
5. Command Room and Consequence Reveal (#105, #106): thin, then deepened. These start only
   after #104, the #107 headless design lab and the three-player formative smoke
   (`28` §1, `29` §1). Product owner chose to write their stories now (2026-11-18).

Already built (no stories): #95/#96 ledger and command contract, #97 standing intent, #99
Ravellan adversary, #100 HQ intelligence.

Not in this epic: #107 headless design lab, the formative smoke, #108 browser E2E, #109/#110
human playtests (machine work cannot pass the human gate).

## Open product decisions (escalated, not invented)

- C5 Operations/Political dissent is not authored anywhere (`24` says "where authored").
- `60-DECISION-LOG` D50 (`used|expired`) conflicts with `25` §2 (`unspent|used`); stories
  follow `25`.
- D49 and `26A` still use the retired `political-operational-sync` target ID and the name
  `kestrel-collection-producer-v1`; stories follow `26` §4/§8.
- `25` C5 `quiet-reinforce-beacon` reserve cost "when material commitment required" has no
  executable condition.

## Stories

| # | Story | Type | Status | ADR |
|---|-------|------|--------|-----|
| 001 | Persistent consequences and irreversible source use (#101) | Integration | Ready | N/A (minimal) |
| 002 | Lattice capability and collection tasks (#102) | Integration | Ready | N/A (minimal) |
| 003 | Staff recommendation and dissent (#98) | Logic | Ready | N/A (minimal) |
| 004 | Complete six-cycle headless run with content identity (#103, #104) | Integration | Ready | N/A (minimal) |
| 005 | Command Room, thin stand-in (#105) | UI | Blocked | N/A (minimal) |
| 006 | Consequence Reveal, thin stand-in (#106) | UI | Blocked | N/A (minimal) |
| 007 | Command Room, deepened (#105) | UI | Blocked | N/A (minimal) |
| 008 | Consequence Reveal, deepened (#106) | UI | Blocked | N/A (minimal) |
