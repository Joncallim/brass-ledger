---
schema: brass-ledger-dialogue-bundle-v1
officer: lin
mode: interview
source_bible: POTATO/41-OFFICER-STYLE-BIBLE
status: authored
---

# Grace Lin — Core Interview Dialogue

## sequence: headquarters-failure

prompt_id: interview.headquarters-failure
prompt: "What does this headquarters get wrong most often?"

### beat: lin.interview.headquarters-failure.position.01
function: position
text: |
  'Readiness' is too broad a word.

### beat: lin.interview.headquarters-failure.reason.01
function: reason
text: |
  Is the system broken? Are parts missing? Have the crews practised? Three problems. Three fixes.

## sequence: commander-disagreement

prompt_id: interview.commander-disagreement
prompt: "Tell me about a time you disagreed with a commander."

### beat: lin.interview.commander-disagreement.example.01
function: example
text: |
  Old system or new fix? I chose the old system for the operation.

### beat: lin.interview.commander-disagreement.qualification.01
function: qualification
text: |
  The commander wanted the new one. We tested it in parallel instead. Less elegant. Safer.

## sequence: red-line

prompt_id: interview.red-line
prompt: "What would make you tell me not to execute an order?"

### beat: lin.interview.red-line.position.01
function: position
text: |
  If nobody has tested the system the way we mean to use it, I will say so.

### beat: lin.interview.red-line.qualification.01
function: qualification
text: |
  We may still use it. I just do not want the first proper test to happen during the operation.

## sequence: self-critique

prompt_id: interview.self-critique
prompt: "What are you bad at?"

### beat: lin.interview.self-critique.position.01
function: position
text: |
  I can make vague people feel stupid.

### beat: lin.interview.self-critique.reason.01
function: reason
text: |
  That is on me. People often know something is wrong before they can tell an engineer which part.

## sequence: crisis-peer

prompt_id: interview.crisis-peer
prompt: "Who here would you want beside you in a crisis, and why?"

### beat: lin.interview.crisis-peer.peer-reference.01
function: peer-reference
text: |
  Tunde Okafor.

### beat: lin.interview.crisis-peer.reason.01
function: reason
text: |
  He does not hide an ugly constraint behind a vague sentence. If he says the repair system is the problem, I know he has separated it from the other things that merely look bad.

## sequence: cross-post

prompt_id: interview.cross-post
prompt: "I'm considering you for another post. What worries you about it?"

### beat: lin.interview.cross-post.position.01
function: position
text: |
  In Operations I would worry about reducing an operational problem to technical readiness.

### beat: lin.interview.cross-post.qualification.01
function: qualification
text: |
  Machines matter, but so do people, timing and the other side. A system that works perfectly can still support a bad operation.

## sequence: act-or-wait

prompt_id: interview.act-or-wait
prompt: "The picture is unclear, but time is short. Do we act or wait?"

### beat: lin.interview.act-or-wait.position.01
function: position
text: |
  Use what works. Test the new thing beside it.

### beat: lin.interview.act-or-wait.reason.01
function: reason
text: |
  We already have one unknown. Do not add another for no reason.

## sequence: future-cost

prompt_id: interview.future-cost
prompt: "We can gain something now, but it will leave us weaker next month. What matters?"

### beat: lin.interview.future-cost.position.01
function: position
text: |
  If the wear is known and repairable, spend it.

### beat: lin.interview.future-cost.reason.01
function: reason
text: |
  If today's gain creates a failure next month that we do not understand yet, I would be much more cautious.

