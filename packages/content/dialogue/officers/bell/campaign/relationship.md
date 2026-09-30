---
schema: brass-ledger-dialogue-bundle-v1
officer: bell
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# bell — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: bell.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're coaching around the same performance problem again. I need to know where the line is.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: bell.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because the team is still carrying someone we keep saying will improve. At this point, our patience is the thing hurting them.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: bell.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You give people room to recover, but you'll act when the job has outgrown the person. That makes it easier for me to argue for one more chance when I think it matters.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: bell.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Set the point where support ends and a personnel decision starts. Then stick to it.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: bell.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. We gave one more chance and the team carried the gap again. That's the cost I was worried about.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: bell.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I was ready to move them too soon. They improved, and the extra chance was worth it.
