---
schema: brass-ledger-dialogue-bundle-v1
officer: briggs
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# briggs — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: briggs.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're circling the decision again. I need to know what happens first, not what we hope the situation looks like afterward.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: briggs.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because I can't execute 'keep options open.' Give me the first move, the trigger, and what we do if it fails.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: briggs.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. I know you'll decide when it matters. So I don't need to dress the answer up for you.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: briggs.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Give me one clear order that survives contact with Monday morning.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: briggs.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. We lost time at exactly the point I was worried about. The first move was never clear.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: briggs.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I wanted to move too early. Holding bought us the better route. I'd wait next time.
