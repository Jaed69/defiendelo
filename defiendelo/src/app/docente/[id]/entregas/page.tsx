"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/app/api-client";
import { classSummary, sessionLine } from "@/app/class-summary";
import { CheckIcon, ClipboardCheckIcon, CopyIcon, UsersIcon } from "@/app/components/icons";
import { isGraded } from "@/domain/grading";
import { isLive, sessionOf } from "@/domain/session";
import type { Assignment } from "@/domain/types";
import { studentLinkFor, TeacherFrame, teacherHref, useTeacherAssignment } from "../teacher-frame";
import { OralPanel } from "./oral-panel";
import { PaperPanel } from "./paper-panel";
import { OpenSubmissions, type PanelProps } from "./session-panel";
import { reviewOrder, WrittenReview } from "./written-review";

const POLL_MS = 5000;

const AI_DOES = ["Sugiere un nivel por criterio y te muestra la evidencia.", "Agrupa los errores repetidos de la clase."];
const AI_DOES_NOT = ["No decide la nota: decides tú.", "No detecta si usaron IA.", "No lee emociones, voz ni cara.", "No guarda el archivo original."];

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="mt-1 shrink-0">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** What the AI does and does not do, said once above the students. */
function AiLimits() {
  return (
    <section className="card grid gap-4 p-4 sm:grid-cols-2 sm:p-5" aria-label="Qué hace y qué no hace la IA">
      <div className="grid content-start gap-2">
        <h2 className="text-[1rem] text-success">Lo que hace la IA</h2>
        <ul className="grid gap-1.5 text-[0.9375rem]">
          {AI_DOES.map((t) => (
            <li key={t} className="flex gap-2">
              <CheckIcon size={16} className="mt-1 text-success" /> {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid content-start gap-2">
        <h2 className="text-[1rem] text-pen">Lo que no hace</h2>
        <ul className="grid gap-1.5 text-[0.9375rem]">
          {AI_DOES_NOT.map((t) => (
            <li key={t} className="flex gap-2 text-ink">
              <span className="text-pen">
                <CrossIcon />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function EmptyClass({ assignment, teacherKey, busy, onSimulate }: { assignment: Assignment; teacherKey: string; busy: boolean; onSimulate: () => void }) {
  const [copied, setCopied] = useState(false);
  const live = isLive(assignment);
  return (
    <section className="card grid justify-items-start gap-4 p-6 sm:p-8" aria-labelledby="vacio-titulo">
      <h2 id="vacio-titulo" className="text-[1.5rem]">
        Todavía nadie entregó
      </h2>
      {assignment.demo ? (
        <>
          <p className="prose-measure text-graphite">
            Esta tarea es un ejemplo. Simula su clase: alumnos inventados entregan, responden sus preguntas y la IA sugiere su nota, al instante.
          </p>
          <button type="button" className="btn" disabled={busy} onClick={onSimulate}>
            <UsersIcon size={18} /> {busy ? "Simulando…" : "Simular entregas de la clase"}
          </button>
        </>
      ) : (
        <p className="prose-measure text-graphite">Comparte el enlace con tus alumnos. Sus entregas aparecen aquí solas.</p>
      )}
      {live ? (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            void navigator.clipboard?.writeText(studentLinkFor(assignment.id));
            setCopied(true);
          }}
        >
          <CopyIcon size={18} /> {copied ? "Enlace copiado" : "Copiar enlace para alumnos"}
        </button>
      ) : (
        <Link href={`${teacherHref(assignment.id, teacherKey, "tarea")}#evaluacion`} className="btn-secondary">
          Elegir cómo evaluar
        </Link>
      )}
    </section>
  );
}

/** D5 · Entregas: who handed in, the evidence behind each grade, and what to go over in class. */
export default function TeacherSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { assignment, setAssignment, teacherKey, error, setError, load } = useTeacherAssignment(id);
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const busyRef = useRef(false);

  const live = assignment ? isLive(assignment) : false;
  const phase = assignment ? sessionOf(assignment).phase : "entregas";

  // Students keep handing in and answering while the teacher has this open; never poll over a pending change.
  useEffect(() => {
    if (!assignment || phase === "publicado") return;
    const timer = setInterval(() => {
      if (!busyRef.current && document.visibilityState === "visible") void load().catch(() => {});
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [assignment, load, phase]);

  const call = useCallback(
    async (path: string, method: "PATCH" | "POST", body?: object) => {
      busyRef.current = true;
      setBusy(true);
      setError(null);
      try {
        const next = await api<Assignment>(path, { method, teacherKey, body: body ? JSON.stringify(body) : undefined });
        setAssignment(next);
        return next;
      } catch (e) {
        setError((e as Error).message);
        return null;
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [setAssignment, setError, teacherKey],
  );

  if (!assignment) return <TeacherFrame id={id} teacherKey={teacherKey} assignment={null} section="entregas" error={error} />;

  const session = sessionOf(assignment);
  const { submissions } = assignment;
  const send: PanelProps["send"] = (method, body) => call(`/api/assignments/${id}/session`, method, body);
  const simulate = () => void call(`/api/assignments/${id}/demo`, "POST");
  const props: PanelProps = { assignment, teacherKey, session, send, busy };

  async function analyze() {
    setAnalyzing(true);
    setError(null);
    try {
      setAssignment(await api<Assignment>(`/api/assignments/${id}/insights`, { method: "POST", teacherKey }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  const written = !live || session.method === "escrito";
  const { toReview, answering, needsHelp } = reviewOrder(assignment);
  const summary = written
    ? classSummary({
        handedIn: submissions.length,
        needHelp: submissions.filter(needsHelp).map((s) => s.alias),
        answering: answering.length,
      })
    : submissions.length === 0
      ? "Todavía nadie entregó."
      : `${submissions.length === 1 ? "1 alumno entregó" : `${submissions.length} alumnos entregaron`}.`;
  const pending = written ? toReview.length : submissions.filter((s) => !isGraded(s)).length;
  const open = live && session.phase === "entregas";

  return (
    <TeacherFrame id={id} teacherKey={teacherKey} assignment={assignment} section="entregas" error={error}>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-[1.1875rem] font-bold" role="status">
            {summary}
          </p>
          {!open && pending > 0 && session.phase !== "publicado" && (
            <span className="chip chip-highlight chip-dot">
              {pending} {written ? (pending === 1 ? "nota por revisar" : "notas por revisar") : pending === 1 ? "nota por poner" : "notas por poner"}
            </span>
          )}
        </div>
        <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 justify-self-start rounded-[var(--radius-pill)] border border-rule bg-surface px-4 py-1.5 text-[0.9375rem]">
          <ClipboardCheckIcon size={18} className="text-graphite" />
          {live ? sessionLine(session) : "Todavía no elegiste cómo evaluar"}
          <Link href={`${teacherHref(id, teacherKey, "tarea")}&cambiar=1#evaluacion`} className="inline-flex min-h-9 items-center font-bold text-brand-text hover:underline">
            {live ? "Cambiar" : "Elegir"}
          </Link>
        </p>
      </div>

      {submissions.length === 0 ? (
        <EmptyClass assignment={assignment} teacherKey={teacherKey} busy={busy} onSimulate={simulate} />
      ) : open ? (
        <OpenSubmissions {...props} onSimulate={assignment.demo ? simulate : undefined} />
      ) : session.method === "oral" && live ? (
        <OralPanel {...props} />
      ) : session.method === "papel" && live ? (
        <PaperPanel {...props} />
      ) : (
        <>
          <AiLimits />
          <WrittenReview {...props} onAnalyze={() => void analyze()} analyzing={analyzing} />
        </>
      )}
    </TeacherFrame>
  );
}
