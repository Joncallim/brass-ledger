---
schema: brass-ledger-dialogue-bundle-v1
officer: rahman
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# rahman — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: rahman.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're changing the process before we've worked out what part of it was actually protecting us.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: rahman.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because 'streamline it' keeps meaning 'remove the bit we don't understand.' That's not reform. That's guessing.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: rahman.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You'll let me move quickly, but you've shown me you'll stop if the old process was carrying something useful.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: rahman.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Before we remove the next step, make someone explain what job it was doing.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: rahman.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. We removed the delay and the safeguard with it. The safeguard is the part that came back to bite us.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: rahman.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I treated the objection as resistance. It wasn't. There was a real safeguard in there and I should have listened longer.
