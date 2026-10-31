"use client";

import { useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { AppBar, Logo } from "@/app/components/brand";
import { AssignmentSheet, PrintSheetButton } from "@/app/components/assignment-sheet";
import { GapBar } from "@/app/components/gap-bar";
import { Waiting } from "@/app/components/waiting";
import { assignmentSummary, givenAwayCriteria, triage } from "@/domain/gap";
import type { Assignment } from "@/domain/types";

const ATTEND_FIRST = 5;
const ATTENTION_GAP = 25;

const STRESS_STEPS = [
  { after: 0, text: "La IA está leyendo la tarea original…" },
  { after: 20, text: "Resolviendo la tarea original sin ningún alumno detrás…" },
  { after: 45, text: "Ahora resuelve la versión rediseñada…" },
  { after: 75, text: "Corrigiendo las dos versiones con sus rúbricas…" },
  { after: 105, text: "Sumando cuánta nota sacó en cada una. Ya casi." },
];

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

export default function TeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const teacherKey = useSearchParams().get("k") ?? "";
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [busy, setBusy] = useState<"stress" | "insights" | "refresh" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setAssignment(await api<Assignment>(`/api/assignments/${id}`, { teacherKey }));
  }, [id, teacherKey]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function run(kind: "stress" | "insights" | "refresh") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "refresh") await load();
      else setAssignment(await api<Assignment>(`/api/assignments/${id}/${kind}`, { method: "POST", teacherKey }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (!assignment) {
    return (
      <>
        <AppBar>
          <Logo />
        </AppBar>
        <main id="contenido" tabIndex={-1} className="container-page py-12 outline-none">
          {error ? (
            <p role="alert" className="font-bold text-pen">
              {error}
            </p>
          ) : (
            <p className="text-graphite">Cargando tu tarea…</p>
          )}
        </main>
      </>
    );
  }

  const { redesign, stress, submissions, insights } = assignment;
  const studentLink = typeof window === "undefined" ? "" : `${window.location.origin}/alumno/${id}`;
  const ranking = triage(redesign.criteria, submissions);
  const pending = submissions.filter((s) => !s.evaluation).length;
  const { aiOriginal, aiRedesigned, meanGap } = assignmentSummary(assignment);
  const toAttend = ranking.slice(0, ATTEND_FIRST).filter((r) => r.gap >= ATTENTION_GAP).length;
  const criterionName = (cid: string) => redesign.criteria.find((c) => c.id === cid)?.name ?? cid;
  const given = stress ? givenAwayCriteria(redesign.criteria, stress.redesigned.scores) : [];

  function copyLink() {
    void navigator.clipboard.writeText(studentLink);
    setCopied(true);
  }

  return (
    <>
      <AppBar>
        <Logo />
        <button type="button" className="btn" onClick={copyLink}>
          {copied ? "Enlace copiado" : "Copiar enlace para alumnos"}
        </button>
      </AppBar>
      <span className="sr-only" role="status">
        {copied ? "Enlace copiado al portapapeles." : ""}
      </span>

      <main id="contenido" tabIndex={-1} className="container-page grid gap-10 py-10 outline-none">
        <section className="grid gap-6">
          <div className="grid gap-2">
            <span className="text-graphite">{assignment.subject}</span>
            <h1 className="max-w-[24ch] text-[clamp(2rem,4vw,3rem)]">{assignment.title}</h1>
            <p className="text-[0.9375rem] text-graphite">Guarda esta página: es solo para ti. A tus alumnos mándales el enlace.</p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label="Nota de la IA sola, tarea de siempre"
              value={aiOriginal === null ? "—" : `${Math.round(aiOriginal)}%`}
              tone={stress ? "text-pen" : "text-graphite"}
            />
            <Kpi
              label="Nota de la IA sola, tarea rediseñada"
              value={aiRedesigned === null ? "—" : `${Math.round(aiRedesigned)}%`}
              tone={stress ? "text-success" : "text-graphite"}
            />
            <Kpi label="Alumnos que entregaron" value={ranking.length} note={pending > 0 ? `${pending} respondiendo ahora` : undefined} />
            <Kpi
              label="No supieron explicar"
              value={meanGap === null ? "—" : `${Math.round(meanGap)}%`}
              note={toAttend > 0 ? `${toAttend} alumno(s) para atender primero` : undefined}
              tone={meanGap !== null && meanGap >= ATTENTION_GAP ? "text-pen" : ""}
            />
          </dl>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid gap-8">
            <section id="atender" className="card grid gap-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2>A quién atender esta semana</h2>
                <button className="btn-quiet" disabled={busy !== null} onClick={() => run("refresh")}>
                  {busy === "refresh" ? "Actualizando…" : "Actualizar"}
                </button>
              </div>
              <p className="text-graphite">Brecha: lo que el alumno entregó pero no supo explicar.</p>
              {ranking.length === 0 ? (
                <p className="rounded-[var(--radius-md)] bg-subtle p-5">
                  Todavía nadie entregó. Comparte el enlace.
                </p>
              ) : (
                <ol className="grid gap-3">
                  {ranking.map((r, i) => {
                    const s = submissions.find((x) => x.id === r.submissionId)!;
                    const attend = i < ATTEND_FIRST && r.gap >= ATTENTION_GAP;
                    return (
                      <li
                        key={r.submissionId}
                        className={`rounded-[var(--radius-md)] border-2 ${attend ? "border-pen bg-danger-subtle/40" : "border-rule"}`}
                      >
                        <details className="group">
                          <summary className="flex min-h-14 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                            <span
                              className="grid size-10 place-items-center rounded-full bg-subtle font-display font-bold"
                              aria-hidden="true"
                            >
                              {r.alias.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="font-bold">{r.alias}</span>
                            <span className={`chip ${attend ? "chip-danger" : "chip-success"}`}>
                              {attend ? "Atender primero" : "Explica lo que entregó"}
                            </span>
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

            <section id="prueba" className="card grid gap-5 p-6 sm:p-8">
              <h2>¿Cuánta nota saca la IA sola?</h2>
              {!stress && (
                <div>
                  <button className="btn" disabled={busy !== null} onClick={() => run("stress")}>
                    {busy === "stress" ? "La IA está resolviendo las dos versiones…" : "Probar la tarea con la IA sola"}
                  </button>
                </div>
              )}
              {busy === "stress" && (
                <Waiting steps={STRESS_STEPS} expected="suele tardar unos 2 minutos; puedes compartir el enlace mientras" />
              )}
              {stress && (
                <>
                  {given.length > 0 ? (
                    <p>
                      La IA todavía resuelve sola:{" "}
                      {given.map((c, i) => (
                        <span key={c.id}>
                          {i > 0 && ", "}
                          <span className="pen-mark">{c.name}</span>
                        </span>
                      ))}
                      .
                    </p>
                  ) : (
                    <p>La IA sola ya no aprueba ningún criterio escrito.</p>
                  )}
                  <details>
                    <summary className="btn-quiet cursor-pointer">Ver lo que entregó la IA</summary>
                    <pre className="prose-measure mt-3 whitespace-pre-wrap rounded-[var(--radius-md)] bg-subtle p-4 font-mono text-sm text-graphite">
                      {stress.redesigned.aiAnswer}
                    </pre>
                  </details>
                </>
              )}
            </section>

            <section id="rediseno" className="card grid gap-5 p-4 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2>Tarea rediseñada</h2>
                <PrintSheetButton sheetId="hoja-tarea" />
              </div>
              <AssignmentSheet
                id="hoja-tarea"
                title={assignment.title}
                subject={assignment.subject}
                statement={redesign.statement}
                aiPolicy={redesign.aiPolicy}
                criteria={redesign.criteria}
              />
            </section>
          </div>

          <aside className="grid gap-8" aria-label="Acciones de la clase">
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
                        {c.label}{" "}
                        <span className="chip chip-neutral ml-1 align-middle">{c.studentAliases.length} alumno(s)</span>
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

            <section id="enlace" className="card grid gap-4 p-6">
              <h2 className="text-[1.375rem]">Enlace para tus alumnos</h2>
              <code className="break-all rounded-[var(--radius-md)] bg-subtle px-3 py-2 font-mono text-sm">{studentLink}</code>
              <button type="button" className="btn-secondary justify-self-start" onClick={copyLink}>
                {copied ? "Enlace copiado" : "Copiar enlace"}
              </button>
            </section>
          </aside>
        </div>

        {error && (
          <p role="alert" className="sticky bottom-4 rounded-[var(--radius-md)] border-2 border-pen bg-surface p-4 font-bold text-pen">
            {error}
          </p>
        )}
      </main>
    </>
  );
}
