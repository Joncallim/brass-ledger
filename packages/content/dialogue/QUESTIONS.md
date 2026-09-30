# Campaign Dialogue Question Catalog

This is the authored question catalog for #124.

Question IDs are semantic. Surface wording may vary. Availability comes from verified player-safe state and officer memory, never hidden truth.

## baseline.current-concern

Purpose: ask for the officer's current priority.

Prompt variants:
- "What worries you most right now?"
- "What's the bit you're watching?"
- "If you had to pick one concern, what is it?"

## baseline.recommendation

Purpose: ask what the officer would do.

Prompt variants:
- "What would you do?"
- "What's your call?"
- "If this were yours, what would you do next?"

## baseline.missing

Purpose: invite the officer to surface something the commander may not be weighting enough.

Prompt variants:
- "What am I missing?"
- "What do you think I'm underweighting?"
- "What's the part I haven't asked about?"

## baseline.change-mind

Purpose: expose the officer's decision trigger.

Prompt variants:
- "What would change your mind?"
- "What would make you call this differently?"
- "What are you waiting to see?"

## disagreement.why

Requires: active professional or expressed disagreement.

Prompt variants:
- "Why are you pushing back?"
- "What's the main thing you don't like?"
- "Where do you think this goes wrong?"

## disagreement.support-condition

Requires: current stance short of support and a legal condition/mitigation path.

Prompt variants:
- "What would make you support it?"
- "What would you need changed?"
- "Is there a version of this you'd back?"

## disagreement.risk-or-stop

Requires: officer concern strong enough that the distinction matters.

Prompt variants:
- "Is this a hard stop, or a risk we can take?"
- "Are you telling me not to do it?"
- "Can we carry the risk, or not?"

## disagreement.peer

Requires: player-safe peer disagreement available.

Prompt variants:
- "Who sees this differently?"
- "Who on the staff disagrees with you?"
- "Whose view should I hear before I decide?"

## consequence.wrong

Requires: new material adverse consequence.

Prompt variants:
- "What did we get wrong?"
- "Where did we misread it?"
- "What should we have seen earlier?"

## consequence.right

Requires: new material positive/avoided consequence.

Prompt variants:
- "What did we get right?"
- "What worked the way you expected?"
- "What should we keep doing?"

## consequence.next-time

Requires: prior consequence with an actionable lesson.

Prompt variants:
- "What do we do differently next time?"
- "What's the change you want after this?"
- "What do you not want to repeat?"

## callback.warned

Requires: officer memory that this officer previously warned about the realised risk.

Prompt variants:
- "You warned me about this. What did I miss?"
- "Was this the thing you were worried about?"
- "You called this earlier. Talk me through it again."

## callback.overruled

Requires: prior officer overrule and current relevant outcome.

Prompt variants:
- "I overruled you. Has your view changed?"
- "I went against your advice. What do you make of the result?"
- "You disagreed with that call. Do you still?"

## callback.officer-wrong

Requires: officer prior firm/soft view materially disconfirmed by later safe outcome.

Prompt variants:
- "You were wrong about this. Does it change your view?"
- "That went better than you expected. What did you miss?"
- "Does this result change your call next time?"

## callback.commitment

Requires: active or recently resolved commitment involving this officer/billet.

Prompt variants:
- "We made this promise earlier. What does it mean now?"
- "Does that earlier commitment still bind us?"
- "What are we still on the hook for?"

## relationship.pushback

Requires: respect decreased or repeated challenge memory.

Prompt variants:
- "You've been pushing back harder. Why?"
- "You've been less patient with my calls lately. What's changed?"
- "You don't sound convinced by me. Why?"

## relationship.judgement

Requires: guarded/low professional respect or a strong recent judgement signal.

Prompt variants:
- "Do you think I'm getting this wrong?"
- "Do you trust my judgement on this?"
- "Are you worried about the decision, or about how I'm making it?"

## relationship.repair

Requires: low/guarded respect plus at least one relevant changed-behaviour path. Does not itself repair respect.

Prompt variants:
- "What do you need to see from me?"
- "What would make you more comfortable with my judgement?"
- "What would tell you I've actually learned from this?"

## relationship.changed-view

Requires: material positive or negative respect change from baseline.

Prompt variants:
- "Have I changed your view of how I command?"
- "Do you read my decisions differently now than you did at the start?"
- "Has anything about the way I command surprised you?"

## Authoring rules

- Normally show 3–5 eligible questions.
- Do not expose relationship questions before there is relationship history.
- Do not ask a callback question without the exact memory ref that makes it true.
- Prompt variants are copy only; selecting a different wording cannot change the semantic question.
- Questions never reveal internal bands, trait IDs, score or hidden state.
- All wording uses ordinary spoken English.
