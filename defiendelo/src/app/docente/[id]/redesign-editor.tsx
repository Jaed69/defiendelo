"use client";

import { useState } from "react";
import { api } from "@/app/api-client";
import { rubricProblem } from "@/domain/grading";
import type { Assignment, Criterion } from "@/domain/types";

type Row = Omit<Criterion, "id"> & { id?: string };

const field = "w-full rounded-[var(--radius-md)] border-[1.5px] border-rule bg-surface px-3 py-2";

/** Lets the teacher fix what the AI generated: statement, AI policy and rubric. */
export function RedesignEditor({
  assignment,
  teacherKey,
  onSaved,
  onCancel,
}: {
  assignment: Assignment;
  teacherKey: string;
  onSaved: (assignment: Assignment) => void;
  onCancel: () => void;
}) {
  const { redesign } = assignment;
  const [statement, setStatement] = useState(redesign.statement);
  const [aiPolicy, setAiPolicy] = useState(redesign.aiPolicy);
  const [criteria, setCriteria] = useState<Row[]>(redesign.criteria);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  const problem = rubricProblem(criteria);
  const edit = (i: number, patch: Partial<Row>) => setCriteria(criteria.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    try {
      onSaved(
        await api<Assignment>(`/api/assignments/${assignment.id}`, {
          method: "PATCH",
          teacherKey,
          body: JSON.stringify({ statement, aiPolicy, criteria }),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      <label className="grid gap-1.5">
        <span className="font-bold">Enunciado</span>
        <textarea required minLength={20} maxLength={8000} rows={10} value={statement} onChange={(e) => setStatement(e.target.value)} />
      </label>
      <label className="grid gap-1.5">
        <span className="font-bold">Uso de la IA</span>
        <textarea required maxLength={1000} rows={2} value={aiPolicy} onChange={(e) => setAiPolicy(e.target.value)} />
      </label>

      <fieldset className="grid gap-3">
        <legend className="mb-2 flex w-full items-baseline justify-between gap-3 font-bold">
          Rúbrica
          <span className={`text-sm tabular-nums ${total === 100 ? "text-success" : "text-pen"}`} aria-live="polite">
            Suma {total}%
          </span>
        </legend>
        {criteria.map((c, i) => (
          <div key={c.id ?? i} className="grid gap-2 rounded-[var(--radius-md)] border border-rule p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] gap-2">
              <input aria-label={`Nombre del criterio ${i + 1}`} className={`${field} font-bold`} required maxLength={120} value={c.name} onChange={(e) => edit(i, { name: e.target.value })} />
              <label className="flex items-center gap-1">
                <input
                  aria-label={`Peso del criterio ${i + 1}`}
                  type="number"
                  min={1}
                  max={100}
                  required
                  className={`${field} text-right tabular-nums`}
                  value={c.weight}
                  onChange={(e) => edit(i, { weight: Number(e.target.value) })}
                />
                %
              </label>
            </div>
            <textarea
              aria-label={`Descripción del criterio ${i + 1}`}
              rows={2}
              maxLength={600}
              className="text-[0.9375rem]"
              value={c.description}
              onChange={(e) => edit(i, { description: e.target.value })}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <select
                aria-label={`Dónde se evalúa el criterio ${i + 1}`}
                className={`${field} w-auto`}
                value={c.evidence}
                onChange={(e) => edit(i, { evidence: e.target.value as Row["evidence"] })}
              >
                <option value="entrega">Se evalúa en la entrega</option>
                <option value="defensa">Se evalúa en la defensa</option>
              </select>
              <button type="button" className="btn-quiet text-pen" onClick={() => setCriteria(criteria.filter((_, j) => j !== i))}>
                Quitar
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn-quiet justify-self-start"
          onClick={() => setCriteria([...criteria, { name: "", description: "", weight: Math.max(1, 100 - total), evidence: "defensa" }])}
        >
          + Agregar criterio
        </button>
      </fieldset>

      {(error || problem) && (
        <p role="alert" className="font-bold text-pen">
          {error ?? problem}
        </p>
      )}
      {assignment.stress && <p className="text-[0.9375rem] text-graphite">Al guardar, la prueba con la IA sola se vuelve a pedir.</p>}
      <div className="flex flex-wrap gap-3">
        <button className="btn" disabled={busy || !!problem}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
