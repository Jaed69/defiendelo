"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { AccountChip } from "@/app/components/account-chip";
import { AppBar, Logo } from "@/app/components/brand";
import type { Assignment } from "@/domain/types";

export type TeacherSection = "tarea" | "entregas";

/** Teacher-side data for one assignment, shared by every teacher screen. */
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
  return `/docente/${id}${section === "entregas" ? "/entregas" : ""}?k=${teacherKey}`;
}

/** "Comunicación, 4.º de secundaria" → "Comunicación · 4.º de secundaria", as the screens show it. */
export function subjectLine(subject: string) {
  const at = subject.lastIndexOf(", ");
  return at === -1 ? subject : `${subject.slice(0, at)} · ${subject.slice(at + 2)}`;
}

export function studentLinkFor(id: string) {
  return typeof window === "undefined" ? `/alumno/${id}` : `${window.location.origin}/alumno/${id}`;
}

/** App bar shared by the teacher screens: the logo and this device's code. */
export function TeacherBar() {
  return (
    <AppBar>
      <Logo />
      <AccountChip />
    </AppBar>
  );
}

/** Header, title and the switch between preparing the task and reviewing what came back. */
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
  if (!assignment) {
    return (
      <>
        <TeacherBar />
        <main id="contenido" tabIndex={-1} className="container-page py-12 outline-none">
          {error ? (
            <p role="alert" className="font-bold text-pen">
              {error}
            </p>
          ) : (
            <p className="text-graphite" role="status">
              Cargando tu tarea…
            </p>
          )}
        </main>
      </>
    );
  }

  const tabs: { section: TeacherSection; label: string }[] = [
    { section: "tarea", label: "1. Tu tarea" },
    { section: "entregas", label: `2. Entregas (${assignment.submissions.length})` },
  ];

  return (
    <>
      <TeacherBar />
      <main id="contenido" tabIndex={-1} className="container-page grid gap-6 py-7 outline-none sm:py-9">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="grid min-w-0 gap-1">
            <span className="text-[0.9375rem] text-graphite">{subjectLine(assignment.subject)}</span>
            <h1 className="max-w-[28ch] text-[clamp(1.875rem,4vw,2.75rem)]">{assignment.title}</h1>
          </div>
          <nav aria-label="Secciones de la tarea" className="grid grid-cols-2 gap-1 rounded-[var(--radius-pill)] bg-subtle p-1 max-sm:w-full">
            {tabs.map((tab) => {
              const current = tab.section === section;
              return (
                <Link
                  key={tab.section}
                  href={teacherHref(id, teacherKey, tab.section)}
                  aria-current={current ? "page" : undefined}
                  className={`flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] px-4 text-center text-[0.9375rem] font-bold ${current ? "bg-surface text-ink shadow-sm" : "text-graphite hover:text-ink"}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

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
