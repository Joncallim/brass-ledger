// Incidents: one-off problems that land on your desk before the month's orders. Each is a
// real dilemma: two officers with good reasons on opposite sides, a free staff answer, and
// at least one answer that costs a personal order. Effects scale with difficulty
// (`k` = the difficulty's severity), so the same incident bites harder on Volatile.
import { WORLD as W, onWorld } from "./world.js";
import { surname } from "./officers.js";

let B, R, M, MA, S, L, BN;
const n = (x, k) => Math.round(x * k);
// Days the battalion's engineer company spends changing the radar's waveguide.
export const ENG_DAYS = 12;

export let INCIDENTS;

export const incidentById = (id) => INCIDENTS.find((x) => x.id === id);

// Recomputed whenever the theatre changes (see setWorld in src/story/world.js).
onWorld(() => {
  B = W.stationShort; R = W.rival; M = W.host; MA = W.hostAdj; S = W.harbour; L = W.network; BN = W.reserve;
  INCIDENTS = [
    {
      // Staff business: the engineers repair it and report. It still costs the battalion.
      id: "radar", command: false, months: ["dec", "jan"], day: { dec: 9, jan: 7 }, from: "briggs",
      title: `${B}’s main radar is failing`,
      text: (c, s, k) => `The main radar on ${B} has a cracked waveguide. Only ${BN}’s engineer company can change it, and the work keeps them from resting: ${ENG_DAYS} more fatigue for the battalion. Left running, the engineers give it a one in ${k > 1.3 ? "three" : "four"} chance of failing for good before the end of February, and ${B} would fight blind on that side.`,
      options: [
        { id: "fix", name: "Repair it now", says: `${BN}’s engineers do the work: ${ENG_DAYS} more fatigue for the battalion, on top of this month’s orders. Six days on the spare radar, then it is sound.`, staff: true,
          effect: (s) => { s.eng += ENG_DAYS; s.notes.push("radar-fixed"); } },
        { id: "run", name: "Keep it running", says: `No cost now. A real chance it fails when ${R} sails, and ${B} loses a step of its defence that day.`, seal: true,
          effect: (s, c, k) => { if (c.luck.radar < (k > 1.3 ? 0.34 : 0.25)) s.radarFails = true; s.notes.push("radar-run"); } },
      ],
      council: (c, s) => ({
        okafor: s.fatigue + ENG_DAYS > 100
          ? { prefers: "run", line: `Those engineers are my tiredest men. Twelve more fatigue on them and I am signing sick notes in February. Let the radar take its chances.`, because: `${BN} fit in February`, risk: `${BN} carries another ${ENG_DAYS} fatigue into February.` }
          : { prefers: "fix", line: "A cracked waveguide does not heal. The engineers have the days to spare now; they may not in February.", because: "keeping equipment working when it matters", risk: `${B} could be blind on the day ${R} sails.` },
        halden: { prefers: "run", line: `Six days with 20 miles is six days I cannot see what leaves ${S}. That is the week I most need to watch.`, because: `watching ${R} through its build-up`, risk: `six days in which a sailing from ${S} could go unseen.` },
        briggs: { prefers: "fix", line: "I would rather lose six days now than lose the radar in February.", because: `${B} being able to see an attack coming`, risk: "a radar failure at the worst possible moment." },
      }),
      reply: { fix: ["briggs", "Engineers start tonight. Spare radar up by midnight."], run: ["briggs", "Then we run it and watch it. If it goes, it goes on the worst day, and I will be short a gun line."] },
    },
    {
      // Staff business: who questions him is a procedure, not a command decision.
      id: "defector", command: false, months: ["dec", "jan"], day: { dec: 11, jan: 9 }, from: "halden",
      title: `A ${R} navy officer wants to defect`,
      text: () => `A lieutenant from ${R}’s navy came ashore in a fishing port in ${M} last night and asked for us by name. He says he served on the staff in ${S} and knows what the landing craft are for. ${MA} police are holding him and want an answer by noon.`,
      options: [
        { id: "talk", name: "Question him ourselves", says: `${surname("halden")}’s people question him for a week. We hear what he knows first. ${M}’s police will feel brushed aside.`, seal: true,
          effect: (s, c, k) => {
            const planted = c.D.deception > 0 && c.luck.defector < c.D.deception;
            s.knows.claim = { plan: planted ? (c.plan === "bluff" ? "land" : "bluff") : c.plan, planted };
            s.support -= n(4, k);
          } },
        { id: "hand", name: `Hand him to ${M}`, says: `${M}’s security service questions him and shares what it chooses. The ${MA} cabinet will like being trusted.`, staff: true,
          effect: (s, c, k) => { s.support += n(6, k); } },
      ],
      council: () => ({
        halden: { prefers: "talk", line: `A staff officer from ${S} is worth more than a month of radio. I want him in my room, not theirs.`, because: `knowing what ${R} really plans`, risk: `whatever he knows reaches us late and filtered, if at all.` },
        sato: { prefers: "hand", line: `He walked into a ${MA} police station. If we take him, the ${MA} ministers will ask what else we take without asking.`, because: `${M}’s trust in us`, risk: `the ${MA} cabinet feels pushed aside a month before it votes.` },
      }),
      reply: { talk: ["halden", "He is in a car to us now. I will tell you what he says, and how far I believe it."], hand: ["sato", "The minister thanks you. She has promised us a summary within the week."] },
    },
    {
      id: "leak", command: true, months: ["dec", "jan"], day: { dec: 13, jan: 10 }, from: "sato",
      title: `${MA} paper prints our numbers on ${B}`,
      text: () => `A ${MA} newspaper has printed how many troops and guns we have on ${B}, nearly right. ${R}’s embassy has already quoted it. Reporters are asking us to confirm or deny by tonight.`,
      options: [
        { id: "silent", name: "Say nothing", says: "No comment. The numbers stay unconfirmed, and the story runs without us.", staff: true,
          effect: (s, c, k) => { s.support -= n(4, k); } },
        { id: "brief", name: "Brief the press openly", says: `Confirm our strength and explain why. ${MA} readers hear it from us. ${R} learns exactly what defends ${B}.`, seal: true,
          effect: (s, c, k) => { s.support += n(6, k); s.rivalKnows = true; } },
      ],
      council: () => ({
        sato: { prefers: "brief", line: `The ${MA} ministers are reading this story with their coffee. Better they hear the numbers from us, with our reasons.`, because: `the ${MA} cabinet hearing our side first`, risk: `the story is told by the paper and by ${R}’s embassy, not by us.` },
        halden: { prefers: "silent", line: `Never confirm a number. Right now ${R} has a newspaper’s guess. Confirm it and they have a fact.`, because: `keeping ${R} unsure of ${B}’s strength`, risk: `${R} plans its next move knowing exactly what it faces.` },
        briggs: { prefers: "silent", line: "I would rather they guess.", because: `${B}’s defences staying a guess to ${R}`, risk: `${R} learns what it would need to beat ${B}.` },
      }),
      reply: { silent: ["sato", "No comment, then. I will spend the evening calling ministers."], brief: ["sato", "We brief at six. I will write it so the ministers recognise their own words."] },
    },
    {
      id: "collision", command: true, months: ["dec", "jan"], day: { dec: 15, jan: 12 }, from: "briggs",
      title: "Collision on the shipping lane",
      text: () => `One of our patrol boats collided with a ${R} fishing boat on the shipping lane at 0300. One fisherman has a broken arm. Our crew says the fishing boat had no lights and a navy radio mast. ${R} state television is already calling it an attack on fishermen.`,
      options: [
        { id: "return", name: "Apologise and return the crew", says: `Treat the fisherman, send boat and crew home by morning, and express regret. ${R} gets its story; nothing escalates.`, staff: true,
          effect: (s, c, k) => { s.support -= n(3, k); } },
        { id: "search", name: "Hold the boat and search it", says: `Board and search before releasing the crew. We would learn what that radio is for. ${R} will call it piracy.`, seal: true,
          effect: (s, c, k) => { s.knows.role = c.fleetRole; s.tension += 1; s.support -= n(c.minister === "dove" ? 8 : 4, k); } },
      ],
      council: () => ({
        okafor: { prefers: "return", line: "A hurt fisherman on our deck is a picture that wins their story for them. Send him home tonight.", because: "keeping our ships out of an incident we cannot win", risk: `${R} gets a second story: we held injured fishermen.` },
        halden: { prefers: "search", line: "A fishing boat with a navy mast and no lights. Give me four hours aboard and I will tell you what their fishing fleet is for.", because: `learning what ${R}’s fishing fleet is really doing`, risk: "we hand back the best evidence we will get." },
        sato: { prefers: "return", line: `Every hour we hold them, the ${MA} ministers hear ${R} call us pirates.`, because: `the ${MA} cabinet’s nerve`, risk: "the cabinet sees us escalating on its doorstep." },
      }),
      reply: { return: ["okafor", "Boat and crew home by first light. The fisherman’s arm is set."], search: ["halden", "My people are aboard. Four hours, General."] },
    },
    {
      id: "visit", command: true, months: ["jan"], day: { jan: 5 }, from: "sato",
      title: `${M}’s defence minister wants to visit ${B}`,
      text: (c) => `${M}’s defence minister asks to visit ${B} on 8 January, ${c.voteDay - 8 === 1 ? "the day" : `${c.voteDay - 8} days`} before the cabinet votes on the ${c.voteDay}${[11, 12, 13].includes(c.voteDay) ? "th" : ["th", "st", "nd", "rd"][c.voteDay % 10] ?? "th"}. She is ${c.minister === "dove" ? "the cabinet’s loudest voice for staying out of this" : c.minister === "hawk" ? "the cabinet’s strongest supporter of standing with us" : "undecided, and the cabinet follows her"}. She wants cameras.`,
      options: [
        { id: "open", name: "Host her, with cameras", says: `A public visit. The ${MA} public sees its minister with our troops. ${R} sees it too.`, staff: true,
          effect: (s, c, k) => { s.support += n(c.minister === "dove" ? 4 : 8, k); s.rivalSaw = true; } },
        { id: "quiet", name: "Host her, no cameras", says: "A private visit. She sees everything; nobody photographs it. She may take offence at the condition.", seal: true,
          effect: (s, c, k) => { s.support += n(c.minister === "dove" ? 8 : 3, k); } },
      ],
      council: (c) => ({
        sato: { prefers: c.minister === "dove" ? "quiet" : "open", line: c.minister === "dove" ? "She is looking for a reason to vote no. Show her everything, privately, and take away the cameras she wants to frown for." : "Let her be photographed with our troops. A minister does not vote against a picture of herself.", because: `the ${MA} vote on ${c.voteDay} January`, risk: c.minister === "dove" ? "she uses the cameras to look reluctant." : "we waste the minister’s wish to be seen with us." },
        briggs: { prefers: "quiet", line: `Cameras on ${B} show ${R} our guns. I would rather they did not see what we have.`, because: `keeping ${B}’s defences out of sight`, risk: `${R} gets free pictures of ${B}’s defences.` },
      }),
      reply: { open: ["sato", "She arrives on the 8th. I have asked the troops to shave."], quiet: ["sato", "She has accepted, without enthusiasm. No cameras."] },
    },
  ];
});
