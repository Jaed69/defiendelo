"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { EXAMPLES, EXAMPLE_SUBJECTS, type Evidence, type ExampleTask, HEADLINE_EVIDENCE, exampleSubjectLabel } from "@/app/examples";
import { SHOWCASE } from "@/app/showcase";
import { type AssignmentSummary, assignmentSummary } from "@/domain/gap";
import type { Assignment } from "@/domain/types";

/** Headline numbers of the preloaded example assignments; examples that fail to load simply show no numbers. */
function useShowcaseSummaries() {
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
    <div className="grid gap-2 rounded-[var(--radius-md)] bg-subtle p-4">
      <span className="label text-graphite">Nota que saca la IA sola</span>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-3xl font-extrabold tabular-nums text-pen">{summary.aiOriginal}%</span>
        <span className="text-graphite">
          <span aria-hidden="true">→</span>
          <span className="sr-only">antes; después del rediseño,</span>
        </span>
        <span className="font-display text-3xl font-extrabold tabular-nums text-success">{summary.aiRedesigned}%</span>
      </p>
      {summary.defenses > 0 && (
        <span className="text-[0.9375rem] text-graphite">
          {summary.defenses} defensas de alumnos{summary.meanGap !== null && ` · brecha promedio ${summary.meanGap}%`}
        </span>
      )}
    </div>
  );
}

export function ExampleGallery({ onUse }: { onUse: (example: ExampleTask) => void }) {
  const [filter, setFilter] = useState<string | null>(null);
  const summaries = useShowcaseSummaries();
  const shown = filter ? EXAMPLES.filter((e) => e.subject === filter) : EXAMPLES;
  const measured = Object.values(summaries).filter((s) => s.aiOriginal !== null && s.aiRedesigned !== null);

  return (
    <section id="ejemplos" className="container-page grid gap-8 py-12" aria-labelledby="ejemplos-titulo">
      <div className="grid gap-3">
        <h2 id="ejemplos-titulo">Ejemplos por curso</h2>
        <p className="prose-measure text-graphite">
          Tareas que hoy se dejan en secundaria. En cada una ves qué parte entrega una IA sola y qué tendría que explicar el alumno en su
          defensa. Elige una para probar Defiéndelo o úsala como modelo para la tuya.
        </p>
        <p className="prose-measure font-bold">
          {HEADLINE_EVIDENCE.text} <span className="font-normal text-graphite">Fuente: <Cite evidence={HEADLINE_EVIDENCE} />.</span>
        </p>
        {measured.length > 0 && (
          <p className="prose-measure rounded-[var(--radius-md)] border-l-4 border-brand bg-brand-subtle p-4">
            En estos {measured.length} ejemplos, la IA sola sacaba en promedio{" "}
            <strong className="text-pen">{mean(measured.map((s) => s.aiOriginal!))}%</strong> de la nota. Con la tarea rediseñada saca{" "}
            <strong className="text-success">{mean(measured.map((s) => s.aiRedesigned!))}%</strong>: el resto se gana defendiendo el
            propio trabajo.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar ejemplos por curso">
        <button type="button" className="filter" aria-pressed={filter === null} onClick={() => setFilter(null)}>
          Todos los cursos
        </button>
        {EXAMPLE_SUBJECTS.map((subject) => (
          <button key={subject} type="button" className="filter" aria-pressed={filter === subject} onClick={() => setFilter(subject)}>
            {subject}
          </button>
        ))}
      </div>
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((example) => {
          const ready = SHOWCASE[example.id];
          const summary = summaries[example.id];
          return (
            <li key={example.id} className="card flex flex-col gap-4 p-6">
              <div className="grid gap-1">
                <span className="label text-brand-text">{exampleSubjectLabel(example)}</span>
                <h3>{example.title}</h3>
                <span className="text-[0.9375rem] text-graphite">Tema: {example.topic}</span>
              </div>
              {summary && <AiBeforeAfter summary={summary} />}
              <p className="text-[0.9375rem]">{example.original}</p>
              <div className="grid gap-3 text-[0.9375rem]">
                <p className="rounded-[var(--radius-md)] border-l-4 border-pen bg-danger-subtle p-4">
                  <span className="label block text-pen">Hoy la IA lo entrega sola</span>
                  {example.aiAlone}
                </p>
                <p className="rounded-[var(--radius-md)] border-l-4 border-brand bg-brand-subtle p-4">
                  <span className="label block text-brand-text">Con Defiéndelo, el alumno explica</span>
                  {example.defense}
                </p>
              </div>
              {example.evidence && (
                <p className="text-[0.875rem] text-graphite">
                  {example.evidence.text} Fuente: <Cite evidence={example.evidence} />.
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-3">
                {ready && (
                  <Link href={`/docente/${ready.id}?k=${ready.teacherKey}`} className="btn">
                    Ver el resultado ya listo
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
