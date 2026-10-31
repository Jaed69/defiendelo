"use client";

import Link from "next/link";
import { use, useState } from "react";
import { GapBar } from "@/app/components/gap-bar";
import { studentGap } from "@/domain/gap";
import { isLive, questionsFor, sessionOf, studentStatus, type StudentStatus } from "@/domain/session";
import type { Assignment, ClassSession, Submission } from "@/domain/types";
import { methodLabel } from "../session-config";
import { gradeSession, patchSession, useAction, usePolling } from "../session-tools";
import { TeacherFrame, teacherHref, useTeacherAssignment } from "../teacher-frame";

const STATUS_LABEL: Record<StudentStatus, string> = {
  entregado: "Entregó",
  en_cola: "En cola",
  turno: "En su turno",
  responder: "Respondiendo en el celular",
  papel: "Examen en papel",
  evaluado: "Evaluado",
  publicado: "Nota publicada",
};

/** Students in presentation order; anyone missing from the queue goes last, by arrival. */
function orderedSubmissions(assignment: Assignment, session: ClassSession): Submission[] {
  const byId = new Map(assignment.submissions.map((s) => [s.id, s]));
  const queued = session.queue.map((id) => byId.get(id)).filter((s): s is Submission => Boolean(s));
  const queuedIds = new Set(queued.map((s) => s.id));
  const rest = assignment.submissions.filter((s) => !queuedIds.has(s.id)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return [...queued, ...rest];
}

function ScoreField({
  label,
  value,
  max,
  disabled,
  onSave,
}: {
  label: string;
  value: number | null | undefined;
  max: number;
  disabled: boolean;
  onSave: (score: number) => void;
}) {
  const saved = value == null ? "" : String(value);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? saved;
  const parsed = shown.trim() === "" ? NaN : Number(shown);
  const valid = Number.isFinite(parsed) && parsed >= 0 && parsed <= max;
  const dirty = draft !== null && draft !== saved;
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="grid w-36 gap-1">
        <span className="label text-graphite">{label}</span>
        <input type="number" min={0} max={max} step={0.5} inputMode="decimal" value={shown} onChange={(e) => setDraft(e.target.value)} />
      </label>
      <span className="pb-3 text-graphite">de {max}</span>
      <button
        type="button"
        className="btn-secondary"
        disabled={disabled || !valid || !dirty}
        onClick={() => {
          onSave(parsed);
          setDraft(null);
        }}
      >
        Guardar
      </button>
    </div>
  );
}

function GradeChip({ grade, session }: { grade: number | null | undefined; session: ClassSession }) {
  if (grade == null) return <span className="chip chip-neutral">Sin nota</span>;
  return (
    <span className={`chip ${grade >= session.passingGrade ? "chip-success" : "chip-danger"}`}>
      Nota {grade} / {session.gradeScale}
    </span>
  );
}

/** Third teacher screen: run the defenses, score each student and publish the grades. */
export default function TeacherEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assignment, teacherKey, error, setError, load } = useTeacherAssignment(id);
  const { busy, run } = useAction(load, setError);
  const evaluating = Boolean(assignment && isLive(assignment) && sessionOf(assignment).phase !== "entregas");
  usePolling(load, 6000, evaluating);

  if (!assignment) return <TeacherFrame id={id} teacherKey={teacherKey} assignment={null} section="evaluacion" error={error} />;

  const frame = (children: React.ReactNode) => (
    <TeacherFrame id={id} teacherKey={teacherKey} assignment={assignment} section="evaluacion" error={error}>
      {children}
    </TeacherFrame>
  );

  if (!isLive(assignment)) {
    return frame(
      <section className="card grid justify-items-start gap-3 p-6">
        <h2 className="text-[1.375rem]">Primero inicia la recepción de entregas</h2>
        <p className="text-graphite">La evaluación empieza cuando configuras la entrega y la recibes.</p>
        <Link href={`${teacherHref(id, teacherKey, "tarea")}#configurar`} className="btn">
          Configurar la entrega
        </Link>
      </section>,
    );
  }

  const session = sessionOf(assignment);
  if (session.phase === "entregas") {
    return frame(
      <section className="card grid justify-items-start gap-3 p-6">
        <h2 className="text-[1.375rem]">Todavía estás recibiendo entregas</h2>
        <p className="text-graphite">Cuando cierres la recepción con «Iniciar evaluación», vienes a esta pantalla.</p>
        <Link href={teacherHref(id, teacherKey, "entregas")} className="btn">
          Ir a las entregas
        </Link>
      </section>,
    );
  }

  const published = session.phase === "publicado";
  const subs = orderedSubmissions(assignment, session);
  const graded = subs.filter((s) => s.grade != null).length;
  const answered = subs.filter((s) => s.answeredAt).length;
  const current = subs.find((s) => s.id === session.current) ?? null;
  const currentQuestions = current ? questionsFor(session, current) : [];
  const currentQuestion = currentQuestions[session.currentQuestion];
  const firstPending = subs.find((s) => s.grade == null) ?? null;
  const criterionName = (cid: string) => assignment.redesign.criteria.find((c) => c.id === cid)?.name ?? cid;

  const score = (submissionId: string, value: number, questionId?: string) =>
    run(() => gradeSession(id, teacherKey, { submissionId, questionId, score: value }));

  function move(submissionId: string, delta: -1 | 1) {
    const order = subs.map((s) => s.id);
    const from = order.indexOf(submissionId);
    const to = from + delta;
    if (to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    void run(() => patchSession(id, teacherKey, { queue: order }));
  }

  function publish() {
    const missing = subs.length - graded;
    if (missing > 0 && !window.confirm(`${missing} alumno(s) todavía no tienen nota. ¿Publicar igual?`)) return;
    void run(() => patchSession(id, teacherKey, { phase: "publicado" }));
  }

  return frame(
    <>
      <section className="card grid gap-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2>{methodLabel(session.method)}</h2>
          <span className={`chip ${published ? "chip-success" : "chip-brand"}`}>{published ? "Notas publicadas" : "Evaluando"}</span>
        </div>
        <p className="text-graphite">
          {graded} de {subs.length} alumnos con nota
          {session.method === "escrito" && ` · ${answered} ya respondieron en el celular`}.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {published ? (
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => void run(() => patchSession(id, teacherKey, { phase: "defensas" }))}>
              Quitar la publicación
            </button>
          ) : (
            <button type="button" className="btn" disabled={busy || subs.length === 0} onClick={publish}>
              Publicar notas
            </button>
          )}
          <span className="text-[0.9375rem] text-graphite">
            {published ? "Cada alumno ya puede ver su nota en su pantalla." : "Los alumnos ven su nota solo cuando la publicas."}
          </span>
        </div>
      </section>

      {session.method === "oral" && !published && (
        <section className="card grid gap-4 p-6 sm:p-8" aria-live="polite">
          <h2 className="text-[1.375rem]">Turno actual</h2>
          {current && currentQuestion ? (
            <div className="grid gap-4">
              <p>
                <span className="font-bold">{current.alias}</span>{" "}
                <span className="text-graphite">
                  · pregunta {session.currentQuestion + 1} de {currentQuestions.length}
                </span>
              </p>
              <p className="rounded-[var(--radius-md)] bg-highlight-subtle p-4 text-[1.0625rem] font-bold">{currentQuestion.question}</p>
              <ScoreField
                key={`${current.id}:${currentQuestion.id}`}
                label="Nota de esta pregunta"
                value={current.questionGrades?.[currentQuestion.id]}
                max={session.gradeScale}
                disabled={busy}
                onSave={(value) => void score(current.id, value, currentQuestion.id)}
              />
              <p className="text-[0.9375rem] text-graphite">Al calificar la última pregunta pasa solo al siguiente alumno de la cola.</p>
            </div>
          ) : (
            <div className="grid justify-items-start gap-3">
              <p className="text-graphite">{firstPending ? "Nadie está defendiendo ahora." : "Ya todos tienen nota."}</p>
              {firstPending && (
                <button type="button" className="btn" disabled={busy} onClick={() => void run(() => patchSession(id, teacherKey, { current: firstPending.id, currentQuestion: 0 }))}>
                  Empezar con {firstPending.alias}
                </button>
              )}
            </div>
          )}
        </section>
      )}

      <section className="card grid gap-5 p-6 sm:p-8">
        <h2>Alumnos</h2>
        <ol className="grid gap-3">
          {subs.map((s, i) => {
            const status = studentStatus(session, s);
            const gap = studentGap(assignment.redesign.criteria, s);
            const questions = questionsFor(session, s);
            const isCurrent = session.current === s.id && !published;
            return (
              <li key={s.id} className={`rounded-[var(--radius-md)] border-2 ${isCurrent ? "border-brand bg-brand-subtle/40" : "border-rule"}`}>
                <details open={isCurrent}>
                  <summary className="flex min-h-14 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                    <span className="grid size-10 place-items-center rounded-full bg-subtle font-display font-bold tabular-nums" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="font-bold">{s.alias}</span>
                    <span className="chip chip-neutral">{STATUS_LABEL[status]}</span>
                    <span className="ml-auto">
                      <GradeChip grade={s.grade} session={session} />
                    </span>
                  </summary>
                  <div className="grid gap-5 border-t border-rule px-4 py-4">
                    {session.method === "oral" && !published && (
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn-secondary" disabled={busy || isCurrent} onClick={() => void run(() => patchSession(id, teacherKey, { current: s.id, currentQuestion: 0 }))}>
                          {isCurrent ? "Es su turno" : "Llamar a este alumno"}
                        </button>
                        <button type="button" className="btn-quiet" disabled={busy || i === 0} onClick={() => move(s.id, -1)} aria-label={`Subir a ${s.alias} en la cola`}>
                          ↑ Subir
                        </button>
                        <button type="button" className="btn-quiet" disabled={busy || i === subs.length - 1} onClick={() => move(s.id, 1)} aria-label={`Bajar a ${s.alias} en la cola`}>
                          ↓ Bajar
                        </button>
                      </div>
                    )}

                    <details>
                      <summary className="btn-quiet cursor-pointer">Ver lo que entregó</summary>
                      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-subtle p-4 font-mono text-sm text-graphite">{s.work}</pre>
                    </details>

                    <div className="grid gap-4">
                      {questions.map((q, n) => {
                        const answer = s.answers.find((a) => a.questionId === q.id)?.answer;
                        return (
                          <div key={q.id} className="grid gap-2">
                            <p className="font-bold">
                              {n + 1}. {q.question}
                            </p>
                            {answer && <p className="rounded-[var(--radius-md)] bg-subtle p-3 text-[0.9375rem]">{answer}</p>}
                            <ScoreField label="Nota" value={s.questionGrades?.[q.id]} max={session.gradeScale} disabled={busy} onSave={(value) => void score(s.id, value, q.id)} />
                          </div>
                        );
                      })}
                    </div>

                    {s.evaluation && (
                      <div className="grid gap-3 rounded-[var(--radius-md)] border border-rule p-4 text-[0.9375rem]">
                        <p className="label text-graphite">Lo que vio la IA{gap !== null ? ` · brecha ${Math.round(gap)}%` : ""}</p>
                        <p>{s.evaluation.summary}</p>
                        {s.evaluation.perCriterion.map((p) => (
                          <div key={p.criterionId} className="grid gap-2">
                            <span className="font-bold">{criterionName(p.criterionId)}</span>
                            <GapBar submitted={p.submissionScore} explained={p.defenseScore} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid gap-2 border-t border-rule pt-4">
                      <ScoreField label="Nota final" value={s.grade} max={session.gradeScale} disabled={busy} onSave={(value) => void score(s.id, value)} />
                      <p className="text-[0.9375rem] text-graphite">Se calcula sola al calificar todas las preguntas; aquí puedes corregirla.</p>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </section>
    </>,
  );
}
