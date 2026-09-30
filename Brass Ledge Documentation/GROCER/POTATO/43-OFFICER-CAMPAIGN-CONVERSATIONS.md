---
type: officer-campaign-conversation-contract
status: active
authority: authored-conversation-and-relationship-presentation
related_issues:
  - 113
  - 116
  - 117
  - 120
  - 124
---

# Officer Campaign Conversation Contract

Backlink: [[41-OFFICER-STYLE-BIBLE]]

This contract owns how campaign conversations evolve after officers are appointed.

It does not decide professional judgement, consequences or hidden truth. Those come from the simulation. Conversation turns legitimate state, history and relationship into authored questions and replies.

## Product goal

The player should stop feeling as if they are opening the same "chief conversation" every month.

Questions should change because the campaign changed.

An officer who warned the commander last month should remember it. An officer who has watched the commander repeat the same mistake should become less patient. An officer who was overruled and then proved wrong should be able to admit it. An officer with high professional respect may challenge the commander more directly, not less.

The player should feel a working relationship developing without seeing a relationship meter.

## Relationship split

Two different officer-owned relationships matter.

### Trust

Trust asks:

> Does this commander keep their word and deal with me honestly?

It is affected by things such as commitments, candour, acknowledged overrides and how the commander handles the officer personally.

### Professional respect

Professional respect asks:

> Do I think this commander has good judgement?

It is affected by repeated command behaviour and consequences the officer can legitimately observe.

A commander can have high trust and low respect, or low trust and high respect.

Do not collapse them.

## Professional-respect bands

Internal closed bands:

- low;
- guarded;
- normal;
- high.

The player never sees the band or a number.

Default is normal unless scenario history explicitly says otherwise.

## What counts as poor judgement

A bad outcome alone is not enough.

Respect falls when the officer can see a pattern such as:

- the commander ignored a known material constraint and the warned problem occurred;
- the same known failure was repeated without a changed condition or reason;
- new information broke an assumption and the commander refused to change;
- incompatible priorities were left unresolved and execution suffered;
- the commander blamed the staff for a risk the staff had already raised;
- the commander keeps making the same kind of error the officer's professional lens is meant to catch.

Respect can rise or recover when the officer sees:

- the commander change course for a real reason rather than to save face;
- a deliberate trade-off made with the cost understood;
- a sound overrule that the later result supports;
- the commander correctly identify the cause of a setback and change behaviour;
- several cycles of sound decisions in the officer's area of concern.

Saying "you're right" is not a competence signal.

## Respect transition rule

At cycle close:

1. derive player-safe judgement events from verified history;
2. keep only events relevant to the officer's judgement lenses;
3. choose the strongest positive and strongest negative;
4. equal strength cancels;
5. move at most one band;
6. persist the causal refs in officer memory.

No arithmetic score. No counting three weak events into one strong event.

Repeated mistakes matter because they produce new events across time.

## Respect changes expression, not truth

Professional respect may change:

- how quickly the officer gets to the point;
- how much benefit of the doubt appears in wording;
- whether a challenge is gentle, blunt or formally recorded;
- whether the officer reminds the commander of an earlier warning;
- which relationship/reflection questions are available;
- whether the officer spends time explaining basics again.

It does not change:

- facts;
- evidence;
- professional stance;
- hard constraints;
- hidden truth;
- the officer's duty to report something material.

Low respect must never cause sabotage, lying or withholding.

## Evolving question surface

Show a small relevant set, normally three to five questions.

Do not show every possible question.

Question relevance is deterministic and comes from player-safe context.

### Baseline questions

Useful in many conversations:

- What worries you most right now?
- What would you do?
- What am I missing?
- What would change your mind?

### Active disagreement

Available only when relevant:

- Why are you pushing back?
- What would make you support this?
- Is this a hard stop or a risk we can take?
- Who on the staff sees this differently?

### After a consequence

Available after an outcome the officer can discuss:

- What did we get wrong?
- What did we get right?
- What should we do differently next time?
- Was this the risk you warned me about?

### Callbacks

Available only when the memory exists:

- I overruled you. Has your view changed?
- You warned me about this. What did I miss?
- You were wrong about this. Does it change your view?
- We made this promise earlier. What does it mean now?

### Relationship / judgement

Do not expose these on turn one.

Unlock them when the relationship has actually changed:

- You've been pushing back harder. Why?
- Do you think I'm getting this wrong?
- What do you need from me before you trust this call?
- Have I changed your view of how I command?

These questions are not confession buttons and do not directly repair respect.

## Question ranking

Question availability is a closed set. Rank eligible questions by:

1. unresolved current decision;
2. new material consequence;
3. direct callback to a prior warning/overrule/commitment;
4. material trust/respect change;
5. stable baseline question.

Within the same rank, canonical question ID order is the deterministic fallback.

The UI may present up to five. It should not invent its own ranking.

## Multiple authored replies

Each question can have multiple authored reply beats.

Eligibility may use only reviewed safe dimensions:

- active billet;
- current professional/expressed stance;
- player-safe issue/consequence tags;
- trust band;
- professional-respect band;
- remembered warning/overrule/commitment;
- named peer context;
- prior asked topics;
- cooldown groups.

The same semantic answer may have more than one copy variant.

Different semantic states must not be disguised as paraphrase variants.

## Player response choices

Some officer replies can end with a small authored commander response set.

Closed posture families:

- ask-for-evidence;
- ask-for-alternative;
- acknowledge-cost;
- own-mistake;
- challenge;
- overrule;
- defer;
- record-dissent;
- commit.

These are not "nice / mean" buttons.

Conversation choices may create explicit memory or trust effects where a code-owned effect ID authorises it.

They do not directly increase professional respect.

If the commander says "I was wrong", the officer can remember the acknowledgement. Respect repairs only if later decisions show learning.

## Conversation memory

Officer-owned memory may retain semantic refs such as:

- warned-about-risk;
- warning-was-borne-out;
- officer-was-overruled;
- officer-was-overruled-and-wrong;
- commander-owned-mistake;
- commander-repeated-known-failure;
- commitment-kept;
- commitment-broken;
- respect-shift;
- prior-question / selected-beat IDs.

Do not persist prose as authority.

## Personality and respect expression

The same respect band should look different by officer.

See [[41-OFFICER-STYLE-BIBLE]] for the 24-person matrix.

A low-respect Briggs is terse and action-focused.

A low-respect Halden becomes more explicit about what was already known.

A low-respect Dubois can remain polite while making the relationship cost impossible to miss.

A low-respect Bell may sound disappointed rather than hostile.

A low-respect Yusuf may simply name the choice the commander has avoided again.

High respect also differs. It is not generic warmth.

## Information boundary

Conversation may read only a dedicated player-safe context assembled from verified history.

It may not read hidden Ravellan state, future outcomes, raw private evidence origins, internal scoring data or inaccessible peer state.

The player can ask "Was this the risk you warned me about?" only if the officer actually raised that risk in recorded memory.

## Copy boundary

Rendered text never feeds back into mechanics.

The authoritative conversation record is semantic:

- question ID;
- sequence ID;
- selected beat IDs;
- selected commander-response effect ID where relevant;
- safe context refs used;
- officer relationship bands at the time.

Copy-only edits change copy identity only.

## Natural language

All campaign dialogue follows the same simple spoken-English rule as the interview corpus.

Respect changes bluntness, patience and structure. It does not change vocabulary sophistication.

Nobody starts speaking like a management paper because respect is low.

## Required authoring coverage

For each of the first 24 officers, campaign content should eventually cover:

- one baseline current-state reply;
- one active disagreement reply;
- one consequence / learning reply;
- one warning or overrule callback;
- one guarded/low-respect relationship reply;
- one high-respect candid reply;
- one billet-specific reply for each normal/credible active billet that materially changes the answer.

This is minimum semantic coverage, not a fixed number of files.

## Tests

Prove:

- question availability evolves with state/history;
- irrelevant callback questions never appear;
- same verified prefix produces the same question set;
- trust and professional respect can diverge;
- respect changes expression but not professional stance;
- low-respect officers still report material facts;
- high respect does not suppress dissent;
- one bad outcome alone does not drop respect;
- repeated known failure can move normal → guarded → low over separate cycles;
- changed behaviour can repair respect gradually;
- copy-only edits cannot alter question availability or respect;
- no reroll by reopening;
- no source-file-order dependence.

## Rejection conditions

Reject if:

- there is one global commander-competence score;
- officers judge only by win/loss;
- relationship questions are always visible;
- saying the right line farms respect;
- all low-respect officers become rude;
- respect changes facts or professional stance;
- dialogue reads hidden truth;
- runtime generates prose.
