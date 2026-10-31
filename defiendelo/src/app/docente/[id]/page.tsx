"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { aiAloneGrade, evaluationSummary } from "@/app/class-summary";
import { AssignmentSheet, PrintSheetButton } from "@/app/components/assignment-sheet";
import { CheckIcon, CopyIcon, LockIcon, PenIcon, UsersIcon } from "@/app/components/icons";
import { Waiting } from "@/app/components/waiting";
import { assignmentSummary } from "@/domain/gap";
import { isLive, sessionOf } from "@/domain/session";
import type { Assignment } from "@/domain/types";
import { deadlineLabel, EvaluationSettings } from "./evaluation-settings";
import { RedesignEditor } from "./redesign-editor";
import { studentLinkFor, TeacherFrame, teacherHref, useTeacherAssignment } from "./teacher-frame";

const STRESS_STEPS = [
  { after: 0, text: "La IA está leyendo la tarea original…" },
  { after: 20, text: "Resolviendo la tarea original sin ningún alumno detrás…" },
  { after: 45, text: "Ahora resuelve la versión rediseñada…" },
  { after: 75, text: "Corrigiendo las dos versiones con sus rúbricas…" },
  { after: 105, text: "Sumando cuánta nota sacó en cada una. Ya casi." },
];

const STEPS = ["Revisa la tarea rediseñada", "Elige cómo evaluar", "Comparte el enlace", "Revisa las entregas"];

function Stepper({ done }: { done: boolean[] }) {
  const current = done.findIndex((d) => !d);
  return (
    <ol className="card flex flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3" aria-label="Pasos de la tarea">
      {STEPS.map((label, i) => {
        const finished = done[i];
        const now = i === current;
        return (
          <li key={label} aria-current={now ? "step" : undefined} className="flex min-w-0 flex-1 items-center gap-2.5">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-[0.875rem] font-bold ${
                finished ? "bg-success-fill text-white" : now ? "bg-brand text-white" : "bg-subtle text-graphite"
              }`}
            >
              {finished ? <CheckIcon size={15} /> : i + 1}
              <span className="sr-only">{finished ? " (hecho)" : now ? " (ahora)" : ""}</span>
            </span>
            <span className={`text-[0.9375rem] leading-tight ${now ? "font-bold text-ink" : finished ? "text-ink" : "text-graphite"} max-md:sr-only`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="hidden h-px min-w-4 flex-1 bg-rule md:block" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

/** D3 · Tu tarea: the redesigned sheet on the left; on the right, only the step that comes next. */
export default function TeacherTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { assignment, setAssignment, teacherKey, error, setError } = useTeacherAssignment(id);
  const [testing, setTesting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  // "Cambiar" on the submissions screen lands here with the settings open.
  const [changing, setChanging] = useState(useSearchParams().get("cambiar") === "1");
  const loaded = assignment !== null;

  useEffect(() => {
    if (loaded && window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [loaded]);

  if (!assignment) return <TeacherFrame id={id} teacherKey={teacherKey} assignment={null} section="tarea" error={error} />;

  const { redesign, stress, submissions } = assignment;
  const live = isLive(assignment);
  const session = sessionOf(assignment);
  const studentLink = studentLinkFor(id);
  const { aiOriginal, aiRedesigned } = assignmentSummary(assignment);
  const scale = live && session.grading === "literal" ? "literal" : "numerica";
  const handed = submissions.length;

  async function runStress() {
    setTesting(true);
    setError(null);
    try {
      setAssignment(await api<Assignment>(`/api/assignments/${id}/stress`, { method: "POST", teacherKey }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setTesting(false);
    }
  }

  async function simulate() {
    setSimulating(true);
    setError(null);
    try {
      await api<Assignment>(`/api/assignments/${id}/demo`, { method: "POST", teacherKey });
      router.push(teacherHref(id, teacherKey, "entregas"));
    } catch (e) {
      setError((e as Error).message);
      setSimulating(false);
    }
  }

  function copyLink() {
    void navigator.clipboard?.writeText(studentLink);
    setCopied(true);
  }

  return (
    <TeacherFrame id={id} teacherKey={teacherKey} assignment={assignment} section="tarea" error={error}>
      <Stepper done={[true, live, live && (copied || handed > 0), false]} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]">
        <section id="rediseno" className="card grid gap-5 p-4 sm:p-7" aria-labelledby="rediseno-titulo">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="grid justify-items-start gap-2">
              <span className="chip chip-success chip-dot">Lista para tus alumnos</span>
              <h2 id="rediseno-titulo" className="text-[1.5rem]">
                Tarea rediseñada
              </h2>
            </div>
            {!editing && (
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  <PenIcon size={16} /> Editar
                </button>
                <PrintSheetButton sheetId="hoja-tarea" label="Imprimir" />
              </div>
            )}
          </div>
          {editing ? (
            <RedesignEditor
              assignment={assignment}
              teacherKey={teacherKey}
              onCancel={() => setEditing(false)}
              onSaved={(next) => {
                setAssignment(next);
                setEditing(false);
              }}
            />
          ) : (
            <AssignmentSheet
              id="hoja-tarea"
              title={assignment.title}
              subject={assignment.subject}
              statement={redesign.statement}
              aiPolicy={redesign.aiPolicy}
              criteria={redesign.criteria}
            />
          )}
        </section>

        <div className="grid gap-5 lg:sticky lg:top-24">
          {!live || changing ? (
            <EvaluationSettings
              key={changing ? "cambiar" : "nuevo"}
              assignment={assignment}
              teacherKey={teacherKey}
              onCancel={changing ? () => setChanging(false) : undefined}
              onSaved={(next) => {
                setAssignment(next);
                setChanging(false);
              }}
            />
          ) : (
            <div className="rise flex items-start gap-3 rounded-[var(--radius-md)] bg-success-subtle px-4 py-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-success text-success">
                <CheckIcon size={13} />
              </span>
              <p className="grid flex-1 gap-0.5">
                <span className="font-bold text-success">Cómo evalúas</span>
                <span>{evaluationSummary(session, deadlineLabel(session.deadline, false))}</span>
              </p>
              <button type="button" className="min-h-11 font-bold text-brand-text hover:underline" onClick={() => setChanging(true)}>
                Cambiar
              </button>
            </div>
          )}

          {!live ? (
            <section className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-rule bg-subtle p-4 text-graphite" aria-label="Paso 3">
              <LockIcon className="mt-0.5" />
              <p className="grid gap-0.5">
                <span className="font-bold text-ink">Paso 3 · Comparte el enlace</span>
                <span className="text-[0.9375rem]">Se activa cuando guardes cómo evaluar.</span>
              </p>
            </section>
          ) : (
            !changing && (
              <section id="enlace" className="card rise grid gap-4 border-2 border-brand p-5 sm:p-6" aria-labelledby="enlace-titulo">
                <div className="grid gap-1">
                  <span className="text-[0.875rem] font-bold text-brand-text">{handed > 0 ? "Paso 4 de 4" : "Paso 3 de 4"}</span>
                  <h2 id="enlace-titulo" className="text-[1.5rem]">
                    Comparte el enlace
                  </h2>
                  <p className="text-[0.9375rem] text-graphite">Pásalo por WhatsApp o escríbelo en la pizarra. Tus alumnos no necesitan cuenta.</p>
                </div>
                <code className="break-all rounded-[var(--radius-md)] bg-subtle px-3 py-2.5 font-mono text-[0.9375rem]">{studentLink.replace(/^https?:\/\//, "")}</code>
                <button type="button" className={handed > 0 ? "btn-secondary w-full" : "btn w-full"} onClick={copyLink}>
                  <CopyIcon size={18} /> {copied ? "Enlace copiado" : "Copiar enlace"}
                </button>
                <span className="sr-only" role="status">
                  {copied ? "Enlace copiado al portapapeles." : ""}
                </span>
                {handed > 0 ? (
                  <Link href={teacherHref(id, teacherKey, "entregas")} className="btn w-full">
                    Ver las {handed === 1 ? "entrega" : `${handed} entregas`}
                  </Link>
                ) : (
                  <p className="text-[0.9375rem] text-graphite">Cuando entreguen, los verás en «2. Entregas».</p>
                )}
                {assignment.demo && handed === 0 && (
                  <div className="grid gap-2 border-t border-rule pt-4">
                    <button type="button" className="btn-secondary w-full" disabled={simulating} onClick={simulate}>
                      <UsersIcon size={18} /> {simulating ? "Simulando…" : "Simular entregas de la clase"}
                    </button>
                    <p className="text-[0.875rem] text-graphite">Alumnos de ejemplo entregan y responden al instante. Son datos inventados.</p>
                  </div>
                )}
              </section>
            )
          )}

          <section id="prueba" className="card grid gap-4 p-5 sm:p-6" aria-labelledby="prueba-titulo">
            <h2 id="prueba-titulo" className="text-[1.25rem]">
              ¿Y si un alumno se lo pasa a la IA?
            </h2>
            {stress && aiOriginal !== null && aiRedesigned !== null ? (
              <>
                <dl className="grid gap-4">
                  {(
                    [
                      { label: "Tu tarea de siempre", percent: aiOriginal, tone: "pen" },
                      { label: "La tarea rediseñada", percent: aiRedesigned, tone: "success" },
                    ] as const
                  ).map((row) => (
                    <div key={row.label} className="grid gap-1.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <dt className="font-bold">{row.label}</dt>
                        <dd className={`font-bold ${row.tone === "pen" ? "text-pen" : "text-success"}`}>
                          La IA sola saca {aiAloneGrade(row.percent, scale, session.gradeScale)}
                        </dd>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                        <div
                          className={`h-full rounded-full ${row.tone === "pen" ? "bg-[var(--color-text-danger)]" : "bg-success-fill"}`}
                          style={{ width: `${Math.max(2, Math.min(100, row.percent))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </dl>
                <details>
                  <summary className="btn-quiet cursor-pointer">
                    Ver lo que entregó la IA
                  </summary>
                  <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-subtle p-4 font-mono text-sm text-graphite">
                    {stress.redesigned.aiAnswer}
                  </pre>
                </details>
                <p className="text-[0.875rem] text-graphite">Se muestra en la escala que elijas.</p>
              </>
            ) : (
              <>
                <p className="text-graphite">Ponemos a la IA a resolver sola las dos versiones y las corregimos con su rúbrica.</p>
                <button className="btn-secondary justify-self-start" disabled={testing} onClick={runStress}>
                  {testing ? "La IA está resolviendo las dos versiones…" : "Probar con la IA sola"}
                </button>
                {testing && <Waiting steps={STRESS_STEPS} expected="suele tardar unos 2 minutos; puedes compartir el enlace mientras" />}
              </>
            )}
          </section>
        </div>
      </div>
    </TeacherFrame>
  );
}
