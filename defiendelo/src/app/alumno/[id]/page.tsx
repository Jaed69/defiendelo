"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/app/api-client";
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
  { id: "submit", label: "Tu entrega" },
  { id: "defend", label: "Tu defensa" },
  { id: "done", label: "Tu resultado" },
];

/** Spoken time is coarse on purpose: screen readers hear each minute, then the last 30 and 10 seconds. */
function spokenTime(seconds: number) {
  if (seconds === 30 || seconds === 10) return `Quedan ${seconds} segundos.`;
  if (seconds > 0 && seconds % 60 === 0) return `Quedan ${seconds / 60} minutos.`;
  return null;
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

  if (!assignment) {
    return (
      <main>
        {error ? (
          <p role="alert" className="font-bold text-pen">
            {error}
          </p>
        ) : (
          <p className="text-graphite">Cargando la tarea…</p>
        )}
      </main>
    );
  }

  const criterionName = (cid: string) => assignment.criteria.find((c) => c.id === cid)?.name ?? cid;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const question = questions[current];
  const isLast = current === questions.length - 1;
  const answered = questions.filter((q) => (answers[q.id] ?? "").trim()).length;
  const stageIndex = STAGES.findIndex((s) => s.id === stage);

  return (
    <main>
      <nav aria-label="Pasos">
        <ol className="steps mb-8">
          {STAGES.map((s, i) => (
            <li key={s.id}>
              <span aria-current={s.id === stage ? "step" : undefined}>
                <span className="step-number" aria-hidden="true">
                  {i < stageIndex ? "✓" : i + 1}
                </span>
                {s.label}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <section>
        <p className="font-display font-bold text-pen">{assignment.subject}</p>
        <h1 className="mt-2">{assignment.title}</h1>
        {stage === "submit" ? (
          <>
            <p className="prose-measure mt-5 whitespace-pre-line">{assignment.statement}</p>
            <p className="prose-measure mt-4 border-l-4 border-ink pl-4 font-bold">{assignment.aiPolicy}</p>
          </>
        ) : (
          <details className="mt-4">
            <summary className="btn-quiet cursor-pointer">Ver el enunciado de la tarea</summary>
            <p className="prose-measure mt-3 whitespace-pre-line">{assignment.statement}</p>
          </details>
        )}
      </section>

      {stage === "submit" && (
        <section>
          <h2>Tu entrega</h2>
          <p className="prose-measure mt-2 text-graphite">
            Cuando entregues, te haremos unas preguntas sobre tu trabajo. Tendrás {DEFENSE_SECONDS / 60} minutos para responderlas.
          </p>
          <form onSubmit={startDefense} className="mt-6 grid gap-5">
            <div className="grid gap-1.5">
              <label htmlFor="alias" className="font-bold">
                Apodo
              </label>
              <span id="alias-hint" className="text-sm text-graphite">
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
            <div className="grid gap-1.5">
              <label htmlFor="work" className="font-bold">
                Tu trabajo
              </label>
              <span id="work-hint" className="text-sm text-graphite">
                Pega tu trabajo o súbelo como archivo.
              </span>
              <FileDrop
                limit={WORK_LIMIT}
                hint="PDF, Word (.docx), texto o código (.py, .js, .java…)."
                onText={setWork}
              />
              <textarea
                id="work"
                required
                minLength={20}
                maxLength={WORK_LIMIT}
                rows={12}
                aria-describedby="work-hint work-count"
                value={work}
                onChange={(e) => setWork(e.target.value)}
              />
              <span id="work-count" className="text-right text-sm tabular-nums text-graphite">
                {work.length.toLocaleString("es")} / {WORK_LIMIT.toLocaleString("es")} caracteres
              </span>
            </div>
            {error && (
              <p role="alert" className="font-bold text-pen">
                {error}
              </p>
            )}
            <div>
              <button className="btn" disabled={busy}>
                {busy ? "Preparando tus preguntas…" : "Entregar y empezar mi defensa"}
              </button>
              {busy && <Waiting steps={QUESTION_STEPS} expected="suele tardar cerca de un minuto" />}
            </div>
          </form>
        </section>
      )}

      {stage === "defend" && question && (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-graphite">
              Pregunta {current + 1} de {questions.length}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <p
                className={`font-display text-xl font-bold tabular-nums ${secondsLeft < 60 ? "text-pen" : ""}`}
                aria-hidden="true"
              >
                {minutes}:{seconds}
              </p>
              {!extended && (
                <button
                  type="button"
                  className="btn-quiet"
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
          </div>
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {questions.map((q, i) => (
              <span
                key={q.id}
                className={`h-1.5 flex-1 rounded-full ${i === current ? "bg-pen" : (answers[q.id] ?? "").trim() ? "bg-ink" : "bg-ink-soft"}`}
              />
            ))}
          </div>

          <h2 ref={questionHeading} tabIndex={-1} className="mt-6 outline-none">
            {question.question}
          </h2>
          <p id="answer-hint" className="prose-measure mt-2 text-graphite">
            Responde con tus palabras, en 2 a 4 oraciones. Ctrl + Enter pasa a la siguiente.
          </p>
          <textarea
            className="mt-4"
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
            <p id="paste-note" role="status" className="mt-2 text-sm font-bold">
              En la defensa no se puede pegar texto: queremos leer tu explicación, escrita por ti.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {current > 0 && (
              <button type="button" className="btn-outline" onClick={() => setCurrent((c) => c - 1)}>
                Anterior
              </button>
            )}
            {isLast ? (
              <button type="button" className="btn" disabled={busy} onClick={() => void sendDefense()}>
                {busy ? "Revisando tu defensa…" : `Enviar mi defensa (${answered} de ${questions.length} respondidas)`}
              </button>
            ) : (
              <button type="button" className="btn" onClick={() => setCurrent((c) => c + 1)}>
                Siguiente pregunta
              </button>
            )}
          </div>
          {busy && <Waiting steps={EVALUATION_STEPS} expected="suele tardar menos de un minuto" />}
          {error && (
            <p role="alert" className="mt-4 font-bold text-pen">
              {error}
            </p>
          )}
        </section>
      )}

      {stage === "done" && evaluation && (
        <section>
          <h2>Lo que defendiste</h2>
          <p className="prose-measure mt-3">{evaluation.summary}</p>
          <ul className="mt-6 grid gap-6">
            {evaluation.perCriterion.map((p) => (
              <li key={p.criterionId} className="grid gap-2">
                <h3>{criterionName(p.criterionId)}</h3>
                <GapBar submitted={p.submissionScore} explained={p.defenseScore} />
                {p.misconception && <p className="pen-mark">{p.misconception}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-graphite">Tu profesor revisa esto y pone la nota final.</p>
        </section>
      )}
    </main>
  );
}
