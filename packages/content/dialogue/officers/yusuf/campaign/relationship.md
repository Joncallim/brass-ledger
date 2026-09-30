---
schema: brass-ledger-dialogue-bundle-v1
officer: yusuf
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# yusuf — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: yusuf.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're using careful language where a choice is needed.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: yusuf.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because this is the same choice again and we're still calling both sides the priority. They're not. Pick one.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: yusuf.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You don't hide behind 'balance' when a real trade appears. That means I can put the ugly choice in front of you without spending ten minutes softening it.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: yusuf.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Make the next priority choice before the staff has to make it for you.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: yusuf.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The conflict showed up exactly where it was going to: both priorities needed the same thing at the same time.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: yusuf.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I forced the choice too early. You held the tension and a better option appeared. I was wrong to close it.
