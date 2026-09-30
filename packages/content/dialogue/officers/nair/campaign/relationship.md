---
schema: brass-ledger-dialogue-bundle-v1
officer: nair
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# nair — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: nair.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're settling on the story before we've tested the other one properly.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: nair.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because every new fact is being made to fit the same explanation. That's usually when I want us to slow down, not speed up.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: nair.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You let me bring you a rough pattern without turning it straight into policy. That means I can show you things earlier.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: nair.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Next time, keep one serious alternative alive until we have something that separates the two.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: nair.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The pattern mattered. We just waited too long for it to become neat.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: nair.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  My pattern was real and my explanation wasn't. You were right not to build the whole decision around it.
