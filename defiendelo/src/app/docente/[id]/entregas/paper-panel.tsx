"use client";

import { useEffect, useState } from "react";
import { markedGrade } from "@/app/class-summary";
import { printSheet } from "@/app/components/assignment-sheet";
import { ChevronDownIcon, ChevronRightIcon, PrinterIcon } from "@/app/components/icons";
import { isGraded, LETTER_LABEL, LETTERS } from "@/domain/grading";
import { questionsFor } from "@/domain/session";
import type { Assignment, ClassSession, Submission } from "@/domain/types";
import { criterionName, LinkToWork, type Mark, MarkButtons, markOf, type PanelProps, PublishCard, QuestionHead } from "./session-panel";

const EXCERPT = 280;

/** One printable sheet: the student's alias and the questions about their own work, with room to answer. */
function PaperSheet({ assignment, session, submission }: { assignment: Assignment; session: ClassSession; submission: Submission }) {
  const questions = questionsFor(session, submission);
  return (
    <article id={`hoja-${submission.id}`} className="sheet-doc bg-surface p-8" style={{ breakAfter: "page" }}>
      <header className="grid gap-1 border-b border-ink pb-3">
        <span className="text-sm">{assignment.subject}</span>
        <h3 className="font-display text-2xl font-extrabold">{assignment.title}</h3>
        <p className="font-bold">Apodo: {submission.alias}</p>
      </header>
      <ol className="grid gap-8 pt-5">
        {questions.map((q, i) => (
          <li key={q.id} className="grid gap-3">
            <p className="font-bold">
              {i + 1}. {q.question}
            </p>
            {[0, 1, 2, 3].map((line) => (
              <span key={line} className="block h-6 border-b border-rule" />
            ))}
          </li>
        ))}
      </ol>
    </article>
  );
}

function PaperRow({ assignment, teacherKey, session, send, busy, submission: s }: PanelProps & { submission: Submission }) {
  const [open, setOpen] = useState(false);
  const [grade, setGrade] = useState(s.grade?.toString() ?? "");
  const [comment, setComment] = useState(s.comment ?? "");
  useEffect(() => setGrade(s.grade?.toString() ?? ""), [s.grade]);
  useEffect(() => setComment(s.comment ?? ""), [s.comment]);
  const questions = questionsFor(session, s);
  const marks = questions.map((q) => markOf(s.questionGrades?.[q.id], session.gradeScale));
  const suggestion = markedGrade(marks, session);
  const post = (body: object) => send("POST", { submissionId: s.id, ...body });
  const detailId = `hoja-detalle-${s.id}`;

  async function markQuestion(i: number, mark: Mark) {
    if (!(await post({ questionId: questions[i].id, score: mark * session.gradeScale }))) return;
    // The server averages the marks into a number; on the letter scale the sheet also gets its letter.
    const letter = markedGrade(
      marks.map((m, j) => (j === i ? mark : m)),
      session,
    );
    if (session.grading === "literal" && typeof letter === "string" && !s.letter) await post({ letter });
  }

  return (
    <>
      <tr className={open ? "bg-brand-subtle/40" : ""}>
        <th scope="row" className="border-t border-rule px-3 py-2 text-left">
          <button type="button" className="inline-flex min-h-11 items-center gap-1.5 font-bold" aria-expanded={open} aria-controls={detailId} onClick={() => setOpen(!open)}>
            {open ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
            {s.alias}
          </button>
        </th>
        <td className="border-t border-rule px-3 py-2">
          {session.grading === "literal" ? (
            <select
              aria-label={`Nota de ${s.alias}`}
              className="w-24!"
              value={s.letter ?? ""}
              disabled={busy}
              onChange={(e) => e.target.value && void post({ letter: e.target.value })}
            >
              <option value="">{suggestion ? `— (sugerida ${suggestion})` : "—"}</option>
              {LETTERS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          ) : (
            <span className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={session.gradeScale}
                step="0.5"
                aria-label={`Nota de ${s.alias}`}
                placeholder="—"
                className="min-h-10! w-20! py-1.5! text-right"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                onBlur={() => grade !== "" && Number(grade) !== s.grade && void post({ grade: Number(grade) })}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
              <span className="text-graphite">/{session.gradeScale}</span>
            </span>
          )}
        </td>
        <td className="border-t border-rule px-3 py-2">
          <input
            type="text"
            maxLength={1000}
            aria-label={`Comentario para ${s.alias} (opcional)`}
            placeholder="Escribe un comentario"
            className="min-h-10! w-full py-1.5!"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={() => comment !== (s.comment ?? "") && void post({ comment })}
          />
        </td>
      </tr>
      {open && (
        <tr id={detailId}>
          <td colSpan={3} className="border-t border-rule bg-subtle/60 p-3 sm:p-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
              <div className="grid content-start gap-2 rounded-[var(--radius-md)] bg-surface p-3">
                <span className="eyebrow">Su entrega</span>
                <p className="text-[0.9375rem] italic">
                  «{s.work.length > EXCERPT ? `${s.work.slice(0, EXCERPT).trim()}…` : s.work}»
                </p>
                <LinkToWork assignment={assignment} teacherKey={teacherKey} submission={s} />
              </div>
              <div className="grid content-start gap-3">
                <span className="eyebrow">Preguntas para {s.alias}</span>
                <ol className="grid gap-3">
                  {questions.map((q, i) => (
                    <li key={q.id} className="grid gap-2 rounded-[var(--radius-md)] bg-surface p-3">
                      <QuestionHead number={i + 1} question={q.question} criterion={criterionName(assignment, q.criterionId)} />
                      <div className="pl-10">
                        <MarkButtons
                          label={`Cómo respondió ${s.alias} la pregunta ${i + 1}`}
                          value={marks[i]}
                          disabled={busy}
                          onChange={(m) => void markQuestion(i, m)}
                        />
                      </div>
                    </li>
                  ))}
                </ol>
                {session.grading === "literal" && suggestion && (
                  <p className="text-[0.9375rem]">
                    Según lo que marcaste: <strong>{suggestion}</strong> ({LETTER_LABEL[suggestion as keyof typeof LETTER_LABEL]}).
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" className="btn-secondary btn-sm" onClick={() => printSheet(`hoja-${s.id}`)}>
                    <PrinterIcon size={16} /> Imprimir solo su hoja
                  </button>
                  <span className="text-[0.875rem] text-graphite">Las preguntas salen de lo que entregó: dos alumnos nunca tienen la misma hoja.</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/** D5p · Defensa en papel: print one sheet per student, then grade each sheet by hand. */
export function PaperPanel(props: PanelProps) {
  const { assignment, session } = props;
  const { submissions } = assignment;
  const first = submissions[0];
  const firstQuestions = first ? questionsFor(session, first) : [];
  const graded = submissions.filter(isGraded).length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <section className="card grid gap-4 p-5" aria-labelledby="imprime-titulo">
        <h2 id="imprime-titulo" className="flex items-center gap-2.5 text-[1.25rem]">
          <span className="grid size-7 place-items-center rounded-full bg-ink text-[0.875rem] text-white">1</span>
          Imprime las hojas
        </h2>
        <p className="text-[0.9375rem] text-graphite">
          Una hoja por alumno, con su apodo y {session.questionsPerStudent} preguntas sobre lo que él entregó. Ábrelo en la tabla para ver su entrega y sus
          preguntas.
        </p>
        {first && (
          <div className="grid gap-2 rounded-[var(--radius-md)] border border-rule bg-surface p-3.5 text-[0.875rem]" aria-label="Vista previa de una hoja">
            <div className="flex justify-between gap-2 border-b border-rule pb-1.5">
              <span className="font-bold">{assignment.title}</span>
              <span className="text-graphite">Apodo: {first.alias}</span>
            </div>
            {firstQuestions.slice(0, 2).map((q, i) => (
              <p key={q.id}>
                {i + 1}. {q.question}
              </p>
            ))}
            {firstQuestions.length > 2 && <p className="text-graphite">… {firstQuestions.length - 2} preguntas más</p>}
          </div>
        )}
        <button type="button" className="btn w-full" disabled={submissions.length === 0} onClick={() => printSheet("hojas-papel")}>
          <PrinterIcon size={18} /> Imprimir {submissions.length === 1 ? "1 hoja" : `${submissions.length} hojas`}
        </button>
        <p className="text-[0.875rem] text-graphite">Llévalas a clase: cada alumno responde la suya a mano.</p>
        <div id="hojas-papel" className="hidden">
          {submissions.map((s) => (
            <PaperSheet key={s.id} assignment={assignment} session={session} submission={s} />
          ))}
        </div>
      </section>

      <div className="grid gap-5">
        <section className="card grid gap-4 p-5" aria-labelledby="notas-titulo">
          <h2 id="notas-titulo" className="flex items-center gap-2.5 text-[1.25rem]">
            <span className="grid size-7 place-items-center rounded-full bg-ink text-[0.875rem] text-white">2</span>
            Pon la nota de cada hoja
          </h2>
          <p className="rounded-[var(--radius-md)] bg-highlight-subtle px-3.5 py-2.5 text-[0.9375rem]">
            La IA no lee las hojas. Abre cada alumno, marca cómo respondió cada pregunta y la nota se calcula con la rúbrica. Puedes cambiarla.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-[0.875rem] text-graphite">
                  <th scope="col" className="px-3 py-2 font-bold">
                    Alumno
                  </th>
                  <th scope="col" className="px-3 py-2 font-bold">
                    Nota
                  </th>
                  <th scope="col" className="px-3 py-2 font-bold">
                    Comentario (opcional)
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <PaperRow key={s.id} {...props} submission={s} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <PublishCard {...props} reviewed={graded} total={submissions.length} noun="puestas" />
      </div>
    </div>
  );
}
