---
schema: brass-ledger-dialogue-bundle-v1
officer: mercer
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# mercer — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: mercer.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're filling today's hole with the person who was meant to fill tomorrow's.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: mercer.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because this is another 'temporary' posting that creates a vacancy nobody is planning to refill. I need you to look one move further.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: mercer.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You usually remember that today's clean personnel answer can make next quarter ugly. I don't have to explain the whole pipeline every time.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: mercer.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Next time we move someone, decide who fills the hole before the order goes out.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: mercer.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. We solved the urgent vacancy. The shortage we're looking at now is the one that move created.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: mercer.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I was too focused on the pipeline. Keeping that person in place was worth the mess it caused later.
