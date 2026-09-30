---
schema: brass-ledger-dialogue-bundle-v1
officer: tan
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# tan — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: tan.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're treating one result like a rule again. I want one more look before we redesign anything around it.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: tan.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because we've 'learned' three different lessons from three different surprises. At some point the constant change becomes the problem.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: tan.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You let me bring you a new lesson without turning it into policy on the spot. That means I can surface things earlier.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: tan.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  When something surprises us, record it first. Change the system after we've seen enough to know what it means.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: tan.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. We changed too much after the first result. The next cycle showed the first one wasn't the pattern we thought it was.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: tan.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I treated the result as noise. It repeated, and I should have pushed the change earlier.
