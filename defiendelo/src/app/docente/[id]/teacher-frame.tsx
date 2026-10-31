"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { AppBar, Logo } from "@/app/components/brand";
import type { Assignment } from "@/domain/types";

export type TeacherSection = "tarea" | "entregas" | "evaluacion";

/** Teacher-side data for one assignment, shared by both teacher screens. */
export function useTeacherAssignment(id: string) {
  const teacherKey = useSearchParams().get("k") ?? "";
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setAssignment(await api<Assignment>(`/api/assignments/${id}`, { teacherKey }));
  }, [id, teacherKey]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  return { assignment, setAssignment, teacherKey, error, setError, load };
}

export function teacherHref(id: string, teacherKey: string, section: TeacherSection) {
  const path = { tarea: "", entregas: "/entregas", evaluacion: "/evaluacion" }[section];
  return `/docente/${id}${path}?k=${teacherKey}`;
}

/** Header, title and the three-step switch: prepare the task, receive what comes back, evaluate. */
export function TeacherFrame({
  id,
  teacherKey,
  assignment,
  section,
  error,
  children,
}: {
  id: string;
  teacherKey: string;
  assignment: Assignment | null;
  section: TeacherSection;
  error: string | null;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const studentLink = typeof window === "undefined" ? "" : `${window.location.origin}/alumno/${id}`;

  function copyLink() {
    void navigator.clipboard.writeText(studentLink);
    setCopied(true);
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

  const tabs: { section: TeacherSection; label: string }[] = [
    { section: "tarea", label: "1. Tu tarea" },
    { section: "entregas", label: `2. Entregas (${assignment.submissions.length})` },
    { section: "evaluacion", label: "3. Evaluación" },
  ];

  return (
    <>
      <AppBar>
        <Logo />
        <button type="button" className="btn" onClick={copyLink}>
          {copied ? "Enlace copiado" : "Copiar enlace para alumnos"}
        </button>
      </AppBar>
      <span className="sr-only" role="status">
        {copied ? "Enlace copiado al portapapeles." : ""}
      </span>

      <main id="contenido" tabIndex={-1} className="container-page grid gap-8 py-8 outline-none sm:py-10">
        <div className="grid gap-2">
          <span className="text-graphite">{assignment.subject}</span>
          <h1 className="max-w-[24ch] text-[clamp(2rem,4vw,3rem)]">{assignment.title}</h1>
        </div>
        <nav aria-label="Secciones de la tarea" className="grid grid-cols-3 gap-1 rounded-[var(--radius-md)] bg-subtle p-1 sm:max-w-xl">
          {tabs.map((tab) => {
            const current = tab.section === section;
            return (
              <Link
                key={tab.section}
                href={teacherHref(id, teacherKey, tab.section)}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] px-3 text-center font-bold ${current ? "bg-surface text-ink shadow-sm" : "text-graphite hover:text-ink"}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {children}

        {error && (
          <p role="alert" className="sticky bottom-4 rounded-[var(--radius-md)] border-2 border-pen bg-surface p-4 font-bold text-pen">
            {error}
          </p>
        )}
      </main>
    </>
  );
}
