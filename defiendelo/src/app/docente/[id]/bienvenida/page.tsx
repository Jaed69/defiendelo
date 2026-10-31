"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { savedAccountCode } from "@/app/account";
import { AppBar, Logo } from "@/app/components/brand";
import { CheckIcon, CopyIcon } from "@/app/components/icons";
import { teacherHref } from "../teacher-frame";

/**
 * D2 · Guarda tu código: shown once, right after the first task. The code is read from this device,
 * never from the URL, so a shared link never leaks it.
 */
export default function SaveCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const teacherKey = useSearchParams().get("k") ?? "";
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => setCode(savedAccountCode()), []);

  return (
    <>
      <AppBar>
        <Logo />
      </AppBar>
      <main id="contenido" tabIndex={-1} className="container-page grid min-h-[70vh] place-items-center py-10 outline-none">
        <section className="card rise grid w-full max-w-[34rem] gap-5 p-6 sm:p-9" aria-labelledby="codigo-titulo">
          <p className="flex items-center gap-2 font-bold text-success">
            <span className="grid size-7 place-items-center rounded-full bg-success-subtle">
              <CheckIcon size={16} />
            </span>
            Creaste tu primera tarea
          </p>
          <h1 id="codigo-titulo" className="text-[clamp(1.75rem,4vw,2.25rem)]">
            Este es tu código
          </h1>
          <p
            className="rounded-[var(--radius-md)] border-2 border-ink bg-highlight-subtle px-4 py-5 text-center font-mono text-[clamp(1.75rem,6vw,2.5rem)] font-bold tracking-[0.12em]"
            aria-live="polite"
          >
            {code ?? "—"}
          </p>
          <p className="leading-relaxed">
            Con este código ves todas tus tareas y las notas por revisar, en cualquier celular o computadora. Anótalo: sin él no podrás volver a tus
            tareas.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="btn-secondary w-full"
              disabled={!code}
              onClick={() => {
                if (!code) return;
                void navigator.clipboard?.writeText(code);
                setCopied(true);
              }}
            >
              <CopyIcon size={18} /> {copied ? "Código copiado" : "Copiar código"}
            </button>
            <Link href={teacherHref(id, teacherKey, "tarea")} className="btn w-full">
              Ir a mi tarea
            </Link>
          </div>
          <span className="sr-only" role="status">
            {copied ? "Código copiado al portapapeles." : ""}
          </span>
          <p className="text-[0.9375rem] text-graphite">Si lo pierdes: abre el enlace privado de cualquiera de tus tareas.</p>
        </section>
      </main>
    </>
  );
}
