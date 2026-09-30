---
schema: brass-ledger-dialogue-bundle-v1
officer: kessler
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# kessler — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: kessler.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because the reset keeps sliding. Another surge may still be right, but I want to know when we come down from it.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: kessler.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because 'after this one' has become the plan. We've postponed recovery too many times for me to treat that as a real answer.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: kessler.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You've spent the reserve hard when it mattered and actually protected the reset afterward. That makes me more willing to say 'go' when the next surge is real.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: kessler.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Put the reset on the calendar and leave it there when the next urgent request arrives.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: kessler.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. We got the immediate effect. Now we're paying for the reset we skipped.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: kessler.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I protected the recovery window too hard. This was the moment to spend it, and you were right.
