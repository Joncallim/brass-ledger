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
  We say 'readiness' when we mean three different failures.

### beat: lin.interview.headquarters-failure.reason.01
function: reason
text: |
  One system is unreliable, another is short of parts, and a third has crews who have never used it under pressure. Those are not the same problem.

## sequence: commander-disagreement

prompt_id: interview.commander-disagreement
prompt: "Tell me about a time you disagreed with a commander."

### beat: lin.interview.commander-disagreement.example.01
function: example
text: |
  I once argued for keeping an older system in service while a new fix was being rushed.

### beat: lin.interview.commander-disagreement.qualification.01
function: qualification
text: |
  The commander wanted the newer option because it looked like progress. We kept the old system for the operation and tested the fix in parallel. It was less elegant and much safer.

## sequence: red-line

prompt_id: interview.red-line
prompt: "What would make you tell me not to execute an order?"

### beat: lin.interview.red-line.position.01
function: position
text: |
  If the order relies on a system nobody has tested in the way we intend to use it, I will tell you exactly what we do not know.

### beat: lin.interview.red-line.qualification.01
function: qualification
text: |
  Sometimes we still use it. We should not discover the failure mode by accident if we had another choice.

## sequence: self-critique

prompt_id: interview.self-critique
prompt: "What are you bad at?"

### beat: lin.interview.self-critique.position.01
function: position
text: |
  I can make people feel foolish when they cannot state a problem precisely.

### beat: lin.interview.self-critique.reason.01
function: reason
text: |
  That is not helpful. Sometimes they know something is wrong before they have the language to tell me which part is failing.

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
  Use the thing we know works and test the new thing in parallel.

### beat: lin.interview.act-or-wait.reason.01
function: reason
text: |
  Uncertainty is already expensive; do not add another unknown unless it buys something important.

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

