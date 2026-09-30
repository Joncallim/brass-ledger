---
schema: brass-ledger-dialogue-bundle-v1
officer: varga
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# varga — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: varga.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because the reporting is getting broader as it moves upward. The source didn't say all of that.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: varga.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because we've done this before. One source, narrow access, broad conclusion. I need you to look at what was actually seen.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: varga.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You don't make me turn a narrow report into a big answer just because the room wants one.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: varga.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Start with the original report next time. If the conclusion gets wider, make sure something new actually supports it.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: varga.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The gap was exactly where the source couldn't see. We treated absence of reporting like reporting.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: varga.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I held the reporting too long. You moved with enough to act on and I was too cautious about releasing it.
