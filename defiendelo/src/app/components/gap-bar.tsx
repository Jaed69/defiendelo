const ATTENTION_GAP = 25;

/** Submitted (ink) vs explained (blue); what was handed in but not explained is outlined in red pen. */
export function GapBar({ submitted, explained }: { submitted: number; explained: number }) {
  const s = Math.round(submitted * 100);
  const e = Math.round(explained * 100);
  const gap = Math.max(0, s - e);
  return (
    <div className="grid gap-2 text-[0.9375rem]" role="img" aria-label={`Entregó ${s}%, explicó ${e}%`}>
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-graphite">Entregó</span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-subtle">
          <div className="h-full rounded-full bg-inverse" style={{ width: `${s}%` }} />
        </div>
        <span className="label w-11 text-right tabular-nums">{s}%</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-graphite">Explicó</span>
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-subtle">
          <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${e}%` }} />
          {gap > 0 && (
            <div className="absolute inset-y-0 border-2 border-pen bg-danger-subtle" style={{ left: `${e}%`, width: `${gap}%` }} />
          )}
        </div>
        <span className={`label w-11 text-right tabular-nums ${gap >= ATTENTION_GAP ? "text-pen" : ""}`}>{e}%</span>
      </div>
    </div>
  );
}
