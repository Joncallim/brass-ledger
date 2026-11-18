# Game Brief: Brass Ledger — V2 Kestrel Strait slice

<!--
A pointer, not a design. GROCER is canonical (CLAUDE.md, Brass Ledger Rules):
`Brass Ledge Documentation/GROCER/POTATO/V2/`, read in numeric order. Every field below
names the contract it comes from. Where this brief and a contract disagree, the
contract wins and this brief is wrong. Fields the contracts leave open are marked, and
are questions for the product owner, not decisions.
-->

## In your words

From [[00-NORTH-STAR]], verbatim:

> Human play identified the V1 headquarters loop as boring despite sound replay,
> saves, staff mechanics, advice, onboarding, and pacing. More polish around
> mandatory packet processing is therefore not the answer under test.
>
> The player is the commander, not a headquarters clerk. The desired thought is:
> “I caused this. I have a plan for what to do about it. I need to see what happens next.”

**Pitch:** You command a coalition HQ holding the Beacon Channel relay for six cycles
against Ravellan: staff runs the routine, and you change only the exceptions that
matter. *(inferred (strong): 00-NORTH-STAR, 20-VERTICAL-SLICE §1)*

**Genre:** single-player strategic leadership simulator.

**Controls:** Each cycle, every issue starts delegated to the responsible chief. Per
issue: Delegate, Intervene (pick another legal course; normally costs one of two
personal interventions), or Defer where authored. C2 public accusation, C4 partner
liaison and C5 attribution use are commander-only. One atomic command a cycle.
*(10-GAMEPLAY-CONTRACT "Command semantics"; 20-VERTICAL-SLICE §1)*

**Question:** Can command-by-exception plus standing intent, hidden-but-fair
opposition and persistent causal history make a player want the next turn?
*(00-NORTH-STAR "What the prototype proves")*

**Hooks:** Standing direction that staff visibly follows; intelligence that is three
separate products (intent assessment, tactical warning, public-case basis) and never a
confidence meter; consequences kept as concrete records, not a moral meter.
*(00-NORTH-STAR pillars; 10-GAMEPLAY-CONTRACT "Intelligence")*

**Intent:** staged failure — painful but manipulable before the final crisis
*(00-NORTH-STAR pillar 6; 20-VERTICAL-SLICE §11)*.

## Look and references

- Look: plain text for the slice; no graphics before the human gate
  *(V2 README "Frozen scope")*. The browser Command Room (#105) and Consequence Reveal
  (#106) follow #107 and smoke *(28-, 29-)*. The Phaser map room
  (`prototypes/map-room/`) is an isolated look-and-feel hypothesis on its own rules,
  not this slice's look. It is one candidate for #105's presentation, to be decided after
  the formative smoke test.
- References: none named yet.
- View: text / 2D UI · Camera: none.

## First minute

Cycle 1, Ownership: the commander sets the four standing directions (main effort,
protected boundary, acceptable secondary risk, posture preference), then sees three
issues already delegated — Beacon watch, partner consultation, Lattice protection — and
changes at most two. *(20-VERTICAL-SLICE §1, §3)* The exact first-screen copy is
#105's. *(open question)*

## Challenge

Cycle 3 brings Doubt: two signposts that point different ways. Cycle 5 brings Pain:
warning, certainty, authority, readiness and protection cannot all be kept. Cycle 6 is
the crisis, with four outcomes from Strategic Success to Operational Defeat. No seed may
force a loss before the end without an earlier legal countermeasure.
*(20-VERTICAL-SLICE §5, §8, §9, §11)*

## Core loop

- Situation: an agenda of consequential issues, with staff recommendations and dissent.
- Command: Delegate most, intervene in up to two, against standing direction.
- Consequence: concrete records change (Beacon, reserve, partner, promises, Lattice, source).
- Anticipation: a plan for next cycle, and the wish to see it play out.
*(00-NORTH-STAR "Situation → Command → Consequence → Anticipation")*

## Goal & fail state

- Hold the Beacon Channel through Cycle 6's crisis: Strategic or Costly Success.
- Fail by Political Defeat or Operational Defeat. The debrief separates what HQ
  believed at the time from what Ravellan actually did.
*(20-VERTICAL-SLICE §9; 10-GAMEPLAY-CONTRACT "Terminal crisis")*

## Features

- [x] Replay-safe V2 version/ledger and authoritative command contract (#95, #96)
- [x] Standing intent (#97)
- [x] Ravellan adversary from hidden posture and fair observations (#99)
- [x] HQ intelligence: assessment, warning and public case as pure derived state (#100) *(inferred: on main)*
- [ ] Persistent consequences and irreversible source use (#101)
- [ ] Lattice capability and collection tasks (#102)
- [ ] Belief- and state-aware staff recommendation and dissent (#98)
- [ ] Complete six-cycle headless run with content identity (#103, #104)
*(50-EXECUTION-PLAN core chain)*

## Your systems

- standing direction · in the slice
- staff recommendation and dissent · in the slice
- Ravellan adversary · in the slice
- HQ intelligence · in the slice
- persistent consequences · in the slice
- Lattice collection · in the slice
- Command Room browser UI · later
- consequence reveal and debrief UI · later

## Keep

- Deterministic replay, save/import/export, server-authoritative mutation and
  stale-write rejection *(CLAUDE.md protected invariants)*.

## Avoid

From [[00-NORTH-STAR]] anti-goals: a meter-optimisation puzzle, a staff chatbot, a
generic strategy framework, a scripted drama machine, an omniscient recommendation
system, automation that chooses for the player; a hidden score; rubber-banding.

## Out of scope

- No extra scenario, graphics, doctrine depth, tutorial expansion, meta-progression,
  broad rewrite or generic plugin framework before the human gate (#110).
- [[32-POST-GATE-GAME-ARCHITECTURE]] is hypotheses only.
- Final campaign length, intervention budget and content breadth are not decided.
*(V2 README "Frozen scope"; 20-VERTICAL-SLICE §13)*

## Build order

1. #101 persistent consequences → #102 Lattice → #98 final recommendation.
2. #103 content identity → #104 complete headless six-cycle run.
3. #107 headless design lab.
4. Three-player formative smoke (non-gating; can stop the browser work).
5. #105 Command Room → #106 Consequence Reveal → #108 browser E2E.
6. #109 study harness → #110 human fun gate (8 players; product owner decides).
*(50-EXECUTION-PLAN)*

---
**Kill condition:** stop and redesign before the browser work if at least two of the
three smoke players cannot explain a major consequence, form a next-command plan, or
want to continue. *(50-EXECUTION-PLAN "Formative smoke")*

**Who it's for / what they feel:** strategy and simulation players who want to own the
consequences of command decisions; they should feel "I caused this, and I have a plan."

**Games you love / don't:** none named yet.
