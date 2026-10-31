"use client";

import Link from "next/link";
import { use, useState } from "react";
import { api } from "@/app/api-client";
import { classSummary } from "@/app/class-summary";
import { Waiting } from "@/app/components/waiting";
import { triage } from "@/domain/gap";
import type { Assignment } from "@/domain/types";
import { TeacherFrame, teacherHref, useTeacherAssignment } from "../teacher-frame";

const ATTEND_FIRST = 5;
const ATTENTION_GAP = 25;

const INSIGHT_STEPS = [
  { after: 0, text: "Leyendo las defensas de la clase…" },
  { after: 10, text: "Agrupando malentendidos parecidos…" },
  { after: 25, text: "Escribiendo una actividad corta para cada uno. Ya casi." },
];

/** Second teacher screen: who handed in, who needs help and with what, and what to go over in class. */
export default function TeacherSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assignment, setAssignment, teacherKey, error, setError, load } = useTeacherAssignment(id);
  const [busy, setBusy] = useState<"insights" | "refresh" | null>(null);

  if (!assignment) return <TeacherFrame id={id} teacherKey={teacherKey} assignment={null} section="entregas" error={error} />;

  const { redesign, submissions, insights } = assignment;
  const ranking = triage(redesign.criteria, submissions);
  const needsHelp = (i: number) => i < ATTEND_FIRST && ranking[i].gap >= ATTENTION_GAP;
  const summary = classSummary({
    handedIn: ranking.length,
    needHelp: ranking.filter((_, i) => needsHelp(i)).map((r) => r.alias),
    answering: submissions.filter((s) => !s.evaluation).length,
  });
  const criterionName = (cid: string) => redesign.criteria.find((c) => c.id === cid)?.name ?? cid;

  async function run(kind: "insights" | "refresh") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "refresh") await load();
      else setAssignment(await api<Assignment>(`/api/assignments/${id}/insights`, { method: "POST", teacherKey }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <TeacherFrame id={id} teacherKey={teacherKey} assignment={assignment} section="entregas" error={error}>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <p className="text-[1.25rem] font-bold" role="status">
          {summary}
        </p>
        <button className="btn-quiet" disabled={busy !== null} onClick={() => run("refresh")}>
          {busy === "refresh" ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section id="atender" className="card grid gap-4 p-6 sm:p-8">
          <h2>Tus alumnos</h2>
          {ranking.length === 0 ? (
            <Link href={teacherHref(id, teacherKey, "tarea")} className="btn-secondary justify-self-start">
              Ver el enlace para compartir
            </Link>
          ) : (
            <ol className="grid gap-3">
              {ranking.map((r, i) => {
                const evaluation = submissions.find((x) => x.id === r.submissionId)!.evaluation!;
                const gaps = evaluation.perCriterion.filter((p) => p.misconception);
                const help = needsHelp(i);
                return (
                  <li key={r.submissionId} className={`rounded-[var(--radius-md)] border-2 ${help ? "border-pen" : "border-rule"}`}>
                    <details>
                      <summary className="flex min-h-14 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                        <span className="text-[1.0625rem] font-bold">{r.alias}</span>
                        {help && <span className="chip chip-danger">Necesita ayuda</span>}
                      </summary>
                      <div className="grid gap-3 border-t border-rule px-4 py-4">
                        {gaps.length === 0 ? (
                          <p>Explicó bien lo que entregó.</p>
                        ) : (
                          <>
                            <p className="label text-pen">No supo explicar</p>
                            <ul className="grid gap-3">
                              {gaps.map((p) => (
                                <li key={p.criterionId} className="grid gap-1">
                                  <span className="font-bold">{criterionName(p.criterionId)}</span>
                                  <span>{p.misconception}</span>
                                  {p.evidenceQuote && <span className="italic text-graphite">&ldquo;{p.evidenceQuote}&rdquo;</span>}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </details>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="card grid gap-4 p-6">
          <h2 className="text-[1.375rem]">Qué repasar en clase</h2>
          {ranking.length === 0 ? (
            <p className="text-graphite">Aparece cuando entreguen los alumnos.</p>
          ) : (
            <button type="button" className="btn justify-self-start" disabled={busy !== null} onClick={() => run("insights")}>
              {busy === "insights" ? "Analizando la clase…" : insights ? "Volver a analizar" : "Analizar la clase"}
            </button>
          )}
          {busy === "insights" && <Waiting steps={INSIGHT_STEPS} expected="suele tardar menos de un minuto" />}
          {insights && insights.clusters.length === 0 && <p>No aparecieron errores repetidos.</p>}
          {insights && insights.clusters.length > 0 && (
            <ul className="grid gap-6">
              {insights.clusters.map((c) => (
                <li key={c.label} className="grid gap-2">
                  <h3 className="text-[1.0625rem]">
                    {c.label} <span className="font-normal text-graphite">({c.studentAliases.length === 1 ? "1 alumno" : `${c.studentAliases.length} alumnos`})</span>
                  </h3>
                  {c.quotes[0] && <p className="italic text-graphite">&ldquo;{c.quotes[0]}&rdquo;</p>}
                  <details className="rounded-[var(--radius-md)] bg-highlight-subtle">
                    <summary className="cursor-pointer px-4 py-3 font-bold">Ver actividad de 10 minutos</summary>
                    <p className="px-4 pb-4">{c.suggestion}</p>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </TeacherFrame>
  );
}
