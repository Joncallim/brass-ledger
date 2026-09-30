---
schema: brass-ledger-dialogue-bundle-v1
officer: warden
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# warden — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: warden.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're spending the same people again, and 'we'll recover them later' keeps moving.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: warden.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because I've heard 'one more month' before. If you want to use them, tell me when they come off the line. I don't believe the rest until I see it happen.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: warden.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You make hard calls, but you usually name who pays and what happens after. That means I can be very direct with you.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: warden.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Don't tell me you understand the cost. Show me the recovery actually happens.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: warden.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. This is the bill I was talking about. They carried the extra load. Now they're the thin part of the force.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: warden.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I was too protective of the people. You spent them and it mattered. I'd be quicker to back that call next time.
