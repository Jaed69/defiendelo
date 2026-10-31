"use client";

import { useEffect, useState } from "react";

export type WaitStep = { after: number; text: string };

/** Progress for long AI calls: staged messages by elapsed seconds; only stage changes are announced. */
export function Waiting({ steps, expected }: { steps: WaitStep[]; expected: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const current = [...steps].reverse().find((s) => elapsed >= s.after) ?? steps[0];
  const done = steps.filter((s) => elapsed >= s.after).length;

  return (
    <div className="waiting mt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-bold" role="status">
          {current.text}
        </p>
        <span className="text-sm tabular-nums text-graphite" aria-hidden="true">
          {elapsed} s ({expected})
        </span>
      </div>
      <ol className="mt-3 flex gap-1.5" aria-hidden="true">
        {steps.map((s, i) => (
          <li key={s.text} className={`h-1.5 flex-1 rounded-full ${i < done ? "bg-ink" : "bg-ink-soft"}`} />
        ))}
      </ol>
    </div>
  );
}
