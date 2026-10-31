"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deliveryProgress, formatRemaining } from "@/app/session-format";
import { sessionOf } from "@/domain/session";
import type { Assignment } from "@/domain/types";
import { methodLabel } from "./session-config";
import { patchSession, useAction, useNow } from "./session-tools";
import { teacherHref } from "./teacher-frame";

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

/** While the session is open to submissions: who handed in, how long is left, and the button that starts the evaluation. */
export function ReceptionPanel({
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
  const session = sessionOf(assignment);
  const { busy, run } = useAction(load, setError);
  const now = useNow(session.deadline !== null);
  const delivered = assignment.submissions.length;
  const remaining = session.deadline ? formatRemaining(session.deadline, now) : null;
  const expired = session.deadline !== null && remaining === null;
  const progress = deliveryProgress(delivered, session.expectedStudents);
  const missing = Math.max(0, session.expectedStudents - delivered);
  const recent = [...assignment.submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function startEvaluation() {
    const warnings = [
      !expired && session.deadline ? "Todavía queda tiempo de plazo." : "",
      missing > 0 ? `Faltan ${missing} alumno(s) por entregar.` : "",
    ].filter(Boolean);
    const message = `${warnings.join(" ")} Al iniciar la evaluación nadie más podrá entregar. ¿Continuar?`.trim();
    if ((warnings.length > 0 || !session.deadline) && !window.confirm(message)) return;
    const ok = await run(() => patchSession(id, teacherKey, { phase: "defensas" }));
    if (ok) router.push(teacherHref(id, teacherKey, "evaluacion"));
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="card grid gap-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2>Entregas recibidas</h2>
          <span className={`chip ${expired ? "chip-danger" : "chip-brand"}`}>{expired ? "Plazo vencido" : "Recibiendo entregas"}</span>
        </div>
        {recent.length === 0 ? (
          <div className="grid justify-items-start gap-3 rounded-[var(--radius-md)] bg-subtle p-5">
            <p>Todavía nadie entregó. Comparte el enlace con tus alumnos; esta lista se actualiza sola.</p>
            <Link href={teacherHref(id, teacherKey, "tarea")} className="btn-secondary">
              Ver el enlace para compartir
            </Link>
          </div>
        ) : (
          <ol className="grid gap-2" aria-label="Entregas, la más reciente primero">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-rule px-4 py-3">
                <span className="grid size-10 place-items-center rounded-full bg-subtle font-display font-bold" aria-hidden="true">
                  {s.alias.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-bold">{s.alias}</span>
                <span className="chip chip-success">Entregó</span>
                <span className="ml-auto tabular-nums text-graphite">{timeOf(s.createdAt)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="card grid gap-5 p-6">
        <h2 className="text-[1.375rem]">Estado de la recepción</h2>
        <dl className="grid gap-4">
          <div className="grid gap-1">
            <dt className="label text-graphite">Entregaron</dt>
            <dd className="stat-value">
              {delivered}
              {session.expectedStudents > 0 && <span className="text-graphite"> de {session.expectedStudents}</span>}
            </dd>
            {progress !== null && (
              <dd>
                <div
                  className="h-3 overflow-hidden rounded-full bg-subtle"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  aria-label="Alumnos que ya entregaron"
                >
                  <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
                </div>
              </dd>
            )}
          </div>
          <div className="grid gap-1">
            <dt className="label text-graphite">Plazo</dt>
            <dd className={`stat-value tabular-nums ${expired ? "text-pen" : ""}`}>
              {session.deadline ? (remaining ?? "Vencido") : "Sin plazo"}
            </dd>
            <dd className="text-[0.9375rem] text-graphite">
              {session.deadline
                ? `Cierra a las ${timeOf(session.deadline)}`
                : "Cierras tú cuando quieras."}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="label text-graphite">Método</dt>
            <dd className="font-bold">{methodLabel(session.method)}</dd>
          </div>
        </dl>
        <button type="button" className="btn justify-self-start" disabled={busy || delivered === 0} onClick={startEvaluation}>
          {busy ? "Iniciando…" : "Iniciar evaluación"}
        </button>
        {delivered === 0 && <p className="text-[0.9375rem] text-graphite">Se activa cuando llegue la primera entrega.</p>}
        <Link href={`${teacherHref(id, teacherKey, "tarea")}#configurar`} className="btn-quiet justify-self-start">
          Cambiar plazo o ajustes
        </Link>
      </section>
    </div>
  );
}
