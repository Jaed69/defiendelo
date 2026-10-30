"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/app/api-client";
import { GapBar } from "@/app/components/gap-bar";
import type { PublicAssignment } from "@/application/use-cases";
import type { DefenseQuestion, Evaluation } from "@/domain/types";

const DEFENSE_SECONDS = 10 * 60;

type Stage = "submit" | "defend" | "done";

export default function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<PublicAssignment | null>(null);
  const [stage, setStage] = useState<Stage>("submit");
  const [alias, setAlias] = useState("");
  const [work, setWork] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [questions, setQuestions] = useState<DefenseQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(DEFENSE_SECONDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sent = useRef(false);

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
    if (stage === "defend" && secondsLeft === 0) void sendDefense();
  }, [secondsLeft, sendDefense, stage]);

  if (!assignment) {
    return <main>{error ? <p className="text-pen">{error}</p> : <p className="text-graphite">Cargando la tarea…</p>}</main>;
  }

  const criterionName = (cid: string) => assignment.criteria.find((c) => c.id === cid)?.name ?? cid;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <main>
      <section>
        <p className="font-display font-bold text-pen">{assignment.subject}</p>
        <h1 className="mt-2">{assignment.title}</h1>
        <p className="prose-measure mt-5 whitespace-pre-line">{assignment.statement}</p>
        <p className="prose-measure mt-4 border-l-4 border-ink pl-4 font-bold">{assignment.aiPolicy}</p>
      </section>

      {stage === "submit" && (
        <section>
          <h2>Tu entrega</h2>
          <form onSubmit={startDefense} className="mt-6 grid gap-5">
            <label className="grid gap-1.5">
              <span className="font-bold">Apodo</span>
              <span className="text-sm text-graphite">Usa un apodo, no tu nombre. No guardamos datos personales.</span>
              <input type="text" required maxLength={40} value={alias} onChange={(e) => setAlias(e.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="font-bold">Tu trabajo</span>
              <textarea required minLength={20} maxLength={20000} rows={12} value={work} onChange={(e) => setWork(e.target.value)} />
            </label>
            {error && <p className="text-pen">{error}</p>}
            <div>
              <button className="btn" disabled={busy}>
                {busy ? "Preparando tus preguntas…" : "Entregar y empezar mi defensa"}
              </button>
            </div>
          </form>
        </section>
      )}

      {stage === "defend" && (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2>Defiende tu entrega</h2>
            <p className={`font-display text-xl font-bold tabular-nums ${secondsLeft < 60 ? "text-pen" : ""}`} aria-live="polite">
              {minutes}:{seconds}
            </p>
          </div>
          <p className="prose-measure mt-2 text-graphite">
            Responde con tus palabras, en 2 a 4 oraciones. Las preguntas son sobre tu propio trabajo.
          </p>
          <ol className="mt-6 grid list-decimal gap-6 pl-5">
            {questions.map((q) => (
              <li key={q.id} className="grid gap-2">
                <span className="font-bold">{q.question}</span>
                <textarea
                  rows={4}
                  maxLength={4000}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  onPaste={(e) => e.preventDefault()}
                  aria-label={`Respuesta a: ${q.question}`}
                />
              </li>
            ))}
          </ol>
          {error && <p className="mt-4 text-pen">{error}</p>}
          <button className="btn mt-6" disabled={busy} onClick={() => void sendDefense()}>
            {busy ? "Revisando tu defensa…" : "Enviar mi defensa"}
          </button>
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
