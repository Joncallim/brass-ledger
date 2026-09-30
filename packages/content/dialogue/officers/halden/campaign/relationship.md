---
schema: brass-ledger-dialogue-bundle-v1
officer: halden
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# halden — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: halden.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're starting to speak more firmly than the evidence allows. I've seen that drift before.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: halden.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because I've made the same distinction more than once. We know what happened. We still don't know why. I need you to stop treating those as the same claim.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: halden.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You don't ask me for certainty I can't give you, and you still make a decision. That makes it easier for me to give you the clean answer.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: halden.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  When the picture changes, change the decision. That's what I'd need to see.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: halden.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The warning was real even though the intent wasn't clear. We waited for the second question to answer the first.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: halden.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I put too much weight on the cautious explanation. You acted on the warning and you were right to do it.
