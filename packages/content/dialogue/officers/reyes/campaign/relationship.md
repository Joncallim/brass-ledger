---
schema: brass-ledger-dialogue-bundle-v1
officer: reyes
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# reyes — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: reyes.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because the order is getting longer and the aim is getting harder to find.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: reyes.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because people are being told every step again and still don't know what matters when the first thing changes.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: reyes.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You give a clear aim and a real boundary, then you let people work. That means I can argue for more freedom without worrying we're just dumping confusion downward.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: reyes.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Next order, tell them what must happen and what must not happen. Leave the rest alone.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: reyes.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The detail changed and the units froze because we had told them how, not why.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: reyes.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I gave too much freedom before the force shared enough of the picture. The common procedure was the right call.
