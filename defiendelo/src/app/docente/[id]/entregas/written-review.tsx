"use client";

import { useEffect, useState } from "react";
import { FileTextIcon, QuoteIcon, SparklesIcon, UserCheckIcon } from "@/app/components/icons";
import { Waiting } from "@/app/components/waiting";
import { studentGap } from "@/domain/gap";
import { type CriterionMark, criterionMarks, isGraded, LETTER_LABEL, letterForMarks, marksTotal } from "@/domain/grading";
import type { Assignment, ClassSession, CriterionEvaluation, Letter, Submission } from "@/domain/types";
import { finalGrade, formatNumber, gradeText, LinkToWork, type PanelProps, PublishCard, workMeta } from "./session-panel";

const HELP_GAP = 25;

const INSIGHT_STEPS = [
  { after: 0, text: "Leyendo las defensas de la clase…" },
  { after: 10, text: "Agrupando malentendidos parecidos…" },
  { after: 25, text: "Escribiendo una actividad corta para cada uno. Ya casi." },
];

/** Students in the order the teacher works through them: to review (largest gap first), graded, still answering. */
export function reviewOrder(assignment: Assignment) {
  const { submissions, redesign } = assignment;
  const gap = (s: Submission) => studentGap(redesign.criteria, s) ?? 0;
  const toReview = submissions.filter((s) => s.evaluation && !isGraded(s)).sort((a, b) => gap(b) - gap(a));
  const graded = submissions.filter((s) => isGraded(s));
  const answering = submissions.filter((s) => !s.evaluation && !isGraded(s));
  return { toReview, graded, answering, needsHelp: (s: Submission) => s.evaluation !== null && gap(s) >= HELP_GAP };
}

function suggestedGrade(session: ClassSession, marks: CriterionMark[]): number | Letter {
  return session.grading === "literal" ? letterForMarks(marks, "suggested") : marksTotal(marks, "suggested");
}

function Bar({ label, value, gap = 0, tone }: { label: string; value: number; gap?: number; tone: "brand" | "ink" }) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 text-[0.8125rem] text-graphite">
      <span>{label}</span>
      <span className="relative h-2.5 rounded-full bg-subtle">
        <span className={`absolute inset-y-0 left-0 rounded-full ${tone === "brand" ? "bg-brand" : "bg-ink"}`} style={{ width: `${value * 100}%` }} />
        {gap > 0 && (
          <span
            className="absolute inset-y-0 rounded-r-full border-2 border-pen bg-pen-soft"
            style={{ left: `${value * 100}%`, width: `${gap * 100}%` }}
          />
        )}
      </span>
    </div>
  );
}

function CriterionRow({
  mark,
  detail,
  busy,
  onSet,
}: {
  mark: CriterionMark;
  detail: CriterionEvaluation | undefined;
  busy: boolean;
  onSet: (points: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(mark.points ?? mark.suggested));
  const suggestionLevel = letterForMarks([mark], "suggested");
  const handed = detail?.submissionScore ?? 0;
  const explained = detail?.defenseScore ?? 0;
  const decided = mark.points !== null;
  const startEditing = () => {
    setValue(String(mark.points ?? mark.suggested));
    setEditing(true);
  };

  return (
    <li className="grid gap-2.5 border-t border-rule pt-4 first:border-t-0 first:pt-0">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-bold">{mark.name}</span>
        <span className="text-[0.875rem] text-graphite">vale {mark.weight}%</span>
      </p>
      {(mark.evidenceQuote || mark.misconception) && (
        <p className="grid grid-cols-[1.125rem_minmax(0,1fr)] gap-2 text-[0.9375rem]">
          <QuoteIcon size={16} className="mt-0.5 text-graphite" />
          <span>
            {mark.evidenceQuote && <span className="italic">«{mark.evidenceQuote.replace(/^[«"“\s]+|[»"”\s]+$/g, "")}»</span>}
            {mark.evidenceQuote && mark.misconception && " "}
            {mark.misconception && <span className="text-pen">{mark.misconception}</span>}
          </span>
        </p>
      )}
      {detail && (
        <div className="grid gap-1.5" aria-label={`Entregó ${Math.round(handed * 100)}%, explicó ${Math.round(explained * 100)}%`} role="img">
          <Bar label="Entregó" value={handed} tone="brand" />
          <Bar label="Explicó" value={explained} gap={Math.max(0, handed - explained)} tone="ink" />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-md)] bg-subtle px-3 py-2">
        <span className="eyebrow inline-flex items-center gap-1.5">
          <SparklesIcon size={14} /> La IA sugiere
        </span>
        <span className={`chip ${suggestionLevel === "AD" || suggestionLevel === "A" ? "chip-success" : suggestionLevel === "B" ? "chip-highlight" : "chip-danger"}`}>
          {LETTER_LABEL[suggestionLevel]}
        </span>
        <span className="font-bold tabular-nums">
          {formatNumber(mark.suggested)}/{formatNumber(mark.max)}
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {editing ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const points = Number(value);
                if (value === "" || points < 0 || points > mark.max) return;
                onSet(points);
                setEditing(false);
              }}
            >
              <input
                type="number"
                min={0}
                max={mark.max}
                step="0.5"
                autoFocus
                aria-label={`Puntos para ${mark.name}, de 0 a ${formatNumber(mark.max)}`}
                className="min-h-10! w-20! py-1.5! text-right"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <span className="text-graphite">/{formatNumber(mark.max)}</span>
              <button className="btn btn-sm" disabled={busy}>
                Guardar
              </button>
              <button type="button" className="btn-quiet" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </form>
          ) : decided ? (
            <>
              <span className="inline-flex items-center gap-1.5 font-bold text-success">
                <UserCheckIcon size={16} />
                {mark.points === mark.suggested ? "Confirmado por ti" : `Cambiado por ti: ${formatNumber(mark.points!)}/${formatNumber(mark.max)}`}
              </span>
              <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={startEditing}>
                Cambiar
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-sm" disabled={busy} onClick={() => onSet(mark.suggested)}>
                Confirmar
              </button>
              <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={startEditing}>
                Cambiar
              </button>
            </>
          )}
        </span>
      </div>
    </li>
  );
}

function ReviewBody({
  assignment,
  teacherKey,
  session,
  send,
  busy,
  submission,
  marks,
  nextAlias,
  onDone,
}: PanelProps & { submission: Submission; marks: CriterionMark[]; nextAlias: string | null; onDone: () => void }) {
  const [comment, setComment] = useState(submission.comment ?? "");
  const [commentSaved, setCommentSaved] = useState(false);
  useEffect(() => setComment(submission.comment ?? ""), [submission.comment]);

  const literal = session.grading === "literal";
  const reviewed = marks.filter((m) => m.points !== null).length;
  const total = marks.length;
  const ready = reviewed === total;
  const finalValue = literal ? letterForMarks(marks, "final") : marksTotal(marks, "final");
  const suggestion = suggestedGrade(session, marks);
  const post = (body: object) => send("POST", { submissionId: submission.id, ...body });

  async function saveComment() {
    if (comment === (submission.comment ?? "")) return true;
    const ok = await post({ comment });
    if (ok) setCommentSaved(true);
    return Boolean(ok);
  }

  async function saveGrade() {
    if (!(await saveComment())) return;
    if (await post(literal ? { letter: finalValue } : { grade: finalValue })) onDone();
  }

  return (
    <div className="grid gap-5 border-t border-rule px-4 pb-5 pt-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-rule px-3 py-2.5">
        <FileTextIcon className="text-brand-text" />
        <span className="grid min-w-0 flex-1">
          <span className="font-bold">Su entrega</span>
          <span className="text-[0.875rem] text-graphite">{workMeta(submission)}</span>
        </span>
        <LinkToWork assignment={assignment} teacherKey={teacherKey} submission={submission} />
      </div>

      <section className="grid gap-4" aria-label="Cómo sale la nota, criterio por criterio">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[1.0625rem]">Cómo sale la nota, criterio por criterio</h3>
          <span className="flex flex-wrap items-center gap-3 text-[0.8125rem] text-graphite" aria-hidden="true">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-brand" /> Entregó
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-ink" /> Explicó
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full border-2 border-pen bg-pen-soft" /> Entregó pero no supo explicar
            </span>
          </span>
        </div>
        <ul className="grid gap-4">
          {marks.map((m) => (
            <CriterionRow
              key={m.criterionId}
              mark={m}
              detail={submission.evaluation?.perCriterion.find((p) => p.criterionId === m.criterionId)}
              busy={busy}
              onSet={(points) => void post({ criterionId: m.criterionId, points })}
            />
          ))}
        </ul>
        <p className="text-[0.875rem] text-graphite">
          Lee la evidencia de cada criterio y confirma o cambia lo que sugiere la IA. No hay «aceptar todo»: {submission.alias} verá esta misma lista con su
          nota.
        </p>
      </section>

      <div className="grid gap-4 rounded-[var(--radius-lg)] border-2 border-ink bg-highlight-subtle p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-x-5 gap-y-2">
          <div className="grid">
            <span className="eyebrow inline-flex items-center gap-1.5">
              <SparklesIcon size={14} /> La IA sugiere
            </span>
            <span className="stat-value font-display">{gradeText(session, suggestion)}</span>
            {typeof suggestion === "string" && <span className="font-bold">{LETTER_LABEL[suggestion]}</span>}
          </div>
          {submission.evaluation?.summary && <p className="min-w-[14rem] flex-1 leading-relaxed">{submission.evaluation.summary}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" disabled={busy || !ready} onClick={() => void saveGrade()}>
            Guardar nota {gradeText(session, finalValue)}
          </button>
          <button
            type="button"
            className="btn-secondary border-pen! text-pen!"
            disabled={busy}
            onClick={async () => {
              if (await post({ redo: true })) onDone();
            }}
          >
            Pedir que explique de nuevo
          </button>
        </div>
        <p className="text-[0.875rem]" role="status">
          {ready
            ? isGraded(submission)
              ? `Nota guardada: ${gradeText(session, finalGrade(session, submission))}. Si cambias un criterio, vuelve a guardarla.`
              : "Lista para guardar."
            : `Se activa cuando confirmes o cambies los ${total} criterios (llevas ${reviewed} de ${total}).`}
          {nextAlias && ` Después se abre el siguiente alumno por revisar: ${nextAlias}.`}
        </p>
      </div>

      <label className="grid gap-1.5">
        <span className="font-bold">Comentario para {submission.alias} (lo verá con su nota)</span>
        <textarea
          rows={2}
          maxLength={1000}
          placeholder="Ej.: Buen trabajo. Practica explicar cómo sabes que tu respuesta es correcta."
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setCommentSaved(false);
          }}
          onBlur={() => void saveComment()}
        />
        <span className="text-[0.875rem] text-success" role="status">
          {commentSaved ? "Comentario guardado." : ""}
        </span>
      </label>
    </div>
  );
}

function StudentCard(
  props: PanelProps & {
    submission: Submission;
    help: boolean;
    open: boolean;
    onToggle: () => void;
    nextAlias: string | null;
    onDone: () => void;
  },
) {
  const { assignment, session, submission: s, help, open, onToggle } = props;
  const marks = criterionMarks(session, assignment.redesign.criteria, s);
  const graded = isGraded(s);
  const answering = !s.evaluation && !graded;
  const bodyId = `revision-${s.id}`;

  return (
    <li className={`card overflow-hidden ${open ? "border-2 border-ink" : help ? "border-2 border-pen" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5 sm:px-5">
        <h3 className="text-[1.1875rem]">{s.alias}</h3>
        {help && <span className="chip chip-danger chip-dot">Necesita ayuda</span>}
        {answering ? (
          <span className="chip chip-brand chip-dot">Respondiendo ahora</span>
        ) : graded ? (
          <span className="chip chip-success chip-dot">Nota aceptada</span>
        ) : (
          <span className="chip chip-highlight chip-dot">Por revisar</span>
        )}
        <span className="ml-auto flex items-center gap-3">
          {!answering && (
            <span className="grid justify-items-end">
              <span className="eyebrow">{graded ? "Nota final" : "Nota de la IA"}</span>
              <span className="font-display text-[1.375rem] font-bold tabular-nums leading-tight">
                {gradeText(session, graded ? finalGrade(session, s) : suggestedGrade(session, marks))}
              </span>
            </span>
          )}
          {!answering && (
            <button type="button" className={open ? "btn-quiet" : graded ? "btn-secondary btn-sm" : "btn btn-sm"} aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
              {open ? "Cerrar" : graded ? "Cambiar" : "Revisar"}
            </button>
          )}
        </span>
        {answering && (
          <p className="w-full text-[0.9375rem] text-graphite">
            {s.redoRequested ? "Le pediste que explique de nuevo. " : ""}La IA sugiere su nota cuando termine.
          </p>
        )}
      </div>
      {open && !answering && (
        <div id={bodyId}>
          <ReviewBody {...props} marks={marks} />
        </div>
      )}
    </li>
  );
}

/** D5 · Entregas con nota: each student's evidence, criterion by criterion, and the teacher's decision. */
export function WrittenReview(
  props: PanelProps & { onAnalyze: () => void; analyzing: boolean },
) {
  const { assignment } = props;
  const { toReview, graded, answering, needsHelp } = reviewOrder(assignment);
  const [openId, setOpenId] = useState<string | null>(toReview[0]?.id ?? null);
  const ordered = [...toReview, ...graded, ...answering];
  const evaluated = toReview.length + graded.length;
  const insights = assignment.insights;

  const nextAfter = (id: string) => toReview.find((s) => s.id !== id) ?? null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="grid gap-3" aria-labelledby="alumnos-titulo">
        <h2 id="alumnos-titulo" className="text-[1.375rem]">
          Tus alumnos
        </h2>
        <ul className="grid gap-3">
          {ordered.map((s) => {
            const next = nextAfter(s.id);
            return (
              <StudentCard
                key={s.id}
                {...props}
                submission={s}
                help={needsHelp(s)}
                open={openId === s.id}
                onToggle={() => setOpenId(openId === s.id ? null : s.id)}
                nextAlias={next?.alias ?? null}
                onDone={() => setOpenId(next?.id ?? null)}
              />
            );
          })}
        </ul>
      </section>

      <div className="grid gap-5 lg:sticky lg:top-24">
        <PublishCard {...props} reviewed={graded.length} total={evaluated} showDecides />

        <section className="card grid gap-4 p-5" aria-labelledby="repasar-titulo">
          <h2 id="repasar-titulo" className="text-[1.25rem]">
            Qué repasar en clase
          </h2>
          {evaluated === 0 && <p className="text-graphite">Aparece cuando respondan los alumnos.</p>}
          {insights && insights.clusters.length === 0 && <p>No aparecieron errores repetidos.</p>}
          {insights && insights.clusters.length > 0 && (
            <ul className="grid gap-5">
              {insights.clusters.map((c) => (
                <li key={c.label} className="grid gap-2">
                  <h3 className="text-[1rem] leading-snug">
                    {c.label} <span className="font-normal text-graphite">({c.studentAliases.length === 1 ? "1 alumno" : `${c.studentAliases.length} alumnos`})</span>
                  </h3>
                  {c.quotes[0] && <p className="text-[0.9375rem] italic text-graphite">&ldquo;{c.quotes[0]}&rdquo;</p>}
                  <details className="rounded-[var(--radius-md)] bg-highlight-subtle">
                    <summary className="cursor-pointer px-3.5 py-2.5 text-[0.9375rem] font-bold">Ver actividad de 10 minutos</summary>
                    <p className="px-3.5 pb-3.5 text-[0.9375rem]">{c.suggestion}</p>
                  </details>
                </li>
              ))}
            </ul>
          )}
          {evaluated > 0 && !assignment.demo && (
            <button type="button" className="btn-secondary justify-self-start" disabled={props.analyzing} onClick={props.onAnalyze}>
              {props.analyzing ? "Analizando la clase…" : insights ? "Volver a analizar" : "Analizar la clase"}
            </button>
          )}
          {props.analyzing && <Waiting steps={INSIGHT_STEPS} expected="suele tardar menos de un minuto" />}
        </section>
      </div>
    </div>
  );
}
