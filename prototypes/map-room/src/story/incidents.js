// Incidents, in words. Their rules (when, and what each answer does) are in definition.js;
// this module words them for one world. Each is a real dilemma: officers with good reasons on
// opposite sides, a free staff answer, and an answer that costs a personal order.
import { CALENDAR, INCIDENT_RULES, TUNING, incidentDay } from "./definition.js";
import { KESTREL } from "./world.js";
import { surname } from "./officers.js";

const ord = (x) => `${x}${x % 100 >= 11 && x % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][x % 10] ?? "th"}`;
const ENG = TUNING.fatigue.engineers;
const cache = new WeakMap();

// The incident pool, worded for a world. Cached per world object.
export function incidentsFor(W = KESTREL) {
  if (cache.has(W)) return cache.get(W);
  const B = W.stationShort, R = W.rival, M = W.host, MA = W.hostAdj, S = W.harbour, BN = W.reserve;
  const words = {
    radar: {
      title: `${B}’s main radar is failing`,
      text: (c, s, k) => `The main radar on ${B} has a cracked waveguide. Only ${BN}’s engineer company can change it, and the work keeps them from resting: ${ENG} more fatigue for the battalion. Left running, the engineers give it a one in ${k > 1.3 ? "three" : "four"} chance of failing for good before the end of February, and ${B} would fight blind on that side.`,
      options: {
        fix: { name: "Repair it now", says: `${BN}’s engineers do the work: ${ENG} more fatigue for the battalion, on top of this month’s orders. Six days on the spare radar, then it is sound.` },
        run: { name: "Keep it running", says: `No cost now. A real chance it fails before ${R} sails; if it does, ${B} counts one level lower against a landing.` },
      },
      council: (c, s) => ({
        okafor: s.fatigue + ENG > TUNING.fatigue.tired
          ? { prefers: "run", line: `Those engineers are my tiredest soldiers. Twelve more fatigue on them and I am signing sick notes in February. Let the radar take its chances.`, because: `${BN} fit in February`, risk: `${BN} carries another ${ENG} fatigue into February.` }
          : { prefers: "fix", line: "A cracked waveguide does not heal. The engineers have the days to spare now; they may not in February.", because: "keeping equipment working when it matters", risk: `${B} could be blind on the day ${R} sails.` },
        halden: { prefers: "run", line: `Six days on the spare is six days I cannot see what leaves ${S}. That is the week I most need to watch.`, because: `watching ${R} through its build-up`, risk: `six days in which a sailing from ${S} could go unseen.` },
        briggs: { prefers: "fix", line: "I would rather lose six days now than lose the radar in February.", because: `${B} being able to see an attack coming`, risk: "a radar failure at the worst possible moment." },
      }),
      reply: { fix: ["briggs", "Engineers start tonight. Spare radar up by midnight."], run: ["briggs", "Then we run it and watch it. If it goes, it goes on the worst day, and I am a level short."] },
    },
    defector: {
      title: `A ${R} navy officer wants to defect`,
      text: () => `A lieutenant from ${R}’s navy came ashore in a fishing port in ${M} last night and asked for us by name. He says he served on the staff in ${S} and knows what the landing craft are for. ${MA} police are holding him and want an answer by noon.`,
      options: {
        talk: { name: "Question him ourselves", says: `${surname("halden")}’s people question him for a week. We hear what he knows first. ${M}’s police will feel brushed aside.` },
        hand: { name: `Hand him to ${M}`, says: `${M}’s security service questions him and shares what it chooses. The ${MA} cabinet will like being trusted.` },
      },
      council: () => ({
        halden: { prefers: "talk", line: `A staff officer from ${S} is worth more than a month of radio. I want him in my room, not theirs.`, because: `knowing what ${R} really plans`, risk: `whatever he knows reaches us late and filtered, if at all.` },
        sato: { prefers: "hand", line: `He walked into a ${MA} police station. If we take him, the ${MA} ministers will ask what else we take without asking.`, because: `${M}’s trust in us`, risk: `the ${MA} cabinet feels pushed aside a month before it votes.` },
      }),
      reply: { talk: ["halden", "He is in a car to us now. I will tell you what he says, and how far I believe it."], hand: ["sato", "The minister thanks you. She has promised us a summary within the week."] },
    },
    leak: {
      title: `${MA} paper prints our numbers on ${B}`,
      text: () => `A ${MA} newspaper has printed how many troops and guns we have on ${B}, nearly right. ${R}’s embassy has already quoted it. Reporters want us to confirm or deny by tonight.`,
      options: {
        silent: { name: "Say nothing", says: "No comment. The numbers stay a guess, and the story runs without our side. The cabinet loses a little patience." },
        brief: { name: "Brief the press openly", says: `Confirm our strength and explain why: the cabinet hears it from us. ${R} learns where our guns are, so a landing would go where they aren’t: ${B} counts one level lower against a landing than what is built, until the guns it saw move to new positions: guns added by night don’t change what it knows. No order in this campaign moves them, so it lasts the sector.` },
      },
      council: () => ({
        sato: { prefers: "brief", line: `The ministers are reading this over breakfast. Better they hear the numbers from us, with our reasons.`, because: `the ${MA} cabinet hearing our side first`, risk: `the story is told by the paper and ${R}’s embassy.` },
        halden: { prefers: "silent", line: `Right now ${R} has a newspaper’s guess. Confirm it and they have a fact.`, because: `keeping ${R} guessing about ${B}`, risk: `${R} knows where our guns are.` },
        briggs: { prefers: "silent", line: "If they know where the guns are, they land where the guns aren’t. That costs us a level.", because: `${B}’s full defence level against a landing`, risk: `${B} counts one level lower against a landing.` },
      }),
      reply: { silent: ["sato", "No comment, then. I will spend the evening calling ministers."], brief: ["sato", "We brief at six. I will write it so the ministers recognise their own words."] },
    },
    collision: {
      title: "Collision on the shipping lane",
      text: () => `One of our patrol boats collided with a ${R} fishing boat on the shipping lane at 0300. One fisherman has a broken arm. Our crew says the fishing boat had no lights and a navy radio mast. ${R} state television is already calling it an attack on fishermen.`,
      options: {
        return: { name: "Apologise and return the crew", says: `Treat the fisherman and send boat and crew home by morning. ${R} gets its story; the cabinet loses a little patience.` },
        search: { name: "Hold the boat and search it", says: `Board and search before releasing the crew: we learn, for certain, what ${R}’s fishing fleet is for. ${R} calls it piracy, and the cabinet takes it badly.` },
      },
      council: () => ({
        okafor: { prefers: "return", line: "A man with a broken arm on our deck is their picture, not ours. Send him home tonight.", because: "the injured fisherman", risk: `${R} gets a second story: we held an injured man.` },
        halden: { prefers: "search", line: "No lights and a navy mast. Four hours aboard and I can tell you what their fishing fleet is for. Not likely: certain.", because: `certainty about the fishing fleet`, risk: "we hand back the best evidence we will get." },
        sato: { prefers: "return", line: `Every hour we hold them, the ministers hear ${R} call us pirates.`, because: `the ${MA} cabinet’s patience`, risk: "the cabinet sees us escalate on its doorstep." },
      }),
      reply: { return: ["okafor", "Boat and crew home by first light. The fisherman’s arm is set."], search: ["halden", "My people are aboard. Four hours, General."] },
    },
    visit: {
      title: `${M}’s defence minister wants to visit ${B}`,
      text: (c) => {
        const v = CALENDAR.jan.visit, gap = c.voteDay - v;
        return `${M}’s defence minister asks to visit ${B} on ${v} January, ${gap === 1 ? "the day" : `${gap} days`} before the cabinet votes on the ${ord(c.voteDay)}. She is ${c.minister === "dove" ? "the cabinet’s loudest voice for staying out of this" : c.minister === "hawk" ? "the cabinet’s strongest supporter of standing with us" : "undecided, and the cabinet follows her"}. She wants cameras.`;
      },
      options: {
        open: { name: "Host her, with cameras", says: `A public visit: the ${MA} public sees its minister with our troops. ${R} gets the pictures, and with them where our guns are: ${B} counts one level lower against a landing than what is built, until the guns it saw move to new positions: guns added by night don’t change what it knows. No order in this campaign moves them, so it lasts the sector. A personal order: the staff would not expose the station without your say.` },
        quiet: { name: "Host her, no cameras", says: "A private visit. She sees everything; nobody photographs it, and our positions stay ours. Wins her over more if she is wary of us, less if she wanted the cameras." },
      },
      council: (c) => ({
        sato: { prefers: c.minister === "dove" ? "quiet" : "open", line: c.minister === "dove" ? "She is looking for a reason to vote no. Show her everything, privately. No cameras to frown for." : "Let her be photographed with our troops. A minister doesn’t vote against a picture of herself.", because: `the vote on ${c.voteDay} January`, risk: c.minister === "dove" ? "she uses the cameras to look reluctant." : "we waste a minister who wants to be seen with us." },
        briggs: { prefers: "quiet", line: `Cameras on ${B} show ${R} where the guns are. That costs us a level against a landing.`, because: `${B}’s full defence level against a landing`, risk: `${B} counts one level lower against a landing.` },
      }),
      reply: { open: ["sato", `She arrives on the ${ord(CALENDAR.jan.visit)}. I have asked the troops to shave.`], quiet: ["sato", "She has accepted, without enthusiasm. No cameras."] },
    },
  };
  const list = INCIDENT_RULES.map((rule) => {
    const w = words[rule.id];
    return { ...rule, ...w, options: rule.options.map((o) => ({ ...o, ...w.options[o.id] })) };
  });
  const out = { list, byId: (id) => list.find((x) => x.id === id) };
  cache.set(W, out);
  return out;
}

export { incidentDay };
