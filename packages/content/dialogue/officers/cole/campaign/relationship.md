---
schema: brass-ledger-dialogue-bundle-v1
officer: cole
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# cole — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: cole.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're adding another task and I'm losing sight of which one is meant to move the campaign.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: cole.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because we've done this twice now: new activity, no clearer main effort. I need you to decide what the rest is supporting.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: cole.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. When the main aim changes for a good reason, you'll drop the old plan instead of protecting it. That makes planning with you much easier.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: cole.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Before we add anything else, name the main effort and cut one thing that doesn't help it.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: cole.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The individual actions worked. The campaign still pulled in two directions. That's what I was worried about.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: cole.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I protected the shape of the plan too long. You cut through it and kept the right objective.
