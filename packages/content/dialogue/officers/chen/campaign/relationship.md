---
schema: brass-ledger-dialogue-bundle-v1
officer: chen
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# chen — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: chen.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're fixing one part and pushing the problem into another part again.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: chen.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because this is the same chain we missed last time. The first number looks better and the system underneath it gets worse.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: chen.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You can hold a wider picture without asking me to explain every branch before we act. That lets me give you the important link first.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: chen.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Before the next fix, follow it one step further than the obvious effect. That's usually enough.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: chen.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The thing that broke wasn't the first thing on the page. It was the next link after it.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: chen.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I widened the problem too far. You picked the part that could actually break soon and that was the right cut.
