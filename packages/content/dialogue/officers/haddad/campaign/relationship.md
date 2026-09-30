---
schema: brass-ledger-dialogue-bundle-v1
officer: haddad
mode: campaign
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
conversation_contract: POTATO/43-OFFICER-CAMPAIGN-CONVERSATIONS
status: authored-baseline
---

# haddad — Campaign Relationship Dialogue

## sequence: relationship-pushback-guarded

prompt_id: relationship.pushback
recipe: normal

### beat: haddad.campaign.relationship-pushback.guarded.01
function: position
requires:
  commander_respect: [guarded]
text: |
  Because the situation changed and the order didn't. People are already working around it.

## sequence: relationship-pushback-low

prompt_id: relationship.pushback
recipe: compressed

### beat: haddad.campaign.relationship-pushback.low.01
function: position
requires:
  commander_respect: [low]
text: |
  Because we're pretending the old plan still exists. It doesn't. And last month's workaround is still hanging around because nobody cleaned it up.

## sequence: relationship-changed-view-high

prompt_id: relationship.changed-view
recipe: normal

### beat: haddad.campaign.relationship-changed-view.high.01
function: position
requires:
  commander_respect: [high]
text: |
  Yes. You let people adapt when the plan breaks, and you usually make us tidy the workaround afterward. That matters.

## sequence: relationship-repair

prompt_id: relationship.repair
recipe: normal

### beat: haddad.campaign.relationship-repair.01
function: position
requires:
  commander_respect: [guarded, low]
text: |
  When the next workaround works, record why we used it and decide when it stops being temporary.

## sequence: callback-warned

prompt_id: callback.warned
recipe: normal

### beat: haddad.campaign.callback-warned.01
function: callback
requires:
  memory_refs: [warning-borne-out]
text: |
  Yes. The field picture moved faster than the plan. We kept trying to pull reality back toward the paperwork.

## sequence: callback-officer-wrong

prompt_id: callback.officer-wrong
recipe: normal

### beat: haddad.campaign.callback-officer-wrong.01
function: callback
requires:
  memory_refs: [officer-view-disconfirmed]
text: |
  I improvised too quickly. The original plan still had more life in it than I gave it credit for.
