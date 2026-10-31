"use client";

import { useId, useState } from "react";
import { api } from "@/app/api-client";
import { rememberAccountCode } from "@/app/account";
import { AssignmentSheet } from "@/app/components/assignment-sheet";
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, ClipboardCheckIcon, ClockIcon, CopyIcon, FileTextIcon, SendIcon, UploadIcon } from "@/app/components/icons";
import { Waiting } from "@/app/components/waiting";
import { fitToLimit } from "@/app/documents/document-text";
import type { PublicAssignment } from "@/application/use-cases";
import type { EvaluationMethod } from "@/domain/types";
import { firstSteps, formatDeadline, methodSentence } from "../student-copy";
import { currentAccountCode, keepForTab, tabAccountCode } from "../tab-code";
import { HandedIn, Stepper } from "../ui";

export const WORK_LIMIT = 20000;
const ACCEPT = ".pdf,.docx,.txt,.md,.csv,.json,.html,.css,.py,.js,.jsx,.ts,.tsx,.java,.c,.h,.cpp,.hpp,.cs,.go,.rb,.php,.kt,.swift,.sql,.r,.m,application/pdf,text/plain";

export type DemoSample = { alias: string; work: string; answers: string[] };
export type HandInResult = { id: string; token: string; code: string };

const SUBMIT_STEPS = [
  { after: 0, text: "Guardando tu entrega…" },
  { after: 6, text: "Preparando preguntas sobre tu trabajo…" },
  { after: 20, text: "Ya casi." },
];

/** A1 · Entrega: how they will be graded, what to do, nickname and work, with "Entregar" fixed at the bottom. */
export function HandIn({
  assignment,
  method,
  questions,
  samples,
  onDone,
}: {
  assignment: PublicAssignment;
  method: EvaluationMethod;
  questions: number | null;
  samples: DemoSample[];
  onDone: (result: HandInResult, isNewCode: boolean) => void;
}) {
  const [alias, setAlias] = useState("");
  const [work, setWork] = useState("");
  const [typing, setTyping] = useState(false);
  const [fileNote, setFileNote] = useState<{ error: boolean; text: string } | null>(null);
  const [picking, setPicking] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileId = useId();
  const steps = firstSteps(assignment.statement);
  const demo = samples.length > 0;

  async function readFile(file: File | undefined) {
    if (!file) return;
    setFileNote({ error: false, text: `Leyendo «${file.name}» en tu celular…` });
    try {
      const { extractText } = await import("@/app/documents/extract");
      const { text, truncated } = fitToLimit(await extractText(file), WORK_LIMIT);
      setWork(text);
      setTyping(true);
      setFileNote({ error: false, text: truncated ? `Leímos «${file.name}». Era muy largo: revisa el final.` : `Leímos «${file.name}». Revisa el texto abajo.` });
    } catch (e) {
      setFileNote({ error: true, text: (e as Error).message || "No pudimos leer el archivo. Prueba con otro formato o pega el texto." });
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const previous = currentAccountCode();
    const tabOnly = tabAccountCode() != null;
    try {
      const result = await api<HandInResult>(`/api/assignments/${assignment.id}/submissions`, {
        method: "POST",
        // The code typed for this tab only is not in localStorage, so api() would not send it.
        headers: previous ? { "x-account-code": previous } : undefined,
        body: JSON.stringify({ alias, work }),
      });
      if (tabOnly) keepForTab(result.code);
      else rememberAccountCode(result.code);
      onDone(result, result.code !== previous);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-[18px]">
      <Stepper index={0} />

      <header className="grid gap-0.5">
        <p className="text-sm text-graphite">{assignment.subject}</p>
        <h1 className="text-[1.75rem]! leading-tight!">{assignment.title}</h1>
      </header>

      <section className="grid gap-2.5 rounded-[var(--radius-lg)] bg-brand-subtle p-4" aria-labelledby="como-evaluan">
        <h2 id="como-evaluan" className="flex items-center gap-2.5 text-base! text-brand-text!">
          <ClipboardCheckIcon /> Cómo te van a evaluar
        </h2>
        <p>{methodSentence(method, questions)}</p>
        <div className="grid gap-1.5 rounded-[var(--radius-lg)] border border-rule bg-page p-3">
          <h3 className="flex items-center gap-1.5 text-sm! font-bold">
            <span className="text-brand-text">
              <FileTextIcon size={16} />
            </span>
            Así te califican
          </h3>
          <ul className="grid gap-1.5">
            {assignment.criteria.map((c) => (
              <li key={c.id} className="flex items-baseline gap-2 text-sm">
                <span className="w-9 shrink-0 font-bold tabular-nums">{c.weight}%</span>
                <span className="min-w-0 flex-1">{c.name}</span>
                <span className={`font-bold ${c.evidence === "defensa" ? "text-brand-text" : "text-graphite"}`}>
                  {c.evidence === "defensa" ? "Defensa" : "Entrega"}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-graphite">«Defensa»: cuenta lo que expliques de tu trabajo, no solo lo que entregues.</p>
        </div>
        {assignment.session.deadline && (
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <ClockIcon size={16} /> Entregas hasta el {formatDeadline(assignment.session.deadline)}
          </p>
        )}
      </section>

      <section className="grid gap-2" aria-labelledby="que-hacer">
        <h2 id="que-hacer" className="text-base!">
          Qué tienes que hacer
        </h2>
        {steps.length > 0 && (
          <ol className="grid gap-2">
            {steps.map((text, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span aria-hidden="true" className="mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-full bg-inverse text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        )}
        <button
          type="button"
          className="flex min-h-11 items-center gap-1.5 justify-self-start font-bold text-brand-text"
          aria-expanded={sheetOpen}
          aria-controls="hoja-tarea"
          onClick={() => setSheetOpen((o) => !o)}
        >
          {sheetOpen ? "Ocultar la tarea" : "Ver la tarea completa"} {sheetOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </button>
        <div className={sheetOpen ? "rise" : "hidden"}>
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

      <section className="grid gap-3 rounded-[var(--radius-lg)] border border-ink bg-surface p-4" aria-label="Tu entrega">
        {demo && (
          <div className="grid gap-2">
            <button type="button" className="btn-secondary btn-sm w-full" aria-expanded={picking} onClick={() => setPicking((p) => !p)}>
              <FileTextIcon size={18} /> Usar un trabajo de ejemplo
            </button>
            {picking && (
              <ul className="rise grid gap-1.5" aria-label="Trabajos de ejemplo">
                {samples.map((s) => (
                  <li key={s.alias}>
                    <button
                      type="button"
                      className="grid min-h-11 w-full gap-0.5 rounded-[var(--radius-md)] border border-rule bg-page px-3 py-2 text-left hover:border-ink"
                      onClick={() => {
                        setAlias(s.alias);
                        setWork(s.work);
                        setTyping(true);
                        setPicking(false);
                        setFileNote(null);
                      }}
                    >
                      <span className="font-bold">{s.alias}</span>
                      <span className="line-clamp-1 text-sm text-graphite">{s.work.replace(/\s+/g, " ")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <label htmlFor="alias" className="eyebrow">
          Tu apodo
        </label>
        <input
          id="alias"
          type="text"
          required
          maxLength={40}
          autoComplete="off"
          placeholder="ale_23"
          aria-describedby="alias-ayuda"
          className="rounded-[var(--radius-lg)]! border-ink!"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
        <p id="alias-ayuda" className="-mt-1.5 text-sm text-graphite">
          No pongas tu nombre real.
        </p>

        <p className="eyebrow" id="trabajo-label">
          Tu trabajo
        </p>
        <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-brand bg-brand-subtle px-3 py-3.5 has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-brand">
          <span className="text-brand-text">
            <UploadIcon />
          </span>
          <p className="min-w-0 flex-1 text-sm">
            <label htmlFor={fileId} className="cursor-pointer font-bold text-brand-text underline underline-offset-2">
              Sube tu archivo
            </label>{" "}
            o{" "}
            <button type="button" className="font-bold text-brand-text underline underline-offset-2" onClick={() => setTyping(true)}>
              toca para pegar el texto
            </button>
          </p>
          <input
            id={fileId}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              void readFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {fileNote && (
          <p role={fileNote.error ? "alert" : "status"} className={`text-sm ${fileNote.error ? "font-bold text-pen" : "text-graphite"}`}>
            {fileNote.text}
          </p>
        )}
        {typing && (
          <textarea
            required
            minLength={20}
            maxLength={WORK_LIMIT}
            rows={8}
            aria-labelledby="trabajo-label"
            placeholder="Pega aquí tu trabajo"
            className="rise font-mono text-[0.9375rem]"
            value={work}
            onChange={(e) => setWork(e.target.value)}
          />
        )}
      </section>

      {error && (
        <p role="alert" className="font-bold text-pen">
          {error}
        </p>
      )}
      {busy && !demo && <Waiting steps={SUBMIT_STEPS} expected="cerca de medio minuto" />}

      <div className="bottom-bar -mx-4 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button className="btn w-full" disabled={busy || !alias.trim() || work.trim().length < 20}>
          <SendIcon size={18} /> {busy ? "Entregando…" : "Entregar"}
        </button>
      </div>
    </form>
  );
}

/** A2 · Guarda tu código: only when handing in created the code; the button goes straight to the defense. */
export function CodeSaved({ code, onContinue }: { code: string; onContinue: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="rise grid gap-[18px]">
      <Stepper index={1} />
      <HandedIn />
      <h1 className="text-[1.875rem]! leading-tight!">Este es tu código</h1>
      <p className="rounded-[var(--radius-lg)] border border-ink bg-highlight-subtle px-4 py-[18px] text-center font-mono text-[clamp(1.5rem,8vw,2rem)] tracking-[0.12em]">
        {code}
      </p>
      <p>Con él ves tu nota y lo que tienes que repasar, desde cualquier celular. Anótalo en tu cuaderno.</p>
      <button
        type="button"
        className="btn-secondary w-full"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        <CopyIcon size={18} /> {copied ? "Copiado" : "Copiar código"}
      </button>
      <p className="sr-only" role="status">
        {copied ? "Código copiado." : ""}
      </p>
      <button type="button" className="btn w-full" onClick={onContinue}>
        <ArrowLeftIcon size={18} className="rotate-180" /> Seguir: explicar mi trabajo
      </button>
      <p className="text-sm text-graphite">No lo compartas: quien lo tenga puede ver tus notas.</p>
    </section>
  );
}
