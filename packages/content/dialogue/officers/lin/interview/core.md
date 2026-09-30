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
  'Readiness' tells me almost nothing.

### beat: lin.interview.headquarters-failure.reason.01
function: reason
text: |
  Is something broken? Are we short of parts? Have the crews actually practised? Those are different problems. They need different fixes.

## sequence: commander-disagreement

prompt_id: interview.commander-disagreement
prompt: "Tell me about a time you disagreed with a commander."

### beat: lin.interview.commander-disagreement.example.01
function: example
text: |
  We had an old system and a new fix. I wanted the old one for the operation.

### beat: lin.interview.commander-disagreement.qualification.01
function: qualification
text: |
  The commander wanted the new one. We ended up running it beside the old system first. Not elegant. It was safer.

## sequence: red-line

prompt_id: interview.red-line
prompt: "What would make you tell me not to execute an order?"

### beat: lin.interview.red-line.position.01
function: position
text: |
  If nobody has tested the system the way we're about to use it, I'll say that very clearly.

### beat: lin.interview.red-line.qualification.01
function: qualification
text: |
  Maybe we still use it. I just don't want the operation to be the first proper test.

## sequence: self-critique

prompt_id: interview.self-critique
prompt: "What are you bad at?"

### beat: lin.interview.self-critique.position.01
function: position
text: |
  I can make people feel stupid when they're being vague.

### beat: lin.interview.self-critique.reason.01
function: reason
text: |
  That's my fault. People often know something's wrong before they can tell an engineer exactly which part is wrong.

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
  Tunde. If he says the repair system is the problem, I know he's separated that from the five other things that merely look ugly.

## sequence: cross-post

prompt_id: interview.cross-post
prompt: "I'm considering you for another post. What worries you about it?"

### beat: lin.interview.cross-post.position.01
function: position
text: |
  In Operations, I'd have to stop myself turning every problem into a technical-readiness problem.

### beat: lin.interview.cross-post.qualification.01
function: qualification
text: |
  The kit matters. So do timing, people, and the other side. A system can work perfectly and still be used badly.

## sequence: act-or-wait

prompt_id: interview.act-or-wait
prompt: "The picture is unclear, but time is short. Do we act or wait?"

### beat: lin.interview.act-or-wait.position.01
function: position
text: |
  Use the thing we know works. Test the new thing beside it.

### beat: lin.interview.act-or-wait.reason.01
function: reason
text: |
  We've already got enough uncertainty. No need to add more unless it buys us something.

## sequence: future-cost

prompt_id: interview.future-cost
prompt: "We can gain something now, but it will leave us weaker next month. What matters?"

### beat: lin.interview.future-cost.position.01
function: position
text: |
  If the wear is understood and we know how to repair it, I'd spend it.

### beat: lin.interview.future-cost.reason.01
function: reason
text: |
  If we're creating a failure next month that we don't properly understand yet, I'd slow down.
