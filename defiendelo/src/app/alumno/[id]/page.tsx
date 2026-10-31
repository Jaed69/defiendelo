"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/app/api-client";
import { AppBar, Logo, TeacherNote } from "@/app/components/brand";
import { AssignmentSheet, PrintSheetButton } from "@/app/components/assignment-sheet";
import { FileDrop } from "@/app/components/file-drop";
import { GapBar } from "@/app/components/gap-bar";
import { Waiting } from "@/app/components/waiting";
import type { PublicAssignment } from "@/application/use-cases";
import type { DefenseQuestion, Evaluation } from "@/domain/types";

const DEFENSE_SECONDS = 10 * 60;
const EXTRA_SECONDS = 5 * 60;
const WORK_LIMIT = 20000;

const QUESTION_STEPS = [
  { after: 0, text: "Leyendo tu entrega…" },
  { after: 8, text: "Buscando las decisiones que tomaste…" },
  { after: 20, text: "Escribiendo preguntas sobre tu propio trabajo…" },
  { after: 35, text: "Revisando que las preguntas sean claras. Ya casi." },
];

const EVALUATION_STEPS = [
  { after: 0, text: "Leyendo tus respuestas…" },
  { after: 8, text: "Comparando lo que explicaste con lo que entregaste…" },
  { after: 20, text: "Preparando tu devolución. Ya casi." },
];

type Stage = "submit" | "defend" | "done";

const STAGES: { id: Stage; label: string }[] = [
  { id: "submit", label: "Entrega" },
  { id: "defend", label: "Defensa" },
  { id: "done", label: "Resultado" },
];

/** Spoken time is coarse on purpose: screen readers hear each minute, then the last 30 and 10 seconds. */
function spokenTime(seconds: number) {
  if (seconds === 30 || seconds === 10) return `Quedan ${seconds} segundos.`;
  if (seconds > 0 && seconds % 60 === 0) return `Quedan ${seconds / 60} minutos.`;
  return null;
}

/** Remaining time as a ring that empties; the digits inside are the visible clock. */
function TimerRing({ left, total, children }: { left: number; total: number; children: React.ReactNode }) {
  const r = 34;
  const length = 2 * Math.PI * r;
  const urgent = left < 60;
  return (
    <div className="relative grid size-20 shrink-0 place-items-center">
      <svg width="80" height="80" viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-bg-subtle)" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={urgent ? "var(--color-text-danger)" : "var(--color-bg-brand)"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - left / total)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      {children}
    </div>
  );
}

export default function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<PublicAssignment | null>(null);
  const [stage, setStage] = useState<Stage>("submit");
  const [alias, setAlias] = useState("");
  const [work, setWork] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [questions, setQuestions] = useState<DefenseQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(DEFENSE_SECONDS);
  const [extended, setExtended] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sent = useRef(false);
  const questionHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    api<PublicAssignment>(`/api/assignments/${id}`).then(setAssignment, (e) => setError(e.message));
  }, [id]);

  async function startDefense(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await api<{ id: string; questions: DefenseQuestion[] }>(`/api/assignments/${id}/submissions`, {
        method: "POST",
        body: JSON.stringify({ alias, work }),
      });
      setSubmissionId(result.id);
      setQuestions(result.questions);
      setCurrent(0);
      setStage("defend");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const sendDefense = useCallback(async () => {
    if (sent.current) return;
    sent.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await api<{ evaluation: Evaluation }>(`/api/assignments/${id}/submissions/${submissionId}`, {
        method: "POST",
        body: JSON.stringify({ answers: questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "" })) }),
      });
      setEvaluation(result.evaluation);
      setStage("done");
    } catch (e) {
      sent.current = false;
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [answers, id, questions, submissionId]);

  useEffect(() => {
    if (stage !== "defend") return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    const spoken = stage === "defend" ? spokenTime(secondsLeft) : null;
    if (spoken) setAnnouncement(spoken);
    if (stage === "defend" && secondsLeft === 0) void sendDefense();
  }, [secondsLeft, sendDefense, stage]);

  useEffect(() => {
    if (stage === "defend") questionHeading.current?.focus();
  }, [current, stage]);

  const header = (
    <AppBar>
      <Logo />
      <span className="chip chip-neutral">Alumno</span>
    </AppBar>
  );

  if (!assignment) {
    return (
      <>
        {header}
        <main id="contenido" tabIndex={-1} className="container-page py-12 outline-none">
          {error ? (
            <p role="alert" className="font-bold text-pen">
              {error}
            </p>
          ) : (
            <p className="text-graphite">Cargando la tarea…</p>
          )}
        </main>
      </>
    );
  }

  const criterionName = (cid: string) => assignment.criteria.find((c) => c.id === cid)?.name ?? cid;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const question = questions[current];
  const isLast = current === questions.length - 1;
  const answered = questions.filter((q) => (answers[q.id] ?? "").trim()).length;
  const stageIndex = STAGES.findIndex((s) => s.id === stage);
  const gapOf = (p: Evaluation["perCriterion"][number]) => p.submissionScore - p.defenseScore;
  const widestGap = evaluation?.perCriterion.filter((p) => gapOf(p) >= 0.25).sort((a, b) => gapOf(b) - gapOf(a))[0]?.criterionId;

  return (
    <>
      {header}
      <main id="contenido" tabIndex={-1} className="mx-auto grid w-full max-w-2xl gap-8 px-4 py-8 outline-none sm:px-6 sm:py-10">
        <nav aria-label="Pasos" className="card px-4 py-2 shadow-none">
          <ol className="steps justify-between gap-x-2">
            {STAGES.map((s, i) => (
              <li key={s.id}>
                <span aria-current={s.id === stage ? "step" : undefined} className={i < stageIndex ? "step-done" : ""}>
                  <span className="step-number" aria-hidden="true">
                    {i < stageIndex ? "✓" : i + 1}
                  </span>
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <section className="grid gap-4">
          <span className="chip chip-brand justify-self-start">{assignment.subject}</span>
          <h1 className="text-[clamp(1.75rem,6vw,2.5rem)]">{assignment.title}</h1>
          {stage === "submit" ? (
            <>
              <AssignmentSheet
                id="hoja-tarea"
                title={assignment.title}
                subject={assignment.subject}
                statement={assignment.statement}
                aiPolicy={assignment.aiPolicy}
                criteria={assignment.criteria}
              />
              <div>
                <PrintSheetButton sheetId="hoja-tarea" />
              </div>
            </>
          ) : (
            <details>
              <summary className="btn-quiet cursor-pointer">Ver el enunciado de la tarea</summary>
              <div className="mt-3">
                <AssignmentSheet
                  title={assignment.title}
                  subject={assignment.subject}
                  statement={assignment.statement}
                  aiPolicy={assignment.aiPolicy}
                  criteria={assignment.criteria}
                />
              </div>
            </details>
          )}
        </section>

        {stage === "submit" && (
          <section className="grid gap-6">
            <div className="grid gap-2">
              <h2>Tu entrega</h2>
              <p className="prose-measure text-graphite">
                Cuando entregues, te haremos unas preguntas sobre tu trabajo. Tendrás {DEFENSE_SECONDS / 60} minutos para responderlas.
              </p>
            </div>
            <form onSubmit={startDefense} className="grid gap-6">
              <div className="grid gap-2">
                <label htmlFor="alias" className="font-bold">
                  Apodo
                </label>
                <span id="alias-hint" className="text-[0.9375rem] text-graphite">
                  Usa un apodo, no tu nombre. No guardamos datos personales.
                </span>
                <input
                  id="alias"
                  type="text"
                  required
                  maxLength={40}
                  autoComplete="off"
                  aria-describedby="alias-hint"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <label htmlFor="work" className="font-bold">
                  Tu trabajo
                </label>
                <span id="work-hint" className="text-[0.9375rem] text-graphite">
                  Pega tu trabajo o súbelo como archivo.
                </span>
                <FileDrop
                  limit={WORK_LIMIT}
                  title="Sube tu archivo"
                  hint="PDF, Word (.docx), texto o código (.py, .js, .java…)."
                  onText={setWork}
                />
                <textarea
                  id="work"
                  required
                  minLength={20}
                  maxLength={WORK_LIMIT}
                  rows={10}
                  aria-describedby="work-hint work-count"
                  className="font-mono text-[0.9375rem]"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                />
                <span id="work-count" className="text-right text-[0.9375rem] tabular-nums text-graphite">
                  {work.length.toLocaleString("es")} / {WORK_LIMIT.toLocaleString("es")} caracteres
                </span>
              </div>
              {error && (
                <p role="alert" className="font-bold text-pen">
                  {error}
                </p>
              )}
              <div className="grid gap-4">
                <button className="btn w-full" disabled={busy}>
                  {busy ? "Preparando tus preguntas…" : "Entregar y empezar mi defensa"}
                </button>
                {busy && <Waiting steps={QUESTION_STEPS} expected="suele tardar cerca de un minuto" />}
              </div>
            </form>
          </section>
        )}

        {stage === "defend" && question && (
          <section className="grid gap-5">
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-1">
                <p className="label text-graphite">
                  Pregunta {current + 1} de {questions.length}
                </p>
                {!extended && (
                  <button
                    type="button"
                    className="btn-quiet justify-self-start"
                    onClick={() => {
                      setExtended(true);
                      setSecondsLeft((s) => s + EXTRA_SECONDS);
                      setAnnouncement(`Agregamos ${EXTRA_SECONDS / 60} minutos.`);
                    }}
                  >
                    Necesito más tiempo
                  </button>
                )}
              </div>
              <TimerRing left={secondsLeft} total={DEFENSE_SECONDS + (extended ? EXTRA_SECONDS : 0)}>
                <p className={`relative font-display text-lg font-bold tabular-nums ${secondsLeft < 60 ? "text-pen" : ""}`} aria-hidden="true">
                  {minutes}:{seconds}
                </p>
              </TimerRing>
            </div>
            <p className="sr-only" aria-live="polite">
              {announcement}
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              {questions.map((q, i) => (
                <span
                  key={q.id}
                  className={`h-2 flex-1 rounded-full ${i === current ? "bg-brand" : (answers[q.id] ?? "").trim() ? "bg-inverse" : "bg-subtle"}`}
                />
              ))}
            </div>

            <div className="grid gap-3">
              <span className="chip chip-brand justify-self-start">Sobre tu trabajo</span>
              <h2 ref={questionHeading} tabIndex={-1} className="outline-none">
                {question.question}
              </h2>
              <p id="answer-hint" className="prose-measure text-graphite">
                Responde con tus palabras, en 2 a 4 oraciones. Ctrl + Enter pasa a la siguiente.
              </p>
            </div>
            <textarea
              className="ruled min-h-[12rem] rounded-[var(--radius-lg)]"
              rows={6}
              maxLength={4000}
              aria-label={`Tu respuesta a la pregunta ${current + 1}`}
              aria-describedby={`answer-hint${pasteBlocked ? " paste-note" : ""}`}
              value={answers[question.id] ?? ""}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
              onPaste={(e) => {
                e.preventDefault();
                setPasteBlocked(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  if (isLast) void sendDefense();
                  else setCurrent((c) => c + 1);
                }
              }}
            />
            {pasteBlocked && (
              <p id="paste-note" role="status" className="rounded-[var(--radius-md)] bg-highlight-subtle p-3 text-[0.9375rem] font-bold">
                En la defensa no se puede pegar texto: queremos leer tu explicación, escrita por ti.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {current > 0 && (
                <button type="button" className="btn-secondary" onClick={() => setCurrent((c) => c - 1)}>
                  Anterior
                </button>
              )}
              {isLast ? (
                <button type="button" className="btn flex-1" disabled={busy} onClick={() => void sendDefense()}>
                  {busy ? "Revisando tu defensa…" : `Enviar mi defensa (${answered} de ${questions.length} respondidas)`}
                </button>
              ) : (
                <button type="button" className="btn flex-1" onClick={() => setCurrent((c) => c + 1)}>
                  Siguiente pregunta
                </button>
              )}
            </div>
            {busy && <Waiting steps={EVALUATION_STEPS} expected="suele tardar menos de un minuto" />}
            {error && (
              <p role="alert" className="font-bold text-pen">
                {error}
              </p>
            )}
          </section>
        )}

        {stage === "done" && evaluation && (
          <section className="grid gap-6">
            <div className="grid gap-3">
              <span className="chip chip-success justify-self-start">Defensa enviada</span>
              <h2>Lo que defendiste</h2>
              <p className="prose-measure">{evaluation.summary}</p>
            </div>
            <ul className="grid gap-4">
              {evaluation.perCriterion.map((p) => (
                <li key={p.criterionId} className="card grid gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3>{criterionName(p.criterionId)}</h3>
                    {p.criterionId === widestGap && <TeacherNote>¡revisa este!</TeacherNote>}
                  </div>
                  <GapBar submitted={p.submissionScore} explained={p.defenseScore} />
                  {p.misconception && (
                    <p className="rounded-[var(--radius-md)] border-l-4 border-pen bg-danger-subtle p-4 text-[0.9375rem]">
                      <span className="label block text-pen">Para repasar</span>
                      {p.misconception}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-[0.9375rem] text-graphite">Tu profesor revisa esto y pone la nota final.</p>
          </section>
        )}
      </main>
    </>
  );
}
