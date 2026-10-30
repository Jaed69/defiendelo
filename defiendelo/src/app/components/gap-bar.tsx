/** Two stacked bars: what was submitted vs what was explained; the difference is marked in red pen. */
export function GapBar({ submitted, explained }: { submitted: number; explained: number }) {
  const s = Math.round(submitted * 100);
  const e = Math.round(explained * 100);
  const gap = Math.max(0, s - e);
  return (
    <div className="grid gap-1 text-sm" aria-label={`Entregó ${s}%, explicó ${e}%`}>
      <div className="flex items-center gap-3">
        <span className="w-20 shrink-0 text-graphite">Entregó</span>
        <div className="h-2.5 flex-1 rounded-full bg-ink-soft">
          <div className="h-full rounded-full bg-ink" style={{ width: `${s}%` }} />
        </div>
        <span className="w-10 text-right tabular-nums">{s}%</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 shrink-0 text-graphite">Explicó</span>
        <div className="relative h-2.5 flex-1 rounded-full bg-ink-soft">
          <div className="absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: `${e}%` }} />
          {gap > 0 && (
            <div
              className="absolute inset-y-0 rounded-r-full border-2 border-pen bg-pen-soft"
              style={{ left: `${e}%`, width: `${gap}%` }}
            />
          )}
        </div>
        <span className={`w-10 text-right tabular-nums ${gap > 0 ? "text-pen font-bold" : ""}`}>{e}%</span>
      </div>
    </div>
  );
}
