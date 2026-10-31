"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { CheckIcon, FileTextIcon, PenIcon, SpeechIcon } from "@/app/components/icons";
import type { StudentView } from "@/domain/session";
import { nextUpLine } from "../student-copy";
import type { SavedSubmission } from "../tab-code";
import { HandedIn, Pill, Stepper, WorkToggle } from "../ui";
import { WORK_LIMIT } from "./hand-in";

const PREPARE = ["Por qué tomaste las decisiones de tu trabajo.", "Qué te dio la IA y qué cambiaste tú.", "Una parte que cambiarías si te lo piden."];

function Prepare({ title }: { title: string }) {
  return (
    <section className="grid gap-2.5 rounded-[var(--radius-lg)] border border-rule bg-surface p-4">
      <h2 className="text-base!">{title}</h2>
      <ul className="grid gap-2.5">
        {PREPARE.map((tip) => (
          <li key={tip} className="flex items-start gap-2.5">
            <span className="mt-1 text-brand-text">
              <CheckIcon size={16} />
            </span>
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Mode({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-1.5 justify-self-start rounded-full bg-brand-subtle px-3 py-1.5 text-sm font-bold text-brand-text">
      {icon}
      {children}
    </p>
  );
}

/** Live session still taking hand-ins: the student waits and may replace the work. */
export function WaitingForDefense({
  view,
  assignmentId,
  saved,
  onChanged,
}: {
  view: StudentView;
  assignmentId: string;
  saved: SavedSubmission;
  onChanged: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [work, setWork] = useState(view.work);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/api/assignments/${assignmentId}/submissions/${saved.sid}`, {
        method: "PUT",
        headers: { "x-student-token": saved.token },
        body: JSON.stringify({ work }),
      });
      await onChanged();
      setEditing(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rise grid gap-[18px]">
      <Stepper index={1} />
      <HandedIn />
      <h1 className="text-[1.875rem]! leading-tight!">Tu profe aún no empieza la defensa</h1>
      <p role="status">Esta pantalla avanza sola cuando empiece.</p>
      {editing ? (
        <form onSubmit={save} className="grid gap-3">
          <label htmlFor="nuevo-trabajo" className="eyebrow">
            Tu trabajo
          </label>
          <textarea
            id="nuevo-trabajo"
            required
            minLength={20}
            maxLength={WORK_LIMIT}
            rows={10}
            className="font-mono text-[0.9375rem]"
            value={work}
            onChange={(e) => setWork(e.target.value)}
          />
          {error && (
            <p role="alert" className="font-bold text-pen">
              {error}
            </p>
          )}
          <button className="btn w-full" disabled={busy || work.trim().length < 20}>
            {busy ? "Guardando…" : "Guardar nueva versión"}
          </button>
          <button type="button" className="btn-secondary w-full" onClick={() => setEditing(false)}>
            Cancelar
          </button>
        </form>
      ) : (
        <>
          <WorkToggle work={view.work} />
          {view.canReplace && (
            <button
              type="button"
              className="btn-quiet justify-self-center"
              onClick={() => {
                setWork(view.work);
                setEditing(true);
              }}
            >
              <PenIcon size={16} /> Cambiar mi entrega
            </button>
          )}
        </>
      )}
    </section>
  );
}

/** A3o1 · oral, waiting in line: place, who presents now, how to prepare. */
export function OralQueue({ view }: { view: StudentView }) {
  const next = nextUpLine(view.queue, view.presenting, view.position);
  return (
    <section className="rise grid gap-[18px]">
      <Stepper index={1} />
      <Mode icon={<SpeechIcon size={16} />}>Defensa oral, en clase</Mode>
      <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-ink bg-surface p-[18px]">
        <div className="grid shrink-0">
          <span className="text-sm text-graphite">Tu turno</span>
          <span className="font-display text-5xl leading-none font-extrabold tabular-nums">{view.position ? `${view.position}.º` : "—"}</span>
          <span className="text-sm text-graphite">de {view.queue.length}</span>
        </div>
        <span aria-hidden="true" className="w-px self-stretch bg-rule" />
        <div className="grid min-w-0 gap-1.5" role="status">
          <span className="text-sm text-graphite">Ahora presenta</span>
          {view.presenting ? (
            <span className="flex items-center gap-2 text-xl font-bold">
              <span aria-hidden="true" className="size-3 shrink-0 animate-pulse rounded-full bg-[var(--color-text-danger)]" />
              <span className="truncate">{view.presenting}</span>
            </span>
          ) : (
            <span className="text-xl font-bold text-graphite">Nadie todavía</span>
          )}
          {next && <span className="text-sm text-graphite">{next}</span>}
        </div>
      </div>
      <Prepare title="Mientras esperas, prepárate. Tu profe te preguntará:" />
      <WorkToggle work={view.work} />
      <p className="text-sm text-graphite">Esta pantalla avanza sola cuando te toque.</p>
    </section>
  );
}

/** A3o2 · oral, own turn: a full-bleed screen impossible to miss, with one message. */
export function OralTurn({ view }: { view: StudentView }) {
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
  return (
    <div className="bg-brand text-white">
      <main
        id="contenido"
        tabIndex={-1}
        className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-xl content-start gap-[22px] px-6 pt-12 outline-none"
        role="alert"
      >
        <span className="grid size-[72px] place-items-center rounded-full bg-white text-brand-text">
          <SpeechIcon size={36} />
        </span>
        <p className="font-display text-[clamp(3.5rem,19vw,4.5rem)] leading-none font-extrabold">¡Te toca!</p>
        <p className="text-xl">Pasa adelante con tu profe y lleva tu celular.</p>
        <div className="grid gap-2 rounded-[var(--radius-lg)] bg-brand-strong p-4">
          <p className="text-sm font-bold tracking-[0.06em] uppercase">Un consejo</p>
          <p className="text-[#e4e9fb]">Habla con tus palabras. Si no recuerdas algo, dilo y explica cómo lo averiguarías: eso también cuenta.</p>
        </div>
        <div className="sticky bottom-0 mt-auto -mx-6 bg-brand px-5 pt-3 pb-6 [&_.btn-inverse]:text-brand-text! sm:static sm:mx-0 sm:px-0">
          <WorkToggle work={view.work} className="btn-inverse w-full" />
        </div>
      </main>
    </div>
  );
}

/** A3p · paper defense: what to write on the sheet and how to prepare. */
export function PaperDefense({ view, questions }: { view: StudentView; questions: number }) {
  return (
    <section className="rise grid gap-[18px]">
      <Stepper index={1} />
      <Mode icon={<FileTextIcon size={16} />}>Defensa escrita, en papel</Mode>
      <h1 className="text-[1.875rem]! leading-tight!">Tu profe te dará una hoja</h1>
      <div className="grid gap-2 rounded-[var(--radius-lg)] border border-ink bg-highlight-subtle p-[18px]">
        <p className="font-bold">Escribe en la hoja tu apodo:</p>
        <p className="font-mono text-[2rem] leading-tight break-all">{view.alias}</p>
      </div>
      <Prepare title={`La hoja tiene ${questions} ${questions === 1 ? "pregunta" : "preguntas"} sobre tu propio trabajo. Prepárate:`} />
      <WorkToggle work={view.work} />
      <p className="text-sm text-graphite">Tu nota aparece aquí cuando tu profe la publique.</p>
    </section>
  );
}

/** A4 · grade not published yet. */
export function GradeInReview({ title, subject }: { title: string; subject: string }) {
  return (
    <section className="rise grid gap-[18px]">
      <Stepper index={2} />
      <header className="grid gap-0.5">
        <p className="text-sm text-graphite">{subject}</p>
        <h1 className="text-[1.75rem]! leading-tight!">{title}</h1>
      </header>
      <div className="grid gap-2.5 rounded-[var(--radius-lg)] border border-rule bg-surface p-6" role="status">
        <p className="eyebrow">Tu nota</p>
        <Pill tone="neutral" className="justify-self-start text-base">
          Nota en revisión
        </Pill>
        <p className="text-[1.0625rem]">
          Tu profe está revisando lo que entregaste y explicaste. Cuando publique tu nota, verás aquí cómo se calculó y qué repasar.
        </p>
      </div>
    </section>
  );
}

/** A4 · the teacher asked to explain the work again. */
export function RedoRequested({ onAnswer }: { onAnswer: () => void }) {
  return (
    <section className="rise grid gap-[18px]">
      <Stepper index={1} />
      <div className="grid gap-2.5 rounded-[var(--radius-lg)] border border-[var(--color-text-danger)] bg-surface p-6" role="alert">
        <p className="eyebrow">Tu nota</p>
        <Pill tone="pen" className="justify-self-start text-base">
          Tu profe te pide explicar de nuevo
        </Pill>
        <p className="text-[1.0625rem]">Responde otra vez las preguntas sobre tu trabajo. Tómate tu tiempo: cuenta con tus palabras cómo lo hiciste.</p>
        <button type="button" className="btn justify-self-start" onClick={onAnswer}>
          Responder ahora
        </button>
      </div>
    </section>
  );
}
