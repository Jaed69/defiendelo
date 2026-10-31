"use client";

import { useState } from "react";
import { api } from "@/app/api-client";
import { CheckIcon, MicIcon, PhoneIcon, PrinterIcon } from "@/app/components/icons";
import { isLive, sessionOf } from "@/domain/session";
import type { Assignment, EvaluationMethod, GradingSystem } from "@/domain/types";

const METHODS: { key: EvaluationMethod; label: string; hint: string; Icon: typeof MicIcon }[] = [
  { key: "oral", label: "Oral, en clase", hint: "Tú haces las preguntas", Icon: MicIcon },
  { key: "escrito", label: "Escrito, en el celular", hint: "Cada uno responde a su ritmo", Icon: PhoneIcon },
  { key: "papel", label: "Escrito, en papel", hint: "Imprimes las preguntas", Icon: PrinterIcon },
];

/** ISO date ⇄ value of <input type="datetime-local"> in the teacher's time zone. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/** "vie 7 nov, 23:59": a deadline as the teacher reads it. */
export function deadlineLabel(iso: string | null, withTime = true) {
  if (!iso) return null;
  const d = new Date(iso);
  const day = d.toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" }).replace(/,/g, "").replace(/\./g, "");
  return withTime ? `${day}, ${d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}` : day;
}

/** Today, tomorrow or in a week, at 23:59 local time, as datetime-local values. */
function deadlinePresets(now: Date) {
  const at = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(23, 59, 0, 0);
    return toLocalInput(d.toISOString());
  };
  return [
    { label: "Sin plazo", value: "" },
    { label: `Hoy, ${deadlineLabel(new Date(at(0)).toISOString(), false)}`, value: at(0) },
    { label: `Mañana, ${deadlineLabel(new Date(at(1)).toISOString(), false)}`, value: at(1) },
    { label: `En una semana, ${deadlineLabel(new Date(at(7)).toISOString(), false)}`, value: at(7) },
  ];
}

const CUSTOM = "otra";

function choice(selected: boolean) {
  return `relative flex min-h-14 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border-2 px-3.5 py-2.5 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
    selected ? "border-brand bg-brand-subtle" : "border-rule bg-surface hover:border-ink"
  }`;
}

/** Paso 2 de 4: grading scale, how students defend their work, deadline and questions. Saving opens the link. */
export function EvaluationSettings({
  assignment,
  teacherKey,
  onSaved,
  onCancel,
}: {
  assignment: Assignment;
  teacherKey: string;
  onSaved: (assignment: Assignment) => void;
  onCancel?: () => void;
}) {
  const live = isLive(assignment);
  const current = sessionOf(assignment);
  // A task never configured starts with what most classes pick: 0 to 20, written on the phone, 4 questions.
  const [form, setForm] = useState({
    grading: live ? current.grading : ("numerica" as GradingSystem),
    gradeScale: current.gradeScale,
    passingGrade: current.passingGrade,
    method: live ? current.method : ("escrito" as EvaluationMethod),
    deadline: toLocalInput(current.deadline),
    questionsPerStudent: live ? current.questionsPerStudent : 4,
  });
  const presets = deadlinePresets(new Date());
  const [custom, setCustom] = useState(form.deadline !== "" && !presets.some((p) => p.value === form.deadline));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });
  const locked = current.phase !== "entregas";

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (form.grading === "numerica" && form.passingGrade > form.gradeScale) {
      setError("La nota para aprobar no puede ser mayor que la nota máxima.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await api<Assignment>(`/api/assignments/${assignment.id}/session`, {
        method: "PATCH",
        teacherKey,
        body: JSON.stringify(
          locked
            ? { grading: form.grading, gradeScale: form.gradeScale, passingGrade: form.passingGrade }
            : { ...form, deadline: form.deadline ? new Date(form.deadline).toISOString() : null },
        ),
      });
      onSaved(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="evaluacion" className="card grid gap-5 border-2 border-brand p-5 sm:p-6" aria-labelledby="evaluacion-titulo">
      <div className="grid gap-1">
        <span className="text-[0.875rem] font-bold text-brand-text">Paso 2 de 4</span>
        <h2 id="evaluacion-titulo" className="text-[1.5rem]">
          Elige cómo evaluar
        </h2>
        <p className="text-[0.9375rem] text-graphite">
          {locked ? "Las entregas ya cerraron: puedes cambiar la nota, no cómo defienden." : "Tus alumnos lo verán al abrir el enlace."}
        </p>
      </div>
      <form onSubmit={save} className="grid gap-5">
        <fieldset className="grid gap-2">
          <legend className="mb-2 font-bold">Nota</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: "literal", label: "AD · A · B · C", hint: "En letras" },
                { key: "numerica", label: `0 a ${form.gradeScale}`, hint: "Numérica" },
              ] as const
            ).map((g) => (
              <label key={g.key} className={`${choice(form.grading === g.key)} justify-center text-center`}>
                <input type="radio" className="sr-only" name="nota" checked={form.grading === g.key} onChange={() => set({ grading: g.key })} />
                <span className="grid">
                  <span className="font-bold">{g.label}</span>
                  <span className="text-[0.875rem] text-graphite">{g.hint}</span>
                </span>
              </label>
            ))}
          </div>
          {form.grading === "numerica" && (
            <label className="mt-1 flex items-center gap-3">
              <span className="font-bold">Aprueba con</span>
              <input
                type="number"
                min={0}
                max={form.gradeScale}
                step="0.5"
                required
                className="w-24! text-right"
                value={form.passingGrade}
                onChange={(e) => set({ passingGrade: Number(e.target.value) })}
              />
            </label>
          )}
        </fieldset>

        <fieldset disabled={locked} className="grid gap-5 disabled:opacity-60">
          <fieldset className="grid gap-2">
            <legend className="mb-2 font-bold">¿Cómo defienden su trabajo?</legend>
            {METHODS.map(({ key, label, hint, Icon }) => {
              const selected = form.method === key;
              return (
                <label key={key} className={choice(selected)}>
                  <input type="radio" className="sr-only" name="defensa" checked={selected} onChange={() => set({ method: key })} />
                  <Icon className={selected ? "text-brand-text" : "text-graphite"} />
                  <span className="grid flex-1">
                    <span className="font-bold">{label}</span>
                    <span className="text-[0.875rem] text-graphite">{hint}</span>
                  </span>
                  {selected && (
                    <span className="grid size-6 place-items-center rounded-full bg-brand text-white">
                      <CheckIcon size={14} />
                    </span>
                  )}
                </label>
              );
            })}
          </fieldset>

          <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
            <label className="grid gap-1.5">
              <span className="font-bold">Entregan hasta</span>
              <select
                value={custom ? CUSTOM : form.deadline}
                onChange={(e) => {
                  if (e.target.value === CUSTOM) return setCustom(true);
                  setCustom(false);
                  set({ deadline: e.target.value });
                }}
              >
                {presets.map((p) => (
                  <option key={p.label} value={p.value}>
                    {p.label}
                  </option>
                ))}
                <option value={CUSTOM}>Otra fecha…</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="font-bold">Preguntas</span>
              <input
                type="number"
                min={1}
                max={5}
                required
                value={form.questionsPerStudent}
                onChange={(e) => set({ questionsPerStudent: Number(e.target.value) })}
              />
            </label>
          </div>
          {custom && (
            <input
              type="datetime-local"
              aria-label="Fecha y hora de cierre"
              required
              value={form.deadline}
              onChange={(e) => set({ deadline: e.target.value })}
            />
          )}
        </fieldset>

        {error && (
          <p role="alert" className="font-bold text-pen">
            {error}
          </p>
        )}
        <div className="grid gap-2">
          <button className="btn w-full" disabled={busy}>
            {busy ? "Guardando…" : "Guardar y seguir →"}
          </button>
          {onCancel && (
            <button type="button" className="btn-quiet justify-self-center" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
