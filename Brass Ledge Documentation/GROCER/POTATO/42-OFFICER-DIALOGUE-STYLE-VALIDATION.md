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

The 24 characters now pass the baseline voice test.

The dialogue corpus is suitable as the semantic foundation for the interview system.

It is not yet the finished variation corpus and should not be presented as such.
