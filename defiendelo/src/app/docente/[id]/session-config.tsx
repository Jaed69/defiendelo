"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRemaining, fromLocalInput, toLocalInput } from "@/app/session-format";
import { isLive, sessionOf } from "@/domain/session";
import type { Assignment, ClassSession, EvaluationMethod } from "@/domain/types";
import { patchSession, useAction } from "./session-tools";
import { teacherHref } from "./teacher-frame";

export const METHODS: { id: EvaluationMethod; label: string; hint: string }[] = [
  { id: "oral", label: "Defensa oral", hint: "Cada alumno defiende frente a la clase, uno por uno." },
  { id: "escrito", label: "Defensa en el celular", hint: "Cada alumno responde por escrito desde su teléfono." },
  { id: "papel", label: "Evaluación en papel", hint: "Imprimes el examen y calificas las respuestas tú." },
];

export function methodLabel(method: EvaluationMethod) {
  return METHODS.find((m) => m.id === method)?.label ?? method;
}

const QUICK_MINUTES = [30, 60, 120];

type Config = Pick<ClassSession, "method" | "deadline" | "expectedStudents" | "questionsPerStudent" | "gradeScale" | "passingGrade">;

/** Teacher's setup of the exam: how students defend, deadline, how many students, grading scale. */
export function SessionConfigCard({
  id,
  teacherKey,
  assignment,
  load,
  setError,
}: {
  id: string;
  teacherKey: string;
  assignment: Assignment;
  load: () => Promise<void>;
  setError: (message: string | null) => void;
}) {
  const router = useRouter();
  const live = isLive(assignment);
  const session = sessionOf(assignment);
  const { busy, run } = useAction(load, setError);
  const [method, setMethod] = useState<EvaluationMethod>(session.method);
  const [deadline, setDeadline] = useState(() => toLocalInput(session.deadline));
  const [expected, setExpected] = useState(String(session.expectedStudents));
  const [questions, setQuestions] = useState(String(session.questionsPerStudent));
  const [scale, setScale] = useState(String(session.gradeScale));
  const [passing, setPassing] = useState(String(session.passingGrade));
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const locked = live && session.phase !== "entregas";
  const expired = live && session.phase === "entregas" && session.deadline !== null && formatRemaining(session.deadline, Date.now()) === null;

  function validate(): Config | string {
    const expectedN = Number(expected || 0);
    const questionsN = Number(questions);
    const scaleN = Number(scale);
    const passingN = Number(passing);
    if (!Number.isInteger(expectedN) || expectedN < 0 || expectedN > 500) return "Alumnos esperados: escribe un número entre 0 y 500.";
    if (!Number.isInteger(questionsN) || questionsN < 1 || questionsN > 5) return "Preguntas por alumno: elige entre 1 y 5.";
    if (!Number.isInteger(scaleN) || scaleN < 1 || scaleN > 100) return "La escala de notas va de 1 a 100 (en Perú suele ser 20).";
    if (!Number.isFinite(passingN) || passingN < 0 || passingN > scaleN) return "La nota mínima aprobatoria no puede ser mayor que la escala.";
    const deadlineIso = fromLocalInput(deadline);
    if (deadline && !deadlineIso) return "El plazo no es una fecha válida.";
    if (deadlineIso && new Date(deadlineIso).getTime() <= Date.now()) return "El plazo tiene que ser una hora futura.";
    return { method, deadline: deadlineIso, expectedStudents: expectedN, questionsPerStudent: questionsN, gradeScale: scaleN, passingGrade: passingN };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const config = validate();
    if (typeof config === "string") {
      setFormError(config);
      setSaved(false);
      return;
    }
    setFormError(null);
    const first = !live;
    const ok = await run(() => patchSession(id, teacherKey, { ...config, phase: "entregas" }));
    if (!ok) return;
    if (first) router.push(teacherHref(id, teacherKey, "entregas"));
    else setSaved(true);
  }

  function setDeadlineIn(minutes: number) {
    setDeadline(toLocalInput(new Date(Date.now() + minutes * 60_000).toISOString()));
    setSaved(false);
  }

  return (
    <section id="configurar" className="card grid gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[1.375rem]">Configura la entrega</h2>
        {!live && <span className="chip chip-neutral">Sin iniciar</span>}
        {live && session.phase === "entregas" && (
          <span className={`chip ${expired ? "chip-danger" : "chip-brand"}`}>{expired ? "Plazo vencido" : "Recibiendo entregas"}</span>
        )}
        {locked && <span className="chip chip-success">{session.phase === "defensas" ? "En evaluación" : "Notas publicadas"}</span>}
      </div>

      {locked ? (
        <div className="grid gap-3">
          <p className="text-graphite">
            La recepción ya cerró, así que la configuración quedó fija: {methodLabel(session.method).toLowerCase()},{" "}
            {session.questionsPerStudent} pregunta(s) por alumno, notas sobre {session.gradeScale}.
          </p>
          <Link href={teacherHref(id, teacherKey, "evaluacion")} className="btn justify-self-start">
            Ir a la evaluación
          </Link>
        </div>
      ) : (
        <form onSubmit={save} className="grid gap-5">
          {!live && (
            <p className="text-[0.9375rem] text-graphite">
              Mientras no inicies la recepción, cada alumno entrega y defiende por su cuenta, sin plazo. Al iniciarla tú controlas el plazo y cuándo empieza la evaluación.
            </p>
          )}

          <fieldset className="grid gap-2">
            <legend className="mb-1 font-bold">¿Cómo defienden los alumnos?</legend>
            {METHODS.map((m) => (
              <label key={m.id} className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border-2 p-3 ${method === m.id ? "border-brand bg-brand-subtle" : "border-rule"}`}>
                <input
                  type="radio"
                  name="method"
                  className="mt-1 size-4"
                  checked={method === m.id}
                  onChange={() => {
                    setMethod(m.id);
                    setSaved(false);
                  }}
                />
                <span className="grid gap-0.5">
                  <span className="font-bold">{m.label}</span>
                  <span className="text-[0.9375rem] text-graphite">{m.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="grid gap-2">
            <label htmlFor="plazo" className="font-bold">
              Plazo de entrega <span className="font-normal text-graphite">(opcional)</span>
            </label>
            <input
              id="plazo"
              type="datetime-local"
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                setSaved(false);
              }}
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_MINUTES.map((m) => (
                <button key={m} type="button" className="btn-secondary" onClick={() => setDeadlineIn(m)}>
                  {m < 60 ? `En ${m} min` : `En ${m / 60} h`}
                </button>
              ))}
              <button type="button" className="btn-quiet" onClick={() => setDeadline("")}>
                Sin plazo
              </button>
            </div>
            <p className="text-[0.9375rem] text-graphite">Pasado el plazo, nadie puede entregar. Sin plazo, cierras tú cuando quieras.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-bold">Alumnos en la clase</span>
              <input type="number" min={0} max={500} inputMode="numeric" value={expected} onChange={(e) => setExpected(e.target.value)} />
              <span className="text-[0.9375rem] text-graphite">Para ver cuántos faltan por entregar.</span>
            </label>
            <label className="grid gap-2">
              <span className="font-bold">Preguntas por alumno</span>
              <input type="number" min={1} max={5} inputMode="numeric" value={questions} onChange={(e) => setQuestions(e.target.value)} />
              <span className="text-[0.9375rem] text-graphite">De 1 a 5.</span>
            </label>
            <label className="grid gap-2">
              <span className="font-bold">Escala de notas</span>
              <input type="number" min={1} max={100} inputMode="numeric" value={scale} onChange={(e) => setScale(e.target.value)} />
              <span className="text-[0.9375rem] text-graphite">La nota máxima (20 en la escala vigesimal).</span>
            </label>
            <label className="grid gap-2">
              <span className="font-bold">Nota mínima para aprobar</span>
              <input type="number" min={0} max={100} step={0.5} inputMode="decimal" value={passing} onChange={(e) => setPassing(e.target.value)} />
            </label>
          </div>

          {formError && (
            <p role="alert" className="rounded-[var(--radius-md)] border-2 border-pen p-3 font-bold text-pen">
              {formError}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn" disabled={busy}>
              {busy ? "Guardando…" : live ? "Guardar cambios" : "Iniciar recepción de entregas"}
            </button>
            {live && (
              <Link href={teacherHref(id, teacherKey, "entregas")} className="btn-quiet">
                Ver las entregas
              </Link>
            )}
            <span role="status" className="font-bold text-success">
              {saved ? "Cambios guardados" : ""}
            </span>
          </div>
        </form>
      )}
    </section>
  );
}
