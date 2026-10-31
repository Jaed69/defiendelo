"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, ClockIcon, EyeIcon, KeyIcon, PenIcon, QuestionIcon, SendIcon, SpeechIcon, UserCheckIcon, InboxIcon } from "@/app/components/icons";
import { Waiting } from "@/app/components/waiting";
import type { DefenseQuestion } from "@/domain/types";
import { quoteForQuestion } from "../student-copy";
import { HandedIn, InfoRow, Stepper, WorkToggle } from "../ui";

const SEND_STEPS = [
  { after: 0, text: "Enviando tus respuestas…" },
  { after: 8, text: "Ya casi." },
];

/** A3e1 · before the written defense: how many questions, how long, and that pasting is off. */
export function DefenseIntro({ questions, freshHandIn, onStart }: { questions: number; freshHandIn: boolean; onStart: () => void }) {
  return (
    <section className="rise grid gap-[18px]">
      <Stepper index={1} />
      {freshHandIn && <HandedIn />}
      <h1 className="text-[1.875rem]! leading-tight!">Ahora explica tu trabajo</h1>
      <ul className="grid gap-3.5 rounded-[var(--radius-lg)] border border-rule bg-surface p-4">
        <InfoRow icon={<QuestionIcon size={18} />}>
          {questions} {questions === 1 ? "pregunta" : "preguntas"} sobre lo que tú hiciste.
        </InfoRow>
        <InfoRow icon={<ClockIcon size={18} />}>Unos 10 minutos, a tu ritmo.</InfoRow>
        <InfoRow icon={<EyeIcon size={18} />}>Puedes mirar tu entrega mientras respondes.</InfoRow>
        <InfoRow icon={<PenIcon size={18} />}>Con tus palabras: no se puede pegar texto.</InfoRow>
      </ul>
      <p className="text-graphite">No es un examen de memoria: queremos saber si entiendes lo que entregaste.</p>
      <button type="button" className="btn w-full" onClick={onStart} autoFocus>
        <SpeechIcon size={18} /> Empezar
      </button>
    </section>
  );
}

function draftKey(assignmentId: string, sid: string) {
  return `defiendelo:${assignmentId}:draft:${sid}`;
}

function readDraft(key: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}");
  } catch {
    return {};
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

/** A3e2 · one question per screen, quoting the student's own work; drafts are kept on the device. */
export function WrittenDefense({
  assignmentId,
  sid,
  questions,
  work,
  exampleAnswers,
  instant,
  onSend,
}: {
  assignmentId: string;
  sid: string;
  questions: DefenseQuestion[];
  work: string;
  /** Example answers in question order when the loaded work is a demo example. */
  exampleAnswers: string[] | null;
  /** Demo tasks answer at once, so no waiting state is shown. */
  instant: boolean;
  onSend: (answers: Record<string, string>) => Promise<void>;
}) {
  const key = draftKey(assignmentId, sid);
  const [answers, setAnswers] = useState<Record<string, string>>(() => readDraft(key));
  const [current, setCurrent] = useState(0);
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus();
  }, [current]);

  function update(next: Record<string, string>) {
    setAnswers(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Blocked storage: answers stay in memory until sent.
    }
  }

  async function send() {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(answers);
      try {
        localStorage.removeItem(key);
      } catch {}
    } catch (e) {
      setError((e as Error).message);
      setSending(false);
    }
  }

  const question = questions[current];
  if (!question) return null;
  const isLast = current === questions.length - 1;
  const quote = quoteForQuestion(question.question, work);
  const example = exampleAnswers?.[current];
  const missing = questions.filter((q) => !(answers[q.id] ?? "").trim()).length;

  return (
    <section className="grid gap-[18px]" aria-label="Defensa escrita">
      <div className="grid gap-2">
        <div className="flex items-end gap-1">
          <p className="counter text-[3.5rem] text-brand-text" aria-label={`Pregunta ${current + 1} de ${questions.length}`}>
            {pad(current + 1)}
            <span className="ml-1 text-2xl text-graphite">/{pad(questions.length)}</span>
          </p>
          <span className="flex-1" />
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-1 text-sm font-bold text-success">
            <CheckIcon size={14} /> Se guarda solo
          </span>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {questions.map((q, i) => (
            <span key={q.id} className={`h-2 flex-1 rounded-full ${i === current ? "bg-brand" : (answers[q.id] ?? "").trim() ? "bg-inverse" : "bg-subtle"}`} />
          ))}
        </div>
      </div>

      <figure className="grid gap-1.5 rounded-[var(--radius-lg)] bg-subtle p-3.5">
        <figcaption className="eyebrow">{quote.quoted ? "En tu trabajo escribiste:" : "Tu trabajo empieza así:"}</figcaption>
        <blockquote>“{quote.text}”</blockquote>
      </figure>

      <h2 ref={heading} tabIndex={-1} className="text-[1.375rem]! leading-snug! outline-none" id={`pregunta-${question.id}`}>
        {question.question}
      </h2>

      <textarea
        className="min-h-[190px]! rounded-[var(--radius-lg)]! border-ink! p-3.5!"
        rows={6}
        maxLength={4000}
        placeholder="Con tus palabras, en 2 a 4 oraciones."
        aria-labelledby={`pregunta-${question.id}`}
        aria-describedby={pasteBlocked ? "paste-note" : undefined}
        value={answers[question.id] ?? ""}
        onChange={(e) => update({ ...answers, [question.id]: e.target.value })}
        onPaste={(e) => {
          e.preventDefault();
          setPasteBlocked(true);
        }}
        onDrop={(e) => e.preventDefault()}
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

      <div className="flex flex-wrap items-center justify-between gap-x-4">
        {example && (
          <button type="button" className="btn-quiet" onClick={() => update({ ...answers, [question.id]: example })}>
            Usar la respuesta de ejemplo
          </button>
        )}
        <WorkToggle work={work} className="btn-quiet" />
      </div>

      {isLast && missing > 0 && (
        <p className="text-sm text-graphite" role="status">
          Te {missing === 1 ? "falta 1 respuesta" : `faltan ${missing} respuestas`}. Puedes volver con «Anterior».
        </p>
      )}
      {error && (
        <p role="alert" className="font-bold text-pen">
          {error}
        </p>
      )}
      {sending && !instant && <Waiting steps={SEND_STEPS} expected="unos segundos" />}

      <div className="bottom-bar -mx-4 flex gap-2.5 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button type="button" className="btn-secondary flex-1" disabled={current === 0 || sending} onClick={() => setCurrent((c) => c - 1)}>
          Anterior
        </button>
        {isLast ? (
          <button type="button" className="btn flex-1" disabled={sending} onClick={() => void send()}>
            <SendIcon size={18} /> {sending ? "Enviando…" : "Enviar"}
          </button>
        ) : (
          <button type="button" className="btn flex-1" onClick={() => setCurrent((c) => c + 1)}>
            Siguiente
          </button>
        )}
      </div>
    </section>
  );
}

/** A3e3 · full-bleed success moment after sending, with what comes next. */
export function DefenseSent({ code }: { code: string | null }) {
  return (
    <div className="bg-success-fill text-white">
      <main id="contenido" tabIndex={-1} className="rise mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-xl content-start gap-5 px-4 pt-5 outline-none sm:px-6 sm:pt-8">
        <Stepper index={2} onColor />
        <span className="grid size-16 place-items-center rounded-full bg-white text-success">
          <CheckIcon size={30} />
        </span>
        <h1 className="text-[clamp(2.25rem,11vw,2.75rem)]! leading-[1.05]! text-white!">
          ¡Listo! Enviaste tus respuestas
        </h1>
        <section className="grid gap-3 rounded-[var(--radius-lg)] border border-rule bg-surface p-4 text-ink">
          <h2 className="eyebrow [font-family:inherit]!">Qué sigue</h2>
          <ul className="grid gap-3">
            <InfoRow icon={<UserCheckIcon size={18} />}>Tu profe lee tus respuestas y decide tu nota.</InfoRow>
            <InfoRow icon={<InboxIcon size={18} />}>Cuando la publique, aparece aquí y en «Mis evaluaciones».</InfoRow>
            {code && (
              <InfoRow icon={<KeyIcon size={18} />}>
                Para verla otro día, entra con tu código <span className="font-mono font-bold">{code}</span>.
              </InfoRow>
            )}
          </ul>
        </section>
        <div className="sticky bottom-0 mt-auto -mx-4 bg-success-fill px-5 pt-3 pb-6 sm:static sm:mx-0 sm:px-0">
          <Link href="/alumno" className="btn-inverse w-full text-success!">
            Ver mis evaluaciones
          </Link>
        </div>
      </main>
    </div>
  );
}
