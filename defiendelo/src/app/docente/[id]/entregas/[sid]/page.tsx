"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeftIcon, FileTextIcon } from "@/app/components/icons";
import { isLive, questionsFor, sessionOf } from "@/domain/session";
import { criterionName, workMeta } from "../session-panel";
import { subjectLine, TeacherBar, TeacherFrame, teacherHref, useTeacherAssignment } from "../../teacher-frame";
import { markWork } from "./work-marks";

/** D5v · Ver la entrega: the text read from what the student handed in, and where each question comes from. */
export default function SubmissionWorkPage({ params }: { params: Promise<{ id: string; sid: string }> }) {
  const { id, sid } = use(params);
  const { assignment, teacherKey, error } = useTeacherAssignment(id);

  if (!assignment) return <TeacherFrame id={id} teacherKey={teacherKey} assignment={null} section="entregas" error={error} />;

  const back = teacherHref(id, teacherKey, "entregas");
  const submission = assignment.submissions.find((s) => s.id === sid);
  if (!submission) {
    return (
      <>
        <TeacherBar />
        <main id="contenido" tabIndex={-1} className="container-page grid justify-items-start gap-4 py-10 outline-none">
          <p role="alert" className="font-bold text-pen">
            No encontramos esa entrega.
          </p>
          <Link href={back} className="btn-secondary">
            <ArrowLeftIcon size={18} /> Volver a Entregas
          </Link>
        </main>
      </>
    );
  }

  const session = sessionOf(assignment);
  const questions = questionsFor(session, submission, isLive(assignment));
  const evaluation = submission.evaluation?.perCriterion ?? [];
  // A question's evidence is the quote the AI kept for its criterion; it is marked when it appears in the work.
  const segments = markWork(
    submission.work,
    questions.flatMap((q, i) => {
      const quote = evaluation.find((p) => p.criterionId === q.criterionId)?.evidenceQuote;
      return quote ? [{ quote, label: String(i + 1) }] : [];
    }),
  );

  return (
    <>
      <TeacherBar />
      <main id="contenido" tabIndex={-1} className="container-page grid gap-6 py-7 outline-none sm:py-9">
        <div className="grid justify-items-start gap-2">
          <Link href={back} className="inline-flex min-h-11 items-center gap-2 font-bold text-brand-text hover:underline">
            <ArrowLeftIcon size={18} /> Volver a Entregas
          </Link>
          <span className="text-[0.9375rem] text-graphite">
            {subjectLine(assignment.subject)} · {assignment.title}
          </span>
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)]">Lo que entregó {submission.alias}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-rule bg-surface px-4 py-3">
          <FileTextIcon className="text-brand-text" />
          <span className="grid min-w-0 flex-1">
            <span className="font-bold">Su entrega</span>
            <span className="text-[0.875rem] text-graphite">{workMeta(submission)}</span>
          </span>
          <span className="chip chip-neutral">Se muestra el texto que se leyó del archivo</span>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <article className="card p-5 sm:p-8" aria-label={`Entrega de ${submission.alias}`}>
            <p className="prose-measure whitespace-pre-wrap text-[1.0625rem] leading-[1.75]">
              {segments.map((seg, i) =>
                seg.label ? (
                  <mark key={i} className="rounded-[4px] bg-highlight-subtle px-0.5 text-ink shadow-[inset_0_-2px_0_var(--color-bg-highlight)]">
                    <sup className="mr-0.5 font-bold text-brand-text">{seg.label}</sup>
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </p>
          </article>

          <aside className="card grid gap-4 p-5 lg:sticky lg:top-24" aria-labelledby="preguntas-titulo">
            <h2 id="preguntas-titulo" className="eyebrow">
              De dónde salen sus preguntas
            </h2>
            {questions.length === 0 ? (
              <p className="text-graphite">Todavía no tiene preguntas.</p>
            ) : (
              <ol className="grid gap-4">
                {questions.map((q, i) => {
                  const answer = submission.answers.find((a) => a.questionId === q.id)?.answer;
                  const name = criterionName(assignment, q.criterionId);
                  return (
                    <li key={q.id} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
                      <span className="grid size-7 place-items-center rounded-full bg-ink text-[0.875rem] font-bold text-white" aria-hidden="true">
                        {i + 1}
                      </span>
                      <div className="grid gap-1">
                        <p className="font-bold leading-snug">{q.question}</p>
                        {name && <p className="text-[0.875rem] text-graphite">Criterio: {name}</p>}
                        {answer && (
                          <p className="text-[0.9375rem]">
                            <span className="font-bold">Respondió: </span>
                            {answer}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
