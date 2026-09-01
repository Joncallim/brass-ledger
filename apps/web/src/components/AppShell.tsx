import { useEffect, useRef, type ReactNode } from "react";
import type { CampaignBrief, CampaignState, StaffFunctionReadout } from "@brass-ledger/shared";
import { HeaderStrip } from "./HeaderStrip";
import { StaffRail } from "./StaffRail";

type Props = {
  children: ReactNode;
  readouts?: StaffFunctionReadout[];
  briefing?: CampaignBrief;
  state?: CampaignState;
  onNavigateHub: () => void;
  onNavigateRecords: () => void;
  showRail?: boolean;
  contentKey?: string;
};

export function AppShell({
  children,
  readouts = [],
  briefing,
  state,
  onNavigateHub,
  onNavigateRecords,
  showRail = true,
  contentKey,
}: Props) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [contentKey]);

  return (
    <div className="flex flex-col h-screen bg-paper text-ink">
      <HeaderStrip
        briefing={briefing}
        state={state}
        onNavigateHub={onNavigateHub}
        onNavigateRecords={onNavigateRecords}
      />
      <div className="flex flex-1 min-h-0">
        {showRail && readouts.length > 0 && <StaffRail readouts={readouts} />}
        <main ref={mainRef} className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
