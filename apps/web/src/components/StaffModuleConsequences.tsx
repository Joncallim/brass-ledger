import type { StaffModuleReadout } from "@brass-ledger/shared";

export function StaffModuleConsequences({ modules, title = "Optional staff cells" }: { modules: StaffModuleReadout[]; title?: string }) {
  if (modules.length === 0) return null;
  return <section>
    <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">{title}</p>
    <div className="space-y-2">{modules.map((module) => <div key={module.id} className="border border-border px-4 py-3">
      <div className="flex items-center gap-2"><p className="text-sm font-semibold text-ink/70">{module.id} — {module.label}</p><span className="ml-auto text-xs text-ink/40">{module.status} · {module.coordinationLoad.toFixed(2)}</span></div>
      {[...module.benefits, ...module.pressures].map((effect, index) => <p key={`${module.id}:${effect.lane}:${index}`} className="text-xs text-ink/60 mt-1">{effect.summary}</p>)}
    </div>)}</div>
  </section>;
}
