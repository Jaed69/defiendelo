"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isTeacherCode, savedAccountCode } from "@/app/account";
import { api } from "@/app/api-client";
import { type ChipTone, taskStatus } from "@/app/class-summary";
import { CopyIcon } from "@/app/components/icons";
import type { TeacherTaskSummary } from "@/application/use-cases";
import { subjectLine, studentLinkFor, TeacherBar, teacherHref } from "./[id]/teacher-frame";

const CHIP: Record<ChipTone, string> = {
  danger: "chip chip-danger chip-dot",
  success: "chip chip-success chip-dot",
  highlight: "chip chip-highlight chip-dot",
  neutral: "chip chip-neutral",
};

function TaskCard({ task }: { task: TeacherTaskSummary }) {
  const [copied, setCopied] = useState(false);
  const status = taskStatus(task);
  const help = task.needHelp.length > 0;
  return (
    <li className={`card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 ${help ? "border-2 border-pen" : ""}`}>
      <div className="grid min-w-0 gap-1.5">
        <span className="text-[0.9375rem] text-graphite">{subjectLine(task.subject)}</span>
        <h2 className="text-[1.375rem]">{task.title}</h2>
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-bold">{status.line}</span>
          {status.chips.map((chip) => (
            <span key={chip.text} className={CHIP[chip.tone]}>
              {chip.text}
            </span>
          ))}
        </p>
      </div>
      {status.action === "entregas" && (
        <Link href={teacherHref(task.id, task.teacherKey, "entregas")} className="btn">
          Ver entregas
        </Link>
      )}
      {status.action === "configurar" && (
        <Link href={`${teacherHref(task.id, task.teacherKey, "tarea")}#evaluacion`} className="btn-secondary">
          Terminar de configurar
        </Link>
      )}
      {status.action === "copiar" && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            void navigator.clipboard?.writeText(studentLinkFor(task.id));
            setCopied(true);
          }}
        >
          <CopyIcon size={18} /> {copied ? "Enlace copiado" : "Copiar enlace para alumnos"}
        </button>
      )}
    </li>
  );
}

/** D4 · Mis tareas: every task of this device's PROFE code, who needs help and which grades are left. */
export default function MyTasksPage() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TeacherTaskSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = savedAccountCode();
    if (!isTeacherCode(saved)) {
      router.replace("/entrar");
      return;
    }
    setCode(saved);
    api<{ tasks: TeacherTaskSummary[] }>(`/api/accounts/${encodeURIComponent(saved!)}`)
      .then(({ tasks }) => setTasks([...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((e: Error) => setError(e.message));
  }, [router]);

  return (
    <>
      <TeacherBar />
      <main id="contenido" tabIndex={-1} className="container-page grid max-w-5xl gap-6 py-8 outline-none sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[clamp(2rem,4vw,2.75rem)]">Mis tareas</h1>
          <Link href="/" className="btn">
            + Nueva tarea
          </Link>
        </div>

        {error && (
          <p role="alert" className="font-bold text-pen">
            {error}
          </p>
        )}
        {!error && tasks === null && (
          <p className="text-graphite" role="status">
            Cargando tus tareas…
          </p>
        )}
        {tasks && tasks.length === 0 && (
          <div className="card grid justify-items-start gap-3 p-6">
            <p className="font-bold">Todavía no tienes tareas.</p>
            <Link href="/" className="btn-secondary">
              Rediseñar mi primera tarea
            </Link>
          </div>
        )}
        {tasks && tasks.length > 0 && (
          <ul className="grid gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </ul>
        )}

        {code && (
          <p className="text-[0.9375rem] text-graphite">
            En otro dispositivo, entra con tu código <span className="font-mono font-bold text-ink">{code}</span> y verás estas mismas tareas.
          </p>
        )}
      </main>
    </>
  );
}
