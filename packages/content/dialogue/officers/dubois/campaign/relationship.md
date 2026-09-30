---
schema: brass-ledger-dialogue-bundle-v1
officer: dubois
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# dubois — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: dubois.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because we're leaning on people who haven't really agreed to carry this with us. That's starting to matter.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: dubois.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because they don't believe the reassurance anymore. We've surprised them too many times. I can keep the relationship polite; I can't make it trustworthy by wording it better.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: dubois.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You listen when I tell you a relationship cost is real, even if you still choose to spend it. That makes it easier for me to tell you the ugly version early.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: dubois.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  Talk to them before the next decision lands on them. Not after.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: dubois.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. We saved time by going around them. The access we lost afterward is the cost I was worried about.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: dubois.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I protected the relationship too long. You were right to force the issue.
