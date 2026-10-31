"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MicIcon } from "@/app/components/icons";
import { gradeReport, isGraded, LETTER_LABEL, LETTERS, suggestGrade, suggestLetter } from "@/domain/grading";
import { isLive, questionsFor, sessionOf } from "@/domain/session";
import type { Assignment, ClassSession, Letter, Submission } from "@/domain/types";
import { teacherHref } from "../teacher-frame";

const POLL_MS = 5000;

const PHASES: { key: ClassSession["phase"]; label: string }[] = [
  { key: "entregas", label: "Entregas abiertas" },
  { key: "defensas", label: "Defensas" },
  { key: "publicado", label: "Notas publicadas" },
];

function Report({ session, submissions }: { session: ClassSession; submissions: Submission[] }) {
  const report = gradeReport(session, submissions);
  const literal = session.grading === "literal";
  return (
    <div className="grid gap-4 rounded-[var(--radius-md)] bg-subtle p-4">
      <p className="text-[1.125rem]">
        <span className="stat-value block">
          {report.achieved} de {report.total}
        </span>
        {literal ? "lograron A (logro esperado) o AD (logro destacado)" : `aprobaron con ${session.passingGrade} o más`}
        {report.graded < report.total && <span className="block text-[0.9375rem] text-graphite">{report.total - report.graded} sin nota todavía</span>}
      </p>
      {literal ? (
        <dl className="grid grid-cols-4 gap-2 text-center">
          {LETTERS.map((l) => (
            <div key={l} className={`rounded-[var(--radius-sm)] p-2 ${l === "AD" || l === "A" ? "bg-success-subtle" : "bg-surface"}`}>
              <dt className="font-display text-lg font-bold" title={LETTER_LABEL[l]}>
                {l}
              </dt>
              <dd className="tabular-nums">{report.letters[l]}</dd>
            </div>
          ))}
        </dl>
      ) : (
        report.average !== null && (
          <p>
            Promedio: <strong className="tabular-nums">{report.average}</strong> de {session.gradeScale}
          </p>
        )
      )}
    </div>
  );
}

function GradeControl({
  session,
  submission,
  suggestion,
  onGrade,
}: {
  session: ClassSession;
  submission: Submission;
  suggestion: Letter | number | null;
  onGrade: (input: { letter: Letter } | { grade: number }) => void;
}) {
  const [value, setValue] = useState(submission.grade?.toString() ?? "");
  useEffect(() => setValue(submission.grade?.toString() ?? ""), [submission.grade]);

  if (session.grading === "literal") {
    return (
      <div className="grid justify-items-end gap-1">
        <div role="group" aria-label={`Nota de ${submission.alias}`} className="inline-grid grid-cols-4 gap-1">
          {LETTERS.map((l) => {
            const chosen = submission.letter === l;
            return (
              <button
                key={l}
                type="button"
                title={LETTER_LABEL[l]}
                aria-pressed={chosen}
                onClick={() => onGrade({ letter: l })}
                className={`size-11 cursor-pointer rounded-[var(--radius-md)] border-2 font-display font-bold ${chosen ? "border-brand bg-brand text-white" : suggestion === l ? "border-dashed border-brand bg-brand-subtle text-brand-text" : "border-rule bg-surface hover:border-ink"}`}
              >
                {l}
              </button>
            );
          })}
        </div>
        {suggestion && !submission.letter && <span className="text-sm text-graphite">Sugerida: {suggestion}</span>}
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (value !== "") onGrade({ grade: Number(value) });
      }}
    >
      <input
        type="number"
        min={0}
        max={session.gradeScale}
        step="0.5"
        aria-label={`Nota de ${submission.alias}`}
        placeholder={suggestion != null ? String(suggestion) : undefined}
        className="min-h-11! w-24! py-2! text-right"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span className="text-graphite">/ {session.gradeScale}</span>
      <button className="btn-secondary btn-sm" disabled={value === "" || Number(value) === submission.grade}>
        Guardar
      </button>
    </form>
  );
}

/** Live class session for the teacher: open/close, order and call students, grade each one, publish. */
export function SessionPanel({
  assignment,
  teacherKey,
  onChange,
  reload,
}: {
  assignment: Assignment;
  teacherKey: string;
  onChange: (assignment: Assignment) => void;
  reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const live = isLive(assignment);
  const session = sessionOf(assignment);

  // Students keep handing in and answering while the teacher has this open.
  useEffect(() => {
    if (!live || session.phase === "publicado") return;
    const timer = setInterval(() => void reload().catch(() => {}), POLL_MS);
    return () => clearInterval(timer);
  }, [live, reload, session.phase]);

  if (!live) {
    return (
      <section className="card grid gap-3 p-6">
        <h2 className="text-[1.375rem]">Notas de la clase</h2>
        <p>Para poner notas, primero elige cómo vas a evaluar.</p>
        <Link href={`${teacherHref(assignment.id, teacherKey, "tarea")}#evaluacion`} className="btn-secondary justify-self-start">
          Configurar la evaluación
        </Link>
      </section>
    );
  }

  async function send(method: "PATCH" | "POST", body: object) {
    setBusy(true);
    setError(null);
    try {
      onChange(await api<Assignment>(`/api/assignments/${assignment.id}/session`, { method, teacherKey, body: JSON.stringify(body) }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const { submissions, redesign } = assignment;
  const ordered =
    session.phase === "entregas" ? submissions : session.queue.map((sid) => submissions.find((s) => s.id === sid)).filter((s): s is Submission => !!s);
  const oral = session.method === "oral" && session.phase === "defensas";
  const phaseIndex = PHASES.findIndex((p) => p.key === session.phase);
  const graded = submissions.filter(isGraded).length;

  function move(i: number, by: -1 | 1) {
    const queue = [...session.queue];
    [queue[i], queue[i + by]] = [queue[i + by], queue[i]];
    void send("PATCH", { queue });
  }

  return (
    <section className="card grid gap-6 p-6 sm:p-8" aria-busy={busy}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2>Notas de la clase</h2>
        <ol className="flex flex-wrap gap-2" aria-label="Momento de la clase">
          {PHASES.map((p, i) => (
            <li key={p.key} aria-current={i === phaseIndex ? "step" : undefined} className={`chip inline-flex items-center gap-1 ${i === phaseIndex ? "chip-brand" : "chip-neutral"}`}>
              {i < phaseIndex && <CheckIcon className="size-4" />}
              {p.label}
            </li>
          ))}
        </ol>
      </div>

      {session.phase === "entregas" && (
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn" disabled={busy || submissions.length === 0} onClick={() => void send("PATCH", { phase: "defensas" })}>
            Cerrar entregas y empezar las defensas
          </button>
          <span className="text-graphite">{submissions.length === 1 ? "1 entrega" : `${submissions.length} entregas`}</span>
        </div>
      )}
      {session.phase === "defensas" && (
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn" disabled={busy || graded === 0} onClick={() => void send("PATCH", { phase: "publicado" })}>
            Publicar las notas
          </button>
          <span className="text-graphite">
            {graded} de {submissions.length} con nota
          </span>
        </div>
      )}
      {session.phase === "publicado" && (
        <button className="btn-secondary justify-self-start" disabled={busy} onClick={() => void send("PATCH", { phase: "defensas" })}>
          Ocultar las notas para corregir
        </button>
      )}

      {session.phase !== "entregas" && <Report session={session} submissions={submissions} />}

      {ordered.length > 0 && (
        <ol className="grid gap-2">
          {ordered.map((s, i) => {
            const current = oral && session.current === s.id;
            const questions = questionsFor(session, s);
            const suggestion = s.evaluation
              ? session.grading === "literal"
                ? suggestLetter(redesign.criteria, s.evaluation)
                : suggestGrade(session, redesign.criteria, s.evaluation)
              : null;
            const question = current ? questions[session.currentQuestion] : null;
            return (
              <li key={s.id} className={`grid gap-3 rounded-[var(--radius-md)] border-2 p-3 ${current ? "border-brand bg-brand-subtle" : "border-rule"}`}>
                {/* Phone: name and order arrows on top, grade and "Llamar" below. Wider: one row. */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="w-6 text-right tabular-nums text-graphite">{i + 1}</span>
                  <span className="min-w-0 flex-1 font-bold">
                    {s.alias}
                    {current && (
                      <span className="chip chip-danger ml-2 inline-flex items-center gap-1 align-middle">
                        <MicIcon className="size-4" /> Defendiendo
                      </span>
                    )}
                    {session.method === "escrito" && session.phase !== "entregas" && (
                      <span className="ml-2 font-normal text-graphite">{s.answeredAt ? "· respondió" : "· respondiendo"}</span>
                    )}
                  </span>
                  {oral && (
                    <span className="ml-auto flex gap-1 sm:order-last sm:ml-0">
                      <button type="button" className="btn-icon" aria-label={`Subir a ${s.alias}`} disabled={busy || i === 0} onClick={() => move(i, -1)}>
                        <ChevronUpIcon />
                      </button>
                      <button type="button" className="btn-icon" aria-label={`Bajar a ${s.alias}`} disabled={busy || i === ordered.length - 1} onClick={() => move(i, 1)}>
                        <ChevronDownIcon />
                      </button>
                    </span>
                  )}
                  {(session.phase !== "entregas" || oral) && (
                    <div className="flex w-full flex-wrap items-start gap-2 sm:w-auto sm:justify-end">
                      {session.phase !== "entregas" && (
                        <GradeControl session={session} submission={s} suggestion={suggestion} onGrade={(input) => void send("POST", { submissionId: s.id, ...input })} />
                      )}
                      {oral && !current && !isGraded(s) && (
                        <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={() => void send("PATCH", { current: s.id, currentQuestion: 0 })}>
                          <MicIcon className="size-4" /> Llamar
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {question && (
                  <div className="grid gap-2 rounded-[var(--radius-md)] bg-surface p-3">
                    <span className="label text-brand-text">
                      Pregunta {session.currentQuestion + 1} de {questions.length}
                    </span>
                    <p className="font-display text-lg font-bold">{question.question}</p>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={busy || session.currentQuestion === 0}
                        onClick={() => void send("PATCH", { currentQuestion: session.currentQuestion - 1 })}
                      >
                        <ChevronLeftIcon className="size-4" /> Anterior
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={busy || session.currentQuestion >= questions.length - 1}
                        onClick={() => void send("PATCH", { currentQuestion: session.currentQuestion + 1 })}
                      >
                        Siguiente <ChevronRightIcon className="size-4" />
                      </button>
                    </div>
                  </div>
                )}

                <details>
                  <summary className="btn-quiet cursor-pointer text-[0.9375rem]">Ver entrega{s.answers.length > 0 ? " y respuestas" : ""}</summary>
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-subtle p-3 font-mono text-sm">{s.work}</pre>
                  {s.answers.length > 0 && (
                    <ul className="mt-2 grid gap-2">
                      {questions.map((q) => (
                        <li key={q.id} className="grid gap-1">
                          <span className="font-bold">{q.question}</span>
                          <span>{s.answers.find((a) => a.questionId === q.id)?.answer || "—"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              </li>
            );
          })}
        </ol>
      )}

      {error && (
        <p role="alert" className="font-bold text-pen">
          {error}
        </p>
      )}
    </section>
  );
}
