---
schema: brass-ledger-dialogue-bundle-v1
officer: hale
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# hale — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: hale.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're taking another small piece out of a programme and calling it temporary.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: hale.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because the temporary raids are now the reason the capability keeps slipping. If we take more, I want you to say what date we're giving up.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: hale.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You've shown me you'll spend the future when the present truly matters, and protect it when it doesn't. I can work with that.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: hale.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Before the next raid, name the milestone it moves and decide whether today's problem is worth that delay.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: hale.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. We solved the urgent problem. The capability that was meant to arrive now won't. That's the bill.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: hale.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I protected the programme too hard. This was exactly the kind of crisis we were building it for.
