"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/app/api-client";
import { AppBar, Logo, TeacherNote } from "@/app/components/brand";
import { AssignmentSheet, PrintSheetButton } from "@/app/components/assignment-sheet";
import { FileDrop } from "@/app/components/file-drop";
import { GapBar } from "@/app/components/gap-bar";
import { Waiting } from "@/app/components/waiting";
import type { PublicAssignment } from "@/application/use-cases";
import type { StudentView } from "@/domain/session";
import type { EvaluationMethod, Evaluation } from "@/domain/types";

const DEFENSE_SECONDS = 10 * 60;
const EXTRA_SECONDS = 5 * 60;
const WORK_LIMIT = 20000;
const POLL_MS = 3000;

const SUBMIT_STEPS = [
  { after: 0, text: "Guardando tu entrega…" },
  { after: 8, text: "Preparando preguntas sobre tus decisiones…" },
  { after: 25, text: "Revisando que las preguntas sean claras. Ya casi." },
];

const EVALUATION_STEPS = [
  { after: 0, text: "Enviando tus respuestas…" },
  { after: 8, text: "Comparando lo que explicaste con lo que entregaste…" },
  { after: 20, text: "Ya casi." },
];

const METHOD_LABEL: Record<EvaluationMethod, string> = {
  oral: "Defensa oral",
  escrito: "Defensa escrita en el celular",
  papel: "Evaluación escrita en papel",
};

const METHOD_HINT: Record<EvaluationMethod, string> = {
  oral: "Cuando cierre el plazo verás el orden. En tu turno, tu profe te hará preguntas sobre tu propio trabajo.",
  escrito: "Cuando tu profe abra la defensa, responderás aquí unas preguntas sobre tu propio trabajo.",
  papel: "Cuando tu profe abra la evaluación, te entregará las preguntas impresas.",
};

const STAGES = ["Entrega", "Defensa", "Resultado"];

type Saved = { sid: string; token: string };

function savedKey(id: string) {
  return `defiendelo:${id}`;
}

function readSaved(id: string): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(savedKey(id)) ?? "null");
  } catch {
    return null;
  }
}

/** Spoken time is coarse on purpose: screen readers hear each minute, then the last 30 and 10 seconds. */
function spokenTime(seconds: number) {
  if (seconds === 30 || seconds === 10) return `Quedan ${seconds} segundos.`;
  if (seconds > 0 && seconds % 60 === 0) return `Quedan ${seconds / 60} minutos.`;
  return null;
}

function countdown(deadline: string, now: number) {
  const left = Math.max(0, Math.floor((new Date(deadline).getTime() - now) / 1000));
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = String(left % 60).padStart(2, "0");
  return left === 0 ? null : h ? `${h} h ${m} min` : `${m}:${s}`;
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

function Deadline({ deadline }: { deadline: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);
  if (!deadline) return null;
  const left = countdown(deadline, now);
  const at = new Date(deadline).toLocaleString("es", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <span className={`chip justify-self-start ${left ? "chip-neutral" : "chip-danger"}`}>
      {left ? `Cierra en ${left} (${at})` : `Plazo cerrado (${at})`}
    </span>
  );
}

/** Written defense on the phone: one question at a time, timed, paste blocked. */
function WrittenDefense({ view, onSend, busy }: { view: StudentView; onSend: (answers: Record<string, string>) => Promise<void>; busy: boolean }) {
  const questions = view.questions;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DEFENSE_SECONDS);
  const [extended, setExtended] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const sent = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  const send = useCallback(async () => {
    if (sent.current) return;
    sent.current = true;
    await onSend(answers).catch(() => (sent.current = false));
  }, [answers, onSend]);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const spoken = spokenTime(secondsLeft);
    if (spoken) setAnnouncement(spoken);
    if (secondsLeft === 0) void send();
  }, [secondsLeft, send]);

  useEffect(() => heading.current?.focus(), [current]);

  const question = questions[current];
  if (!question) return null;
  const isLast = current === questions.length - 1;
  const answered = questions.filter((q) => (answers[q.id] ?? "").trim()).length;

  return (
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
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
          </p>
        </TimerRing>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div className="flex gap-1.5" aria-hidden="true">
        {questions.map((q, i) => (
          <span key={q.id} className={`h-2 flex-1 rounded-full ${i === current ? "bg-brand" : (answers[q.id] ?? "").trim() ? "bg-inverse" : "bg-subtle"}`} />
        ))}
      </div>
      <div className="grid gap-3">
        <span className="chip chip-brand justify-self-start">Sobre tu trabajo</span>
        <h2 ref={heading} tabIndex={-1} className="outline-none">
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
            if (isLast) void send();
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
          <button type="button" className="btn flex-1" disabled={busy} onClick={() => void send()}>
            {busy ? "Enviando tu defensa…" : `Enviar mi defensa (${answered} de ${questions.length} respondidas)`}
          </button>
        ) : (
          <button type="button" className="btn flex-1" onClick={() => setCurrent((c) => c + 1)}>
            Siguiente pregunta
          </button>
        )}
      </div>
      {busy && <Waiting steps={EVALUATION_STEPS} expected="suele tardar menos de un minuto" />}
    </section>
  );
}

/** Oral queue: everyone sees the order, the student sees their place and who is presenting. */
function Queue({ view }: { view: StudentView }) {
  return (
    <section className="grid gap-5">
      <div className="grid gap-2">
        <span className="chip chip-brand justify-self-start">{METHOD_LABEL.oral}</span>
        <h2>{view.position ? `Eres el n.º ${view.position} de ${view.queue.length}` : "Esperando el orden"}</h2>
        <p className="prose-measure text-graphite" role="status">
          {view.presenting ? `Ahora defiende ${view.presenting}.` : "Tu profe todavía no llama al primero."} Mantén esta pantalla abierta: te avisamos aquí.
        </p>
      </div>
      <ol className="card grid gap-1 p-3">
        {view.queue.map((alias, i) => {
          const me = i + 1 === view.position;
          const now = alias === view.presenting;
          return (
            <li
              key={`${alias}-${i}`}
              aria-current={me ? "true" : undefined}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 ${me ? "bg-brand-subtle font-bold" : ""}`}
            >
              <span className="w-6 text-right tabular-nums text-graphite">{i + 1}</span>
              <span className="flex-1">
                {alias}
                {me && " (tú)"}
              </span>
              {now && <span className="chip chip-danger">Defendiendo</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Result({ view, criterionName }: { view: StudentView; criterionName: (id: string) => string }) {
  const result = view.result!;
  const evaluation: Evaluation | null = result.evaluation;
  const gapOf = (p: Evaluation["perCriterion"][number]) => p.submissionScore - p.defenseScore;
  const widestGap = evaluation?.perCriterion.filter((p) => gapOf(p) >= 0.25).sort((a, b) => gapOf(b) - gapOf(a))[0]?.criterionId;
  return (
    <section className="grid gap-6">
      <div className="card grid justify-items-start gap-2 p-5 sm:p-6">
        <span className="label text-graphite">Tu nota</span>
        {result.grade == null ? (
          <p className="text-graphite">Tu profe aún no te puso nota.</p>
        ) : (
          <p className="font-display text-5xl font-extrabold tabular-nums">
            {result.grade}
            <span className="text-2xl text-graphite"> / {view.gradeScale}</span>
          </p>
        )}
      </div>
      {result.perQuestion.length > 0 && (
        <div className="grid gap-3">
          <h2>Pregunta por pregunta</h2>
          <ul className="grid gap-3">
            {result.perQuestion.map((q, i) => (
              <li key={i} className="card flex items-start justify-between gap-4 p-4">
                <p className="prose-measure">{q.question}</p>
                <span className="shrink-0 font-bold tabular-nums">{q.score == null ? "—" : `${q.score} / ${view.gradeScale}`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {evaluation && (
        <div className="grid gap-4">
          <h2>Lo que defendiste</h2>
          <p className="prose-measure">{evaluation.summary}</p>
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
        </div>
      )}
    </section>
  );
}

function Notice({ chip, title, children }: { chip: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card grid gap-3 p-5 sm:p-6" role="status">
      <span className="chip chip-success justify-self-start">{chip}</span>
      <h2>{title}</h2>
      <p className="prose-measure text-graphite">{children}</p>
    </section>
  );
}

export default function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<PublicAssignment | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [view, setView] = useState<StudentView | null>(null);
  const [alias, setAlias] = useState("");
  const [work, setWork] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<PublicAssignment>(`/api/assignments/${id}`).then(setAssignment, (e) => setError(e.message));
    setSaved(readSaved(id));
  }, [id]);

  const refresh = useCallback(async () => {
    if (!saved) return;
    try {
      setView(await api<StudentView>(`/api/assignments/${id}/submissions/${saved.sid}`, { headers: { "x-student-token": saved.token } }));
    } catch {
      // ponytail: a lost or foreign token just starts over with a new submission.
      try {
        localStorage.removeItem(savedKey(id));
      } catch {}
      setSaved(null);
    }
  }, [id, saved]);

  // ponytail: polling every 3 s; switch to SSE or websockets if a class of 40 phones is too much for the store.
  const published = view?.status === "publicado";
  useEffect(() => {
    if (!saved || published) return;
    void refresh();
    const timer = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [published, refresh, saved]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (editing && saved) {
        await api(`/api/assignments/${id}/submissions/${saved.sid}`, {
          method: "PUT",
          headers: { "x-student-token": saved.token },
          body: JSON.stringify({ work }),
        });
        await refresh();
        setEditing(false);
        return;
      }
      const result = await api<{ id: string; token: string }>(`/api/assignments/${id}/submissions`, {
        method: "POST",
        body: JSON.stringify({ alias, work }),
      });
      const next = { sid: result.id, token: result.token };
      try {
        localStorage.setItem(savedKey(id), JSON.stringify(next));
      } catch {}
      setSaved(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const sendDefense = useCallback(
    async (answers: Record<string, string>) => {
      if (!saved || !view) return;
      setBusy(true);
      setError(null);
      try {
        await api(`/api/assignments/${id}/submissions/${saved.sid}`, {
          method: "POST",
          headers: { "x-student-token": saved.token },
          body: JSON.stringify({ answers: view.questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "" })) }),
        });
        await refresh();
      } catch (e) {
        setError((e as Error).message);
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [id, refresh, saved, view],
  );

  const header = (
    <AppBar>
      <Logo />
      <span className="chip chip-neutral">Alumno</span>
    </AppBar>
  );

  if (!assignment || (saved && !view)) {
    return (
      <>
        {header}
        <main id="contenido" tabIndex={-1} className="container-page py-12 outline-none">
          {error ? (
            <p role="alert" className="font-bold text-pen">
              {error}
            </p>
          ) : (
            <p className="text-graphite">Cargando…</p>
          )}
        </main>
      </>
    );
  }

  const { method, deadline } = assignment.session;
  const criterionName = (cid: string) => assignment.criteria.find((c) => c.id === cid)?.name ?? cid;
  const status = view?.status;
  const stageIndex = !view ? 0 : status === "publicado" ? 2 : 1;

  return (
    <>
      {header}
      <main id="contenido" tabIndex={-1} className="mx-auto grid w-full max-w-2xl gap-8 px-4 py-8 outline-none sm:px-6 sm:py-10">
        <nav aria-label="Pasos" className="card px-4 py-2 shadow-none">
          <ol className="steps justify-between gap-x-2">
            {STAGES.map((label, i) => (
              <li key={label}>
                <span aria-current={i === stageIndex ? "step" : undefined} className={i < stageIndex ? "step-done" : ""}>
                  <span className="step-number" aria-hidden="true">
                    {i < stageIndex ? "✓" : i + 1}
                  </span>
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <section className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="chip chip-brand">{assignment.subject}</span>
            <span className="chip chip-neutral">{METHOD_LABEL[method]}</span>
          </div>
          <h1 className="text-[clamp(1.75rem,6vw,2.5rem)]">{assignment.title}</h1>
          {!view && <Deadline deadline={deadline} />}
          {!view ? (
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

        {!view && !assignment.acceptsSubmissions && (
          <Notice chip="Entregas cerradas" title="Ya no se reciben entregas">
            El plazo de esta tarea terminó. Si crees que es un error, avísale a tu profe.
          </Notice>
        )}

        {((!view && assignment.acceptsSubmissions) || (editing && status === "entregado")) && (
          <section className="grid gap-6">
            <div className="grid gap-2">
              <h2>{editing ? "Cambiar mi entrega" : "Tu entrega"}</h2>
              <p className="prose-measure text-graphite">
                {editing ? "Tu nueva versión reemplaza a la anterior. Las preguntas se harán sobre esta versión." : METHOD_HINT[method]}
              </p>
            </div>
            <form onSubmit={submit} className="grid gap-6">
              {!editing && (
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
              )}
              <div className="grid gap-3">
                <label htmlFor="work" className="font-bold">
                  Tu trabajo
                </label>
                <span id="work-hint" className="text-[0.9375rem] text-graphite">
                  Pega tu trabajo o súbelo como archivo.
                </span>
                <FileDrop limit={WORK_LIMIT} title="Sube tu archivo" hint="PDF, Word (.docx), texto o código (.py, .js, .java…)." onText={setWork} />
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
                  {busy ? "Entregando…" : editing ? "Guardar mi nueva versión" : "Entregar mi trabajo"}
                </button>
                {editing && !busy && (
                  <button type="button" className="btn-secondary w-full" onClick={() => setEditing(false)}>
                    Cancelar, dejar la entrega anterior
                  </button>
                )}
                {busy && <Waiting steps={SUBMIT_STEPS} expected="suele tardar cerca de un minuto" />}
              </div>
            </form>
          </section>
        )}

        {status === "entregado" && !editing && (
          <>
            <Notice chip="Entregado ✓" title={`Listo, ${view!.alias}`}>
              {METHOD_HINT[method]} Puedes cerrar esta pestaña y volver con el mismo enlace.
            </Notice>
            <Deadline deadline={deadline} />
            <details className="card p-5">
              <summary className="btn-quiet cursor-pointer">Ver lo que entregaste</summary>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap font-mono text-[0.9375rem]">{view!.work}</pre>
            </details>
            {view!.canReplace && (
              <button
                type="button"
                className="btn-secondary justify-self-start"
                onClick={() => {
                  setWork(view!.work);
                  setError(null);
                  setEditing(true);
                }}
              >
                Cambiar mi entrega
              </button>
            )}
          </>
        )}

        {status === "en_cola" && <Queue view={view!} />}

        {status === "turno" && (
          <section className="card grid gap-4 border-brand p-5 sm:p-6" role="alert">
            <span className="chip chip-danger justify-self-start">¡Te toca!</span>
            <h2 className="text-[clamp(2rem,8vw,3rem)]">{view!.alias}, acércate a tu profe</h2>
            {view!.question && (
              <div className="grid gap-2 rounded-[var(--radius-md)] bg-brand-subtle p-4">
                <span className="label text-brand-text">
                  Pregunta {view!.question.number} de {view!.question.total}
                </span>
                <p className="font-display text-xl font-bold">{view!.question.text}</p>
              </div>
            )}
          </section>
        )}

        {status === "responder" && (
          <>
            <WrittenDefense view={view!} onSend={sendDefense} busy={busy} />
            {error && (
              <p role="alert" className="font-bold text-pen">
                {error}
              </p>
            )}
          </>
        )}

        {status === "papel" && (
          <Notice chip={METHOD_LABEL.papel} title="Tu evaluación es en papel">
            Tu profe te entregará las preguntas impresas. Cuando publique las notas, las verás aquí.
          </Notice>
        )}

        {status === "evaluado" && (
          <Notice chip="Defensa terminada ✓" title="Ya te evaluaron">
            Tu nota aparecerá aquí cuando tu profe publique los resultados.
          </Notice>
        )}

        {status === "publicado" && <Result view={view!} criterionName={criterionName} />}
      </main>
    </>
  );
}
