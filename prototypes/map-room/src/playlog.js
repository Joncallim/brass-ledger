// A playtest log, kept in this browser only. It records what a tester did, not what they
// thought: time on each screen, which order slips they opened, which options they picked
// and took back, the personal orders they spent, and how the campaign ended. Settings shows
// a summary and the raw lines to copy into the playtest sheet (PLAYTEST.md).
const KEY = "brass-ledger:playlog";
const MAX = 2000;

let lines = [];
try { lines = JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { lines = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(lines.slice(-MAX))); } catch { /* kept in memory only */ } };

export function log(kind, detail = {}) {
  lines.push({ t: Date.now(), kind, ...detail });
  if (lines.length > MAX) lines = lines.slice(-MAX);
  save();
}

export function clearLog() {
  lines = [];
  save();
}

export const rawLog = () => lines.map((l) => JSON.stringify(l)).join("\n");

// One row per campaign played: code, minutes, personal orders used, options picked then
// taken back (a sign they were weighed), slips opened, the February choice and the result.
export function summary() {
  const out = [];
  let cur = null;
  for (const l of lines) {
    if (l.kind === "campaign") {
      cur = { code: l.code, difficulty: l.difficulty, start: l.t, end: l.t, opened: 0, picked: 0, undone: 0, seals: { dec: 0, jan: 0 }, heard: 0, route: null, grade: null, screens: {} };
      out.push(cur);
      continue;
    }
    if (!cur) continue;
    cur.end = l.t;
    if (l.kind === "screen") cur.screens[l.chapter] = (cur.screens[l.chapter] ?? 0) + (l.ms ?? 0);
    if (l.kind === "open") cur.opened++;
    if (l.kind === "pick") { cur.picked++; if (l.back) cur.undone++; }
    if (l.kind === "seals") cur.seals[l.month] = l.used;
    if (l.kind === "hear") cur.heard++;
    if (l.kind === "route") cur.route = l.route;
    if (l.kind === "result") Object.assign(cur, { grade: l.grade, code: cur.code, days: l.days, casualties: l.casualties, ministers: l.ministers });
  }
  return out.map((c) => ({ ...c, minutes: Math.round((c.end - c.start) / 6000) / 10 }));
}
