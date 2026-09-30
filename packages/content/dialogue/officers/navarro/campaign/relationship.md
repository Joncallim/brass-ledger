---
schema: brass-ledger-dialogue-bundle-v1
officer: navarro
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# navarro — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: navarro.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're calling another one-off success 'ready.' I want to know whether we can do it again.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: navarro.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because we've done this before. Extra help, best team, one clean run, then suddenly it's a standard. It isn't.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: navarro.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You'll use an exception when you need one without pretending it proves more than it does. I can work with that.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: navarro.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Show me the repeat. Same task, normal people, normal support. Then I'll change my view.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: navarro.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The first run worked. The repeat is where it came apart. That's the gap I was talking about.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: navarro.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I asked for more proof than this decision needed. We only needed it to work once, and it did.
