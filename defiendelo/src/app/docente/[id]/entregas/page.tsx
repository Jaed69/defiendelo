"use client";

import Link from "next/link";
import { use, useState } from "react";
import { api } from "@/app/api-client";
import { GapBar } from "@/app/components/gap-bar";
import { Waiting } from "@/app/components/waiting";
import { assignmentSummary, triage } from "@/domain/gap";
import { isLive, sessionOf } from "@/domain/session";
import type { Assignment } from "@/domain/types";
import { ReceptionPanel } from "../reception-panel";
import { usePolling } from "../session-tools";
import { TeacherFrame, teacherHref, useTeacherAssignment } from "../teacher-frame";

const ATTEND_FIRST = 5;
const ATTENTION_GAP = 25;

const INSIGHT_STEPS = [
  { after: 0, text: "Leyendo las defensas de la clase…" },
  { after: 10, text: "Agrupando malentendidos parecidos…" },
  { after: 25, text: "Escribiendo una actividad corta para cada uno. Ya casi." },
];

function Kpi({ label, value, note, tone = "" }: { label: string; value: React.ReactNode; note?: string; tone?: string }) {
  return (
    <div className="card grid content-start gap-1 p-5">
      <dt className="label text-graphite">{label}</dt>
      <dd className={`stat-value ${tone}`}>{value}</dd>
      {note && <dd className="text-[0.9375rem] text-graphite">{note}</dd>}
    </div>
  );
}

/** Second teacher screen: what came back from the students and what to do about it. */
export default function TeacherSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assignment, setAssignment, teacherKey, error, setError, load } = useTeacherAssignment(id);
  const [busy, setBusy] = useState<"insights" | "refresh" | null>(null);

  const receiving = Boolean(assignment && isLive(assignment) && sessionOf(assignment).phase === "entregas");
  usePolling(load, 8000, receiving);

  if (!assignment) return <TeacherFrame id={id} teacherKey={teacherKey} assignment={null} section="entregas" error={error} />;

  const live = isLive(assignment);
  const session = sessionOf(assignment);
  const { redesign, submissions, insights } = assignment;
  const ranking = triage(redesign.criteria, submissions);
  const pending = submissions.filter((s) => !s.evaluation).length;
  const { meanGap } = assignmentSummary(assignment);
  const toAttend = ranking.slice(0, ATTEND_FIRST).filter((r) => r.gap >= ATTENTION_GAP).length;
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
      {!live && (
        <p className="rounded-[var(--radius-md)] bg-subtle p-4 text-graphite">
          Cada alumno entrega y defiende por su cuenta. Para poner plazo y controlar cuándo empieza la evaluación,{" "}
          <Link href={`${teacherHref(id, teacherKey, "tarea")}#configurar`} className="font-bold underline underline-offset-4">
            configura la entrega
          </Link>
          .
        </p>
      )}
      {live && session.phase !== "entregas" && (
        <p className="rounded-[var(--radius-md)] bg-subtle p-4 text-graphite">
          La recepción ya cerró.{" "}
          <Link href={teacherHref(id, teacherKey, "evaluacion")} className="font-bold underline underline-offset-4">
            Ir a la evaluación y las notas
          </Link>
          .
        </p>
      )}
      {receiving ? (
        <ReceptionPanel id={id} teacherKey={teacherKey} assignment={assignment} load={load} setError={setError} />
      ) : (
        <>
        <dl className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
          <Kpi label="Alumnos que entregaron" value={ranking.length} note={pending > 0 ? `${pending} respondiendo ahora` : undefined} />
          <Kpi
            label="No supieron explicar"
            value={meanGap === null ? "—" : `${Math.round(meanGap)}%`}
            note={toAttend > 0 ? `${toAttend} alumno(s) para atender primero` : undefined}
            tone={meanGap !== null && meanGap >= ATTENTION_GAP ? "text-pen" : ""}
          />
        </dl>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <section id="atender" className="card grid gap-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2>A quién atender esta semana</h2>
              <button className="btn-quiet" disabled={busy !== null} onClick={() => run("refresh")}>
                {busy === "refresh" ? "Actualizando…" : "Actualizar"}
              </button>
            </div>
            <p className="text-graphite">Brecha: lo que el alumno entregó pero no supo explicar.</p>
            {ranking.length === 0 ? (
              <div className="grid justify-items-start gap-3 rounded-[var(--radius-md)] bg-subtle p-5">
                <p>Todavía nadie entregó.</p>
                <Link href={teacherHref(id, teacherKey, "tarea")} className="btn-secondary">
                  Ver el enlace para compartir
                </Link>
              </div>
            ) : (
              <ol className="grid gap-3">
                {ranking.map((r, i) => {
                  const s = submissions.find((x) => x.id === r.submissionId)!;
                  const attend = i < ATTEND_FIRST && r.gap >= ATTENTION_GAP;
                  return (
                    <li key={r.submissionId} className={`rounded-[var(--radius-md)] border-2 ${attend ? "border-pen bg-danger-subtle/40" : "border-rule"}`}>
                      <details className="group">
                        <summary className="flex min-h-14 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                          <span className="grid size-10 place-items-center rounded-full bg-subtle font-display font-bold" aria-hidden="true">
                            {r.alias.slice(0, 1).toUpperCase()}
                          </span>
                          <span className="font-bold">{r.alias}</span>
                          <span className={`chip ${attend ? "chip-danger" : "chip-success"}`}>{attend ? "Atender primero" : "Explica lo que entregó"}</span>
                          <span className={`ml-auto tabular-nums ${r.gap >= ATTENTION_GAP ? "font-bold text-pen" : "text-graphite"}`}>
                            Brecha {Math.round(r.gap)}%
                          </span>
                        </summary>
                        <div className="grid gap-4 border-t border-rule px-4 py-4 text-[0.9375rem]">
                          <p>{s.evaluation!.summary}</p>
                          {s.evaluation!.perCriterion.map((p) => (
                            <div key={p.criterionId} className="grid gap-2">
                              <span className="font-bold">{criterionName(p.criterionId)}</span>
                              <GapBar submitted={p.submissionScore} explained={p.defenseScore} />
                              {p.misconception && (
                                <p>
                                  <span className="pen-mark">{p.misconception}</span>
                                  <br />
                                  <span className="text-graphite">&ldquo;{p.evidenceQuote}&rdquo;</span>
                                </p>
                              )}
                            </div>
                          ))}
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
              <p className="text-[0.9375rem] text-graphite">Aparece cuando entreguen los alumnos.</p>
            ) : (
              <button type="button" className="btn justify-self-start" disabled={busy !== null} onClick={() => run("insights")}>
                {busy === "insights" ? "Analizando la clase…" : insights ? "Volver a analizar" : "Analizar la clase"}
              </button>
            )}
            {busy === "insights" && <Waiting steps={INSIGHT_STEPS} expected="suele tardar menos de un minuto" />}
            {insights && insights.clusters.length === 0 && <p>No aparecieron malentendidos repetidos.</p>}
            {insights && insights.clusters.length > 0 && (
              <ul className="grid gap-5">
                {insights.clusters.map((c) => (
                  <li key={c.label} className="grid gap-2">
                    <h3 className="text-[1.0625rem]">
                      {c.label} <span className="chip chip-neutral ml-1 align-middle">{c.studentAliases.length} alumno(s)</span>
                    </h3>
                    {c.quotes.map((q) => (
                      <p key={q} className="text-[0.9375rem] italic text-graphite">
                        &ldquo;{q}&rdquo;
                      </p>
                    ))}
                    <p className="rounded-[var(--radius-md)] bg-highlight-subtle p-4 text-[0.9375rem]">
                      <span className="label block">Actividad de 10 minutos</span>
                      {c.suggestion}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        </>
      )}
    </TeacherFrame>
  );
}
