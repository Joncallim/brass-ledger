import { useEffect, useRef, type RefObject } from "react";
import type { ScenarioSummary } from "@brass-ledger/shared";

type Props = {
  scenario: ScenarioSummary | null;
  onClose: () => void;
  /** The control that opened the manual. Dialog dismissal must not strand keyboard focus. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

type ManualEntry = {
  term: string;
  what: string;
  care: string;
  changes: string;
  notAssume: string;
};

const sharedEntries: ManualEntry[] = [
  { term: "Burden", what: "The work your packet asks a staff lane to absorb this month.", care: "High burden makes follow-through less reliable.", changes: "Narrow the packet, sequence work, or seek available staff relief.", notAssume: "A green headline does not mean the staff has room." },
  { term: "Strained and overloaded", what: "Words for staff lanes carrying more work than is comfortable or sustainable.", care: "They warn that the visible order may cost readiness, quality, or recovery later.", changes: "Reduce competing demands, phase work, or use a negotiated relief option when one is offered.", notAssume: "They are warnings to weigh, not automatic vetoes or hidden failure states." },
  { term: "Forecast", what: "A projection of this packet before you commit it.", care: "Use it to see which staff lane and risk your choices create.", changes: "It updates when you change the packet, intent, or available relief.", notAssume: "It is not a recommendation and it does not make a choice for you." },
  { term: "Uncertainty and confidence", what: "The degree to which the command picture is supported rather than merely plausible.", care: "A visible posture can be real while the forecast around it remains uncertain.", changes: "Collection, warning work, and time can improve confidence; deception and pressure can weaken it.", notAssume: "Low confidence does not mean nothing is happening, and high confidence is not a guarantee." },
  { term: "Accepted risk", what: "A warning you decide to carry into the order explicitly.", care: "It makes the cost of a strategic gain visible before the order goes forward.", changes: "Revise the packet, seek available relief, or record the warning when the gain is worth carrying it.", notAssume: "Accepting a risk records it; it does not remove the consequence." },
  { term: "Staff relief and negotiation", what: "A specific, available way to move or defer staff work before committing.", care: "It can make a packet more supportable, but it also creates a real trade-off or obligation.", changes: "Only offered relief can be selected; changing the packet can change what is available.", notAssume: "Relief is not free capacity and it does not erase every warning." },
  { term: "Chief terms and dissent", what: "A chief can support with conditions, leave a commitment, or record disagreement.", care: "These shape what the headquarters can credibly carry later.", changes: "Discuss the affected choice, honour the term, or deliberately carry the dissent into the order.", notAssume: "Agreement is not required for every sound decision." },
  { term: "Programme phase", what: "A capability moves from concept through funding, integration, training, and operational use.", care: "Sequence the staff time and support it needs to mature.", changes: "Consistent support and time move a programme forward; competing priorities can delay it.", notAssume: "Early progress is not the same as usable operational capability." },
  { term: "Doctrine risk", what: "A risk that grows when repeated choices make the command's stated approach harder to sustain.", care: "It shows how a series of individually plausible orders can create a strategic bill.", changes: "Change the pattern of choices, strengthen its support, or deliberately accept the accumulating exposure.", notAssume: "A doctrine risk is not a punishment for one option or a hidden formula." },
  { term: "Campaign horizon and outcomes", what: "The months available to build a strategy, plus the conditions that end the campaign in success or collapse.", care: "It tells you which investments can mature in time and which pressures cannot be deferred.", changes: "Each committed month changes the command picture; terminal conditions are shown in the campaign's reports.", notAssume: "A long horizon does not make immediate pressure disappear, and a good month does not guarantee victory." },
];

export function FieldManual({ scenario, onClose, returnFocusRef }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dismiss = () => {
    onClose();
    // Let React remove the focused dialog control before restoring focus.
    queueMicrotask(() => returnFocusRef?.current?.focus());
  };
  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <div className="fixed inset-0 z-50 bg-ink/55 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="field-manual-title">
      <section className="mx-auto max-w-3xl bg-paper text-ink border border-border shadow-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div><p className="text-xs uppercase tracking-widest text-ink/40">Field manual</p><h2 id="field-manual-title" className="text-xl font-semibold">Command language</h2></div>
          <button ref={closeRef} type="button" onClick={dismiss} className="border border-border px-3 py-1 text-sm hover:border-brass">Close</button>
        </div>
        <p className="text-sm text-ink/60 mb-5">Plain-language guidance for the terms that recur in a Brass Ledger campaign. Advanced causal detail remains in each turn’s explainability.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(scenario?.staffFunctions ?? []).map((staff) => (
            <article key={staff.id} className="border border-border p-3 text-sm"><h3 className="font-medium">{staff.shortLabel} — {staff.label}</h3><p className="mt-1 text-ink/60"><span className="text-ink/45">What it is: </span>{staff.doctrineNote}</p><p className="mt-1 text-ink/60"><span className="text-ink/45">Why care: </span>This function helps make the commander's packet executable rather than merely visible.</p><p className="mt-1 text-ink/60"><span className="text-ink/45">What changes it: </span>The choices that place work in its lane, and any available relief or sequencing.</p><p className="mt-1 text-ink/60"><span className="text-ink/45">Do not assume: </span>A strong reading here guarantees the other staff functions can support the packet.</p><p className="mt-2 text-xs text-ink/45">Watch: {staff.metricLabels.join(", ")}.</p></article>
          ))}
          {sharedEntries.map((entry) => (
            <article key={entry.term} className="border border-border p-3 text-sm"><h3 className="font-medium">{entry.term}</h3><p className="mt-1 text-ink/60"><span className="text-ink/45">What it is: </span>{entry.what}</p><p className="mt-1 text-ink/60"><span className="text-ink/45">Why care: </span>{entry.care}</p><p className="mt-1 text-ink/60"><span className="text-ink/45">What changes it: </span>{entry.changes}</p><p className="mt-1 text-ink/60"><span className="text-ink/45">Do not assume: </span>{entry.notAssume}</p></article>
          ))}
        </div>
      </section>
    </div>
  );
}
