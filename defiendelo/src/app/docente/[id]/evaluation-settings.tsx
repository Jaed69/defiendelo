"use client";

import { useState } from "react";
import { api } from "@/app/api-client";
import { MicIcon, PhoneIcon, PrinterIcon } from "@/app/components/icons";
import { isLive, sessionOf } from "@/domain/session";
import type { Assignment, EvaluationMethod, GradingSystem } from "@/domain/types";

const METHODS: { key: EvaluationMethod; label: string; Icon: typeof MicIcon }[] = [
  { key: "oral", label: "Oral", Icon: MicIcon },
  { key: "escrito", label: "Escrito en el celular", Icon: PhoneIcon },
  { key: "papel", label: "Escrito en papel", Icon: PrinterIcon },
];

const GRADINGS: { key: GradingSystem; label: string; hint: string }[] = [
  { key: "literal", label: "AD · A · B · C", hint: "Secundaria" },
  { key: "numerica", label: "Numérica", hint: "Universidad" },
];

/** ISO date ⇄ value of <input type="datetime-local"> in the teacher's time zone. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string; hint?: string; Icon?: typeof MicIcon }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 font-bold">{label}</legend>
      <div className={`grid gap-1 rounded-[var(--radius-md)] bg-subtle p-1 ${options.length === 3 ? "grid-cols-1" : "grid-cols-2"}`}>
        {options.map(({ key, label: text, hint, Icon }) => (
          <label
            key={key}
            className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] px-2 text-center font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand ${value === key ? "bg-surface text-ink shadow-sm" : "text-graphite"}`}
          >
            <input type="radio" className="sr-only" name={label} checked={value === key} onChange={() => onChange(key)} />
            {Icon && <Icon className="size-5" />}
            <span>
              {text}
              {hint && <span className="block text-sm font-normal">{hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** How the class is evaluated: grading scale, method, deadline. Saving it turns on the live session. */
export function EvaluationSettings({
  assignment,
  teacherKey,
  onSaved,
}: {
  assignment: Assignment;
  teacherKey: string;
  onSaved: (assignment: Assignment) => void;
}) {
  const current = sessionOf(assignment);
  const [form, setForm] = useState({
    grading: current.grading,
    gradeScale: current.gradeScale,
    passingGrade: current.passingGrade,
    method: current.method,
    deadline: toLocalInput(current.deadline),
    questionsPerStudent: current.questionsPerStudent,
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<typeof form>) => {
    setForm({ ...form, ...patch });
    setSaved(false);
  };
  const locked = current.phase !== "entregas";

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (form.grading === "numerica" && form.passingGrade > form.gradeScale) {
      setError("La nota mínima no puede ser mayor que la nota máxima.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await api<Assignment>(`/api/assignments/${assignment.id}/session`, {
        method: "PATCH",
        teacherKey,
        body: JSON.stringify({ ...form, deadline: form.deadline ? new Date(form.deadline).toISOString() : null }),
      });
      onSaved(next);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="evaluacion" className="card grid gap-5 p-6">
      <div className="grid gap-1">
        <h2 className="text-[1.375rem]">Cómo vas a evaluar</h2>
        {!isLive(assignment) && <p className="text-[0.9375rem] text-graphite">Guárdalo antes de compartir el enlace.</p>}
        {locked && <p className="text-[0.9375rem] text-graphite">Las entregas ya cerraron: puedes cambiar la nota mínima, no el método.</p>}
      </div>
      <form onSubmit={save} className="grid gap-5">
        <Segmented label="Nota" options={GRADINGS} value={form.grading} onChange={(grading) => set({ grading })} />
        {form.grading === "numerica" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className="font-bold">Nota máxima</span>
              <input
                type="number"
                min={1}
                max={100}
                required
                className="w-full rounded-[var(--radius-md)] border-[1.5px] border-rule bg-surface px-4 py-3"
                value={form.gradeScale}
                onChange={(e) => set({ gradeScale: Number(e.target.value) })}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="font-bold">Mínima para aprobar</span>
              <input
                type="number"
                min={0}
                max={100}
                step="0.5"
                required
                className="w-full rounded-[var(--radius-md)] border-[1.5px] border-rule bg-surface px-4 py-3"
                value={form.passingGrade}
                onChange={(e) => set({ passingGrade: Number(e.target.value) })}
              />
            </label>
          </div>
        )}
        <fieldset disabled={locked} className="grid gap-5 disabled:opacity-60">
          <Segmented label="Defensa" options={METHODS} value={form.method} onChange={(method) => set({ method })} />
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
            <label className="grid gap-1.5">
              <span className="font-bold">Plazo de entrega</span>
              <input
                type="datetime-local"
                className="w-full rounded-[var(--radius-md)] border-[1.5px] border-rule bg-surface px-4 py-3"
                value={form.deadline}
                onChange={(e) => set({ deadline: e.target.value })}
              />
              <span className="text-sm text-graphite">Vacío: tú cierras las entregas.</span>
            </label>
            <label className="grid content-start gap-1.5">
              <span className="font-bold">Preguntas</span>
              <input
                type="number"
                min={1}
                max={5}
                required
                className="w-full rounded-[var(--radius-md)] border-[1.5px] border-rule bg-surface px-4 py-3"
                value={form.questionsPerStudent}
                onChange={(e) => set({ questionsPerStudent: Number(e.target.value) })}
              />
              <span className="text-sm text-graphite">por alumno</span>
            </label>
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="font-bold text-pen">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn" disabled={busy}>
            {busy ? "Guardando…" : "Guardar"}
          </button>
          <span role="status" className="font-bold text-success">
            {saved ? "Guardado ✓" : ""}
          </span>
        </div>
      </form>
    </section>
  );
}
