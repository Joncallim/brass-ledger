---
schema: brass-ledger-dialogue-bundle-v1
officer: sato
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# sato — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: sato.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because the next promise is starting to appear before we've decided whether we want to make it.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: sato.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because this is how we keep tying our own hands. We say something for today's effect, then act surprised when people expect us to mean it tomorrow.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: sato.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You've shown me you know when an option is worth closing. I don't need to keep every door open for you.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: sato.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Before the next public step, tell me what you're willing to be held to after it.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: sato.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The immediate move worked. The expectation it created is the part we're dealing with now.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: sato.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I was too protective of the room to manoeuvre. The commitment bought us more than I expected.
