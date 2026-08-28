import { useEffect, useRef } from "react";
import type { ScenarioSummary } from "@brass-ledger/shared";

type Props = { scenario: ScenarioSummary | null; onClose: () => void };

const sharedEntries = [
  ["Burden", "The work your packet asks a staff lane to absorb this month.", "High burden makes follow-through less reliable.", "A green headline does not mean the staff has room."],
  ["Forecast", "A projection of this packet before you commit it.", "Use it to see which staff lane and risk your choices create.", "It is not a recommendation and it does not make a choice for you."],
  ["Accepted risk", "A warning you decide to carry into the order explicitly.", "Accept it only when the gain is worth the named cost.", "Accepting a risk records it; it does not remove the consequence."],
  ["Chief terms and dissent", "A chief can support with conditions, leave a commitment, or record disagreement.", "These shape what the headquarters can credibly carry later.", "Agreement is not required for every sound decision."],
  ["Programme phase", "A capability moves from concept through funding, integration, training, and operational use.", "Sequence the staff time and support it needs to mature.", "Early progress is not the same as usable capability."],
  ["Campaign horizon", "The months available to build a strategy before the campaign closes.", "Use it to decide what can mature in time.", "A long horizon does not make immediate pressure disappear."],
] as const;

export function FieldManual({ scenario, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-ink/55 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="field-manual-title">
      <section className="mx-auto max-w-3xl bg-paper text-ink border border-border shadow-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div><p className="text-xs uppercase tracking-widest text-ink/40">Field manual</p><h2 id="field-manual-title" className="text-xl font-semibold">Command language</h2></div>
          <button ref={closeRef} type="button" onClick={onClose} className="border border-border px-3 py-1 text-sm hover:border-brass">Close</button>
        </div>
        <p className="text-sm text-ink/60 mb-5">Plain-language guidance for the terms that recur in a Brass Ledger campaign. Advanced causal detail remains in each turn’s explainability.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(scenario?.staffFunctions ?? []).map((staff) => (
            <article key={staff.id} className="border border-border p-3 text-sm"><h3 className="font-medium">{staff.shortLabel} — {staff.label}</h3><p className="mt-1 text-ink/60">{staff.doctrineNote}</p><p className="mt-2 text-xs text-ink/45">Watch: {staff.metricLabels.join(", ")}.</p></article>
          ))}
          {sharedEntries.map(([term, what, care, notAssume]) => (
            <article key={term} className="border border-border p-3 text-sm"><h3 className="font-medium">{term}</h3><p className="mt-1 text-ink/60"><span className="text-ink/45">What it is: </span>{what}</p><p className="mt-1 text-ink/60"><span className="text-ink/45">Why care: </span>{care}</p><p className="mt-1 text-ink/60"><span className="text-ink/45">Do not assume: </span>{notAssume}</p></article>
          ))}
        </div>
      </section>
    </div>
  );
}
