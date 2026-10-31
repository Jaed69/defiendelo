"use client";

import { useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { Waiting } from "@/app/components/waiting";
import { aiObtainableScore, givenAwayCriteria, triage } from "@/domain/gap";
import type { Assignment, Criterion } from "@/domain/types";

const ATTEND_FIRST = 5;

const STRESS_STEPS = [
  { after: 0, text: "La IA está leyendo la tarea original…" },
  { after: 20, text: "Resolviendo la tarea original sin ningún alumno detrás…" },
  { after: 45, text: "Ahora resuelve la versión rediseñada…" },
  { after: 75, text: "Corrigiendo las dos versiones con sus rúbricas…" },
  { after: 105, text: "Sumando cuánta nota sacó en cada una. Ya casi." },
];

const INSIGHT_STEPS = [
  { after: 0, text: "Leyendo las defensas de la clase…" },
  { after: 10, text: "Agrupando malentendidos parecidos…" },
  { after: 25, text: "Escribiendo una actividad corta para cada uno. Ya casi." },
];

function evidenceLabel(c: Criterion) {
  return c.evidence === "defensa" ? "En la defensa" : "En la entrega";
}

export default function TeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const teacherKey = useSearchParams().get("k") ?? "";
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [busy, setBusy] = useState<"stress" | "insights" | "refresh" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setAssignment(await api<Assignment>(`/api/assignments/${id}`, { teacherKey }));
  }, [id, teacherKey]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function run(kind: "stress" | "insights" | "refresh") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "refresh") await load();
      else setAssignment(await api<Assignment>(`/api/assignments/${id}/${kind}`, { method: "POST", teacherKey }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (!assignment) {
    return (
      <main>
        {error ? (
          <p role="alert" className="font-bold text-pen">
            {error}
          </p>
        ) : (
          <p className="text-graphite">Cargando tu tarea…</p>
        )}
      </main>
    );
  }

  const { redesign, stress, submissions, insights } = assignment;
  const studentLink = typeof window === "undefined" ? "" : `${window.location.origin}/alumno/${id}`;
  const ranking = triage(redesign.criteria, submissions);
  const pending = submissions.filter((s) => !s.evaluation).length;
  const criterionName = (cid: string) => redesign.criteria.find((c) => c.id === cid)?.name ?? cid;

  return (
    <main>
      <section>
        <p className="font-display font-bold text-pen">{assignment.subject}</p>
        <h1 className="mt-2">{assignment.title}</h1>
        <p className="prose-measure mt-4 text-graphite">{redesign.rationale}</p>
        <nav aria-label="Pasos de la tarea" className="mt-6">
          <ol className="steps">
            {[
              { href: "#rediseno", label: "Revisa el rediseño", done: true },
              { href: "#prueba", label: "Prueba con la IA sola", done: Boolean(stress) },
              { href: "#enlace", label: "Comparte el enlace", done: submissions.length > 0 },
              { href: "#atender", label: "Mira quién entendió", done: ranking.length > 0 },
            ].map((step, i) => (
              <li key={step.href}>
                <a href={step.href} className="underline-offset-4 hover:underline">
                  <span className="step-number" aria-hidden="true">
                    {step.done ? "✓" : i + 1}
                  </span>
                  {step.label}
                  {step.done && <span className="sr-only"> (hecho)</span>}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <section id="rediseno">
        <h2>Tarea rediseñada</h2>
        <p className="prose-measure mt-4 whitespace-pre-line">{redesign.statement}</p>
        <p className="prose-measure mt-4 border-l-4 border-ink pl-4 font-bold">{redesign.aiPolicy}</p>
        <table className="mt-6 w-full text-left text-sm">
          <thead className="border-b border-rule text-graphite">
            <tr>
              <th className="py-2 pr-3 font-bold">Criterio</th>
              <th className="py-2 pr-3 font-bold">Peso</th>
              <th className="py-2 font-bold">Se verifica</th>
            </tr>
          </thead>
          <tbody>
            {redesign.criteria.map((c) => (
              <tr key={c.id} className="border-b border-rule align-top">
                <td className="py-2.5 pr-3">
                  <span className="font-bold">{c.name}</span>
                  <br />
                  <span className="text-graphite">{c.description}</span>
                </td>
                <td className="py-2.5 pr-3 tabular-nums">{c.weight}%</td>
                <td className="py-2.5">{evidenceLabel(c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="prueba">
        <h2>Prueba de estrés: ¿cuánta nota saca la IA sola?</h2>
        <p className="prose-measure mt-3 text-graphite">
          Una IA resuelve la tarea sin ningún alumno detrás. Los criterios que se verifican en la defensa no se pueden
          delegar, así que solo cuenta lo que la IA logra por escrito.
        </p>
        {!stress && (
          <button className="btn mt-5" disabled={busy !== null} onClick={() => run("stress")}>
            {busy === "stress" ? "La IA está resolviendo las dos versiones…" : "Probar la tarea con la IA sola"}
          </button>
        )}
        {busy === "stress" && (
          <Waiting steps={STRESS_STEPS} expected="suele tardar unos 2 minutos; puedes compartir el enlace mientras" />
        )}
        {stress && (
          <>
            <dl className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <dt className="text-graphite">Tarea original</dt>
                <dd className="font-display text-5xl font-extrabold tabular-nums text-pen">
                  {aiObtainableScore(redesign.originalCriteria, stress.original.scores)}%
                </dd>
              </div>
              <div>
                <dt className="text-graphite">Tarea rediseñada</dt>
                <dd className="font-display text-5xl font-extrabold tabular-nums">
                  {aiObtainableScore(redesign.criteria, stress.redesigned.scores)}%
                </dd>
              </div>
            </dl>
            {(() => {
              const given = givenAwayCriteria(redesign.criteria, stress.redesigned.scores);
              return given.length > 0 ? (
                <p className="mt-5">
                  Criterios que la IA todavía resuelve sola:{" "}
                  {given.map((c, i) => (
                    <span key={c.id}>
                      {i > 0 && ", "}
                      <span className="pen-mark">{c.name}</span>
                    </span>
                  ))}
                  . Considera moverlos a la defensa o bajar su peso.
                </p>
              ) : (
                <p className="mt-5">Ningún criterio escrito queda regalado a la IA.</p>
              );
            })()}
            <details className="mt-5">
              <summary className="cursor-pointer font-bold">Ver lo que entregó la IA</summary>
              <p className="prose-measure mt-3 whitespace-pre-line text-sm text-graphite">{stress.redesigned.aiAnswer}</p>
            </details>
          </>
        )}
      </section>

      <section id="enlace">
        <h2>Enlace para tus alumnos</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="break-all rounded bg-ink-soft px-3 py-2 text-sm">{studentLink}</code>
          <button
            className="btn-outline"
            onClick={() => {
              void navigator.clipboard.writeText(studentLink);
              setCopied(true);
            }}
          >
            {copied ? "Enlace copiado" : "Copiar enlace"}
          </button>
          <span className="sr-only" role="status">
            {copied ? "Enlace copiado al portapapeles." : ""}
          </span>
        </div>
        <p className="mt-3 text-sm text-graphite">
          Guarda la dirección de esta página: es tu acceso de docente y no la compartas con alumnos.
        </p>
      </section>

      <section id="atender">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2>A quién atender esta semana</h2>
          <button className="btn-quiet" disabled={busy !== null} onClick={() => run("refresh")}>
            {busy === "refresh" ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
        <p className="prose-measure mt-3 text-graphite">
          Brecha: cuánto de lo que el alumno entregó no pudo explicar en su defensa. La nota final la pones tú.
        </p>
        {ranking.length === 0 ? (
          <p className="mt-5">Todavía no hay defensas. Comparte el enlace y vuelve en unos minutos.</p>
        ) : (
          <ol className="mt-5 grid gap-3">
            {ranking.map((r, i) => {
              const s = submissions.find((x) => x.id === r.submissionId)!;
              return (
                <li key={r.submissionId} className={`border-l-4 pl-4 ${i < ATTEND_FIRST && r.gap >= 25 ? "border-pen" : "border-rule"}`}>
                  <details>
                    <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-4">
                      <span className="font-bold">{r.alias}</span>
                      <span className={`tabular-nums ${r.gap >= 25 ? "font-bold text-pen" : "text-graphite"}`}>
                        Brecha {r.gap}%
                      </span>
                    </summary>
                    <div className="mt-3 grid gap-3 text-sm">
                      <p>{s.evaluation!.summary}</p>
                      {s.evaluation!.perCriterion
                        .filter((p) => p.misconception)
                        .map((p) => (
                          <p key={p.criterionId}>
                            <span className="font-bold">{criterionName(p.criterionId)}:</span>{" "}
                            <span className="pen-mark">{p.misconception}</span>
                            <br />
                            <span className="text-graphite">&ldquo;{p.evidenceQuote}&rdquo;</span>
                          </p>
                        ))}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
        {pending > 0 && <p className="mt-4 text-sm text-graphite">{pending} alumno(s) están defendiendo ahora.</p>}
      </section>

      <section>
        <h2>Qué reforzar en la próxima clase</h2>
        <p className="prose-measure mt-3 text-graphite">
          Agrupamos los malentendidos de toda la clase y te sugerimos una actividad corta para cada uno.
        </p>
        <button className="btn mt-5" disabled={busy !== null || ranking.length === 0} onClick={() => run("insights")}>
          {busy === "insights" ? "Analizando la clase…" : insights ? "Volver a analizar la clase" : "Analizar la clase"}
        </button>
        {busy === "insights" && <Waiting steps={INSIGHT_STEPS} expected="suele tardar menos de un minuto" />}
        {insights && insights.clusters.length === 0 && <p className="mt-5">No aparecieron malentendidos repetidos.</p>}
        {insights && insights.clusters.length > 0 && (
          <ul className="mt-6 grid gap-6">
            {insights.clusters.map((c) => (
              <li key={c.label} className="grid gap-2">
                <h3>
                  {c.label} <span className="font-body text-base font-normal text-graphite">({c.studentAliases.length} alumno(s))</span>
                </h3>
                {c.quotes.map((q) => (
                  <p key={q} className="text-sm text-graphite">&ldquo;{q}&rdquo;</p>
                ))}
                <p className="border-l-4 border-ink pl-4">{c.suggestion}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Banco de la comunidad</h2>
        <p className="prose-measure mt-3 text-graphite">
          Próximamente: las preguntas de defensa y los malentendidos que validan docentes con experiencia quedan
          disponibles para todos, por curso y nivel. Lo que sabe un docente que se jubila se queda en el sistema.
        </p>
        <ul className="mt-4 grid gap-2 text-sm">
          <li>Programación · búsqueda binaria · &ldquo;Cree que la lista no necesita estar ordenada&rdquo; · validado por 4 docentes</li>
          <li>Matemática · funciones · &ldquo;Confunde dominio con rango al leer la gráfica&rdquo; · validado por 7 docentes</li>
        </ul>
      </section>

      {error && (
        <p role="alert" className="sticky bottom-4 mt-6 rounded-md border-2 border-pen bg-white p-4 font-bold text-pen">
          {error}
        </p>
      )}
    </main>
  );
}
