"use client";

import { useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { AppBar, Logo } from "@/app/components/brand";
import { GapBar } from "@/app/components/gap-bar";
import { Waiting } from "@/app/components/waiting";
import { aiObtainableScore, averageGap, givenAwayCriteria, triage } from "@/domain/gap";
import type { Assignment, Criterion } from "@/domain/types";

const ATTEND_FIRST = 5;
const ATTENTION_GAP = 25;

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

function Kpi({ label, value, note, tone = "" }: { label: string; value: React.ReactNode; note: string; tone?: string }) {
  return (
    <div className="card grid content-start gap-1 p-5">
      <dt className="label text-graphite">{label}</dt>
      <dd className={`stat-value ${tone}`}>{value}</dd>
      <dd className="text-[0.9375rem] text-graphite">{note}</dd>
    </div>
  );
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
      <>
        <AppBar>
          <Logo />
        </AppBar>
        <main id="contenido" tabIndex={-1} className="container-page py-12 outline-none">
          {error ? (
            <p role="alert" className="font-bold text-pen">
              {error}
            </p>
          ) : (
            <p className="text-graphite">Cargando tu tarea…</p>
          )}
        </main>
      </>
    );
  }

  const { redesign, stress, submissions, insights } = assignment;
  const studentLink = typeof window === "undefined" ? "" : `${window.location.origin}/alumno/${id}`;
  const ranking = triage(redesign.criteria, submissions);
  const pending = submissions.filter((s) => !s.evaluation).length;
  const meanGap = averageGap(ranking);
  const toAttend = ranking.slice(0, ATTEND_FIRST).filter((r) => r.gap >= ATTENTION_GAP).length;
  const criterionName = (cid: string) => redesign.criteria.find((c) => c.id === cid)?.name ?? cid;
  const given = stress ? givenAwayCriteria(redesign.criteria, stress.redesigned.scores) : [];
  const givenIds = new Set(given.map((c) => c.id));

  function copyLink() {
    void navigator.clipboard.writeText(studentLink);
    setCopied(true);
  }

  const steps = [
    { href: "#rediseno", label: "Revisa el rediseño", done: true },
    { href: "#prueba", label: "Prueba con la IA sola", done: Boolean(stress) },
    { href: "#enlace", label: "Comparte el enlace", done: submissions.length > 0 },
    { href: "#atender", label: "Mira quién entendió", done: ranking.length > 0 },
  ];

  return (
    <>
      <AppBar>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <Logo />
          <span className="hidden h-6 w-px bg-rule md:block" aria-hidden="true" />
          <span className="text-graphite">
            {assignment.subject} · <span className="font-bold text-ink">{assignment.title}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-secondary" onClick={copyLink}>
            {copied ? "Enlace copiado" : "Copiar enlace para alumnos"}
          </button>
          <button type="button" className="btn" disabled={busy !== null || ranking.length === 0} onClick={() => run("insights")}>
            {busy === "insights" ? "Analizando la clase…" : insights ? "Volver a analizar la clase" : "Analizar la clase"}
          </button>
        </div>
      </AppBar>
      <span className="sr-only" role="status">
        {copied ? "Enlace copiado al portapapeles." : ""}
      </span>

      <main id="contenido" tabIndex={-1} className="container-page grid gap-10 py-10 outline-none">
        <section className="grid gap-6">
          <div className="grid gap-3">
            <span className="chip chip-brand justify-self-start">Panel de la tarea</span>
            <h1 className="max-w-[24ch] text-[clamp(2rem,4vw,3rem)]">{assignment.title}</h1>
            <p className="prose-measure text-graphite">{redesign.rationale}</p>
          </div>
          <nav aria-label="Pasos de la tarea">
            <ol className="steps">
              {steps.map((step, i) => (
                <li key={step.href}>
                  <a href={step.href} className={`underline-offset-4 hover:underline ${step.done ? "step-done" : ""}`}>
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
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label="IA sola, tarea original"
              value={stress ? `${aiObtainableScore(redesign.originalCriteria, stress.original.scores)}%` : "—"}
              note={stress ? "Lo que sacaba sin ningún alumno." : "Corre la prueba para medirlo."}
              tone={stress ? "text-pen" : "text-graphite"}
            />
            <Kpi
              label="IA sola, tarea rediseñada"
              value={stress ? `${aiObtainableScore(redesign.criteria, stress.redesigned.scores)}%` : "—"}
              note={stress ? "El resto se gana en la defensa." : "Corre la prueba para medirlo."}
              tone={stress ? "text-success" : "text-graphite"}
            />
            <Kpi
              label="Defensas recibidas"
              value={ranking.length}
              note={pending > 0 ? `${pending} alumno(s) defendiendo ahora.` : "Se actualiza al recargar."}
            />
            <Kpi
              label="Brecha promedio"
              value={meanGap === null ? "—" : `${meanGap}%`}
              note={meanGap === null ? "Aparece con la primera defensa." : `${toAttend} alumno(s) para atender primero.`}
              tone={meanGap !== null && meanGap >= ATTENTION_GAP ? "text-pen" : ""}
            />
          </dl>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid gap-8">
            <section id="atender" className="card grid gap-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2>A quién atender esta semana</h2>
                <button className="btn-quiet" disabled={busy !== null} onClick={() => run("refresh")}>
                  {busy === "refresh" ? "Actualizando…" : "Actualizar"}
                </button>
              </div>
              <p className="prose-measure text-graphite">
                Brecha: cuánto de lo que el alumno entregó no pudo explicar en su defensa. La nota final la pones tú.
              </p>
              {ranking.length === 0 ? (
                <p className="rounded-[var(--radius-md)] bg-subtle p-5">
                  Todavía no hay defensas. Comparte el enlace y vuelve en unos minutos.
                </p>
              ) : (
                <ol className="grid gap-3">
                  {ranking.map((r, i) => {
                    const s = submissions.find((x) => x.id === r.submissionId)!;
                    const attend = i < ATTEND_FIRST && r.gap >= ATTENTION_GAP;
                    return (
                      <li
                        key={r.submissionId}
                        className={`rounded-[var(--radius-md)] border-2 ${attend ? "border-pen bg-danger-subtle/40" : "border-rule"}`}
                      >
                        <details className="group">
                          <summary className="flex min-h-14 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                            <span
                              className="grid size-10 place-items-center rounded-full bg-subtle font-display font-bold"
                              aria-hidden="true"
                            >
                              {r.alias.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="font-bold">{r.alias}</span>
                            <span className={`chip ${attend ? "chip-danger" : "chip-success"}`}>
                              {attend ? "Atender primero" : "Explica lo que entregó"}
                            </span>
                            <span className={`ml-auto tabular-nums ${r.gap >= ATTENTION_GAP ? "font-bold text-pen" : "text-graphite"}`}>
                              Brecha {r.gap}%
                            </span>
                          </summary>
                          <div className="grid gap-4 border-t border-rule px-4 py-4 text-[0.9375rem]">
                            <p>{s.evaluation!.summary}</p>
                            {s.evaluation!.perCriterion.map((p) => (
                              <div key={p.criterionId} className="grid gap-2">
                                <span className="font-bold">{criterionName(p.criterionId)}</span>
                                <GapBar submitted={p.submissionScore} explained={p.defenseScore} />
                                {p.misconception && (
                                  <p>
                                    <span className="pen-mark">{p.misconception}</span>
                                    <br />
                                    <span className="text-graphite">&ldquo;{p.evidenceQuote}&rdquo;</span>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <section id="prueba" className="card grid gap-5 p-6 sm:p-8">
              <h2>Prueba de estrés: ¿cuánta nota saca la IA sola?</h2>
              <p className="prose-measure text-graphite">
                Una IA resuelve la tarea sin ningún alumno detrás. Los criterios que se verifican en la defensa no se pueden delegar, así
                que solo cuenta lo que la IA logra por escrito.
              </p>
              {!stress && (
                <div>
                  <button className="btn" disabled={busy !== null} onClick={() => run("stress")}>
                    {busy === "stress" ? "La IA está resolviendo las dos versiones…" : "Probar la tarea con la IA sola"}
                  </button>
                </div>
              )}
              {busy === "stress" && (
                <Waiting steps={STRESS_STEPS} expected="suele tardar unos 2 minutos; puedes compartir el enlace mientras" />
              )}
              {stress && (
                <>
                  {given.length > 0 ? (
                    <p>
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
                    <p>Ningún criterio escrito queda regalado a la IA.</p>
                  )}
                  <details>
                    <summary className="btn-quiet cursor-pointer">Ver lo que entregó la IA</summary>
                    <pre className="prose-measure mt-3 whitespace-pre-wrap rounded-[var(--radius-md)] bg-subtle p-4 font-mono text-sm text-graphite">
                      {stress.redesigned.aiAnswer}
                    </pre>
                  </details>
                </>
              )}
            </section>

            <section id="rediseno" className="card grid gap-5 p-6 sm:p-8">
              <h2>Tarea rediseñada</h2>
              <p className="prose-measure whitespace-pre-line">{redesign.statement}</p>
              <p className="prose-measure rounded-[var(--radius-md)] border-l-4 border-brand bg-brand-subtle p-4 font-bold">
                {redesign.aiPolicy}
              </p>
            </section>
          </div>

          <aside className="grid gap-8" aria-label="Acciones de la clase">
            <section className="card grid gap-4 p-6">
              <h2 className="text-[1.375rem]">Qué reforzar mañana</h2>
              <p className="text-[0.9375rem] text-graphite">
                Agrupamos los malentendidos de toda la clase y te sugerimos una actividad corta para cada uno.
              </p>
              {!insights && busy !== "insights" && (
                <p className="rounded-[var(--radius-md)] bg-subtle p-4 text-[0.9375rem]">
                  {ranking.length === 0
                    ? "Aparece cuando lleguen las primeras defensas."
                    : "Usa «Analizar la clase» arriba para agruparlos."}
                </p>
              )}
              {busy === "insights" && <Waiting steps={INSIGHT_STEPS} expected="suele tardar menos de un minuto" />}
              {insights && insights.clusters.length === 0 && <p>No aparecieron malentendidos repetidos.</p>}
              {insights && insights.clusters.length > 0 && (
                <ul className="grid gap-5">
                  {insights.clusters.map((c) => (
                    <li key={c.label} className="grid gap-2">
                      <h3 className="text-[1.0625rem]">
                        {c.label}{" "}
                        <span className="chip chip-neutral ml-1 align-middle">{c.studentAliases.length} alumno(s)</span>
                      </h3>
                      {c.quotes.map((q) => (
                        <p key={q} className="text-[0.9375rem] italic text-graphite">
                          &ldquo;{q}&rdquo;
                        </p>
                      ))}
                      <p className="rounded-[var(--radius-md)] bg-highlight-subtle p-4 text-[0.9375rem]">
                        <span className="label block">Actividad de 10 minutos</span>
                        {c.suggestion}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section id="enlace" className="card grid gap-4 p-6">
              <h2 className="text-[1.375rem]">Enlace para tus alumnos</h2>
              <code className="break-all rounded-[var(--radius-md)] bg-subtle px-3 py-2 font-mono text-sm">{studentLink}</code>
              <button type="button" className="btn-secondary justify-self-start" onClick={copyLink}>
                {copied ? "Enlace copiado" : "Copiar enlace"}
              </button>
              <p className="text-[0.9375rem] text-graphite">
                Guarda la dirección de esta página: es tu acceso de docente y no la compartas con alumnos.
              </p>
            </section>

            <section className="card grid gap-4 p-6">
              <h2 className="text-[1.375rem]">Rúbrica rediseñada</h2>
              <ul className="grid gap-4">
                {redesign.criteria.map((c) => (
                  <li key={c.id} className="grid gap-1.5 border-b border-rule pb-4 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-bold">{c.name}</span>
                      <span className="label tabular-nums">{c.weight}%</span>
                    </div>
                    <span className="text-[0.9375rem] text-graphite">{c.description}</span>
                    <span className="flex flex-wrap gap-2">
                      <span className={`chip ${c.evidence === "defensa" ? "chip-brand" : "chip-neutral"}`}>{evidenceLabel(c)}</span>
                      {givenIds.has(c.id) && <span className="chip chip-danger">La IA lo resuelve sola</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card grid gap-3 p-6">
              <h2 className="text-[1.375rem]">Banco de la comunidad</h2>
              <p className="text-[0.9375rem] text-graphite">
                Próximamente: las preguntas de defensa y los malentendidos que validan docentes con experiencia quedan disponibles para
                todos, por curso y nivel. Lo que sabe un docente que se jubila se queda en el sistema.
              </p>
              <ul className="grid gap-2 text-[0.9375rem]">
                <li>Programación · búsqueda binaria · &ldquo;Cree que la lista no necesita estar ordenada&rdquo; · validado por 4 docentes</li>
                <li>Matemática · funciones · &ldquo;Confunde dominio con rango al leer la gráfica&rdquo; · validado por 7 docentes</li>
              </ul>
            </section>
          </aside>
        </div>

        {error && (
          <p role="alert" className="sticky bottom-4 rounded-[var(--radius-md)] border-2 border-pen bg-surface p-4 font-bold text-pen">
            {error}
          </p>
        )}
      </main>
    </>
  );
}
