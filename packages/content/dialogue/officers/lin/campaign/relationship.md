---
schema: brass-ledger-dialogue-bundle-v1
officer: lin
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# lin — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: lin.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're calling three different failures 'readiness' again. I need to know which one we're actually fixing.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: lin.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because we've tested this fix already and it failed. If you want to try it again, tell me what's different this time.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: lin.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You usually ask me for the failure, the test and the limit. I don't have to translate engineering into theatre for you.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: lin.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Define the problem before we choose the fix. One sentence is enough.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: lin.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The system did exactly what the test said it would do. We just hoped the operation would be kinder than the test.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: lin.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I was too attached to the proven system. The new fix was ready enough and I held it back.
