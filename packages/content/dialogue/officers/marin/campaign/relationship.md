---
schema: brass-ledger-dialogue-bundle-v1
officer: marin
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# marin — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: marin.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're relying on another promise that still hasn't turned into movement.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: marin.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because friendly words keep going into the plan as if they're trucks on the road. I need a deadline and a fallback before I trust it.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: marin.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You use partner goodwill without confusing it with delivery. That means I can be honest when a reliable friend is having a bad week.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: marin.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  For the next critical contribution, set the deadline and the fallback before the meeting ends.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: marin.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. They wanted to help. They still didn't deliver in time. That's the difference I was worried about.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: marin.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I gave the partner too little room. They delivered, and cutting them out would have cost us for no reason.
