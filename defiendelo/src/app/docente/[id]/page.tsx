"use client";

import Link from "next/link";
import { use, useState } from "react";
import { api } from "@/app/api-client";
import { AssignmentSheet, PrintSheetButton } from "@/app/components/assignment-sheet";
import { Waiting } from "@/app/components/waiting";
import { assignmentSummary, givenAwayCriteria } from "@/domain/gap";
import type { Assignment } from "@/domain/types";
import { TeacherFrame, teacherHref, useTeacherAssignment } from "./teacher-frame";

const STRESS_STEPS = [
  { after: 0, text: "La IA está leyendo la tarea original…" },
  { after: 20, text: "Resolviendo la tarea original sin ningún alumno detrás…" },
  { after: 45, text: "Ahora resuelve la versión rediseñada…" },
  { after: 75, text: "Corrigiendo las dos versiones con sus rúbricas…" },
  { after: 105, text: "Sumando cuánta nota sacó en cada una. Ya casi." },
];

function Score({ label, value, tone }: { label: string; value: number | null; tone: string }) {
  return (
    <div className="grid content-start gap-1 rounded-[var(--radius-md)] bg-subtle p-4">
      <dt className="label text-graphite">{label}</dt>
      <dd className={`stat-value ${value === null ? "text-graphite" : tone}`}>{value === null ? "—" : `${Math.round(value)}%`}</dd>
    </div>
  );
}

/** First teacher screen: the redesigned task, its test against the AI alone, and the link to share. */
export default function TeacherTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assignment, setAssignment, teacherKey, error, setError } = useTeacherAssignment(id);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!assignment) return <TeacherFrame id={id} teacherKey={teacherKey} assignment={null} section="tarea" error={error} />;

  const { redesign, stress, submissions } = assignment;
  const studentLink = typeof window === "undefined" ? "" : `${window.location.origin}/alumno/${id}`;
  const { aiOriginal, aiRedesigned } = assignmentSummary(assignment);
  const given = stress ? givenAwayCriteria(redesign.criteria, stress.redesigned.scores) : [];

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

  return (
    <TeacherFrame id={id} teacherKey={teacherKey} assignment={assignment} section="tarea" error={error}>
      <div className="grid items-start gap-8 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <div className="grid gap-8">
          <section id="enlace" className="card grid gap-4 p-6">
            <h2 className="text-[1.375rem]">Compártela con tus alumnos</h2>
            <code className="break-all rounded-[var(--radius-md)] bg-subtle px-3 py-2 font-mono text-sm">{studentLink}</code>
            <button
              type="button"
              className="btn-secondary justify-self-start"
              onClick={() => {
                void navigator.clipboard.writeText(studentLink);
                setCopied(true);
              }}
            >
              {copied ? "Enlace copiado" : "Copiar enlace"}
            </button>
            <p className="text-[0.9375rem] text-graphite">Guarda esta página: es solo para ti.</p>
            {submissions.length > 0 && (
              <Link href={teacherHref(id, teacherKey, "entregas")} className="btn justify-self-start">
                Ver las {submissions.length} entregas
              </Link>
            )}
          </section>

          <section id="prueba" className="card grid gap-4 p-6">
            <h2 className="text-[1.375rem]">¿Cuánta nota saca la IA sola?</h2>
            <dl className="grid grid-cols-2 gap-3">
              <Score label="Tarea de siempre" value={aiOriginal} tone="text-pen" />
              <Score label="Tarea rediseñada" value={aiRedesigned} tone="text-success" />
            </dl>
            {!stress && (
              <button className="btn justify-self-start" disabled={testing} onClick={runStress}>
                {testing ? "La IA está resolviendo las dos versiones…" : "Probar con la IA sola"}
              </button>
            )}
            {testing && <Waiting steps={STRESS_STEPS} expected="suele tardar unos 2 minutos; puedes compartir el enlace mientras" />}
            {stress && (
              <>
                {given.length > 0 ? (
                  <p>
                    La IA todavía resuelve sola:{" "}
                    {given.map((c, i) => (
                      <span key={c.id}>
                        {i > 0 && ", "}
                        <span className="pen-mark">{c.name}</span>
                      </span>
                    ))}
                    .
                  </p>
                ) : (
                  <p>La IA sola ya no aprueba ningún criterio escrito.</p>
                )}
                <details>
                  <summary className="btn-quiet cursor-pointer">Ver lo que entregó la IA</summary>
                  <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-subtle p-4 font-mono text-sm text-graphite">
                    {stress.redesigned.aiAnswer}
                  </pre>
                </details>
              </>
            )}
          </section>
        </div>

        <section id="rediseno" className="card grid gap-5 p-4 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2>Tarea rediseñada</h2>
            <PrintSheetButton sheetId="hoja-tarea" />
          </div>
          <AssignmentSheet
            id="hoja-tarea"
            title={assignment.title}
            subject={assignment.subject}
            statement={redesign.statement}
            aiPolicy={redesign.aiPolicy}
            criteria={redesign.criteria}
          />
        </section>
      </div>
    </TeacherFrame>
  );
}
