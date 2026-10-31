"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/app/api-client";
import { AppBar, Logo, TeacherNote } from "@/app/components/brand";
import { AssignmentSheet, PrintSheetButton } from "@/app/components/assignment-sheet";
import { FileDrop } from "@/app/components/file-drop";
import { GapBar } from "@/app/components/gap-bar";
import {
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  EyeIcon,
  HourglassIcon,
  LockIcon,
  MicIcon,
  PaperclipIcon,
  PenIcon,
  PhoneIcon,
  PrinterIcon,
  SendIcon,
  StarIcon,
  UsersIcon,
} from "@/app/components/icons";
import { Waiting } from "@/app/components/waiting";
import { LETTER_LABEL } from "@/domain/grading";
import type { PublicAssignment } from "@/application/use-cases";
import type { StudentView } from "@/domain/session";
import type { Evaluation, EvaluationMethod } from "@/domain/types";

const DEFENSE_SECONDS = 10 * 60;
const EXTRA_SECONDS = 5 * 60;
const WORK_LIMIT = 20000;
const POLL_MS = 3000;

const SUBMIT_STEPS = [
  { after: 0, text: "Guardando tu entrega…" },
  { after: 8, text: "Preparando preguntas sobre tu trabajo…" },
  { after: 25, text: "Ya casi." },
];

const EVALUATION_STEPS = [
  { after: 0, text: "Enviando tus respuestas…" },
  { after: 10, text: "Ya casi." },
];

const METHOD: Record<EvaluationMethod, { label: string; Icon: typeof MicIcon }> = {
  oral: { label: "Defensa oral", Icon: MicIcon },
  escrito: { label: "Defensa en el celular", Icon: PhoneIcon },
  papel: { label: "Evaluación en papel", Icon: PrinterIcon },
};

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

/** A ring that fills with `value / total`; the children sit in the middle. */
function Ring({
  value,
  total,
  size = 80,
  tone = "var(--color-bg-brand)",
  children,
}: {
  value: number;
  total: number;
  size?: number;
  tone?: string;
  children: React.ReactNode;
}) {
  const r = size / 2 - 6;
  const length = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-bg-subtle)" strokeWidth="8" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - Math.min(1, value / total))}
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
  return (
    <span className={`chip inline-flex items-center gap-1.5 tabular-nums ${left ? "chip-neutral" : "chip-danger"}`}>
      <ClockIcon className="size-4" />
      {left ? `Cierra en ${left}` : "Plazo cerrado"}
    </span>
  );
}

/** Empty/success/waiting state: one icon, one title, at most one line. */
function StateCard({
  icon,
  tone = "brand",
  title,
  children,
}: {
  icon: React.ReactNode;
  tone?: "brand" | "success" | "neutral";
  title: string;
  children?: React.ReactNode;
}) {
  const bubble = { brand: "bg-brand-subtle text-brand-text", success: "bg-success-subtle text-success", neutral: "bg-subtle text-graphite" }[tone];
  return (
    <section className="card grid justify-items-center gap-3 px-5 py-8 text-center" role="status">
      <span className={`grid size-16 place-items-center rounded-full ${bubble}`}>{icon}</span>
      <h2>{title}</h2>
      {children && <div className="grid w-full justify-items-center gap-3 text-graphite">{children}</div>}
    </section>
  );
}

const BIG_ICON = "size-8";

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
  const urgent = secondsLeft < 60;

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
              Necesito {EXTRA_SECONDS / 60} min más
            </button>
          )}
        </div>
        <Ring value={secondsLeft} total={DEFENSE_SECONDS + (extended ? EXTRA_SECONDS : 0)} tone={urgent ? "var(--color-text-danger)" : undefined}>
          <p className={`relative font-display text-lg font-bold tabular-nums ${urgent ? "text-pen" : ""}`} aria-hidden="true">
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
          </p>
        </Ring>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div className="flex gap-1.5" aria-hidden="true">
        {questions.map((q, i) => (
          <span key={q.id} className={`h-2 flex-1 rounded-full ${i === current ? "bg-brand" : (answers[q.id] ?? "").trim() ? "bg-inverse" : "bg-subtle"}`} />
        ))}
      </div>
      <h2 ref={heading} tabIndex={-1} className="outline-none">
        {question.question}
      </h2>
      <textarea
        className="ruled min-h-[12rem] rounded-[var(--radius-lg)]"
        rows={6}
        maxLength={4000}
        placeholder="Con tus palabras, en 2 a 4 oraciones."
        aria-label={`Tu respuesta a la pregunta ${current + 1}`}
        aria-describedby={pasteBlocked ? "paste-note" : undefined}
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
          Aquí no se puede pegar: escríbelo tú.
        </p>
      )}
      <div className="flex gap-3">
        {current > 0 && (
          <button type="button" className="btn-secondary" onClick={() => setCurrent((c) => c - 1)}>
            Anterior
          </button>
        )}
        {isLast ? (
          <button type="button" className="btn flex-1" disabled={busy} onClick={() => void send()}>
            <SendIcon /> {busy ? "Enviando…" : `Enviar (${answered}/${questions.length})`}
          </button>
        ) : (
          <button type="button" className="btn flex-1" onClick={() => setCurrent((c) => c + 1)}>
            Siguiente
          </button>
        )}
      </div>
      {busy && <Waiting steps={EVALUATION_STEPS} expected="menos de un minuto" />}
    </section>
  );
}

function Avatar({ alias, active }: { alias: string; active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-10 shrink-0 place-items-center rounded-full font-display font-bold uppercase ${active ? "bg-brand text-white" : "bg-subtle text-graphite"}`}
    >
      {alias.slice(0, 1)}
    </span>
  );
}

/** Oral queue: everyone sees the order, the student sees their place and who is presenting. */
function Queue({ view }: { view: StudentView }) {
  return (
    <section className="grid gap-4">
      <div className="card grid grid-cols-2 divide-x divide-[var(--color-border-default)] p-0">
        <div className="grid justify-items-center gap-1 p-5 text-center">
          <span className="label text-graphite">Tu turno</span>
          <span className="stat-value">{view.position ? `${view.position}.º` : "—"}</span>
          <span className="text-[0.9375rem] text-graphite">de {view.queue.length}</span>
        </div>
        <div className="grid justify-items-center gap-2 p-5 text-center" role="status">
          <span className="label text-graphite">Ahora</span>
          {view.presenting ? (
            <>
              <span className="relative grid size-12 place-items-center rounded-full bg-danger-subtle text-pen">
                <span className="absolute inset-0 animate-ping rounded-full bg-danger-subtle" aria-hidden="true" />
                <MicIcon className="relative size-6" />
              </span>
              <span className="font-bold">{view.presenting}</span>
            </>
          ) : (
            <>
              <span className="grid size-12 place-items-center rounded-full bg-subtle text-graphite">
                <HourglassIcon className="size-6" />
              </span>
              <span className="text-graphite">Por empezar</span>
            </>
          )}
        </div>
      </div>

      <div className="card grid gap-1 p-2">
        <h2 className="label flex items-center gap-2 px-3 pt-2 text-graphite">
          <UsersIcon className="size-4" /> Orden de la clase
        </h2>
        <ol className="grid">
          {view.queue.map((alias, i) => {
            const me = i + 1 === view.position;
            const now = alias === view.presenting;
            return (
              <li
                key={`${alias}-${i}`}
                aria-current={me ? "true" : undefined}
                className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 ${me ? "bg-brand-subtle" : ""}`}
              >
                <span className="w-5 text-right text-sm tabular-nums text-graphite">{i + 1}</span>
                <Avatar alias={alias} active={me} />
                <span className={`min-w-0 flex-1 truncate ${me ? "font-bold" : ""}`}>{alias}</span>
                {me && <span className="chip chip-brand">Tú</span>}
                {now && (
                  <span className="text-pen" role="img" aria-label="Defendiendo ahora">
                    <MicIcon />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** Own oral turn: impossible to miss, with the question being asked right now. */
function YourTurn({ view }: { view: StudentView }) {
  useEffect(() => {
    const previous = document.title;
    document.title = "¡Te toca! · Defiéndelo";
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {}
    return () => {
      document.title = previous;
    };
  }, []);
  const q = view.question;
  return (
    <section className="grid gap-4" role="alert">
      <div className="grid justify-items-center gap-3 rounded-[var(--radius-lg)] bg-brand px-5 py-8 text-center text-white">
        <span className="relative grid size-20 place-items-center rounded-full bg-white/15">
          <span className="absolute inset-0 animate-ping rounded-full bg-white/20" aria-hidden="true" />
          <MicIcon className="relative size-10" />
        </span>
        <p className="font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-none">¡Te toca!</p>
        <p className="text-lg text-white/85">Acércate a tu profe, {view.alias}</p>
      </div>
      {q && (
        <div className="card grid gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="label text-brand-text">
              Pregunta {q.number} de {q.total}
            </span>
            <span className="flex gap-1" aria-hidden="true">
              {Array.from({ length: q.total }, (_, i) => (
                <span key={i} className={`h-2 w-6 rounded-full ${i < q.number ? "bg-brand" : "bg-subtle"}`} />
              ))}
            </span>
          </div>
          <p className="font-display text-xl font-bold leading-snug">{q.text}</p>
        </div>
      )}
    </section>
  );
}

function Result({ view, criterionName }: { view: StudentView; criterionName: (id: string) => string }) {
  const result = view.result!;
  const evaluation: Evaluation | null = result.evaluation;
  const scale = view.gradeScale;
  const passed = (score: number) => score >= view.passingGrade;
  const gapOf = (p: Evaluation["perCriterion"][number]) => p.submissionScore - p.defenseScore;
  const widestGap = evaluation?.perCriterion.filter((p) => gapOf(p) >= 0.25).sort((a, b) => gapOf(b) - gapOf(a))[0]?.criterionId;
  return (
    <section className="grid gap-4">
      <div className="card grid justify-items-center gap-3 px-5 py-8 text-center">
        <h2 className="label flex items-center gap-1.5 text-graphite">
          <StarIcon className="size-4" /> Tu nota
        </h2>
        {view.grading === "literal" && result.letter ? (
          <div className="grid justify-items-center gap-2">
            <span
              className={`grid size-36 place-items-center rounded-full font-display text-6xl font-extrabold ${result.letter === "A" || result.letter === "AD" ? "bg-success-subtle text-success" : "bg-danger-subtle text-pen"}`}
            >
              {result.letter}
            </span>
            <span className="font-bold">{LETTER_LABEL[result.letter]}</span>
          </div>
        ) : result.grade == null ? (
          <p className="text-graphite">Sin nota todavía.</p>
        ) : (
          <Ring value={result.grade} total={scale} size={144} tone={passed(result.grade) ? "var(--color-text-success)" : "var(--color-text-danger)"}>
            <p className="relative font-display font-extrabold tabular-nums leading-none">
              <span className="text-5xl">{result.grade}</span>
              <span className="block text-base text-graphite">de {scale}</span>
            </p>
          </Ring>
        )}
      </div>

      {result.perQuestion.some((q) => q.score != null) && (
        <ul className="card grid divide-y divide-[var(--color-border-default)] p-0" aria-label="Nota por pregunta">
          {result.perQuestion.map((q, i) => (
            <li key={i} className="flex items-start gap-3 p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-subtle text-sm font-bold text-graphite">P{i + 1}</span>
              <p className="line-clamp-3 flex-1 text-[0.9375rem]">{q.question}</p>
              <span className={`chip shrink-0 tabular-nums ${q.score == null ? "chip-neutral" : passed(q.score) ? "chip-success" : "chip-danger"}`}>
                {q.score ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {evaluation && (
        <details className="card p-5">
          <summary className="btn-quiet cursor-pointer">Ver detalle por criterio</summary>
          <ul className="mt-4 grid gap-5">
            {evaluation.perCriterion.map((p) => (
              <li key={p.criterionId} className="grid gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3>{criterionName(p.criterionId)}</h3>
                  {p.criterionId === widestGap && <TeacherNote>¡revisa este!</TeacherNote>}
                </div>
                <GapBar submitted={p.submissionScore} explained={p.defenseScore} />
                {p.misconception && <p className="rounded-[var(--radius-md)] bg-danger-subtle p-3 text-[0.9375rem]">{p.misconception}</p>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

/** Three-step progress with icons; labels stay on one line on a phone. */
function Steps({ index, method }: { index: number; method: EvaluationMethod }) {
  const DefenseIcon = METHOD[method].Icon;
  const steps = [
    { label: "Entrega", icon: <PaperclipIcon /> },
    { label: "Defensa", icon: <DefenseIcon /> },
    { label: "Nota", icon: <StarIcon /> },
  ];
  return (
    <nav aria-label="Pasos">
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((step, i) => {
          const done = i < index;
          const current = i === index;
          return (
            <li key={step.label} aria-current={current ? "step" : undefined} className="grid justify-items-center gap-1.5 text-center">
              <span
                className={`grid size-10 place-items-center rounded-full ${current ? "bg-brand text-white" : done ? "bg-brand-subtle text-brand-text" : "bg-subtle text-graphite"}`}
              >
                {done ? <CheckIcon /> : step.icon}
              </span>
              <span className={`text-sm ${current ? "font-bold text-ink" : "text-graphite"}`}>
                {step.label}
                {done && <span className="sr-only"> (hecho)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const SOURCES = [
  { key: "archivo", label: "Subir archivo", Icon: PaperclipIcon },
  { key: "texto", label: "Pegar texto", Icon: ClipboardIcon },
] as const;

export default function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<PublicAssignment | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [view, setView] = useState<StudentView | null>(null);
  const [alias, setAlias] = useState("");
  const [work, setWork] = useState("");
  const [source, setSource] = useState<"archivo" | "texto">("archivo");
  const [fromFile, setFromFile] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showWork, setShowWork] = useState(false);
  // null = default: open before submitting, folded afterwards.
  const [sheetToggle, setSheetToggle] = useState<boolean | null>(null);
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

  const { deadline } = assignment.session;
  // Until the teacher configures a live session, the defense is answered on the phone right after handing in.
  const method = assignment.live ? assignment.session.method : "escrito";
  const { label: methodLabel, Icon: MethodIcon } = METHOD[method];
  const criterionName = (cid: string) => assignment.criteria.find((c) => c.id === cid)?.name ?? cid;
  const status = view?.status;
  const stepIndex = !view ? 0 : status === "publicado" || status === "evaluado" ? 2 : 1;
  const showForm = (!view && assignment.acceptsSubmissions) || (editing && status === "entregado");
  // A file that hit the length limit was cut: open its text so the student checks the end.
  const sheetOpen = sheetToggle ?? !view;
  const textVisible =source === "texto" || showText || (fromFile && work.length >= WORK_LIMIT);

  return (
    <>
      {header}
      <main id="contenido" tabIndex={-1} className="mx-auto grid w-full max-w-xl gap-6 px-4 py-6 outline-none sm:px-6 sm:py-10">
        <Steps index={stepIndex} method={method} />

        <section className="grid gap-3">
          {/* Before submitting the open task sheet already shows the title. */}
          <h1 className={view ? "text-[clamp(1.5rem,6vw,2rem)]!" : "sr-only"}>{assignment.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip chip-brand inline-flex items-center gap-1.5">
              <MethodIcon className="size-4" /> {methodLabel}
            </span>
            {(!view || status === "entregado") && <Deadline deadline={deadline} />}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              aria-expanded={sheetOpen}
              aria-controls="hoja-tarea"
              onClick={() => setSheetToggle(!sheetOpen)}
              className="flex min-h-11 items-center gap-2 font-bold text-brand-text"
            >
              <EyeIcon className="size-5" />
              {sheetOpen ? "Ocultar la tarea" : "Ver la tarea"}
            </button>
            <PrintSheetButton sheetId="hoja-tarea" quiet />
          </div>
          {/* Always rendered so it can be printed while folded; only the sheet itself is cloned for printing. */}
          <div className={sheetOpen ? "" : "hidden"}>
            <AssignmentSheet
              id="hoja-tarea"
              title={assignment.title}
              subject={assignment.subject}
              statement={assignment.statement}
              aiPolicy={assignment.aiPolicy}
              criteria={assignment.criteria}
            />
          </div>
        </section>

        {!view && !assignment.acceptsSubmissions && <StateCard icon={<LockIcon className={BIG_ICON} />} tone="neutral" title="Entregas cerradas" />}

        {showForm && (
          <form onSubmit={submit} className="grid gap-5">
            <h2>{editing ? "Cambiar mi entrega" : "Tu entrega"}</h2>
            {!editing && (
              <div className="grid gap-1.5">
                <label htmlFor="alias" className="font-bold">
                  Apodo
                </label>
                <input
                  id="alias"
                  type="text"
                  required
                  maxLength={40}
                  autoComplete="off"
                  placeholder="ej. luz_23 (no tu nombre real)"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </div>
            )}

            <div className="grid gap-3">
              <div role="tablist" aria-label="Cómo entregar" className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] bg-subtle p-1">
                {SOURCES.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={source === key}
                    onClick={() => setSource(key)}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] font-bold ${source === key ? "bg-surface text-ink shadow-sm" : "text-graphite"}`}
                  >
                    <Icon className="size-5" /> {label}
                  </button>
                ))}
              </div>

              {source === "archivo" && (
                <FileDrop
                  limit={WORK_LIMIT}
                  title="Elige tu archivo"
                  hint="PDF, Word, texto o código"
                  onText={(text) => {
                    setWork(text);
                    setFromFile(true);
                  }}
                />
              )}
              {source === "archivo" && fromFile && (
                <button type="button" className="btn-quiet justify-self-start" aria-expanded={showText} onClick={() => setShowText((s) => !s)}>
                  {showText ? "Ocultar el texto" : "Ver o corregir el texto"}
                </button>
              )}
              {textVisible && (
                <textarea
                  id="work"
                  required
                  minLength={20}
                  maxLength={WORK_LIMIT}
                  rows={source === "texto" ? 8 : 10}
                  aria-label="Tu trabajo"
                  placeholder="Pega aquí tu trabajo"
                  className="font-mono text-[0.9375rem]"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                />
              )}
              {work.length > WORK_LIMIT * 0.8 && (
                <span className="text-right text-sm tabular-nums text-graphite">
                  {work.length.toLocaleString("es")} / {WORK_LIMIT.toLocaleString("es")}
                </span>
              )}
            </div>

            {error && (
              <p role="alert" className="font-bold text-pen">
                {error}
              </p>
            )}
            {busy && <Waiting steps={SUBMIT_STEPS} expected="cerca de un minuto" />}

            <div className="sticky bottom-0 -mx-4 grid gap-2 border-t border-rule bg-page/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
              <button className="btn w-full" disabled={busy || work.trim().length < 20}>
                <SendIcon /> {busy ? "Entregando…" : editing ? "Guardar nueva versión" : "Entregar"}
              </button>
              {editing && !busy && (
                <button type="button" className="btn-secondary w-full" onClick={() => setEditing(false)}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}

        {status === "entregado" && !editing && (
          <StateCard icon={<CheckIcon className={BIG_ICON} />} tone="success" title="¡Entregado!">
            <p>Te avisamos aquí cuando empiece.</p>
            <div className={`grid w-full gap-2 ${view!.canReplace ? "grid-cols-2" : ""}`}>
              <button type="button" className="btn-secondary whitespace-nowrap px-3!" aria-expanded={showWork} onClick={() => setShowWork((s) => !s)}>
                <EyeIcon /> {showWork ? "Ocultar" : "Ver entrega"}
              </button>
              {view!.canReplace && (
                <button
                  type="button"
                  className="btn-secondary whitespace-nowrap px-3!"
                  onClick={() => {
                    setWork(view!.work);
                    setSource("texto");
                    setError(null);
                    setEditing(true);
                  }}
                >
                  <PenIcon /> Cambiar
                </button>
              )}
            </div>
            {showWork && (
              <pre className="max-h-72 w-full overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-subtle p-3 text-left font-mono text-sm text-ink">
                {view!.work}
              </pre>
            )}
          </StateCard>
        )}

        {status === "en_cola" && <Queue view={view!} />}

        {status === "turno" && <YourTurn view={view!} />}

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
          <StateCard icon={<PrinterIcon className={BIG_ICON} />} title="Evaluación en papel">
            <p>Tu profe te dará la hoja.</p>
          </StateCard>
        )}

        {status === "evaluado" && (
          <StateCard icon={<HourglassIcon className={BIG_ICON} />} title="¡Listo!">
            <p>Tu nota aparecerá aquí.</p>
          </StateCard>
        )}

        {status === "publicado" && <Result view={view!} criterionName={criterionName} />}
      </main>
    </>
  );
}
