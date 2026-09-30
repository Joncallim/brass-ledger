---
type: officer-dialogue-validation
status: active
authority: dialogue-style-test
source_bible: 41-OFFICER-STYLE-BIBLE
related_issues:
  - 113
  - 115
  - 120
  - 122
---

# Officer Dialogue Style Validation

Backlink: [[41-OFFICER-STYLE-BIBLE]]

This note records the first full dialogue pass against the 24-officer style bible.

It tests character voice. It does not certify the interview engine, runtime compiler, social reducer or final campaign dialogue.

## Corpus

Each officer has one source bundle at:

`packages/content/dialogue/officers/<officer-id>/interview/core.md`

Each bundle contains eight common interview situations:

1. what the headquarters gets wrong;
2. a disagreement with a commander;
3. a professional red line;
4. personal weakness;
5. preferred crisis colleague;
6. cross-post concern;
7. act now versus wait;
8. short-term gain versus next-month cost.

The common questions are deliberate. They make it easier to compare character voice without confusing topic differences for personality differences.

Each sequence currently contains two authored semantic beats. These are the **baseline answer**, not the final variation pool.

## Plain-English gate

Pass.

The dialogue was checked against the project's banned management/staff-paper language, including:

- human capital;
- strategic optionality;
- cross-functional alignment;
- stakeholder;
- decision advantage;
- institutional resilience;
- synergy;
- optimise/optimize;
- internal engine terms such as professional stance and basis pattern.

No dialogue beat uses those terms.

Normal military words remain allowed where the sentence is understandable from context.

## Structural gate

Pass.

All 24 officers have:

- 8 sequences;
- 16 authored beats;
- stable officer/sequence/beat ids;
- one source-bible reference;
- one self-critique answer;
- one peer answer;
- one cross-post answer.

The files use the provisional `brass-ledger-dialogue-bundle-v1` source shape. Issue #113 must make this bundle form an accepted compiler input before runtime consumption.

## Style-bible alignment

### First-principles test

Pass.

The first answer to the same question, "What does this headquarters get wrong most often?", remains character-specific:

| Officer | What they notice first |
| --- | --- |
| Warden | exceptional effort being treated as free |
| Halden | language becoming stronger than reporting |
| Briggs | plans without an executable verb |
| Okafor | the same physical capacity promised twice |
| Sato | strong words without a decision behind them |
| Navarro | one exposure being mistaken for competence |
| Mercer | today's posting creating tomorrow's vacancy |
| Rahman | old process surviving after its purpose is forgotten |
| Dubois | partners being told after the decision |
| Nair | one explanation being chosen too early |
| Varga | reports becoming larger as they move upward |
| Chen | connected problems being split into neat boxes |
| Ortiz | dependencies being discovered after approval |
| Kessler | surge becoming the normal setting |
| Haddad | trying to restore a plan after reality changed |
| Mensah | accepting "cannot" before checking who controls the rule |
| Lin | several different failures being hidden inside "readiness" |
| Marin | partner promises being treated as delivery |
| Cole | activity being added without a clear purpose |
| Yusuf | hard choices being hidden inside "balance" |
| Hale | future programmes being raided for each urgent problem |
| Reyes | headquarters telling people how instead of what must happen |
| Tan | learning either nothing or too much from a result |
| Bell | calling a person weak before checking whether they were developed properly |

No two characters answer the question through the same professional lens.

### Rough-edge test

Pass.

Every officer's self-critique matches the ordinary human fault in the style bible rather than inventing a new personality defect.

Examples:

- Warden remembers broken promises too long;
- Halden corrects people publicly;
- Briggs interrupts slower speakers;
- Okafor holds spare margin too closely;
- Sato overworks wording;
- Navarro can become cutting with senior officers;
- Nair becomes defensive about a long-worked hypothesis;
- Varga holds reporting too long;
- Lin makes vague speakers feel foolish;
- Hale protects programmes he helped build;
- Bell gives struggling people too many chances.

### Cross-post test

Pass after revision.

Every normal cross-post answer now matches the career-grounded fit table.

Specialists are allowed to say they should **not** hold another billet:

- Nair rejects Plans as a normal appointment;
- Mensah rejects Plans;
- Yusuf rejects Personnel.

A useful professional perspective is not treated as appointment qualification.

### Relationship test

Pass after revision.

Peer answers now use either:

- an explicit shared history; or
- an explicit directional professional view.

The dialogue pass exposed several missing directional edges. The style bible was amended for Halden/Varga, Nair/Chen, Ortiz/Marin, Kessler/Warden and Mercer/Hale.

Rahman's crisis-peer answer was changed from Warden to Hale because her existing friction/respect with Hale is more useful and better grounded.

## Voice-overlap test

No exact long-sentence duplication was found inside the two 12-officer audit batches or the high-risk conceptual comparison groups.

The highest lexical overlaps in the deliberately difficult comparison sets were approximately:

- Reyes / Bell: 0.194;
- Warden / Kessler: 0.187;
- Marin / Dubois: 0.187;
- Halden / Sato: 0.180;
- Sato / Cole: 0.171.

These pairs are expected to share subject matter.

They still pass the reasoning test:

### Reyes / Bell

Reyes asks whether local leaders understand the aim and have room to act.

Bell asks whether an individual has been fairly developed and whether the team is carrying that person's weakness.

### Warden / Kessler

Warden sees the people paying the cost.

Kessler sees the operational cycle losing its ability to surge again.

### Marin / Dubois

Marin asks whether the partner contribution will physically arrive.

Dubois asks whether the relationship was handled early enough to support cooperation.

### Halden / Sato

Halden separates what can be claimed from what is inferred.

Sato asks what a choice causes others to expect next.

### Sato / Cole

Sato protects or spends future freedom of action.

Cole asks whether current activities still support the main campaign aim.

The overlap is therefore mostly shared setting vocabulary rather than collapsed character identity.

## Cadence failures found and repaired

The first writing pass did **not** pass cleanly.

The audit found:

- Varga was too verbose for a terse field-collection officer;
- Lin sounded too polished for her exact, engineering-led voice;
- Yusuf's answers were too rounded and explanatory for her crisp style;
- Chen was too concise for someone who naturally follows links through a wider system;
- too many disagreement stories opened with the same "I once..." shape;
- Rahman's dialogue was too measured for her faster conversational energy;
- Mensah's first peer choice did not use his strongest useful relationship tension.

Those were revised in the source files.

Examples of the corrected shapes:

**Varga**
> Two reports. One original source. I was asked to call the location confirmed.

**Lin**
> Old system or new fix? I chose the old system for the operation.

**Yusuf**
> Will waiting buy us something? If not, decide.

**Chen**
> A shipping decision changes repair parts. Repair delays change readiness. Readiness changes what we can promise a partner.

**Okafor**
> Three major loads. One window. Capacity for two.

**Navarro**
> One exercise. One clean run. Headquarters wanted to call the new capability operational.

The dialogue is now differentiated by sentence shape as well as subject.

## Natural-speech pass

The full 24-officer baseline corpus was rewritten after an additional read-aloud review.

The previous prose was semantically sound but too polished. Repeated synthetic tells included:

- balanced two-clause contrasts;
- tidy moral-of-the-story endings;
- formal negatives such as "That does not mean...";
- complete explanatory paragraphs where a real speaker would stop earlier;
- too few contractions;
- statements shaped like staff-paper prose even when the vocabulary was simple.

All 384 authored interview beats were reviewed and rewritten without changing:

- beat IDs;
- sequence IDs;
- beat functions;
- officer identity;
- peer choice;
- core professional meaning.

This is a copy-only pass. It must change `dialogueCopyDigest` once #113 exists, but must not change `dialogueSemanticDigest`, beat eligibility, appointment logic or simulation results.

The target is not "casual" dialogue. It is senior professionals speaking normally: simple words, contractions where natural, occasional fragments, uneven sentence length, and no need to end every answer with a polished lesson.

Future validation should include a read-aloud / synthetic-cadence check in addition to banned jargon and lexical overlap.

## Orthogonal information-presentation review

Baseline result: **failed structurally; character contract repaired; runtime/corpus migration still required under #113/#115.**

The earlier tests proved that officers notice different things and use different cadence. They did **not** test the order in which an officer packages facts, meaning, uncertainty, trade-offs and action.

The orthogonal audit found a complete structural collision across the current 24 baseline bundles.

All 24 officers currently use the same function order for the same eight validation probes:

- headquarters failure: `position → reason`;
- commander disagreement: `example → qualification`;
- red line: `position → qualification`;
- self-critique: `position → reason`;
- crisis peer: `peer-reference → reason`;
- cross-post: `position → qualification`;
- act or wait: `position → reason`;
- future cost: `position → reason`.

That uniformity is useful for the original controlled voice comparison, but it cannot become the final conversation grammar. If left unchanged, a player would hear twenty-four different vocabularies wrapped around the same underlying answer shape.

### Repair

[[41-OFFICER-STYLE-BIBLE]] now defines a distinct information-presentation profile for every officer.

Examples:

- Warden: bearer → burden → duration → recovery / terms;
- Halden: observed → assessed → unknown or change-trigger → action;
- Briggs: objective → first action → next trigger → branch;
- Sato: purpose → expectation → commitment → future freedom;
- Nair: pattern → competing explanations → discriminator → provisional action;
- Varga: source → access → observation → limitation;
- Ortiz: aim → dependency → failure case → branch;
- Yusuf: real choice → incompatible priorities → sacrifice → ownership;
- Tan: result → meaning → repeat-or-noise test → adapt or hold.

The profiles are presentation-only. They do not decide stance or mechanics.

### Engine implication

Issue #113 must keep two different concepts separate:

1. **beat function** — what a beat does in the answer, such as position, reason, example or qualification;
2. **presentation move/profile** — the officer-specific order in which information is framed.

The compiler/interview engine should not hard-code twenty-four branches. Officer content should reference a validated presentation profile, and sequence composition recipes should select/order authored beats against that profile.

The engine must support:

- a normal profile;
- a compressed under-pressure form;
- deliberate authored inversions such as example-first interview stories;
- omission of unnecessary moves for short answers;
- deterministic fallback when a preferred move has no eligible authored beat.

It must not:

- generate missing prose;
- parse presentation style back into mechanics;
- make every answer emit every profile move;
- expose profile labels to the player;
- silently fall back to one global `position → reason` skeleton.

### Final presentation-style gate

Before #115 can claim officer-specific conversation shape, prove:

- all 24 officers resolve to a valid presentation profile;
- no two of the first 24 use the same full normal-order profile;
- profile identity is stable across cross-posts;
- cross-post content changes while the person's information order remains recognisable;
- at least one common substantive prompt renders materially different composition orders across comparison officers;
- pressure compression preserves the character's entry logic rather than collapsing everyone to the same terse form;
- a copy-only edit cannot change profile/beat selection;
- selection remains deterministic and independent of source-file order;
- the existing collision pairs are distinguishable by presentation order as well as vocabulary.

The current two-beat core bundles remain useful **voice fixtures**, but they are no longer sufficient evidence that final runtime dialogue is structurally distinct.

## Remaining limitation: the core answers are still too fixed for final runtime

This pass deliberately gives each officer one strong semantic answer to each test question.

That is enough to prove voice.

It is **not** enough to make repeated campaigns feel unscripted.

The next authoring layer should add variation through:

- alternate position/reason/example beats that preserve the same belief;
- billet-specific context;
- campaign-specific context;
- peer-specific material;
- callbacks to earlier interview answers;
- cooldown groups for anecdotes and signature language.

Do not solve this by paraphrasing every line randomly.

A different sentence that changes the officer's meaning is not harmless variation.

## Runtime topic rule

The final interview UI should not ask all eight common validation questions to every officer in every campaign.

These are test probes.

Runtime should expose roughly 5–7 topics that are relevant to:

- the officer;
- the campaign;
- the proposed billet;
- known peers.

That keeps interviews from feeling like a repeated personality questionnaire.

## Campaign-dialogue boundary

This pass covers **pre-campaign interview dialogue**.

Do not copy these answers into monthly chief conversations.

Campaign dialogue needs memo/option facts, professional stance, social modifier, commitments and memory. It should be authored after #116/#118 semantics are stable enough to give those beats real context.

## Result

The 24 characters pass the baseline worldview, plain-English and cadence tests.

The orthogonal review found that their current baseline bundles do **not** yet pass the final information-presentation test because the validation probes intentionally share one function skeleton.

The dialogue corpus remains a suitable semantic foundation for the interview system, provided #113/#115 implement the new presentation-profile layer before these bundles become final runtime conversation content.

It is not yet the finished variation or composition corpus and should not be presented as such.
