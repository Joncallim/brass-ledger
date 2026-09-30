---
schema: brass-ledger-dialogue-bundle-v1
officer: okafor
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# okafor — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: okafor.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because the plan is asking for more real capacity than we have. Somebody needs to say what gets less.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: okafor.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because we're promising the same capacity twice again. Which job is losing the lift this time?

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: okafor.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You spend buffers on purpose. That means I can bring you a workaround without worrying you'll hear it as free capacity.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: okafor.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Pick the constraint that matters and actually protect it when something else asks for the same capacity.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: okafor.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The thing that failed was the part we had no spare capacity behind. That's what I was trying to protect.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: okafor.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I treated the limit as fixed. You found another route. I was too narrow about what could move.
