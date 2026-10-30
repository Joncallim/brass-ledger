// Names and terms you can ask about. Every proper noun and piece of jargon in the story is
// wrapped in a highlighted span that opens a short profile on hover or keyboard focus.
// Officers are already wrapped by fullName()/surname(); this finds everything else.
import { glossaryFor, officersFor } from "./fixture.js";
import { onWorld } from "./story/world.js";

// The highlighter works on the page, so it follows the world on the table (the campaign's).
let GLOSSARY, OFFICERS;
const portrait = (id) => `./portraits/${OFFICERS[id].portrait}.jpg`;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// One regex for every alias, longest first, so "Beacon Station" wins over "Beacon" and
// "landing craft" over "landing". Proper nouns match case-sensitively; jargon does not.
// Rebuilt when the theatre changes, since the names change with it.
let byText, pattern;
// Jargon may open a sentence, so its first letter matches either case.
const loose = (t) => `[${t[0].toUpperCase()}${t[0].toLowerCase()}]${esc(t.slice(1))}`;
onWorld((W) => {
  const world = { ...W }; // a snapshot: the shared world object changes in place
  GLOSSARY = glossaryFor(world); OFFICERS = officersFor(world);
  const aliases = Object.entries(GLOSSARY)
    .flatMap(([id, g]) => g.match.map((text) => ({ id, text, kind: g.kind })))
    .sort((a, b) => b.text.length - a.text.length);
  byText = new Map(aliases.map((a) => [a.kind === "name" ? a.text : a.text.toLowerCase(), a]));
  pattern = new RegExp(`(?<![\\w-])(${aliases.map((a) => (a.kind === "name" ? esc(a.text) : loose(a.text))).join("|")})(?![\\w-])`, "g");
});
const lookup = (m) => byText.get(m) ?? byText.get(m.toLowerCase());

// Text inside these is left alone: controls, existing marks, and chrome.
const SKIP = "button, a, h1, .officer, .term, .hud, .chip, .stance, .cost, .hint, [data-noterm]";

// Wraps glossary words in every text node under `root`. Names are marked every time;
// jargon only on its first use in each block, so a paragraph is not a field of underlines.
// Safe to call twice.
export function glossNode(root) {
  const seen = new Set(root.querySelectorAll ? [...root.querySelectorAll(".term")].map((e) => e.dataset.term) : []);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue.trim() && !n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const text = node.nodeValue;
    pattern.lastIndex = 0;
    if (!pattern.test(text)) continue;
    pattern.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(pattern)) {
      const a = lookup(m[0]);
      if (!a || (a.kind === "term" && seen.has(a.id))) continue;
      seen.add(a.id);
      frag.append(text.slice(last, m.index));
      const span = document.createElement("span");
      span.className = `term ${a.kind}`;
      span.dataset.term = a.id;
      span.tabIndex = 0;
      span.textContent = m[0];
      frag.append(span);
      last = m.index + m[0].length;
    }
    frag.append(text.slice(last));
    node.replaceWith(frag);
  }
}

// The profile card for a term id ("sarn") or an officer ("officer:halden").
export function profileHTML(key) {
  if (key.startsWith("officer:")) {
    const id = key.slice(8), o = OFFICERS[id];
    if (!o) return "";
    return `<div class="profile officer-card"><div class="pf-face" style="background-image:url(${portrait(id)})"></div>
      <div><p class="pf-tag">${o.post}${o.from ? ` · ${o.from}` : ""}</p><p class="pf-title"><span class="rank">${o.rank}</span> ${o.name}</p>
      <p class="pf-body">${o.role ?? ""}</p></div></div>`;
  }
  const g = GLOSSARY[key];
  if (!g) return "";
  return `<div class="profile"><p class="pf-tag">${g.tag}</p><p class="pf-title">${g.title}</p><p class="pf-body">${g.body}</p></div>`;
}

export const hasTerm = (key) => Boolean(key && (GLOSSARY[key] || (key.startsWith("officer:") && OFFICERS[key.slice(8)])));
