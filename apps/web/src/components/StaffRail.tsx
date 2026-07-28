import { useState } from "react";
import type { StaffFunctionReadout } from "@brass-ledger/shared";
import { StaffFunctionBadge } from "./StaffFunctionBadge";
import { StaffFunctionDetail } from "./StaffFunctionDetail";

type Props = {
  readouts: StaffFunctionReadout[];
};

export function StaffRail({ readouts }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeReadout = readouts.find((r) => r.id === activeId) ?? null;

  function toggle(id: string) {
    setActiveId((prev) => (prev === id ? null : id));
  }

  return (
    <aside className="w-48 shrink-0 border-r border-border flex flex-col bg-paper/40">
      <div className="px-3 pt-3 pb-2 border-b border-border/60">
        <p className="text-xs uppercase tracking-widest text-ink/40">Your staff</p>
        <p className="text-xs text-ink/30 mt-0.5 leading-snug">Select one for detail</p>
      </div>

      <div className="flex-1 flex flex-col gap-px p-2">
        {readouts.map((readout) => (
          <StaffFunctionBadge
            key={readout.id}
            readout={readout}
            active={activeId === readout.id}
            onClick={() => toggle(readout.id)}
          />
        ))}
      </div>

      {activeReadout && (
        <div className="border-t border-border">
          <StaffFunctionDetail readout={activeReadout} onClose={() => setActiveId(null)} />
        </div>
      )}
    </aside>
  );
}
