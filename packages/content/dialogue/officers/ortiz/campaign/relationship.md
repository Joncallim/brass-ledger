---
schema: brass-ledger-dialogue-bundle-v1
officer: ortiz
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# ortiz — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: ortiz.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because the plan still has one dependency nobody owns if it fails.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: ortiz.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because we've lost more than one plan to the same kind of thing: one promise, no fallback. I need a real branch before I call this ready.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: ortiz.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You've shown me you'll accept a thin branch if it's real. I don't need to build a comfortable answer before we move.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: ortiz.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Give the next major dependency an owner and a trigger for the fallback.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: ortiz.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The main move was fine. The unowned dependency is what broke it.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: ortiz.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I wanted a stronger branch than we had time to build. The thin one was enough.
