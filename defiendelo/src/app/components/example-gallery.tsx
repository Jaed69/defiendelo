"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { EXAMPLES, type Evidence, type ExampleTask, HEADLINE_EVIDENCE, exampleSubjectLabel } from "@/app/examples";
import { SHOWCASE } from "@/app/showcase";
import { type AssignmentSummary, assignmentSummary } from "@/domain/gap";
import type { Assignment } from "@/domain/types";

/** Headline numbers of the preloaded example assignments; examples that fail to load simply show no numbers. */
export function useShowcaseSummaries() {
  const [summaries, setSummaries] = useState<Record<string, AssignmentSummary>>({});
  useEffect(() => {
    let alive = true;
    Promise.all(
      Object.entries(SHOWCASE).map(async ([exampleId, { id, teacherKey }]) => {
        try {
          return [exampleId, assignmentSummary(await api<Assignment>(`/api/assignments/${id}`, { teacherKey }))] as const;
        } catch {
          return null;
        }
      }),
    ).then((rows) => {
      if (alive) setSummaries(Object.fromEntries(rows.filter((r) => r !== null)));
    });
    return () => {
      alive = false;
    };
  }, []);
  return summaries;
}

/** Where "Ver el resultado" lands: the submissions screen, which carries the demo's point. */
export function resultHref({ id, teacherKey }: { id: string; teacherKey: string }) {
  return `/docente/${id}/entregas?k=${teacherKey}`;
}

function mean(values: number[]) {
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function Cite({ evidence }: { evidence: Evidence }) {
  return (
    <a href={evidence.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
      {evidence.source}
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </a>
  );
}

function AiBeforeAfter({ summary }: { summary: AssignmentSummary }) {
  if (summary.aiOriginal === null || summary.aiRedesigned === null) return null;
  return (
    <div className="grid gap-1 rounded-[var(--radius-md)] bg-subtle p-4">
      <span className="label text-graphite">Nota de la IA sola</span>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-3xl font-extrabold tabular-nums text-pen">{Math.round(summary.aiOriginal)}%</span>
        <span className="text-graphite">
          <span aria-hidden="true">→</span>
          <span className="sr-only">antes; después del rediseño,</span>
        </span>
        <span className="font-display text-3xl font-extrabold tabular-nums text-success">{Math.round(summary.aiRedesigned)}%</span>
      </p>
    </div>
  );
}

export function ExampleGallery({
  summaries,
  onUse,
}: {
  summaries: Record<string, AssignmentSummary>;
  onUse: (example: ExampleTask) => void;
}) {
  const measured = Object.values(summaries).filter((s) => s.aiOriginal !== null && s.aiRedesigned !== null);

  return (
    <section id="ejemplos" className="container-page grid gap-8 py-12" aria-labelledby="ejemplos-titulo">
      <div className="grid gap-3">
        <h2 id="ejemplos-titulo">Tareas de ejemplo</h2>
        <p className="prose-measure">
          {HEADLINE_EVIDENCE.text} <span className="text-graphite">Fuente: <Cite evidence={HEADLINE_EVIDENCE} />.</span>
        </p>
        {measured.length > 0 && (
          <p className="prose-measure text-[1.125rem] font-bold">
            En estas {measured.length} tareas, la IA sola sacaba{" "}
            <span className="text-pen">{mean(measured.map((s) => s.aiOriginal!))}%</span> de la nota. Rediseñadas, saca{" "}
            <span className="text-success">{mean(measured.map((s) => s.aiRedesigned!))}%</span>.
          </p>
        )}
      </div>
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {EXAMPLES.map((example) => {
          const ready = SHOWCASE[example.id];
          const summary = summaries[example.id];
          return (
            <li key={example.id} className="card flex flex-col gap-4 p-6">
              <div className="grid gap-1">
                <span className="label text-brand-text">{exampleSubjectLabel(example)}</span>
                <h3>{example.title}</h3>
              </div>
              {summary && <AiBeforeAfter summary={summary} />}
              <div className="mt-auto flex flex-wrap items-center gap-3">
                {ready && (
                  <Link href={resultHref(ready)} className="btn">
                    Ver el resultado
                  </Link>
                )}
                <button type="button" className={ready ? "btn-quiet" : "btn-secondary"} onClick={() => onUse(example)}>
                  Usar esta tarea
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
