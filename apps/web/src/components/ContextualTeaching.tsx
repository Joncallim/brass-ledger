import { useEffect, useState, type ReactNode } from "react";

type Props = { concept: string; title: string; children: ReactNode };
const storageKey = "brass-ledger.guidance";
type GuidanceState = { hidden?: boolean; seen?: string[] };

function readGuidance(): GuidanceState {
  try { return JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as GuidanceState; } catch { return {}; }
}
function writeGuidance(state: GuidanceState) {
  try { window.localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Preferences remain optional. */ }
}

/** First-use presentation help only; it never enters session, save, or replay state. */
export function ContextualTeaching({ concept, title, children }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const guidance = readGuidance();
    setVisible(!guidance.hidden && !guidance.seen?.includes(concept));
  }, [concept]);
  if (!visible) return null;
  function dismiss(all = false) {
    const guidance = readGuidance();
    writeGuidance(all ? { ...guidance, hidden: true } : { ...guidance, seen: [...new Set([...(guidance.seen ?? []), concept])] });
    setVisible(false);
  }
  return <aside className="mb-4 border border-brass/60 bg-brass/10 px-3 py-3 text-xs text-ink" aria-label={`First-use guidance: ${title}`}>
    <p className="font-semibold text-ink">First time here — {title}</p>
    <div className="mt-1 leading-relaxed text-ink/70">{children}</div>
    <div className="mt-2 flex flex-wrap gap-2">
      <button type="button" onClick={() => dismiss()} className="border border-border bg-paper px-2 py-1 text-ink/70 hover:border-brass">Got it</button>
      <button type="button" onClick={() => dismiss(true)} className="px-2 py-1 text-ink/50 hover:text-ink">Hide guided teaching</button>
    </div>
  </aside>;
}
