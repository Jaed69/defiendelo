"use client";

import Link from "next/link";
import { CheckIcon, UserCheckIcon } from "@/app/components/icons";
import { teacherDecides } from "@/app/class-summary";
import { criterionMarks, isGraded } from "@/domain/grading";
import type { Assignment, ClassSession, Letter, Submission } from "@/domain/types";

/** Sends one change of the class session and returns the updated assignment (null when it failed). */
export type Send = (method: "PATCH" | "POST", body: object) => Promise<Assignment | null>;

export interface PanelProps {
  assignment: Assignment;
  teacherKey: string;
  session: ClassSession;
  send: Send;
  busy: boolean;
}

export function formatNumber(value: number) {
  return value.toLocaleString("es", { maximumFractionDigits: 1 });
}

/** "14/20" or a letter: a grade as the screens show it. */
export function gradeText(session: Pick<ClassSession, "gradeScale">, value: number | Letter | null) {
  if (value === null) return "—";
  return typeof value === "string" ? value : `${formatNumber(value)}/${session.gradeScale}`;
}

/** The grade the teacher set, on the session scale. */
export function finalGrade(session: Pick<ClassSession, "grading">, submission: Submission): number | Letter | null {
  return session.grading === "literal" ? (submission.letter ?? null) : (submission.grade ?? null);
}

/** "Texto · 320 palabras · entregó el 29 oct, 21:14" */
export function workMeta(submission: Submission) {
  const words = submission.work.trim().split(/\s+/).filter(Boolean).length;
  const when = new Date(submission.createdAt).toLocaleString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return `Texto · ${words} ${words === 1 ? "palabra" : "palabras"} · entregó el ${when.replace(/\./g, "")}`;
}

export function workHref(assignmentId: string, teacherKey: string, submissionId: string) {
  return `/docente/${assignmentId}/entregas/${submissionId}?k=${teacherKey}`;
}

export function criterionName(assignment: Assignment, criterionId: string) {
  return assignment.redesign.criteria.find((c) => c.id === criterionId)?.name ?? "";
}

export type Mark = 1 | 0.5 | 0;

/** A stored question score back to the teacher's mark. */
export function markOf(score: number | undefined, scale: number): Mark | null {
  if (score === undefined) return null;
  const share = scale === 0 ? 0 : score / scale;
  return share >= 0.75 ? 1 : share >= 0.25 ? 0.5 : 0;
}

const MARKS: { value: Mark; label: string; on: string }[] = [
  { value: 1, label: "Lo explicó", on: "border-success bg-success-subtle text-success" },
  { value: 0.5, label: "A medias", on: "border-ink bg-highlight-subtle text-ink" },
  { value: 0, label: "No lo explicó", on: "border-pen bg-pen-soft text-pen" },
];

/** How the student answered one question, marked while listening or reading the sheet. */
export function MarkButtons({ value, onChange, label, disabled }: { value: Mark | null; onChange: (mark: Mark) => void; label: string; disabled?: boolean }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {MARKS.map((m) => {
        const on = value === m.value;
        return (
          <button
            key={m.label}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            onClick={() => onChange(m.value)}
            className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 text-[0.9375rem] font-bold ${
              on ? m.on : "border-rule bg-surface text-graphite hover:border-ink hover:text-ink"
            }`}
          >
            {on && <CheckIcon size={14} />}
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/** Numbered question with the rubric criterion it checks. */
export function QuestionHead({ number, question, criterion }: { number: number; question: string; criterion: string }) {
  return (
    <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
      <span className="grid size-7 place-items-center rounded-full bg-ink text-[0.875rem] font-bold text-white" aria-hidden="true">
        {number}
      </span>
      <div className="grid gap-0.5">
        <p className="font-bold leading-snug">
          <span className="sr-only">Pregunta {number}: </span>
          {question}
        </p>
        {criterion && <p className="text-[0.875rem] text-graphite">Criterio: {criterion}</p>}
      </div>
    </div>
  );
}

/**
 * "Notas para los alumnos": how many grades are reviewed, how often the teacher changed the AI, and
 * the one button that shows the grades to the students.
 */
export function PublishCard({
  assignment,
  session,
  send,
  busy,
  reviewed,
  total,
  noun = "revisadas",
  showDecides = false,
}: Omit<PanelProps, "teacherKey"> & { reviewed: number; total: number; noun?: string; showDecides?: boolean }) {
  const published = session.phase === "publicado";
  const ready = total > 0 && reviewed === total;
  const marks = assignment.submissions.map((s) => criterionMarks(session, assignment.redesign.criteria, s));
  return (
    <section className="card grid gap-4 border-2 border-ink p-5" aria-labelledby="publicar-titulo">
      <h2 id="publicar-titulo" className="text-[1.25rem]">
        Notas para los alumnos
      </h2>
      <div className="grid gap-2">
        <p className="font-bold">
          {reviewed} de {total} notas {noun}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
          <div className="h-full rounded-full bg-success-fill" style={{ width: `${total === 0 ? 0 : (reviewed / total) * 100}%` }} />
        </div>
      </div>
      {showDecides && (
        <div className="grid gap-1 rounded-[var(--radius-md)] bg-brand-subtle p-3.5">
          <p className="flex items-center gap-2 font-bold text-brand-text">
            <UserCheckIcon size={18} /> Tú decides
          </p>
          <p className="text-[0.9375rem]">{teacherDecides(marks)}</p>
        </div>
      )}
      {published ? (
        <>
          <p className="flex items-center gap-2 font-bold text-success">
            <CheckIcon size={18} /> Notas publicadas. Tus alumnos ya ven su nota.
          </p>
          <button type="button" className="btn-secondary w-full" disabled={busy} onClick={() => void send("PATCH", { phase: "defensas" })}>
            Ocultar las notas para corregir
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="btn w-full"
            disabled={busy || !ready}
            onClick={() => void send("PATCH", assignment.session ? { phase: "publicado" } : { method: "escrito", phase: "publicado" })}
          >
            Publicar notas
          </button>
          <p className="text-[0.875rem] text-graphite">Se activa cuando revises todas. Los alumnos ven solo la nota que tú aceptaste o pusiste.</p>
        </>
      )}
    </section>
  );
}

/** Before the defenses: who handed in, and the button that closes submissions. */
export function OpenSubmissions({ assignment, session, send, busy, onSimulate }: Omit<PanelProps, "teacherKey"> & { onSimulate?: () => void }) {
  const { submissions } = assignment;
  const next =
    session.method === "oral"
      ? "Después llamas a cada alumno en clase."
      : session.method === "papel"
        ? "Después imprimes una hoja por alumno con sus preguntas."
        : "Cada alumno responde sus preguntas en el celular.";
  return (
    <section className="card grid gap-5 p-5 sm:p-6" aria-labelledby="abiertas-titulo">
      <div className="grid gap-1">
        <h2 id="abiertas-titulo" className="text-[1.375rem]">
          Las entregas están abiertas
        </h2>
        <p className="text-graphite">Cuando estén todos, cierra las entregas para empezar las defensas. {next}</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {submissions.map((s) => (
          <li key={s.id} className="chip chip-neutral">
            {s.alias}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn" disabled={busy || submissions.length === 0} onClick={() => void send("PATCH", { phase: "defensas" })}>
          Cerrar entregas y empezar las defensas
        </button>
        {onSimulate && (
          <button type="button" className="btn-secondary" disabled={busy} onClick={onSimulate}>
            Simular entregas de la clase
          </button>
        )}
      </div>
    </section>
  );
}

export function ungraded(submissions: Submission[]) {
  return submissions.filter((s) => !isGraded(s));
}

export function LinkToWork({ assignment, teacherKey, submission }: { assignment: Assignment; teacherKey: string; submission: Submission }) {
  return (
    <Link href={workHref(assignment.id, teacherKey, submission.id)} className="inline-flex min-h-11 items-center font-bold text-brand-text hover:underline">
      Ver lo que entregó
    </Link>
  );
}
