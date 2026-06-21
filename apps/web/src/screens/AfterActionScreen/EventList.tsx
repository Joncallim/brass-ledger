import type { EventDefinition } from "@brass-ledger/shared";

type Props = {
  events: EventDefinition[];
};

export function EventList({ events }: Props) {
  return (
    <section>
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Events triggered</p>
      {events.length === 0 ? (
        <p className="text-sm text-ink/40">No events this month.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="border border-yellow-800/60 bg-yellow-950/40 px-4 py-3">
              <p className="text-sm font-semibold text-yellow-300 mb-1">{event.title}</p>
              <p className="text-xs text-yellow-300 leading-relaxed">{event.summary}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
