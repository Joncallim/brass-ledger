---
schema: brass-ledger-dialogue-bundle-v1
officer: mensah
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# mensah — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: mensah.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because this solution has a price we haven't really put on the table yet.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: mensah.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because we're calling another expensive favour a quick fix. We've done that enough times that the favour is becoming the constraint.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: mensah.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You know a negotiated answer isn't free just because the invoice isn't money. That lets me bring you more aggressive options.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: mensah.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Next time, ask what we give up later before you call the deal solved.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: mensah.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. We got what we needed. The access we gave away to get it is the part hurting us now.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: mensah.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I thought the limit could be moved. This time it really was a hard limit. I pushed the negotiation too far.
