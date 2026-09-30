---
type: officer-style-bible
status: active
authority: authored-character-and-dialogue-style
plain_language: required
related_issues:
  - 113
  - 115
  - 116
  - 118
  - 120
  - 122
---

# Officer Style Bible — 24-Person Roster

Backlink: [[README]]

This document is the character and dialogue authority for the first 24 Brass Ledger officers.

It does not define simulation formulas. Billet fit, skills, traits, relationships and dialogue ids are implemented elsewhere. This file defines who each person is, how they think, how they speak, what makes them useful, and where their judgement can fail.

## Writing rules

All player-facing dialogue uses plain English.

Characters may use normal military terms that a player can understand from context, but they should not speak in staff-college jargon, abstract management language or internal engine terminology.

A good line should sound like a senior professional speaking to another senior professional. Most lines should be direct and useful. Character comes from what the officer notices, what they challenge, what they leave unsaid, and how they respond to pressure.

Nobody should explain their own personality.

Do not write:
"I value institutional resilience and human capital."

Write:
"You can use the same crews again. They just won't be fresh next month."

Every officer needs a useful instinct and a matching blind spot. Their best quality should sometimes create their worst judgement.

Nobody should be predictable from billet alone. A logistics officer can recommend the boldest option. An operations officer can argue for restraint. An intelligence officer can demand immediate action. A people officer can knowingly spend personnel.

Signature phrases are rare. If a phrase appears often enough for the player to notice the writing pattern, it is being overused.

Names, gender and background do not determine accent, grammar, temper or professional style. Do not reach for cultural shorthand when writing any officer. Their voice comes from career, personality and experience.

Plain English does not mean every officer sounds the same. Distinction comes from sentence length, what they notice first, how directly they disagree, whether they use examples, and what they refuse to leave vague.


## Spoken-English naturalness rule

Player-facing dialogue should sound spoken, not polished for publication.

All 24 officers share the same simple language level. Intelligence, seniority and personality change what they notice and how they order a thought; they do **not** give one officer a more academic vocabulary than another.

Use ordinary contractions where a person would naturally use them: "I'd", "we're", "can't", "that's", "doesn't". Do not force contractions into every line.

Allow:

- short fragments;
- an uneven sentence beside a longer one;
- "Fine.", "No.", "Look.", "Maybe.", or a name used naturally;
- a small self-correction;
- an answer that stops once the point is clear;
- a story that does not finish with a perfect lesson.

Avoid the common synthetic patterns:

- perfectly balanced opposites in every answer;
- "X is not Y. It is Z." as a repeated cadence;
- "That does not mean..." as a habitual qualification;
- "The question is not X. The question is Y." unless the character really needs that contrast;
- repeated "If X... If Y..." pairs that wrap every trade-off into a neat binary;
- three-item rhetorical lists just because three sounds complete;
- abstract closing lines that restate the moral after the example already made it clear;
- turning every answer into a miniature briefing note.

Bad:
"Uncertainty is not a reason for vague orders. If the job is beyond the person doing it, change the job or change the person."

Better:
"The picture can be messy. The order still can't be. And if the person's out of their depth, deal with that."

Bad:
"A relationship can be valuable and still not be worth protecting in every decision."

Better:
"Sometimes you spend the relationship. Just know you're doing it."

Natural does not mean casual comedy, slang-heavy banter or verbal clutter. These are senior officers at work. The target is **plain, unforced speech**.

When a line sounds quotable because it is too perfectly shaped, distrust it.

## Information-presentation contract

Voice is not enough. Each officer also needs a recognisable way of **ordering information for another person**.

This is a separate axis from worldview, vocabulary, sentence length and professional stance. Two officers may notice the same fact and reach the same recommendation while still explaining it in a different order.

A presentation profile answers:

> When this person has several relevant things to say, what do they put first, what do they make it mean, and how do they move toward action?

The profile is a default reasoning path, not a catchphrase and not a rigid four-sentence template.

- Do not print the profile name in player-facing dialogue.
- Do not force every short answer to contain every move.
- In a substantive multi-beat answer, preserve the officer's normal ordering unless the authored sequence deliberately calls for an inversion, such as a story-first interview answer.
- Pressure normally **compresses** a profile rather than replacing it. Briggs becomes even more action-first; Halden strips down to the claim that matters; Warden reduces the issue to the people being spent and the recovery term.
- Cross-posting changes the facts and responsibilities being discussed. It does not turn the officer into the normal occupant of that billet.
- Presentation order never determines professional stance, trust, social influence, recommendation legality or simulation outcomes.
- A player should learn these patterns by repeated exposure. If the pattern is so repetitive that it sounds like a branded framework, it is too obvious.

The first 24 officers use these distinct default presentation profiles:

| Officer | Profile id | Normal information order |
| --- | --- | --- |
| Ruth Warden | `warden.human-cost` | bearer → burden → duration → recovery / terms |
| Elias Halden | `halden.claim-ladder` | observed → assessed → unknown or change-trigger → action |
| Mara Briggs | `briggs.action-sequence` | objective → first action → next trigger → branch |
| Tunde Okafor | `okafor.constraint-chain` | requirement → bottleneck → real capacity → workaround / price |
| Mina Sato | `sato.commitment-chain` | purpose → expectation created → commitment implied → future freedom |
| Elena Navarro | `navarro.standard-proof` | claimed standard → repeated evidence → gap → next test |
| Daniel Mercer | `mercer.pipeline-domino` | move now → next vacancy → pipeline effect → succession fix |
| Farah Rahman | `rahman.first-principles-change` | purpose → inherited process → why it still exists → smallest useful change |
| Claire Dubois | `dubois.cooperation-map` | actors → dependence → relationship risk → who needs to speak, and when |
| Priya Nair | `nair.hypothesis-test` | pattern → competing explanations → discriminating clue → provisional action |
| Tomas Varga | `varga.provenance-chain` | source → access → actual observation → limitation / usable claim |
| Miriam Chen | `chen.system-chain` | change → connected effects → most important link → intervention |
| Helena Ortiz | `ortiz.branch-plan` | aim → dependency → failure case → branch / trigger |
| Noah Kessler | `kessler.tempo-cycle` | tempo now → accumulated debt → recovery window → next surge |
| Laila Haddad | `haddad.reality-workaround` | reality now → what still works → immediate workaround → normalise later |
| Peter Mensah | `mensah.control-negotiation` | need → who controls it → what they want → trade / agreement |
| Grace Lin | `lin.requirement-test` | requirement → failure mode → mechanism → test / pass condition |
| Sofia Marin | `marin.partner-delivery` | needed contribution → owner → promise versus delivery → fallback |
| Adrian Cole | `cole.end-state-coherence` | end state → main effort → supporting actions → cut what does not serve it |
| Nadia Yusuf | `yusuf.forced-choice` | real choice → incompatible priorities → sacrifice → decision ownership |
| Victor Hale | `hale.future-capability` | future capability → dependency / milestone → present raid → delay or irreversible cost |
| Samuel Reyes | `reyes.intent-boundary-feedback` | intent → non-negotiable boundary → local freedom → feedback |
| Mei Tan | `tan.lesson-loop` | result → meaning → repeat-or-noise test → adapt or hold |
| Omar Bell | `bell.development-diagnosis` | performance problem → cause locus → development / support → accountability threshold |

These are deliberately not twenty-four synonyms for “fact → opinion → recommendation”.

The main collision risks are:

- **Warden / Kessler / Mercer / Hale** — all can discuss future cost. Warden follows the people carrying it; Kessler follows operational rhythm; Mercer follows the personnel pipeline; Hale follows capability milestones.
- **Halden / Nair / Varga / Chen** — all can sound analytical. Halden separates claim levels; Nair compares explanations; Varga follows provenance; Chen follows system effects.
- **Sato / Cole / Yusuf** — all can talk strategy. Sato follows commitments and future freedom; Cole follows campaign coherence; Yusuf exposes the choice that cannot stay balanced.
- **Dubois / Marin / Mensah** — all can discuss other actors. Dubois follows the working relationship; Marin follows delivery across a partner boundary; Mensah follows control and negotiability.
- **Briggs / Ortiz / Haddad / Reyes** — all can sound operational. Briggs sequences action; Ortiz builds branches; Haddad rebuilds from current reality; Reyes frames intent and discretion.
- **Navarro / Lin / Tan** — all can challenge performance. Navarro asks whether a standard is repeatable; Lin defines and tests a system requirement; Tan asks what a result actually teaches.

When reviewing dialogue, compare information order before comparing word choice. A line can pass the voice test and still fail the character test if it presents the problem in another officer's reasoning shape.

## Headquarters frame

Brass Ledger uses one fictional national joint force. It works closely with allies and a local partner, but the 24 selectable officers all belong to the same force.

The existing "coalition-composite" doctrine label describes **how this force works with allies**. It does not mean the candidate pool is made up of officers owned by different nations.

This matters because the commander can realistically choose among them without also modelling national ownership of billets, different legal chains of command, or partner vetoes over appointments.

All selectable officers are pre-screened at the same **two-star-equivalent appointment level**. Service-specific rank titles can differ in the dossier, but they do not make one candidate mechanically superior or give one candidate command authority over another.

The old prototype used mixed rank strings. Those are legacy presentation and should be normalised when #112 creates the new officer records. Officer identity is the person/id, not the old rank text.

The original six officers keep their existing identities:

- Ruth Warden;
- Elias Halden;
- Mara Briggs;
- Tunde Okafor;
- Mina Sato;
- Elena Navarro.

Halden is a commissioned senior intelligence officer who also holds a doctorate. The old "Dr. Elias Halden" display is a legacy presentation choice, not evidence that he is a civilian. New dossiers should use his military rank once the personnel schema has a separate rank field.

The six selectable posts are:

- J1 Personnel;
- J2 Intelligence;
- J3 Operations;
- J4 Logistics;
- J5 Plans and Policy;
- J7 Force Development and Training.

J7 is different from J1-J5. The game still has five core staff readouts. J7 is a cross-cutting senior adviser whose work appears through personnel absorption, operational readiness, exercises, lessons, training standards and long-term capability development.

J5 does not own every long-term problem. J5 owns campaign plans, policy, alliance choices and how major decisions fit together. Resource accounting and programme costing are supported by a non-selectable J8 staff cell.

J6 communications/cyber and J8 resources exist in the headquarters but are not selectable senior advisers in the first game. Their effects appear through capability, burden, events and staff notes rather than another two character systems.

A non-selectable Chief of Staff runs the staff process and helps the commander with appointments. The Chief of Staff does not vote on decisions and does not enter the friendship system.

The Chief of Staff should not secretly recommend an "optimal" roster either. The factual preflight comes from the **Staff Secretary office**: legal fit, past postings, known working history and obvious gaps. That keeps the appointment screen useful without adding a seventh personality model.

In ordinary dialogue, use plain role names such as Personnel, Intelligence, Operations, Logistics, Plans and Force Development. J1/J2/J3/J4/J5/J7 are useful dossier shorthand, not something every character needs to say aloud.

## Realism decisions

These decisions close the main realism gaps found during review.

1. **Keep the original six people.** Ruth Warden, Elias Halden, Mara Briggs, Tunde Okafor, Mina Sato and Elena Navarro remain the same officers. Do not rename them just to fit a new roster.
2. **Halden is military.** He is a commissioned senior intelligence officer who also has a doctorate. "Dr." is an old display choice, not civilian status.
3. **Keep five core staff readouts, but six selectable advisers.** J7 Force Development and Training is a real senior appointment, but its mechanics feed Personnel, Operations and Plans rather than creating a sixth global meter.
4. **Keep Plans narrow.** J5 means campaign plans, policy, alliances and how major decisions fit together. It is not the home for every officer who thinks long term.
5. **Treat Intelligence as a specialist career.** Being clever, analytical or comfortable with uncertainty does not qualify somebody to lead J2.
6. **Use one fictional national joint force.** The headquarters works closely with allies, but selectable officers are not supplied by different nations. This avoids fake freedom to swap partner-nation officers between posts.
7. **Put candidates at one appointment level.** All are two-star-equivalent for selection. Old prototype rank strings do not create seniority inside the candidate pool.
8. **Use one current dialogue authority.** This document owns current character voice. The old detailed advisor-style file is historical only.
9. **Separate history from opinion.** "Served together" is a shared fact. Liking, trust and professional respect are directional and can differ.
10. **Allow real friction.** Some officers genuinely dislike or distrust each other. That still does not force them to disagree on the facts.
11. **Ground every officer in a service and career.** Cross-posting must come from real prior work, not from personality alone.
12. **Give people ordinary human faults.** Not every weakness is a noble strength used too much. Officers can be defensive, impatient, poor at notes, slow to confront, protective of favourites or too attached to their own work.
13. **Do not use the same discovery trick for everyone.** Some first impressions are right. Some get worse with familiarity. Some officers stay hard to read.
14. **Keep the Chief of Staff outside the roster game.** The Chief of Staff runs process. The Staff Secretary office gives factual appointment notes. Neither secretly picks the best roster.
15. **Do not add J6/J8 characters yet.** Communications/cyber and resources/costing exist in the headquarters and appear through modules, events and staff notes. They are not selectable chiefs in the first roster.

These choices are deliberately simpler than a real headquarters. The goal is a believable command team, not a complete personnel simulator.

## Roster overview

The table is a writing summary, not a player-facing rating sheet. Exact fit categories are listed later.

| Officer | Main lane | Other believable posts | First impression |
| --- | --- | --- | --- |
| Ruth Warden | J1 | J7 | Protective, plain-spoken, harder than she first appears |
| Elias Halden | J2 | J5 | Precise, sceptical, unexpectedly decisive |
| Mara Briggs | J3 | J5; J4 only as a deliberate stretch | Fast, practical, loyal, better prepared than her manner suggests |
| Tunde Okafor | J4 | J3 | Calm realist, inventive once constraints are clear |
| Mina Sato | J5 | J3 | Polished strategist, values options but will commit hard |
| Elena Navarro | J7 | J1; J3 only as a deliberate stretch | Demanding teacher, tolerant of honest failure |
| Daniel Mercer | J1 | J7 | Quiet organiser, sees manpower as a long pipeline |
| Farah Rahman | J7 | J1 | Energetic reformer, good with people, impatient with stale systems |
| Claire Dubois | J1 | J5 | Relationship builder with a stubborn core |
| Priya Nair | J2 | — | Fast pattern-reader, imaginative, vulnerable to elegant stories |
| Tomas Varga | J2 | J3 only as a deliberate stretch | Field-minded collector, practical, private, distrusts false certainty |
| Miriam Chen | J2, J5 | — | Broad thinker, excellent on systems, can make simple things too complicated |
| Helena Ortiz | J3 | J5; J4 only as a deliberate stretch | Calm operator, excellent coordinator, reluctant to gamble without a branch |
| Noah Kessler | J3 | J7; J1 only as a deliberate stretch | Stabiliser, protects recovery and tempo, can wait too long |
| Laila Haddad | J3 | J5 | Crisis improviser, comfortable with ambiguity, weak at making temporary fixes stick |
| Peter Mensah | J4 | — | Persuasive negotiator, good at finding capacity, sometimes believes every constraint can be moved |
| Grace Lin | J4 | J7, J3 | Engineer's mind, exacting, quietly creative, impatient with vague plans |
| Sofia Marin | J4 | J3, J5 | Coalition logistician, strong relationship builder, can compromise too far |
| Adrian Cole | J5 | J3 | Elegant planner, sees structure quickly, at risk of falling in love with a neat plan |
| Nadia Yusuf | J5 | — | Direct strategist, forces choices into the open, can close debate too early |
| Victor Hale | J7 | J5; J4 only as a deliberate stretch | Patient capability builder, thinks in years, can sacrifice too much of the present |
| Samuel Reyes | J7 | J3, J1 | Practical coach, trusts local leaders, can underweight central control |
| Mei Tan | J7 | J5 | Curious learning-system builder, absorbs lessons quickly, sometimes changes too much |
| Omar Bell | J1 | J7 | Warm mentor, builds strong teams, can protect weak performers too long |

## Career background guide

These are grounding facts for dialogue and appointment realism. They are not bonuses.

| Officer | Service / career stream | Formative experience |
| --- | --- | --- |
| Ruth Warden | Land force, personnel and reserve command | formation command; reserve mobilisation; training-and-recovery command |
| Elias Halden | Land force intelligence | warning centre; joint assessment staff; estimates-and-plans tour |
| Mara Briggs | Land force operations | brigade command; joint operations centre; joint plans tour |
| Tunde Okafor | Maritime force logistics | fleet support; depot command; deputy in a joint task force |
| Mina Sato | Air force plans and policy | air operations centre; alliance plans staff; senior policy tour |
| Elena Navarro | Land force training and force development | training command; personnel-readiness staff; joint force development |
| Daniel Mercer | Land force personnel | formation staff; assignments branch; training-manpower planning |
| Farah Rahman | Air force force development | squadron command; personnel-policy tour; training reform |
| Claire Dubois | Land force reserve and liaison | reserve brigade staff; partner liaison; coalition plans tour |
| Priya Nair | Air force intelligence | all-source warning; adversary studies; red-team analysis |
| Tomas Varga | Maritime force intelligence | collection unit; maritime patrol intelligence; joint liaison |
| Miriam Chen | Joint intelligence and plans | industry assessment; long-range estimates; campaign planning |
| Helena Ortiz | Maritime force operations | task-group operations; coalition exercises; joint plans deputy |
| Noah Kessler | Air force operations and readiness | wing command; readiness staff; force-development exercise tour |
| Laila Haddad | Land force operations | task-force command; contingency planning; crisis response |
| Peter Mensah | Joint logistics and procurement | movement control; emergency sourcing; partner support agreements |
| Grace Lin | Air force engineering and logistics | maintenance command; readiness recovery; technical training command |
| Sofia Marin | Maritime force logistics and coalition support | port operations; multinational movement; coalition operations staff |
| Adrian Cole | Land force plans | division plans; joint campaign staff; operations-plans deputy |
| Nadia Yusuf | Joint plans and policy | command policy; campaign planning; headquarters priorities team |
| Victor Hale | Joint force development | capability planning; programme integration; long-range plans tour |
| Samuel Reyes | Land force training and operations | battalion command; training centre; joint operations exercise staff |
| Mei Tan | Air force training, simulation and plans | simulation centre; lessons team; campaign-plans staff |
| Omar Bell | Land force personnel and training | command; instructor tour; leader-development and assignments staff |

---

# Ruth Warden

## Core

Warden believes people can carry very hard burdens if the institution is honest about why, for how long, and what happens afterward.

She is often mistaken for the soft voice in the room. She is not. She can recommend a painful mobilisation if she thinks it matters. What she hates is pretending the cost does not exist.

Her first question is usually: who carries this?

## Career anchor

Former formation commander with long experience in reserve mobilisation, personnel planning and force recovery. She has spent enough time both commanding units and managing the people system to distrust easy answers from either side.

## Strength

She spots slow damage early: exhausted specialists, reserve employers losing patience, instructors being used as ordinary manpower, and temporary surges becoming normal work.

She understands that a force can look healthy on paper while losing the experienced people who make it work.

## Blind spot

She can protect existing experience too hard. Sometimes an organisation needs to accept short-term damage to change. Warden may hold on to proven people and structures after the commander should be willing to break them.

## Social presence

Approachable, dry, not especially chatty. She remembers who carried difficult work and who kept promises to junior units.

She has more respect for someone who says "yes, this will hurt" than someone who says "they will cope."

## Voice

Plain, concrete, human without sounding therapeutic.

She uses words like people, crews, instructors, recovery, experience, employers and replacements.

She tends to turn broad ideas into a real group of people:
"That gets us another exercise. Same maintainers, third weekend away this month."

## Under pressure

She gets shorter and firmer.

Low pressure:
"I'd give them another recovery cycle."

High pressure:
"Use them. Then take them off the line next month. Put both in the order."

## Interview

She answers directly and often gives an example about a unit or group of people.

Asked about a mistake, she is more likely to talk about asking too much of people than about being out-thought.

## Cross-post

In J7 she brings a people-and-recovery view to training and force development. She asks whether the force is actually building depth or simply using the same experienced people again.

She should remain a J1 specialist first. Do not move her into J3 or J5 just because her judgement is useful there.

## Interesting contradiction

She may be the strongest voice for a harsh surge:
"Mobilise them. That's what the reserve is for. Just don't call it painless."

## Respect, friction and being wrong

She respects Briggs because she owns the cost of her decisions, even when she thinks he pushes too hard. She trusts Sato to remember that promises to people are still promises. She gets on with Kessler because he thinks seriously about recovery, though she sometimes thinks he protects the force when it should be used.

She loses respect fastest when a leader calls repeated sacrifice "resilience" and never pays the recovery bill.

When Warden is wrong, she usually knows the cost correctly but judges the timing badly. She may protect experienced people through the very moment when the commander should spend them. She does not suddenly become sentimental; she becomes too convinced that preserving the force is the same thing as preserving future options.


## Avoid

Do not write her as maternal, emotional by default, anti-tempo, or obsessed with morale scores.

---

# Elias Halden

## Core

Halden cares about intellectual honesty more than caution.

He does not need certainty before acting. He needs everyone to know what is observed, what is inferred, and what would change the judgement.

His first question is usually: what do we actually know?

## Career anchor

Commissioned intelligence officer and assessment leader with a doctorate, with experience in warning, red-teaming and joint headquarters work. He has seen both genuine surprise and false alarms created by people wanting a clean answer.

## Strength

He sees when a repeated claim is turning into "fact" without new evidence. He notices stale reporting, false corroboration, convenient assumptions and language that has become more certain than the evidence.

## Blind spot

He can assume that if uncertainty is explained clearly enough, everyone will use it well. Sometimes the commander needs a short usable judgement, not another distinction.

He can also under-rate the value of a clear public story because he distrusts stories that become substitutes for evidence.

## Social presence

Reserved and observant. He listens longer than most. He remembers small qualifications from earlier conversations.

He dislikes having his authority used as decoration:
"Intelligence agrees" is exactly the sort of sentence that makes him ask what Intelligence actually said.

## Voice

Precise, simple and clean.

"We know the units moved. We don't know why. Those are different things."

He asks useful questions rather than giving lectures:
"What would change your mind?"

## Under pressure

He becomes more decisive because he strips away uncertainty that does not affect the decision.

"I can't tell you if they mean to attack. I can tell you they can do it now with very little warning."

## Interview

He often corrects the question before answering it.

"Are you cautious?"
"About claims, yes. Not always about action."

He is unusually willing to discuss times when he was wrong.

## Cross-post

In J5 he can test the assumptions holding a campaign plan together because he has done estimates-and-plans work.

He is not a normal J3 candidate. His usefulness to operations comes through advice, not through pretending an intelligence career makes him an operations chief.

## Interesting contradiction

He can be the first to demand action:
"Intent's still unclear. The warning isn't. Move the reserve tonight."

## Respect, friction and being wrong

He has strong professional respect for Sato even when he thinks she moves too easily from behaviour to intent. He values Varga because Varga knows exactly what a source could and could not have seen. He sees real talent in Nair and is also one of the people most likely to challenge her when a good hypothesis starts becoming a favourite explanation.

He loses respect when somebody asks for a stronger judgement because the weaker one is inconvenient.

When Halden is wrong, he often has the categories right and the weight wrong. He can spend too much effort keeping a judgement clean while the commander needs a rough but useful answer. His failure is not cowardice. It is thinking that better wording can always solve the gap between uncertainty and action.


## Avoid

Do not make him cold, indecisive, permanently sceptical of action, or addicted to the word "confidence."

---

# Mara Briggs

## Core

Briggs believes a decision becomes real when somebody has to do something because of it.

She is impatient with plans that describe the effect but never reach the first action.

Her first question is usually: what happens first?

## Career anchor

Combined-arms commander and joint operations officer with repeated crisis-planning and field-command experience. She has spent much of her career turning broad orders into actions that units can actually carry out.

## Strength

She turns intent into action quickly. She sees timelines, branches, unclear authority and plans that will fall apart on first contact.

She prepares more than her manner suggests.

## Blind spot

She is very good at handling friction, which can make her believe friction is always manageable. She can start moving because she trusts himself to adjust later, even when the first move closes options.

## Social presence

Energetic and direct. She enjoys professional argument. She can have a fierce disagreement and be perfectly friendly twenty minutes later.

She hates passive resistance much more than open opposition.

## Voice

Short, active and practical.

"Who moves first?"
"By when?"
"And if that fails?"

She uses verbs more than abstract nouns.

## Under pressure

She cuts the problem down quickly:
"Move the reserve."
"Protect the airfield."
"If they react, branch north."

Her failure under stress is closing the argument too early.

## Interview

She turns broad questions into cases.

"How do you handle disagreement?"
"How much time do we have?"

She prefers stories about decisions that nearly failed.

## Cross-post

In J5 she pushes a campaign plan toward clear actions, branches and decision points.

J4 is a deliberate stretch. If a scenario puts her there, the point is the risk: she understands operational demand better than the deeper logistics system.

## Interesting contradiction

She sometimes argues hardest for restraint:
"No. Surge now and all we do is show them what moves and burn the reserve. Give it two days."

## Respect, friction and being wrong

She and Okafor can be close friends despite arguing constantly. She trusts him because a hard "no" from him usually comes with a reason and another route. She has strong professional respect for Ortiz and a mild competitive streak with her because both think they can run a difficult operation well. Yusuf's directness appeals to her until she closes a choice she still thinks can be worked.

She loses respect for people who keep objections vague enough that they never have to own an alternative.

When Briggs is wrong, she tends to mistake her own ability to recover from trouble for proof that the headquarters can safely create the trouble. She sees the branch, the reserve and the workaround and concludes that the risk is manageable. Sometimes the first move itself is the mistake.


## Avoid

Do not write a movie general. She is not stupid, permanently aggressive or allergic to planning.

---

# Tunde Okafor

## Core

Okafor believes a real constraint is not an excuse. It is the shape of the problem.

He dislikes both fantasy plans and lazy "we cannot" answers.

His first question is usually: what physical system makes this work?

## Career anchor

Logistics and engineering officer with experience in transport, maintenance, depots and operational support. He has managed both routine systems and crisis shortages.

## Strength

He sees flows, bottlenecks, repair, stock, transport and several plans quietly using the same capacity.

Once the constraint is clear, he is often one of the most inventive people in the room.

## Blind spot

He can protect spare capacity too long. Because he has seen organisations discover why buffers exist, he sometimes saves margin that should be spent on a decisive opportunity.

## Social presence

Calm and hard to fluster. He remembers who gave his warning early and who committed his capacity without asking.

He rarely needs to win a meeting. Physical reality tends to bring the argument back to his.

## Voice

Methodical and concrete.

"The aircraft are there. The crews are there. The spare engines aren't."

He often says:
"That's not the problem. This is."

## Under pressure

He becomes sharply selective:
"Fuel's fine. Lift isn't. Protect the lift."

He will burn a buffer if the commander clearly chooses to spend it.

## Interview

He answers abstract questions with practical examples. Asked about another officer, he often describes how they react when told something cannot be done as planned.

## Cross-post

In J3 he brings a strong sense of what movement and tempo actually require because he has served as a joint task-force deputy.

He is not a generic long-term planner. His value outside J4 comes from connecting action to the support system that makes it possible.

## Interesting contradiction

He can propose the boldest option:
"The normal route won't carry it. Use the partner port, skip the depot, save two days."

## Respect, friction and being wrong

He trusts Briggs more than outsiders expect because he usually changes the plan when he proves a constraint is real. He has strong technical respect for Lin. Mensah can irritate his: he thinks he sometimes treats a physical limit as if one more phone call will move it; he thinks he sometimes accepts a limit before testing who actually owns it.

He loses respect when someone commits his capacity before involving his.

When Okafor is wrong, he usually protects a buffer for a sensible reason and misses the moment when that buffer should have been spent. He can be so good at keeping the system able to absorb shocks that he underestimates the value of one decisive gamble.


## Avoid

Do not make him a permanent "no", a walking inventory list, or a synonym for caution.

---

# Mina Sato

## Core

Sato believes every decision changes the choices available afterward.

She values room to move, but she is not afraid of commitment. She wants commitments made when closing options creates real advantage.

Her first question is usually: what follows from this?

## Career anchor

Plans and policy officer with coalition, partner and senior-headquarters experience. She has spent years watching small wording choices become real promises.

## Strength

She sees audiences, promises, future bargaining space and the difference between a reversible step and one that changes expectations permanently.

## Blind spot

She can protect future options too long. Sometimes an extra option is only delay.

She can also assume other actors read signals as carefully as she does.

## Social presence

Composed, observant and easy to talk to. She notices who has stopped arguing and which disagreement is really about trust.

She is charming, but charm is not her superpower.

## Voice

Measured and clear.

"Strong words aren't the issue. What are we going to have to do after we say them?"

She often reframes the problem rather than simply saying no.

## Under pressure

She stops trying to keep every audience happy:
"We can't reassure all three. Which relationship still has to be intact next week?"

## Interview

She often finds the second question under the first.

"How do you deal with a difficult ally?"
"Difficult because they want something different, or because we still haven't decided what we want?"

## Cross-post

In J3 she brings campaign-planning and operations-centre experience. She notices what operational posture tells allies and adversaries as well as what it does physically.

She does not become an intelligence or personnel chief merely because she understands politics and people.

## Interesting contradiction

She can demand the hardest commitment:
"No more private reassurance. Put the guarantee in writing. If we won't do that, tell them now."

## Respect, friction and being wrong

She respects Warden because Warden understands that credibility inside the force matters as much as credibility outside it. Her relationship with Halden is intellectually useful: he keeps asking what can really be claimed; she keeps reminding him that other actors make choices from incomplete evidence too. She likes Dubois because Dubois understands relationships at working level rather than only as signals.

She loses respect for leaders who make public promises for an easy win and leave somebody else to honour them.

When Sato is wrong, she usually sees a real second-order cost and gives it too much weight. She can protect room to manoeuvre after the moment when the right choice is to spend that room and force everybody else to adjust.


## Avoid

Do not write her as a press secretary, manipulator, or person who always wants more ambiguity.

---

# Elena Navarro

## Core

Navarro believes organisations improve only when they can tell the difference between performance and appearance.

She is strict about standards and surprisingly tolerant of honest failure.

Her first question is usually: can they do it again?

## Career anchor

Training commander and evaluator with experience in exercises, instructor systems and converting new ideas into routines units can repeat. She has seen many "successful" demonstrations that never became real capability.

## Strength

She sees one-off success being turned into "capability", instructors being exhausted, standards moving after the result, and organisations hiding weak performance behind certification.

## Blind spot

She can overvalue repeatability. Some opportunities only need to work once. Sometimes the emergency exception is the right answer even if it should never become normal practice.

## Social presence

Patient with juniors, harder on seniors. She likes people who can say "we are not good at this yet."

She dislikes leaders who pressure units to claim readiness for appearance.

## Voice

Precise and plain.

"One clean run tells me it can work. Show me we can do it again."

She often asks:
"What exactly are we saying they can do?"

## Under pressure

She becomes practical:
"Use the emergency procedure. It works. Just don't call it the new standard afterward."

## Interview

She often asks the player to define a word such as ready, trained or successful. This is not pedantry; she thinks the definition often contains the real disagreement.

## Cross-post

In J1 she focuses on skill depth, instructor pipelines and whether the force is keeping the experience it needs.

J3 is a deliberate stretch. If used there, her standards can help, but she lacks the same depth of operations command as the natural J3 candidates.

## Interesting contradiction

She can approve the ugliest shortcut:
"No rehearsal. Use the prototype team. It's an emergency. We'll argue about the standard later."

## Respect, friction and being wrong

She respects Lin because Lin wants claims tied to things that can actually be tested. She likes Reyes personally and often argues with him professionally: he wants local freedom; she wants enough common practice that local freedom does not become six different systems. Tan interests her because Tan learns quickly, though Navarro sometimes thinks she changes the lesson before the organisation has proved it.

She loses respect when leaders change the standard after seeing who passed.

When Navarro is wrong, she can demand repeatability from a situation that only needs one successful attempt. She may correctly say "we do not own this capability yet" and miss that ownership is not required for the decision in front of the commander.


## Avoid

Do not make her a bureaucratic standards officer, perfectionist or enemy of experimentation.

---

# Daniel Mercer

## Core

Mercer sees personnel as a pipeline rather than a headcount.

He thinks about who will be ready six months from now, who must be promoted, where experience is trapped, and what today's posting decision does to tomorrow's bench.

His first question is usually: what does this do to the next group?

## Career anchor

Manpower and assignments officer who has also commanded at formation level. His career has moved between field units, promotion boards, reserve planning and the slow work of building the next layer of leaders.

## Strength

He is excellent at succession, force structure and matching people to jobs. He sees hidden single points of failure in the career system.

He is less emotionally expressive than Warden and more willing to move people around.

## Blind spot

Mercer can treat people as pieces in a well-designed system. He sometimes underestimates loyalty, identity and the damage caused when people feel used as interchangeable appointments.

## Social presence

Quiet, organised and hard to surprise. He is not cold, but he rarely leads with emotion.

He is good at remembering careers and who is ready for more responsibility.

## Voice

Calm and practical.

"Move her now and we fix this month. Training gets the hole next quarter."

He talks about people by name when possible, not as "human capital."

## Under pressure

He becomes ruthless about priorities:
"Keep the specialists. Replace the headquarters staff. We'll rebuild that faster."

## Interview

He answers questions through trade-offs and succession.

Asked who he would choose, he may answer with the job he needs them for rather than whether he likes them.

## Cross-post

In J7 he thinks about instructor pipelines, leader development and whether training is producing the next group of people the force will need.

He should not drift into J5 simply because he thinks long term.

## Interesting contradiction

He may recommend removing a popular high performer:
"Everyone likes him. That's not a reason to leave him in a job he's stopped growing in."

## Respect, friction and being wrong

He respects Hale because Hale understands that today's personnel move can damage a capability years later. He values Bell's judgement of people but thinks Bell sometimes gives development too much time. Bell, in turn, can find Mercer too willing to move people as if the move has no emotional cost.

He loses respect for leaders who hoard good officers because they are useful in their current jobs.

When Mercer is wrong, his plan for the institution is often neat and the human reaction is not. He can move the right person to the right job and still damage loyalty because he treated the move as an obviously sensible piece of career management.


## Avoid

Do not make him a spreadsheet with a face or use business-HR language.

---

# Farah Rahman

## Core

Rahman believes organisations can learn faster than they think, but only if leaders are willing to change habits people have mistaken for rules.

Her first question is usually: why do we still do it this way?

## Career anchor

Unit commander, training reformer and headquarters change lead. She has repeatedly been sent into organisations that everyone agrees need to improve but nobody agrees how to change.

## Strength

She spots stale routines, unnecessary hand-offs and cultural habits that block good people.

She is good at getting teams to try a new method without waiting for a perfect redesign.

## Blind spot

She can move faster than trust. When a system has survived for years, some of its ugly parts may exist for a reason she has not yet found.

She can also wear out conservative colleagues by treating every objection as attachment to the past.

## Social presence

Warm, energetic and persuasive. She enjoys disagreement when it produces a better way of working.

She gets frustrated with people who raise history as a complete argument.

## Voice

Clear, lively and slightly impatient.

"Is that actually a rule, or just how the last three people did it?"

She prefers short examples over theory.

## Under pressure

She becomes willing to tear down process quickly:
"Drop the extra approval. Give one officer the job and make them own it."

Her risk is deleting a safeguard she has not understood.

## Interview

She is candid about frustrations and usually has a story about changing something small that everyone thought was fixed.

## Cross-post

In J1 she is useful when the people problem is also a culture or organisation problem.

She remains strongest in J7. Do not use her as a generic planner just because she is good at change.

## Interesting contradiction

She can become the voice for slowing down:
"We've changed this twice in three months. Stop. Let people learn the version we've already given them."

## Respect, friction and being wrong

She gets on naturally with Tan because both are willing to change practice after learning something. That pairing can also become dangerous if they reinforce each other's desire to fix every new problem. Hale frustrates her because he protects long programmes; she frustrates him because she is willing to break process before he is sure the replacement will last.

She loses respect when "we tried that once" is used to end an argument.

When Rahman is wrong, she often removes a piece of friction before she understands what useful job it was doing. Her best failure is not wild innovation. It is a cleaner process that quietly lost a safeguard nobody had explained to her.


## Avoid

Do not make her a generic innovation evangelist or make every old practice stupid.

---

# Claire Dubois

## Core

Dubois believes a headquarters works best when people understand why they need one another.

She is skilled at holding together groups with different interests, but she is not conflict-averse.

Her first question is usually: whose cooperation does this depend on?

## Career anchor

Reserve and partner-force officer with long experience in mobilisation, liaison and joint support arrangements. Much of her career has depended on getting organisations with different incentives to keep working together.

## Strength

She reads informal networks well and knows which person or organisation must be brought in before a plan becomes real.

She is good at reserve, partner and civil relationships.

## Blind spot

She can spend too much time building agreement where command should simply decide.

She also sometimes protects a working relationship after the underlying bargain has stopped being useful.

## Social presence

Friendly, steady and good at making difficult people feel heard without promising them their way.

She remembers favours and obligations.

## Voice

Plain and relational.

"If we need them to carry it, tell them before the order arrives."

She does not use Sato's strategic audience language. Dubois focuses more on working relationships than signalling.

## Under pressure

She becomes firmer:
"They don't have to like it. They should hear it from us first."

## Interview

She talks easily about people but avoids gossip. She tends to explain why a difficult colleague behaves as they do.

## Cross-post

In J5 she brings direct experience of coalition plans and the practical relationship work needed to make them hold.

She is not a logistics chief. Knowing partners does not make her qualified to run the support system.

## Interesting contradiction

She can recommend breaking a relationship cleanly:
"We've spent three months protecting a partnership that's stopped delivering. End it properly."

## Respect, friction and being wrong

She has an easy working relationship with Marin because both understand that partners contribute through relationships, not just formal agreements. Sato respects her ability to keep people working together after the strategic argument is over. Dubois can become impatient with Yusuf when Yusuf forces a clean choice before Dubois thinks the relationship has been given a chance to work.

She loses respect for people who surprise a partner and then call the reaction unreasonable.

When Dubois is wrong, she often keeps a relationship alive because she can still see how it might be repaired. She may spend time and concessions on cooperation that has stopped being worth the effort.


## Avoid

Do not make her universally agreeable, diplomatic in Sato's style, or unable to make enemies.

---

# Priya Nair

## Core

Nair is a fast pattern-reader. She is good at seeing how scattered facts may fit together before other analysts do.

Her first question is usually: what larger picture would explain all of this?

## Career anchor

All-source intelligence analyst with warning, red-team and long-range assessment experience. She built her reputation by spotting patterns early, including a few that were initially dismissed.

## Strength

She connects weak signals, notices unusual combinations and generates useful hypotheses quickly.

She is comfortable proposing an idea before she can prove it.

## Blind spot

A good story can become too attractive to her. Once several facts fit an elegant explanation, she may spend too long trying to repair the explanation rather than discard it.

Halden checks claims. Nair generates them.

## Social presence

Curious, talkative by intelligence standards, enjoys being challenged if the challenge is specific.

She dislikes people dismissing hypotheses simply because they are not yet proven.

## Voice

Fast but clear.

"One report is nothing. Three odd things pointing the same way? Worth a look."

She often offers two competing explanations rather than one.

## Under pressure

She becomes more intuitive:
"I can't prove it yet. I'd still protect against it. Waiting costs more."

## Interview

She enjoys "what if" questions and admits when a hunch was wrong.

## Cross-post

Nair is a J2 specialist.

Her hypotheses can help any staff function, but that does not make her a normal candidate to lead those functions. Keep the distinction between being useful to a billet and being qualified to hold it.

## Interesting contradiction

She can be the strongest voice against the exciting explanation:
"It's too neat. We're making every new fact fit the same story."

## Respect, friction and being wrong

She respects Halden but sometimes finds his discipline constraining when she is trying to explore a new explanation. She enjoys working with Tan because Tan asks what new evidence should change. Chen is a useful counterweight: Chen sees wider systems where Nair sees a sharp emerging pattern.

She loses respect when people dismiss a hypothesis only because it is uncomfortable or incomplete.

When Nair is wrong, she rarely invents facts. She gives too much meaning to real facts that fit a compelling pattern. The danger is a story that keeps surviving because she is clever enough to explain away each awkward piece.


## Avoid

Do not make her mystical, psychic or careless with evidence.

---

# Tomas Varga

## Core

Varga trusts information more when he understands how it was collected.

He has spent much of his career close to field collection and is wary of headquarters turning messy reporting into neat certainty.

His first question is usually: where did this come from?

## Career anchor

Collection officer with field, liaison and headquarters experience. He has worked close enough to sources and sensors to know how much detail disappears when reporting moves upward.

## Strength

He understands source access, collection limits and what people on the ground can actually observe.

He is good at finding practical ways to answer a narrow question.

## Blind spot

He can overvalue direct reporting and under-rate broad analysis. He sometimes distrusts a sound judgement because no single source can see the whole thing.

## Social presence

Private, understated and slow to trust. He does not share stories simply to fill silence.

Once he trusts someone, he is loyal.

## Voice

Short, concrete and source-minded.

"She saw the convoy. She didn't see where it went after the junction."

He dislikes broad words when a narrower claim will do.

## Under pressure

He becomes very practical:
"Stop asking what they intend. Give me one thing we can collect on tonight."

## Interview

He is guarded about operations and people, but willing to talk about how collection goes wrong.

## Cross-post

J3 is a deliberate stretch because his field-collection background gives him a practical feel for what can be seen and reported during operations.

The scenario should make the trade-off clear: good field sense is not the same as deep operations command experience.

## Interesting contradiction

He can defend a broad analytic call:
"No single source can tell us. Doesn't mean the combined picture is wrong."

## Respect, friction and being wrong

He respects Halden because Halden usually protects the boundary between what a source reported and what headquarters inferred. He can work well with Haddad in a crisis because both care about what is actually true now, though he worries that her improvisation sometimes outruns the reporting.

He loses respect when a headquarters judgement is later described as though a source said it directly.

When Varga is wrong, he tends to trust what can be seen up close and discount the picture that only appears when several weak sources are combined. He can reject a sound wider assessment because none of the individual reports feels strong enough on its own.


## Avoid

Do not make him secretive for drama, anti-analysis, or a spy-fiction character.

---

# Miriam Chen

## Core

Chen thinks in systems. She wants to understand how economic, political, industrial and military pressures connect before choosing the part that matters most.

Her first question is usually: what else changes if we do this?

## Career anchor

Intelligence and planning officer with a background in industry, economics and long-range assessment. She has spent much of her career on problems where military action changes markets, politics and supply at the same time.

## Strength

She is excellent at second-order effects, industrial pressure and seeing feedback between several parts of the campaign.

She often spots a hidden dependency nobody else has linked.

## Blind spot

She can make a simple decision feel larger than it is. Her maps of the problem are sometimes better than her sense of which part the commander actually needs now.

## Social presence

Patient, thoughtful and low-ego. She rarely interrupts.

People sometimes mistake her quiet for indecision.

## Voice

Measured but plain.

"Cut that route and fuel isn't the first problem. Repair parts are."

She explains chains in short steps rather than jargon.

## Under pressure

She forces herself to choose the most important link:
"Leave the rest for now. Shipping is what can break this month."

## Interview

She thinks for a moment before answering and often says what she is leaving out.

## Cross-post

Chen can credibly lead either J2 or J5. In J2 she joins evidence into a wider picture. In J5 she traces how military, industrial and political choices affect one another.

The danger in either billet is the same: she can make the problem wider faster than she makes it clearer.

## Interesting contradiction

She sometimes demands a narrow, blunt answer:
"We know enough. Stop widening it."

## Respect, friction and being wrong

She enjoys Nair's ability to find a pattern quickly, but she is often the one asking whether the pattern still holds once economic or political effects are added. She respects Hale's long view and Okafor's physical grounding because both stop her systems thinking from floating away from reality.

She loses respect when somebody declares one cause for a problem that plainly has several.

When Chen is wrong, she sees too many real connections. Her map of the problem becomes so complete that the commander has trouble seeing which link matters now. She can be right about the system and late with the decision.


## Avoid

Do not make her an exposition machine or the officer who always sees everything.

---

# Helena Ortiz

## Core

Ortiz believes good operations are built around choices that remain workable when the first assumption fails.

Her first question is usually: what is our branch if this goes wrong?

## Career anchor

Joint operations officer with experience coordinating multinational exercises, task forces and crisis plans. Her strongest work has usually involved several organisations that could not simply be ordered into perfect timing.

## Strength

She coordinates complicated operations calmly and sees where timing, partners and support must line up.

She is especially good at making several organisations work to one plan.

## Blind spot

She can hold back from a high-payoff gamble because she wants a branch for every major failure.

Some opportunities disappear before a safe branch exists.

## Social presence

Calm, professional and low-drama. She is good in tense rooms because she rarely adds emotion to an already emotional argument.

## Voice

Clear and ordered.

"I can support the first move. What do we do if the partner is a day late?"

She is less blunt than Briggs but just as action-focused.

## Under pressure

She becomes more willing to accept a thin branch:
"We've got one workable route. Use it. Keep the reserve free."

## Interview

She talks about coordination failures and what she learned when good plans met unreliable partners.

## Cross-post

In J5 she brings campaign sequencing and coalition-planning experience.

J4 is a deliberate stretch. She understands where operations and support meet, but that is not the same as having spent a career running logistics.

## Interesting contradiction

She can take the largest gamble in the room once she believes the branch is good enough:
"We're not getting a cleaner window. Go."

## Respect, friction and being wrong

She respects Briggs and competes with him a little. Briggs likes to force the first move; Ortiz wants to know the branch. She works naturally with Marin because both have experience getting partners to move on the same timetable. Okafor's constraints do not bother her if they arrive early enough to become part of the plan.

She loses respect for people who reveal a dependency only after the plan has been approved.

When Ortiz is wrong, she usually asks for one more branch, one more confirmation or one more protected reserve than the opportunity allows. The plan becomes robust just as the moment to use it disappears.


## Avoid

Do not make her merely "Briggs but calmer" or permanently cautious.

---

# Noah Kessler

## Core

Kessler believes forces lose campaigns by never resetting. He sees tempo as something that must rise and fall, not simply increase.

His first question is usually: when do we recover from this?

## Career anchor

Operations and readiness officer who has alternated between field command, force-generation jobs and major exercise planning. He has seen forces burn themselves out by treating surge tempo as a permanent setting.

## Strength

He is excellent at pacing operations, preserving reserves and knowing when a headquarters needs to stop adding activity.

Unlike Warden, his concern is operational rhythm rather than people first.

## Blind spot

He can wait for a cleaner moment that never arrives. He may preserve the force for a future opportunity while the current one passes.

## Social presence

Steady, understated and reassuring. He is hard to provoke.

This can make more aggressive officers feel he lacks urgency.

## Voice

Simple and time-focused.

"We can surge for two weeks. Two months? No."

## Under pressure

He becomes much more decisive:
"This is the surge. Use the reserve now. Reset after."

## Interview

He talks about campaigns in phases and often asks what came before and what must come next.

## Cross-post

In J7 he is good at fitting training, exercises and recovery into the wider readiness cycle.

J1 is a deliberate stretch. He understands force rhythm, but he is not a career personnel officer.

## Interesting contradiction

He can be the officer who says "spend everything now" when he thinks this is the moment the reserve was saved for.

## Respect, friction and being wrong

He and Warden often agree for different reasons. Warden sees people being worn down; Kessler sees the operational cycle losing its ability to surge. He respects Hale's patience and can frustrate Briggs, who sometimes thinks Kessler is saving the reserve from the war it exists to fight.

He loses respect for leaders who run every month at emergency tempo and call the result readiness.

When Kessler is wrong, he preserves a force for a better moment that never comes. His instinct for rhythm can become an excuse to postpone the ugly period when the commander really should accept exhaustion and push.


## Avoid

Do not make him passive, sleepy or a second Warden.

---

# Laila Haddad

## Core

Haddad is at her best when the situation stops matching the plan.

She trusts judgement, local initiative and the ability of good officers to make sense of a messy situation.

Her first question is usually: what can we do with what is actually true now?

## Career anchor

Joint task-force and crisis-response officer with repeated experience in plans breaking under real conditions. She has built a career on keeping people effective after the situation stops matching the brief.

## Strength

She adapts quickly, works well with incomplete information and keeps action moving when formal plans break.

She is very good in crises.

## Blind spot

She underestimates the cost of undocumented workarounds. What she solves through judgement today may become a confusing mess for everyone else tomorrow.

She can leave institutions depending on people rather than systems.

## Social presence

Warm, quick and confident. She makes people feel trusted.

She dislikes excessive supervision.

## Voice

Direct, flexible and informal by senior-officer standards.

"Plan's gone. Fine. We still have two units, one route and six hours."

## Under pressure

She gets better:
"Stop trying to get the old plan back. Work with what's left."

Her weakness appears afterward, when somebody has to turn the improvised answer into a repeatable system.

## Interview

She tells vivid stories about moments when plans failed and people adapted.

## Cross-post

In J5 she can build flexible branches and plans that survive a changing situation, though she needs stronger staff discipline around documentation.

She is not a J2 candidate. Comfort with uncertainty is not an intelligence qualification.

## Interesting contradiction

She can demand strict process after too many workarounds:
"No more exceptions. We've got three ways of doing the same thing and nobody knows which one is real."

## Respect, friction and being wrong

She likes Reyes because he trusts people close to the problem. Varga's field sense earns her respect even when he refuses to stretch a report as far as she would like. Ortiz can frustrate her with branch planning; Ortiz thinks Haddad sometimes creates the need for tomorrow's branch by improvising too freely today.

She loses respect when headquarters continues following a dead plan because changing it would be embarrassing.

When Haddad is wrong, the immediate fix works and the organisation pays later. Her danger is leaving three unofficial procedures, two verbal promises and one brilliant officer holding together something that should have become a proper system.


## Avoid

Do not make her reckless, anti-planning or a heroic improviser who is always right.

---

# Peter Mensah

## Core

Mensah believes many "hard" constraints are really agreements, contracts or priorities that can be changed if someone is willing to negotiate.

His first question is usually: who controls the thing we need?

## Career anchor

Logistics, procurement and partner-support officer with experience in contracts, access agreements and emergency sourcing. He understands how much "capacity" is actually controlled by agreements between people.

## Strength

He finds capacity through partners, suppliers, contracts and clever trade-offs.

He understands money and bargaining power without talking like a corporate executive.

## Blind spot

He can assume every constraint has a deal behind it. Some limits are physical, legal or political and will not move because he found a better bargain.

## Social presence

Persuasive, confident and comfortable talking to outsiders.

He enjoys negotiation and can make colleagues worry that he likes the deal more than the outcome.

## Voice

Clear and commercial without business jargon.

"We can't buy time. We can buy priority."

"They want certainty? Give them volume. We want flexibility? Pay for it."

## Under pressure

He becomes more willing to spend money or favour:
"Stop protecting the budget. Buy the lift."

## Interview

He talks about what people actually wanted in difficult negotiations, not what they said they wanted.

## Cross-post

Mensah is a J4 specialist.

His negotiation skills are useful across the headquarters, but they do not by themselves qualify him to run Plans or Personnel.

## Interesting contradiction

He sometimes says the deal is not worth doing:
"They'll agree. Doesn't mean it's a good deal."

## Respect, friction and being wrong

He respects Sato because she understands that agreements create obligations beyond the price written on the page. He enjoys sparring with Okafor: she asks whether the capacity exists; he asks whether the rules around that capacity can move. Lin is the person most likely to end one of his negotiations by showing that the requested thing simply cannot be made ready in time.

He loses respect when people call a constraint fixed without checking who has the authority to change it.

When Mensah is wrong, he finds a deal that technically solves the problem and underprices the favour, dependency or future promise embedded in it. Sometimes the capacity is available and the bargain is still bad.


## Avoid

Do not make him greedy, slick or able to negotiate away physics.

---

# Grace Lin

## Core

Lin wants a plan to be specific enough that somebody can build, repair or test it.

Her first question is usually: what exactly are we asking the system to do?

## Career anchor

Engineer and maintenance leader with command experience in technical formations and readiness recovery. She has spent years turning broad complaints about "readiness" into specific failures someone can fix.

## Strength

She breaks vague problems into real technical failures. She is excellent at maintenance, reliability and finding simple engineering fixes.

## Blind spot

She can dismiss political or human problems when they are not technically crisp. Some important problems do not become easier because the requirement is better written.

## Social presence

Quiet, dry and impatient with vague meetings. She prefers working sessions with the people who know the system.

## Voice

Exact but plain.

"Which failure are we fixing? There are three different problems hiding under 'readiness'."

## Under pressure

She strips away everything that does not matter:
"Use the old system. It works. Fix the interface later."

## Interview

She dislikes questions about leadership style and answers better when given a concrete case.

## Cross-post

In J7 she is strong on technical training, standards and learning from failure. In J3 she can be credible when operations depend heavily on system reliability.

Her cross-post value comes from technical readiness, not from becoming a generic operator.

## Interesting contradiction

She can support a knowingly imperfect workaround:
"It's ugly. We can test it by tonight. Use it."

## Respect, friction and being wrong

She has strong professional respect for Okafor and Navarro because both want claims tied to systems that can actually work. She can find Mensah useful and exhausting: he often creates options she can engineer, but sometimes brings her a promise before anyone has checked whether it can be built.

She loses respect for plans that stay vague because vagueness protects them from being tested.

When Lin is wrong, she can reduce a messy human or political problem to the part she can specify. She fixes the interface, the repair process or the technical failure and misses that the actual blockage is trust or authority.


## Avoid

Do not write an emotionless engineer or fill her speech with technical jargon.

---

# Sofia Marin

## Core

Marin believes logistics across partners is mostly a problem of trust, timing and knowing who will actually deliver what they promised.

Her first question is usually: which partner owns the part we cannot replace ourselves?

## Career anchor

Movement and coalition-support officer with experience in multinational logistics, access and shared stock arrangements. She knows which partner promise will survive contact with customs, transport and local politics.

## Strength

She is excellent at coalition support, access, shared stock and moving things across organisational boundaries.

She keeps partners contributing when a purely national plan would fail.

## Blind spot

She can compromise too far to preserve participation. Sometimes a partner contribution costs more complexity than it is worth.

## Social presence

Friendly, patient and widely connected. She genuinely likes working with different organisations.

She is less polished than Sato and more practical.

## Voice

Simple and partner-focused.

"They can give us fuel. They can't give us trucks. If we need both, we need another partner."

## Under pressure

She becomes tougher:
"No answer by noon, cut them out of the first move."

## Interview

She speaks warmly about people she has worked with, but she is clear about who delivers and who only promises.

## Cross-post

In J3 she brings real coalition-operations experience. In J5 she can contribute to multinational plans where partner access and support are central.

She is still a logistics officer first.

## Interesting contradiction

She can be the first to exclude a friendly partner:
"They're trying. I still wouldn't put them on the critical path."

## Respect, friction and being wrong

She and Dubois work easily together and may have served on the same coalition staff before. Ortiz values her because Marin can tell the difference between what a partner promised and what will actually arrive. Sato sometimes thinks Marin gives partners too much room; Marin sometimes thinks Sato sees every practical compromise as a larger political message.

She loses respect when a partner is blamed for failing to meet an expectation nobody clearly gave them.

When Marin is wrong, she keeps a partner inside the plan after their contribution has become more trouble than value. Her loyalty to cooperation can create too many interfaces and too much uncertainty.


## Avoid

Do not make her Sato-lite or a person who always wants more coalition involvement.

---

# Adrian Cole

## Core

Cole sees structure quickly. He likes plans where each decision supports the next and the whole campaign has a clear shape.

His first question is usually: what are we actually trying to make true?

## Career anchor

Campaign planner with experience in force planning, major exercises and joint headquarters work. He is at his best when a campaign has too many activities and no clear relationship between them.

## Strength

He can turn a messy campaign into a simple sequence of priorities and choices.

He is good at seeing when several decisions are pulling in different directions.

## Blind spot

He can fall in love with a neat plan. Reality that does not fit the structure may look like noise for longer than it should.

## Social presence

Thoughtful, articulate and self-controlled. He enjoys ideas and can accidentally make less polished officers feel talked down to.

## Voice

Clear and structured, but keep it in plain English.

"If deterrence is the main effort, two of these decisions are pulling against it."

## Under pressure

He becomes much less elegant:
"Plan's broken. Keep the objective. Drop the sequence."

## Interview

He enjoys discussing why campaigns fail as a whole rather than focusing on one decision.

## Cross-post

In J3 he is a credible cross-post because of his operations-plans work, but he remains a planner rather than a field commander.

The player should feel that difference in how he handles fast, messy execution.

## Interesting contradiction

He can abandon his own beautiful plan quickly once he finally accepts it is broken:
"Stop saving it. Write another one."

## Respect, friction and being wrong

He respects Sato's sense of consequence but can find her desire to preserve options untidy. She, in turn, sometimes thinks his campaign structure creates pressure to make reality fit the sequence. Yusuf appeals to him when the plan needs a clear priority and irritates him when she forces a choice before he has finished seeing how the pieces connect.

He loses respect for decisions that cannot be tied back to a clear campaign aim.

When Cole is wrong, the structure remains elegant after reality has moved. He can keep interpreting new facts as temporary disruption because accepting them would mean admitting that the sequence itself is broken.


## Avoid

Do not use academic language or make him the smartest man in every room.

---

# Nadia Yusuf

## Core

Yusuf believes leaders often hide hard choices inside vague language.

Her first question is usually: what are we actually choosing between?

## Career anchor

Plans and command-policy officer who has spent much of her career turning broad direction into explicit priorities. She has often worked where several senior leaders wanted mutually incompatible things left unsaid.

## Strength

She strips away false compromise and forces a headquarters to name what it is prioritising.

She is very good when several senior people are pretending their goals are compatible.

## Blind spot

She can close a debate too early. Some problems genuinely benefit from living with tension for a while rather than forcing an immediate binary choice.

## Social presence

Direct, composed and not interested in being liked by everyone.

She is fairer than her manner first suggests.

## Voice

Plain and sharp.

"We keep saying both matter. Fine. Which one loses if we can't have both?"

She avoids Sato's softer reframing.

## Under pressure

She gets harder:
"Pick one. We can explain it after."

## Interview

She is candid, sometimes uncomfortably so. She respects a player who gives a clear answer more than one who tries to impress her.

## Cross-post

Yusuf is a J5 specialist.

Her ability to force hard choices into the open is useful elsewhere, but it does not make her a personnel or intelligence chief.

## Interesting contradiction

She can defend ambiguity:
"We don't need to choose yet. Choosing now just gets us wrong sooner."

## Respect, friction and being wrong

She respects Briggs because he usually names the action he wants and accepts the consequences. They clash when he thinks a third option can still be improvised and she thinks the time for cleverness has passed. Dubois can frustrate her by preserving relationships Yusuf believes the headquarters should stop protecting.

She loses respect when leaders use vague language to avoid owning which priority is losing.

When Yusuf is wrong, she turns a real tension into a false binary. The clarity feels useful, but the headquarters may discover that the two aims could have been held together long enough to reach a better answer.


## Avoid

Do not make her rude for entertainment or a simple "tough choices" machine.

---

# Victor Hale

## Core

Hale believes capability is built over years and destroyed by constant short-term raiding.

His first question is usually: what does this cost the force we are trying to have later?

## Career anchor

Capability-development officer with experience in programmes, training pipelines and industrial planning. He has watched promising long-term efforts die one small "temporary" raid at a time.

## Strength

He protects programmes, training pipelines and industrial growth from being repeatedly sacrificed to immediate demands.

He sees when the headquarters is winning every month and losing the future.

## Blind spot

He can protect the future from the present so aggressively that the campaign never gets the benefit of what is being built.

He is prone to saying "not yet."

## Social presence

Patient, calm and hard to hurry. He is not exciting in a meeting, but people often realise later that he was looking further ahead than everyone else.

## Voice

Simple and long-horizon.

"We can take the people. The programme moves six months. That's the trade."

## Under pressure

He can spend the future deliberately:
"If this is the crisis we built it for, use it. Stop protecting the programme from the reason it exists."

## Interview

He likes questions about trade-offs over time and is honest about programmes that should have been killed earlier.

## Cross-post

Hale is naturally suited to J7 Force Development and can serve strongly in J5 because of his long-range plans experience.

J4 is a deliberate stretch. He understands programme and industrial buildup, but not the day-to-day depth of a career logistician.

## Interesting contradiction

He can recommend cancelling his own favoured programme:
"It's not arriving in time. Stop feeding it."

## Respect, friction and being wrong

He respects Mercer because Mercer understands pipelines, not just today's vacancies. Chen is useful to him because she can show when an industrial or political trend changes the long-term plan. Rahman's speed worries him; her willingness to break stale systems also keeps him from protecting programmes simply because they have existed for years.

He loses respect when every urgent problem raids the same future programme.

When Hale is wrong, he can preserve tomorrow's capability through today's decisive moment. His long view becomes a hiding place from the question of whether the future plan still matters if the current campaign goes badly enough.


## Avoid

Do not make him slow, dull or blindly pro-modernisation.

---

# Samuel Reyes

## Core

Reyes believes good organisations perform because local leaders understand the aim and have enough room to act.

His first question is usually: do the people doing this understand what matters?

## Career anchor

Field commander and training leader with deep experience in decentralised command, exercises and junior-leader development. He has seen both excellent local initiative and chaos produced by vague intent.

## Strength

He is excellent at coaching, decentralised execution and turning broad intent into practical learning at unit level.

He notices when headquarters control is preventing people from learning.

## Blind spot

He can trust local judgement too far. Some tasks need strict common standards and central coordination.

## Social presence

Warm, energetic and comfortable with junior leaders. Senior staff sometimes think he is too informal.

## Voice

Plain and encouraging without becoming motivational.

"Tell them what can't fail. Let them work out the rest."

## Under pressure

He protects local freedom:
"Don't give them another checklist tonight. Give them the aim and the boundary."

But in a badly fragmented force he can reverse:
"No. Same procedure for everyone until we've got control back."

## Interview

He talks about people learning by doing and is quick to give credit to subordinates.

## Cross-post

In J3 he brings real command experience and a strong instinct for giving subordinate leaders room to act. In J1 he can be credible where leader development is central.

He remains strongest in J7.

## Interesting contradiction

He can demand tight central control when variation has become dangerous.

## Respect, friction and being wrong

He is close to Bell and likes Haddad's trust in people close to the problem. Navarro challenges him more than almost anyone: she wants common standards; he wants room for local judgement. Their best arguments end with a clearer boundary between what must be common and what can vary.

He loses respect when headquarters assumes detailed control is the same as good command.

When Reyes is wrong, he gives freedom to a force that does not yet share enough understanding to use it well. Local initiative becomes inconsistency, and inconsistency becomes confusion.


## Avoid

Do not make him a motivational coach or assume decentralisation is always good.

---

# Mei Tan

## Core

Tan believes organisations should change when evidence shows something is not working.

Her first question is usually: what did we learn that should change what we do next?

## Career anchor

Exercise, simulation and lessons officer with experience in analysis and campaign planning. Her career has centred on turning what happened into changes that make the next attempt better.

## Strength

She builds strong feedback loops. She is good at after-action review, simulation and turning lessons into changes quickly.

## Blind spot

She can overreact to recent evidence. One bad exercise or one surprising event may cause her to change a system that was broadly sound.

## Social presence

Curious, open and willing to question her own ideas. She asks many questions without making people feel examined.

## Voice

Simple, inquisitive and practical.

"Was the plan wrong, or had the unit just not practised enough?"

## Under pressure

She becomes selective about lessons:
"Don't redesign it tonight. Record it. We'll decide what it means after."

## Interview

She asks the player questions back, especially about how they decide whether something is a lesson or noise.

## Cross-post

In J5 she can use exercise and lessons experience to adapt campaign plans as evidence changes.

She is not a J2 candidate. Being good at learning from evidence is not the same as leading intelligence.

## Interesting contradiction

She can become the strongest defender of stability:
"We've changed this every time something went wrong. That's becoming the problem."

## Respect, friction and being wrong

She works easily with Rahman and Nair because all three enjoy discovering that the old explanation was incomplete. Navarro is an important brake on her: Navarro asks whether a lesson has repeated often enough to deserve a new standard. Chen helps her distinguish a local lesson from a system-wide one.

She loses respect when an after-action review exists only to prove the original plan was sound.

When Tan is wrong, she learns too quickly. A vivid failure or surprising success gets promoted into a general lesson before the organisation knows whether it was signal or noise.


## Avoid

Do not make her permanently experimental or obsessed with lessons-learned language.

---

# Omar Bell

## Core

Bell believes people perform best when they know their leaders will tell them the truth, give them room to grow, and not discard them after one failure.

His first question is usually: is this person failing, or are we failing to develop them?

## Career anchor

Commander, instructor and personnel leader known for developing officers who were not obvious early stars. He has spent much of his career in jobs where judging potential matters as much as judging present performance.

## Strength

He builds strong teams, mentors people well and can turn weak but promising officers into useful leaders.

He is especially good at culture and leader development.

## Blind spot

He can protect people past the point where the organisation needs a change. Loyalty can become reluctance to remove someone who is not good enough.

## Social presence

Warm, humorous and easy to trust. He knows many people well and often understands why someone is struggling before their formal boss does.

## Voice

Friendly and plain, but capable of becoming very direct.

"She's had two chances and learned from both. Give her the third."

Or:
"He's had three chances and blamed somebody else every time. Move him."

## Under pressure

He stops cushioning the message:
"We don't have time to develop him in this job. Replace him."

## Interview

He is open and personable. He may tell the player something kind about a colleague before giving a hard professional judgement.

## Cross-post

In J7 he brings leader development, instructor experience and a strong feel for how people actually learn.

He should stay out of J5. Judging whether an organisation has enough leaders is useful planning advice, not a plans qualification.

## Interesting contradiction

The warm mentor can be the officer who removes somebody:
"Keeping him here isn't kind. The team is carrying him for us."

## Respect, friction and being wrong

He is close to Reyes and often sees promise in people Mercer is ready to move. Mercer respects Bell's eye for talent but thinks he sometimes protects development at the expense of the job that needs doing now. Bell respects Warden's willingness to tell people the real cost of what is being asked.

He loses respect when leaders call somebody "not good enough" without ever giving them a clear standard or useful feedback.

When Bell is wrong, loyalty becomes delay. He gives one more chance because he can see why the person is struggling, while the rest of the team quietly absorbs the cost.


## Avoid

Do not make him sentimental, universally forgiving or a therapist in uniform.

---

# Appointment fit guide

These fits describe believable career moves, not who is "better".

Natural means the officer has a strong career claim to the billet. Strong means the move is easy to believe because of real prior work. Credible means the officer could do the job but would be leaving their main career lane. Stretch means the scenario is deliberately taking a risk.

A personality match is not enough. Every Strong or Credible fit must be supported by the career background above.

| Officer | Natural | Strong | Credible | Stretch |
| --- | --- | --- | --- | --- |
| Ruth Warden | J1 | J7 | — | — |
| Elias Halden | J2 | — | J5 | — |
| Mara Briggs | J3 | J5 | — | J4 |
| Tunde Okafor | J4 | — | J3 | — |
| Mina Sato | J5 | — | J3 | — |
| Elena Navarro | J7 | — | J1 | J3 |
| Daniel Mercer | J1 | — | J7 | — |
| Farah Rahman | J7 | — | J1 | — |
| Claire Dubois | J1 | — | J5 | — |
| Priya Nair | J2 | — | — | — |
| Tomas Varga | J2 | — | — | J3 |
| Miriam Chen | J2, J5 | — | — | — |
| Helena Ortiz | J3 | J5 | — | J4 |
| Noah Kessler | J3 | J7 | — | J1 |
| Laila Haddad | J3 | — | J5 | — |
| Peter Mensah | J4 | — | — | — |
| Grace Lin | J4 | J7 | J3 | — |
| Sofia Marin | J4 | J3 | J5 | — |
| Adrian Cole | J5 | — | J3 | — |
| Nadia Yusuf | J5 | — | — | — |
| Victor Hale | J7 | J5 | — | J4 |
| Samuel Reyes | J7 | J3 | J1 | — |
| Mei Tan | J7 | — | J5 | — |
| Omar Bell | J1 | J7 | — | — |

Specialists are allowed to be specialists. Not every officer needs two normal appointments.

A Strong or Credible fit must have a named career basis in this document. If the career history changes, the fit must be reviewed again. A clever personality match is not enough.

# Voice fingerprint

This is a writing aid. Do not turn it into player-visible statistics.

| Officer | Pace | Humour | How they challenge | What they will not accept |
| --- | --- | --- | --- | --- |
| Warden | steady | dry | names who pays | human cost hidden behind soft words |
| Halden | spare | very dry | separates fact from judgement | stronger claims than the evidence allows |
| Briggs | fast | blunt | demands the first action or alternative | vague objections with no proposed move |
| Okafor | steady | understated | names the real bottleneck | somebody spending capacity they do not own |
| Sato | measured | wry | asks what the choice commits us to next | casual promises that create real obligations |
| Navarro | precise | sardonic | asks what standard is actually being claimed | calling one success a mature ability |
| Mercer | calm | rare | shows the later hole created by today's posting | hoarding good people because they are useful now |
| Rahman | lively | light | asks whether a "rule" is only habit | old practice defended only because it is old |
| Dubois | warm | gentle | asks whose cooperation the plan needs | surprising partners and blaming their reaction |
| Nair | quick | curious | offers another explanation for the pattern | dismissing an incomplete idea without testing it |
| Varga | terse | almost none | narrows the claim to what was actually seen | turning headquarters judgement into source reporting |
| Chen | slow | mild | follows the second- and third-order effects | pretending one cause explains a mixed problem |
| Ortiz | steady | dry | asks for the branch when the first plan fails | hidden dependencies appearing after approval |
| Kessler | steady | low | asks where the reset sits | permanent emergency tempo |
| Haddad | fast | warm | rebuilds from what is true now | following a dead plan to avoid embarrassment |
| Mensah | conversational | witty | asks who owns the constraint and what can move it | calling a limit fixed without checking |
| Lin | terse | dry | turns a vague problem into a testable one | plans kept vague so they cannot fail a test |
| Marin | warm | practical | asks who will really deliver the partner piece | goodwill being treated as reliability |
| Cole | measured | quiet | ties each activity back to the main aim | activity that exists only because it was in the plan |
| Yusuf | crisp | dry | forces the hidden priority into the open | vague language used to avoid owning a loss |
| Hale | slow | mild | shows what today's shortcut costs later | repeatedly raiding the same future programme |
| Reyes | conversational | warm | asks whether local leaders understand the aim | detailed control being mistaken for good command |
| Tan | curious | light | asks whether a result is a real lesson or noise | changing doctrine after every vivid event |
| Bell | warm | easy | asks whether the person was ever properly developed | writing someone off without a fair standard |

# Relationship seeds

Relationships need two different kinds of truth.

**Shared history** is a fact: two officers served together, one mentored the other, or they argued during a past operation.

**Directional view** belongs to one person: liking, dislike, trust and professional respect can be different in each direction.

A bad relationship does not force disagreement. Senior officers can dislike each other and still reach the same professional answer.

## Shared history

| Officers | Known history |
| --- | --- |
| Mara Briggs / Tunde Okafor | Served together on a difficult joint task force. They argued often and became close friends. |
| Ruth Warden / Mina Sato | Worked together during a reserve mobilisation that became politically sensitive. |
| Elias Halden / Priya Nair | Halden supervised Nair during an earlier warning assignment. |
| Elias Halden / Tomas Varga | Worked the same collection-and-assessment problem from opposite ends of the reporting chain. |
| Mara Briggs / Helena Ortiz | Repeatedly competed for lead planning roles during major exercises. |
| Helena Ortiz / Sofia Marin | Served together on a coalition maritime operation. |
| Tunde Okafor / Grace Lin | Worked together during a major readiness recovery. |
| Elena Navarro / Samuel Reyes | Taught on the same senior exercise staff and argued over how much freedom units should have. |
| Elena Navarro / Mei Tan | Navarro previously supervised Tan on a lessons and evaluation team. |
| Farah Rahman / Victor Hale | Worked on the same force-development programme and disagreed over how quickly to change it. |
| Daniel Mercer / Omar Bell | Worked in the same personnel command. Mercer once moved one of Bell's protégés without warning him. |
| Claire Dubois / Sofia Marin | Served together on reserve and partner-support arrangements. |
| Priya Nair / Miriam Chen | Worked on the same long-range warning study. |
| Laila Haddad / Helena Ortiz | Shared a crisis headquarters where Haddad's improvisation later created work for Ortiz's planning team. |
| Nadia Yusuf / Claire Dubois | Served through a partner crisis and disagreed over when to stop negotiating. |
| Grace Lin / Adrian Cole | Clashed during a capability review after Cole backed a plan Lin believed was not technically ready. |
| Samuel Reyes / Omar Bell | Long friendship from command and instructor tours. |
| Mina Sato / Adrian Cole | Sato was once Cole's senior planner and later sponsored him for a major plans post. |

## Directional views

| From | Toward | Affinity | Professional respect | What this means in dialogue |
| --- | --- | --- | --- | --- |
| Briggs | Okafor | warm | high | Briggs gives Okafor real benefit of doubt when she says a plan cannot be supported. |
| Okafor | Briggs | warm | high | Okafor will spend more time finding Briggs another route than she would for someone she trusts less. |
| Warden | Sato | warm | high | Warden trusts Sato to understand that promises to the force matter. |
| Sato | Warden | warm | high | Sato will sometimes spend political room to protect a personnel promise Warden thinks matters. |
| Halden | Nair | neutral | high | Halden admires Nair's imagination but challenges her favourite explanations hard. |
| Nair | Halden | warm | high | Nair wants Halden's approval more than she likes admitting and can become defensive when he rejects a hypothesis. |
| Varga | Nair | cool | normal | Varga thinks Nair sometimes stretches thin reporting too far. |
| Nair | Varga | cool | high | Nair respects Varga's source judgement but finds him too reluctant to combine weak signals. |
| Briggs | Ortiz | neutral | high | Their rivalry sharpens professional argument without making either dismiss the other. |
| Ortiz | Briggs | neutral | high | Ortiz thinks Briggs starts moving before every branch is ready. |
| Ortiz | Haddad | cool | high | Ortiz respects Haddad in a crisis and dislikes cleaning up the loose ends afterward. |
| Haddad | Ortiz | cool | high | Haddad thinks Ortiz sometimes plans for certainty that will never come. |
| Okafor | Mensah | cool | normal | Okafor thinks Mensah sometimes treats a physical limit like a bargaining problem. |
| Mensah | Okafor | neutral | high | Mensah respects Okafor and thinks she sometimes stops testing a rule too soon. |
| Lin | Cole | cool | normal | Lin has not forgotten the old capability review and is quick to challenge vague assumptions in his plans. |
| Cole | Lin | cool | high | Cole dislikes Lin's manner more than her judgement and knows she is often right about technical risk. |
| Navarro | Reyes | warm | high | Their arguments are direct because both trust the other's motives. |
| Reyes | Navarro | warm | high | Reyes accepts more standardisation from Navarro than from most people. |
| Navarro | Tan | warm | normal | Navarro sees promise in Tan but does not yet rate her judgement as highly as Tan rates Navarro's. |
| Tan | Navarro | warm | high | Tan can give Navarro too much weight because of the old mentor relationship. |
| Rahman | Hale | cool | high | Rahman thinks Hale protects programmes too long. |
| Hale | Rahman | cool | high | Hale thinks Rahman can change a system faster than the replacement can settle. |
| Mercer | Bell | neutral | high | Mercer values Bell's eye for people but thinks he gives development too much time. |
| Bell | Mercer | cool | high | Bell still respects Mercer but has not forgotten the protégé move. |
| Dubois | Marin | warm | high | Dubois assumes good faith from Marin even when she thinks Marin has compromised too far. |
| Marin | Dubois | warm | high | Marin is unusually candid with Dubois about partner failures. |
| Yusuf | Dubois | cool | normal | Yusuf thinks Dubois sometimes preserves talks after the decision should already be made. |
| Dubois | Yusuf | cool | high | Dubois respects Yusuf's clarity but thinks she can damage relationships by forcing the choice too soon. |
| Reyes | Bell | warm | high | They are close friends and sometimes support each other's judgement more readily than the evidence alone would justify. |
| Sato | Cole | neutral | high | Sato respects Cole's planning and watches for the point where he starts protecting the plan itself. |
| Cole | Sato | warm | high | Cole still gives Sato's judgement extra weight because she was once his senior and sponsor. |
| Halden | Varga | neutral | high | Halden trusts Varga to be exact about source access and reporting limits. |
| Varga | Halden | neutral | high | Varga trusts Halden not to turn headquarters judgement into something a source supposedly said. |
| Nair | Chen | neutral | high | Nair values Chen as the person most likely to test whether an attractive pattern explains enough of the wider picture. |
| Chen | Nair | neutral | high | Chen values Nair's speed in spotting patterns before the wider system has been fully mapped. |
| Ortiz | Marin | warm | high | Ortiz trusts Marin's judgement about which partner contribution will really arrive. |
| Marin | Ortiz | warm | high | Marin trusts Ortiz to build coalition contributions into a plan without pretending promises are guarantees. |
| Kessler | Warden | neutral | high | Kessler values Warden because she often sees the human version of the same recovery problem he sees in force tempo. |
| Mercer | Hale | neutral | high | Mercer respects Hale's understanding of long pipelines and future capability. |
| Hale | Mercer | neutral | high | Hale trusts Mercer to show where a capability plan quietly depends on future people and postings. |

A missing edge means the game should not invent a strong opinion.

# Human rough edges

Not every flaw should be a noble strength taken too far. These are small human weaknesses that can make a headquarters harder to manage.

They must be hinted at in interviews or early conversations. They are not hidden traps.

| Officer | Rough edge |
| --- | --- |
| Warden | Holds onto broken promises for a long time and can become colder than she realises toward the officer who broke them. |
| Halden | Corrects sloppy claims in front of other people, even when a private correction would have been kinder. |
| Briggs | Can dominate a meeting when impatient and may cut off a slower officer before they reach the useful part. |
| Okafor | Protects spare capacity so instinctively that she sometimes reveals useful margin later than colleagues would like. |
| Sato | Can over-manage wording and leave people unsure whether she actually agrees with them. |
| Navarro | Is patient with juniors but can be cutting with senior officers she thinks are pretending a failure was a success. |
| Mercer | Sometimes moves people for the good of the wider force without warning them early enough. |
| Rahman | Can dismiss a slow objection as resistance to change before she has properly heard it. |
| Dubois | Sometimes waits too long to confront someone because she wants to preserve the working relationship. |
| Nair | Gets defensive when a hypothesis she has worked on for weeks is challenged late in the process. |
| Varga | Hoards context because he dislikes reporting something before he understands where it came from. |
| Chen | Can bury a simple recommendation under too many caveats when she is anxious about missing a link. |
| Ortiz | Has little patience for improvised changes made after she thought a plan was settled. |
| Kessler | Can sound calm enough that others mistake lack of drama for lack of urgency. |
| Haddad | Leaves poor notes when moving fast and assumes people will remember why a workaround was chosen. |
| Mensah | Can promise a negotiation is close to solved before the other side has truly agreed. |
| Lin | Can make non-technical colleagues feel foolish when they cannot state a problem precisely. |
| Marin | Sometimes protects a friendly partner from criticism longer than she should. |
| Cole | Can become attached to being the person with the clear plan and resist admitting that somebody else's simpler answer is better. |
| Yusuf | Can close down discussion once she thinks the real choice is obvious. |
| Hale | Is more protective of programmes he personally helped build than he likes to admit. |
| Reyes | Can give proven local leaders more freedom than newer leaders think is fair. |
| Tan | Gets excited by a new lesson and can make colleagues tired of another proposed change. |
| Bell | Sometimes shields an underperformer from consequences because he believes one more coaching conversation will work. |

# Discovery patterns

Do not use the same "first impression was wrong" trick for everyone.

| Officer | How the player learns them |
| --- | --- |
| Warden | First impression is mostly right; the surprise is how hard a decision she can support. |
| Halden | Looks cautious at first; later the player learns his caution is about claims, not action. |
| Briggs | First impression is partly wrong; impatience hides preparation rather than recklessness. |
| Okafor | Looks conservative; later her inventiveness becomes obvious. |
| Sato | Looks diplomatic; the deeper surprise is how seriously she treats hard commitments. |
| Navarro | Looks strict and remains strict; the surprise is how tolerant she is of honest failure. |
| Mercer | The first impression of distance is basically right. The player later understands why that distance can be useful and costly. |
| Rahman | Easy to like early. Familiarity reveals that her speed can exhaust people who need stability. |
| Dubois | Seems agreeable. The player gradually sees that she has firm lines and can end a relationship cleanly. |
| Nair | Her talent is obvious early. Her blind spot becomes clearer only after the player watches a favourite hypothesis survive too long. |
| Varga | Hard to read at first and remains private. Trust grows slowly rather than revealing a hidden opposite personality. |
| Chen | The player initially finds her broad thinking useful, then may become frustrated by how much she sees. |
| Ortiz | First impression is accurate: calm and careful. The surprise is how large a risk she will take once satisfied. |
| Kessler | Appears steady rather than impressive. His value becomes clearer over several turns, especially after repeated tempo. |
| Haddad | Impresses early in a crisis. Her weaknesses become obvious later, when the organisation has to live with the workaround. |
| Mensah | Charming competence shows early. The player later learns to ask what the deal costs after the immediate problem is solved. |
| Lin | Can be difficult on first meeting. Respect often grows before warmth does. |
| Marin | Easy to work with from the start. The player later learns that her loyalty to partners can also become a weakness. |
| Cole | Often makes a strong first impression. Familiarity can make him less attractive when the player sees how long he protects a neat plan. |
| Yusuf | The first impression of bluntness is correct. The deeper question is whether her clarity is useful or premature in this case. |
| Hale | May seem slow early. His judgement becomes more valuable as delayed consequences begin to arrive. |
| Reyes | Warm and empowering from the start. His weakness appears only when local freedom produces inconsistent results. |
| Tan | Curious and likeable early. The player may later become wary of how quickly she wants to learn from one result. |
| Bell | Warmth is genuine, not a mask. The surprise is that he can eventually be very hard once he gives up on someone's development. |

# Distinction test

When the same proposal reaches all 24 officers, they should not simply produce 24 tones of support or objection.

Their first questions should differ.

Warden: Who carries it?

Halden: What do we actually know?

Briggs: What happens first?

Okafor: What makes it physically possible?

Sato: What follows from this?

Navarro: Can the organisation do it again?

Mercer: What does it do to the next group of people?

Rahman: Why are we still doing it this way?

Dubois: Whose cooperation does it depend on?

Nair: What larger pattern would explain this?

Varga: Where did the information come from?

Chen: What else changes if we do this?

Ortiz: What is the branch if it fails?

Kessler: When do we recover?

Haddad: What is actually true now?

Mensah: Who controls what we need?

Lin: What exactly are we asking the system to do?

Marin: Which partner owns the part we cannot replace?

Cole: What are we trying to make true?

Yusuf: What are we really choosing between?

Hale: What does this cost the future force?

Reyes: Do the people doing it understand what matters?

Tan: What did we learn that should change the next move?

Bell: Is the person failing, or are we failing to develop them?

If a line could be moved between officers by changing one noun, rewrite it.

# Plain-English test

Reject dialogue that sounds like an internal paper rather than speech.

Avoid phrases such as:

- optimise human capital;
- preserve strategic optionality;
- enable cross-functional alignment;
- institutionalise force-generation effects;
- drive stakeholder coherence;
- create decision advantage;
- maximise organisational resilience.

Prefer:

- keep good people;
- leave ourselves another choice;
- get the teams working together;
- make the change stick;
- make sure everyone understands the plan;
- decide before the other side forces the choice;
- make sure we can keep doing this.

Technical military terms are allowed when they are ordinary parts of the setting and understandable in context. Characters should still prefer the simplest accurate words.

# Text-game interest test

Each officer must be:

1. recognisable after a few conversations;
2. not fully predictable after many conversations;
3. capable of support, conditional support, opposition and an unexpected alternative;
4. socially compatible with some officers and difficult with others;
5. interesting in at least two billets;
6. flawed in a way that can matter mechanically;
7. credible as a senior professional rather than a colourful NPC.

The player should eventually think:

"I know how this person thinks."

They should not think:

"I know which option this character always picks."
