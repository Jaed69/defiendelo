"use client";

import Link from "next/link";
import { FileTextIcon, SparklesIcon, UserCheckIcon } from "@/app/components/icons";
import { type CriterionMark, LETTER_LABEL, marksTotal } from "@/domain/grading";
import type { StudentView } from "@/domain/session";
import type { CriterionEvaluation, Letter } from "@/domain/types";
import { criterionVerdict, formatPoints, gradeShown, teacherChange } from "../student-copy";
import { Pill, type PillTone, WorkToggle } from "../ui";

const LEVEL_TONE: Record<Letter, PillTone> = { AD: "success", A: "success", B: "highlight", C: "pen" };

function Bar({ label, value, gap = 0, tone }: { label: string; value: number; gap?: number; tone: "ink" | "brand" }) {
  const pct = (n: number) => `${Math.round(Math.max(0, Math.min(1, n)) * 100)}%`;
  return (
    <div className="flex items-center gap-3">
      <span className="w-[76px] shrink-0 text-sm text-graphite">{label}</span>
      <span className="flex h-3.5 min-w-0 flex-1 overflow-hidden rounded-[8px] bg-subtle" role="img" aria-label={`${label}: ${pct(value)}`}>
        <span className={tone === "ink" ? "bg-inverse" : "bg-brand"} style={{ width: pct(value) }} />
        {gap > 0 && <span className="border border-[var(--color-text-danger)] bg-pen-soft" style={{ width: pct(gap) }} />}
      </span>
    </div>
  );
}

function Criterion({ mark, scores }: { mark: CriterionMark; scores: CriterionEvaluation | undefined }) {
  const verdict = criterionVerdict(mark);
  const change = teacherChange(mark);
  const points = `${formatPoints(mark.points ?? mark.suggested)}/${formatPoints(mark.max)}`;
  const submitted = scores?.submissionScore ?? 0;
  const explained = scores?.defenseScore ?? 0;
  return (
    <li className="grid gap-3 border-t border-rule pt-4 md:grid-cols-2 md:gap-6">
      <div className="grid content-start gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[1.0625rem]! font-bold">{mark.name}</h3>
          <span className="font-bold tabular-nums md:hidden">{points}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={LEVEL_TONE[mark.level]} className="px-2.5!">
            {LETTER_LABEL[mark.level]}
          </Pill>
          <span className="text-sm text-graphite">
            {mark.evidence === "defensa" ? "En la defensa" : "En la entrega"} · vale {mark.weight}%
          </span>
        </div>
        {scores && <Bar label="Entregaste" value={submitted} tone="ink" />}
        {scores && mark.evidence === "defensa" && <Bar label="Explicaste" value={explained} gap={Math.max(0, submitted - explained)} tone="brand" />}
      </div>
      <div className="grid content-start gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`font-bold ${verdict.good ? "text-success" : "text-pen"}`}>{verdict.title}</p>
          <span className="hidden font-bold tabular-nums md:inline">{points}</span>
        </div>
        {verdict.text && <p>{verdict.text}</p>}
        {change && (
          <p className="flex items-center gap-1.5 text-sm font-bold text-brand-text">
            <UserCheckIcon size={14} /> {change}
          </p>
        )}
      </div>
    </li>
  );
}

/** A6 · Mi evaluación: the grade, the teacher's comment and how each rubric criterion added up. */
export function Result({
  view,
  title,
  subject,
  backToList,
  justSent,
}: {
  view: StudentView;
  title: string;
  subject: string;
  backToList: boolean;
  justSent: boolean;
}) {
  const result = view.result!;
  const shown = gradeShown(result, view.grading, view.gradeScale);
  const marks = result.criteria;
  const scoresOf = (id: string) => result.evaluation?.perCriterion.find((p) => p.criterionId === id);
  const maxTotal = marks.reduce((sum, m) => sum + m.max, 0);
  const words = view.work.trim().split(/\s+/).filter(Boolean).length;
  const anyDefense = marks.some((m) => m.evidence === "defensa");

  return (
    <section className="rise grid gap-5">
      {backToList && (
        <Link href="/alumno" className="inline-flex min-h-11 items-center justify-self-start font-bold text-brand-text">
          ← Mis evaluaciones
        </Link>
      )}
      {justSent && (
        <p role="status" className="rounded-[var(--radius-lg)] bg-success-subtle px-3 py-2.5 font-bold text-success">
          ¡Listo! Enviaste tus respuestas.
        </p>
      )}
      <header className="grid gap-1">
        <p className="text-sm text-graphite">{subject}</p>
        <h1 className="text-[clamp(1.875rem,4vw,2.5rem)]! leading-tight!">{title}</h1>
      </header>

      <section className="grid gap-3 rounded-[var(--radius-lg)] border border-ink bg-surface p-5 md:grid-cols-[auto_1fr] md:gap-8 md:p-6" aria-label="Tu nota">
        <div className="grid content-start justify-items-start gap-3">
          <p className="eyebrow">Tu nota</p>
          {shown ? (
            <p className="font-display text-[3.5rem] leading-none font-extrabold tabular-nums">{shown.value}</p>
          ) : (
            <p className="text-graphite">Sin nota todavía.</p>
          )}
          {shown?.label && <p className="font-bold">{shown.label}</p>}
          {shown && (shown.byTeacher ? <Pill tone="success">Puesta por tu profe</Pill> : <Pill tone="brand">Revisión al momento</Pill>)}
        </div>
        <div className="grid content-start gap-3">
          {result.comment && (
            <div className="grid gap-2 rounded-[var(--radius-lg)] bg-subtle p-4">
              <p className="eyebrow">Comentario de tu profe</p>
              <p className="text-[1.0625rem]">“{result.comment}”</p>
            </div>
          )}
          <p className="flex items-start gap-2 text-sm text-graphite">
            <span className="mt-0.5 text-brand-text">
              <SparklesIcon size={16} />
            </span>
            {shown?.byTeacher
              ? "La IA hizo una primera revisión. Tu profe la leyó y decidió tu nota."
              : "La IA hizo esta revisión al momento. Tu profe la puede cambiar."}
          </p>
        </div>
      </section>

      {marks.length > 0 && (
        <section className="grid gap-4 rounded-[var(--radius-lg)] border border-rule bg-surface p-5 md:p-6" aria-labelledby="como-se-calculo">
          <h2 id="como-se-calculo" className="text-[1.375rem]!">
            Cómo se calculó tu nota
          </h2>
          <p className="text-sm text-graphite">
            Tu nota sale de la rúbrica de tu profe. En lo que se califica «en la defensa» cuenta lo que explicaste, no solo lo que entregaste.
          </p>
          <div className="grid gap-2 rounded-[var(--radius-lg)] border border-rule bg-page px-3.5 py-2.5">
            <p className="flex items-center gap-2.5">
              <span className="text-graphite">
                <FileTextIcon size={22} />
              </span>
              <span className="grid">
                <span className="text-sm font-bold">Lo que entregaste</span>
                <span className="text-sm text-graphite">{words} palabras</span>
              </span>
            </p>
            <WorkToggle work={view.work} label="Ver lo que entregaste" className="btn-quiet" />
          </div>
          {anyDefense && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-graphite" aria-label="Leyenda">
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3 w-[22px] rounded-[8px] bg-inverse" /> Entregaste
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3 w-[22px] rounded-[8px] bg-brand" /> Explicaste
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3 w-[22px] rounded-[8px] border border-[var(--color-text-danger)] bg-pen-soft" /> Entregaste pero no supiste explicar
              </li>
            </ul>
          )}
          <ul className="grid gap-4">
            {marks.map((m) => (
              <Criterion key={m.criterionId} mark={m} scores={scoresOf(m.criterionId)} />
            ))}
          </ul>
          <p className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-brand-subtle px-4 py-3 font-bold">
            <span>Tu nota (suma de los puntos)</span>
            <span className="text-lg tabular-nums">
              {formatPoints(marksTotal(marks))}/{formatPoints(maxTotal)}
            </span>
          </p>
        </section>
      )}

      {marks.length === 0 && result.perQuestion.some((q) => q.score != null) && (
        <ul className="grid divide-y divide-[var(--color-border-default)] rounded-[var(--radius-lg)] border border-rule bg-surface" aria-label="Nota por pregunta">
          {result.perQuestion.map((q, i) => (
            <li key={i} className="flex items-start gap-3 p-4">
              <span className="font-bold text-graphite">P{i + 1}</span>
              <p className="line-clamp-3 flex-1 text-[0.9375rem]">{q.question}</p>
              <span className="font-bold tabular-nums">{q.score == null ? "—" : formatPoints(q.score)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
