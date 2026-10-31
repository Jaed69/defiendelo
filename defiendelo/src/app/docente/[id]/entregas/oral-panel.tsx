"use client";

import { useEffect, useState } from "react";
import { markedGrade } from "@/app/class-summary";
import { ChevronDownIcon, ChevronUpIcon, ClockIcon, MicIcon } from "@/app/components/icons";
import { isGraded, LETTER_LABEL, LETTERS } from "@/domain/grading";
import { questionsFor } from "@/domain/session";
import type { Letter, Submission } from "@/domain/types";
import {
  criterionName,
  finalGrade,
  gradeText,
  LinkToWork,
  type Mark,
  MarkButtons,
  markOf,
  type PanelProps,
  PublishCard,
  QuestionHead,
} from "./session-panel";

const TURN_SECONDS = 5 * 60;
const SHOWN = 6;

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Time since this student was called, against a five-minute turn. */
function TurnTimer({ studentId }: { studentId: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setSeconds(0);
    const started = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [studentId]);
  const late = seconds > TURN_SECONDS;
  return (
    <span className={`chip ${late ? "chip-danger" : "chip-neutral"} font-mono tabular-nums`} aria-label={`Lleva ${clock(seconds)} de ${clock(TURN_SECONDS)}`}>
      <ClockIcon size={15} /> {clock(seconds)} de {clock(TURN_SECONDS)}
    </span>
  );
}

/** The queue as the teacher set it, plus anyone who handed in later. */
function classOrder(queue: string[], submissions: Submission[]) {
  const inQueue = queue.map((id) => submissions.find((s) => s.id === id)).filter((s): s is Submission => !!s);
  return [...inQueue, ...submissions.filter((s) => !queue.includes(s.id))];
}

function Presenting({ assignment, teacherKey, session, send, busy, student, next }: PanelProps & { student: Submission; next: Submission | null }) {
  const questions = questionsFor(session, student);
  const scale = session.gradeScale;
  const [marks, setMarks] = useState<(Mark | null)[]>(() => questions.map((q) => markOf(student.questionGrades?.[q.id], scale)));
  const computed = markedGrade(marks, session);
  const [override, setOverride] = useState<string>("");
  useEffect(() => setOverride(computed === null ? "" : String(computed)), [computed]);
  const current = marks.findIndex((m) => m === null);

  function mark(i: number, value: Mark) {
    const nextMarks = marks.map((m, j) => (j === i ? value : m));
    setMarks(nextMarks);
    // The student's phone shows the question being asked; move it to the next one left.
    const pending = nextMarks.findIndex((m) => m === null);
    if (pending !== -1 && pending !== session.currentQuestion) void send("PATCH", { currentQuestion: pending });
  }

  async function save() {
    if (computed === null) return;
    // Per-question scores go first: the student sees them with the grade, and the last one calls the next student.
    for (let i = 0; i < questions.length; i++) {
      if (!(await send("POST", { submissionId: student.id, questionId: questions[i].id, score: (marks[i] as number) * scale }))) return;
    }
    if (session.grading === "literal") await send("POST", { submissionId: student.id, letter: (override || computed) as Letter });
    else if (override !== "" && Number(override) !== computed) await send("POST", { submissionId: student.id, grade: Number(override) });
  }

  return (
    <section className="card grid gap-5 border-2 border-ink p-5 sm:p-6" aria-labelledby="presenta-titulo">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <span className="eyebrow">Presentando ahora</span>
          <h2 id="presenta-titulo" className="flex items-center gap-2.5 text-[1.75rem]">
            <span className="size-3 rounded-full bg-[var(--color-text-danger)]" aria-hidden="true" />
            {student.alias}
          </h2>
          <LinkToWork assignment={assignment} teacherKey={teacherKey} submission={student} />
        </div>
        <TurnTimer studentId={student.id} />
      </div>
      <p className="text-graphite">Pregúntale esto. Las preguntas salen de su propio trabajo: puedes leerlas tal cual.</p>

      <ol className="grid gap-3">
        {questions.map((q, i) => (
          <li
            key={q.id}
            className={`grid gap-3 rounded-[var(--radius-md)] border p-3.5 ${i === current ? "border-2 border-brand bg-brand-subtle" : "border-rule"}`}
            aria-current={i === current ? "step" : undefined}
          >
            <QuestionHead number={i + 1} question={q.question} criterion={criterionName(assignment, q.criterionId)} />
            <div className="pl-10">
              <MarkButtons label={`Cómo respondió la pregunta ${i + 1}`} value={marks[i]} onChange={(m) => mark(i, m)} />
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border-2 border-ink bg-highlight-subtle p-4">
        <div className="grid">
          <span className="eyebrow">Nota según lo que marcaste</span>
          {computed === null ? (
            <span className="stat-value font-display">— /{session.grading === "literal" ? "AD" : scale}</span>
          ) : session.grading === "literal" ? (
            <select aria-label={`Nota de ${student.alias}`} className="w-28! font-bold" value={override || String(computed)} onChange={(e) => setOverride(e.target.value)}>
              {LETTERS.map((l) => (
                <option key={l} value={l}>
                  {l} · {LETTER_LABEL[l]}
                </option>
              ))}
            </select>
          ) : (
            <span className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={scale}
                step="0.5"
                aria-label={`Nota de ${student.alias}`}
                className="w-24! text-right font-bold"
                value={override}
                onChange={(e) => setOverride(e.target.value)}
              />
              <span className="font-bold">/{scale}</span>
            </span>
          )}
        </div>
        <p className="min-w-[12rem] flex-1 text-[0.875rem]">
          Aparece al marcar las {questions.length} preguntas: cada una suma puntos a su criterio de la rúbrica. Puedes cambiarla antes de guardar.
        </p>
        <button type="button" className="btn" disabled={busy || computed === null} onClick={() => void save()}>
          <MicIcon size={18} /> {next ? `Guardar y llamar a ${next.alias}` : "Guardar nota"}
        </button>
      </div>
    </section>
  );
}

/** D5o · Defensa oral en vivo: call each student, ask the questions from their work and mark how they answered. */
export function OralPanel(props: PanelProps) {
  const { assignment, session, send, busy } = props;
  const [reordering, setReordering] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const order = classOrder(session.queue, assignment.submissions);
  const presenting = order.find((s) => s.id === session.current) ?? null;
  const at = presenting ? order.indexOf(presenting) : -1;
  const pending = order.filter((s) => !isGraded(s) && s.id !== presenting?.id);
  const next = pending.find((s) => order.indexOf(s) > at) ?? pending[0] ?? null;
  const graded = order.filter(isGraded).length;
  const shown = showAll || reordering ? order : order.slice(0, SHOWN);

  function move(i: number, by: -1 | 1) {
    const queue = order.map((s) => s.id);
    [queue[i], queue[i + by]] = [queue[i + by], queue[i]];
    void send("PATCH", { queue });
  }

  function skip() {
    if (!presenting) return;
    const queue = [...order.map((s) => s.id).filter((id) => id !== presenting.id), presenting.id];
    void send("PATCH", { queue, current: next?.id ?? null, currentQuestion: 0 });
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {presenting && session.phase === "defensas" ? (
        <Presenting key={presenting.id} {...props} student={presenting} next={next} />
      ) : (
        <section className="card grid justify-items-start gap-4 p-6" aria-live="polite">
          <h2 className="text-[1.5rem]">{pending.length > 0 ? "Nadie está presentando" : "Ya defendieron todos"}</h2>
          <p className="text-graphite">
            {pending.length > 0
              ? "Llama al primer alumno: en su celular aparece «¡Te toca!» y aquí ves las preguntas sobre su trabajo."
              : "Revisa el orden de la clase y publica las notas cuando quieras."}
          </p>
          {pending.length > 0 && session.phase === "defensas" && (
            <button type="button" className="btn" disabled={busy} onClick={() => void send("PATCH", { current: pending[0].id, currentQuestion: 0 })}>
              <MicIcon size={18} /> Llamar a {pending[0].alias}
            </button>
          )}
        </section>
      )}

      <div className="grid gap-5 lg:sticky lg:top-24">
        <section className="card grid gap-3 p-5" aria-labelledby="orden-titulo">
          <div className="flex items-center justify-between gap-2">
            <h2 id="orden-titulo" className="eyebrow">
              Orden de la clase
            </h2>
            <button type="button" className="min-h-11 font-bold text-brand-text hover:underline" aria-pressed={reordering} onClick={() => setReordering(!reordering)}>
              {reordering ? "Listo" : "Cambiar"}
            </button>
          </div>
          <ol className="grid gap-1.5">
            {shown.map((s) => {
              const i = order.indexOf(s);
              const now = s.id === presenting?.id;
              const done = isGraded(s);
              return (
                <li
                  key={s.id}
                  className={`flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-2.5 ${now ? "border-2 border-pen bg-pen-soft" : ""}`}
                >
                  <span className="w-6 text-right tabular-nums text-graphite">{i + 1}.</span>
                  <span className="flex-1 font-bold">{s.alias}</span>
                  {reordering ? (
                    <span className="flex gap-1">
                      {!done && !now && session.phase === "defensas" && (
                        <button type="button" className="btn-quiet text-[0.875rem]" disabled={busy} onClick={() => void send("PATCH", { current: s.id, currentQuestion: 0 })}>
                          Llamar
                        </button>
                      )}
                      <button type="button" className="btn-icon" aria-label={`Subir a ${s.alias}`} disabled={busy || i === 0} onClick={() => move(i, -1)}>
                        <ChevronUpIcon />
                      </button>
                      <button type="button" className="btn-icon" aria-label={`Bajar a ${s.alias}`} disabled={busy || i === order.length - 1} onClick={() => move(i, 1)}>
                        <ChevronDownIcon />
                      </button>
                    </span>
                  ) : done ? (
                    <span className="font-bold text-success">✓ {gradeText(session, finalGrade(session, s) ?? s.grade ?? null)}</span>
                  ) : now ? (
                    <span className="chip chip-danger chip-dot">Presentando</span>
                  ) : s.id === next?.id ? (
                    <span className="text-[0.875rem] text-graphite">Sigue</span>
                  ) : null}
                </li>
              );
            })}
          </ol>
          {!showAll && !reordering && order.length > SHOWN && (
            <button type="button" className="btn-quiet justify-self-start" onClick={() => setShowAll(true)}>
              + {order.length - SHOWN} {order.length - SHOWN === 1 ? "alumno más" : "alumnos más"}
            </button>
          )}
        </section>

        {presenting && session.phase === "defensas" && (
          <>
            <section className="card grid gap-3 p-5" aria-labelledby="ausente-titulo">
              <h2 id="ausente-titulo" className="text-[1.0625rem]">
                ¿{presenting.alias} no está?
              </h2>
              <button type="button" className="btn-secondary w-full" disabled={busy} onClick={skip}>
                Pasarlo al final
              </button>
            </section>
            <p className="rounded-[var(--radius-md)] bg-brand-subtle p-3.5 text-[0.9375rem]">
              En el celular de {presenting.alias} aparece «¡Te toca!».{next ? ` ${next.alias} ve que le toca después.` : ""}
            </p>
          </>
        )}

        <PublishCard {...props} reviewed={graded} total={order.length} noun="puestas" />
      </div>
    </div>
  );
}

