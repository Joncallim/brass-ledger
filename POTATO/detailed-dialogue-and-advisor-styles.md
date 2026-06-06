---
type: dialogue-design-plan
area: advisor-dialogue
status: active
priority: P1
tags:
  - POTATO
  - dialogue
  - advisors
  - style-generation
---

# Detailed Dialogue And Advisor Styles

Backlink: [[POTATO]]

## Purpose

Advisor dialogue should make the staff system legible. The player should understand what each advisor wants, what they fear, how much they trust the commander, and which institutional cost they are trying to force into the decision.

## Dialogue Contract

The engine should generate dialogue from structured state, not from browser layout:

```ts
type AdvisorDialogueStyle = {
  chiefId: string;
  functionId: "S1" | "S2" | "S3" | "S4" | "S5" | "training";
  voice: string;
  sentenceShape: "short-direct" | "measured-analytic" | "clipped-operational" | "ledger-specific" | "strategic-political" | "instructional";
  pressureTactic: "protective-veto" | "evidence-demand" | "tempo-challenge" | "constraint-accounting" | "coherence-test" | "standards-check";
  trustLowBehavior: string;
  trustHighBehavior: string;
  preferredEvidence: string[];
  forbiddenStyle: string[];
  spriteStyleSeed: string;
};

type AdvisorDialoguePacket = {
  memoId: string;
  optionId: string;
  chiefId: string;
  style: AdvisorDialogueStyle;
  stance: "support" | "caution" | "oppose";
  openingLine: string;
  evidenceLines: string[];
  pressureQuestion: string;
  concessionLine: string;
  finalAsk: string;
  playerResponses: Array<{
    id: string;
    posture: "reassure" | "probe" | "tradeoff" | "overrule" | "commit";
    text: string;
    trustDelta: number;
  }>;
};
```

## Generation Pipeline

1. Read current memo, option, chief, trust, burden forecast, and prior conversation trail.
2. Select the advisor style record for the chief.
3. Derive stance from chief position, doctrine fit, concern tags, trust, and directorate burden.
4. Emit one opening line, two evidence lines, one pressure question, one concession line, and one final ask.
5. Emit player responses with explicit posture labels and trust deltas.
6. Save the structured packet and transcript. Do not save generated bitmap assets or long prompt blobs in the campaign state.

## Global Dialogue Rules

- Every advisor must speak from their institutional function first and personality second.
- Every exchange needs one concrete state reference: trust, burden, metric, event, program, or constraint.
- Avoid exposition dumps. Use one pressure question per stage.
- Do not let all advisors use the same cadence; sentence shape is part of the style contract.
- Do not generate real-world classified procedure, operational advice, or targeting detail. Keep military content at fictional strategic staff level.
- Do not imitate living public figures, real commanders, or copyrighted character voices.

## Advisor Style Records

### Maj. Gen. Ruth Warden

- Function: S1 Personnel
- Voice: protective, blunt, human-cost focused
- Sentence shape: short-direct
- Pressure tactic: protective-veto
- Preferred evidence: reserve strain, personnel shortfalls, rotation stress, training recovery
- Trust low behavior: assumes tempo decisions hide personnel debt and asks for explicit ceilings
- Trust high behavior: offers a workable compromise before objecting
- Forbidden style: sentimental speeches, generic HR language, heroic sacrifice framing
- Sprite style seed: grounded stance, muted green accent, guarded expression when strain is high
- Sample line: "This buys readiness with people we already owe rest."

### Dr. Elias Halden

- Function: S2 Intelligence
- Voice: precise, skeptical, probability-driven
- Sentence shape: measured-analytic
- Pressure tactic: evidence-demand
- Preferred evidence: confidence, collection coverage, deception pressure, warning time
- Trust low behavior: refuses clean conclusions and emphasizes unknowns
- Trust high behavior: names the strongest assumption and the condition that would change his view
- Forbidden style: spy-thriller melodrama, omniscient certainty, vague caution
- Sprite style seed: narrow framing, cool blue accent, analytical expression
- Sample line: "The estimate supports a move, not the story currently attached to it."

### Lt. Gen. Mara Briggs

- Function: S3 Operations
- Voice: direct, impatient, execution-focused
- Sentence shape: clipped-operational
- Pressure tactic: tempo-challenge
- Preferred evidence: deployable units, posture visibility, exercise tempo, deterrence effect
- Trust low behavior: challenges delay as indecision and demands a visible operational reason
- Trust high behavior: accepts sequencing if the commander names the trigger for action
- Forbidden style: reckless warmongering, action-movie bravado, abstract doctrine lectures
- Sprite style seed: square posture, brass accent, forward lean, ready expression
- Sample line: "If the force is ready enough to signal, then signal with something measurable."

### Lt. Gen. Tunde Okafor

- Function: S4 Logistics
- Voice: methodical, concrete, throughput-focused
- Sentence shape: ledger-specific
- Pressure tactic: constraint-accounting
- Preferred evidence: depot backlog, munitions, lift, fuel, repair, shipping constraints
- Trust low behavior: treats every promise as unfunded until support detail is named
- Trust high behavior: proposes the smallest support-first adjustment that keeps the plan real
- Forbidden style: bean-counter caricature, vague pessimism, magic supply fixes
- Sprite style seed: broad base, clay accent, practical uniform detail, composed expression
- Sample line: "I can support that order if we stop pretending lift is an afterthought."

### Gen. Mina Sato

- Function: S5 Plans
- Voice: composed, strategic, politically literate
- Sentence shape: strategic-political
- Pressure tactic: coherence-test
- Preferred evidence: alliance alignment, modernization queue, doctrine, cabinet cover, public story
- Trust low behavior: identifies contradictions between current action and long-term posture
- Trust high behavior: frames tradeoffs as a doctrine choice the player can own
- Forbidden style: mystical strategist, generic futurism, empty vision statements
- Sprite style seed: clean silhouette, muted indigo accent, reserved expression
- Sample line: "This can work, but only if we admit it changes the story we tell allies next month."

### Lt. Gen. Elena Navarro

- Function: Training
- Voice: exacting, practical, standards-focused
- Sentence shape: instructional
- Pressure tactic: standards-check
- Preferred evidence: training throughput, simulation quality, certification tempo, absorption capacity
- Trust low behavior: assumes prestige is outrunning repetition and asks what will be cut
- Trust high behavior: turns ambition into a staged training standard
- Forbidden style: schoolteacher scolding, motivational slogans, vague readiness talk
- Sprite style seed: teal accent, clear gaze, precise posture, stricter expression under overload
- Sample line: "A standard that cannot be repeated is a demonstration, not readiness."

## Dialogue Stage Design

| Stage | Purpose | Advisor output | Player response style |
| --- | --- | --- | --- |
| Opening | Establish stance and institutional cost | openingLine | acknowledge, challenge, or ask for evidence |
| Diagnosis | Expose why the advisor cares | evidenceLines and pressureQuestion | probe assumption or request alternative |
| Bargaining | Offer tradeoff or mitigation | concessionLine | accept mitigation, trade another burden, or overrule |
| Closing | Record commitment | finalAsk | commit, defer, or reject |

## Style Generation Rules

- `voice` controls vocabulary.
- `sentenceShape` controls cadence and length.
- `pressureTactic` controls the conflict.
- `preferredEvidence` controls which state fields must be cited.
- `trustLowBehavior` and `trustHighBehavior` control tone shifts, not facts.
- `forbiddenStyle` is a hard negative prompt for text generation and review.
- `spriteStyleSeed` should align the visual style with the dialogue style without copying prose into image prompts.

## Implementation Stages

Stage 1:

- Store advisor style records in shared/content data.
- Add style id and sentence shape to generated conversation records.
- Add tests that each advisor emits distinct cadence and cites at least one state reference.

Stage 2:

- Expand `startChiefConversation` and `continueChiefConversation` to consume style records.
- Emit dialogue packets that can drive browser, CLI, or native shells.
- Add CLI output mode for dialogue packets.

Stage 3:

- Connect sprite style seeds to `SpriteSpec`.
- Add optional external generation only after provenance, provider terms, and asset review controls in [[sprite-design-logic]] are implemented.
