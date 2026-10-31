"use client";

import { Fragment, useState } from "react";
import { AppBar, Logo } from "@/app/components/brand";
import { AccountChip } from "@/app/components/account-chip";
import { CheckIcon, ClipboardCheckIcon, EyeIcon, FileTextIcon, SpeechIcon } from "@/app/components/icons";

/** Shared pieces of the student screens (Pencil A1–A6). */

export function StudentBar() {
  return (
    <AppBar>
      <Logo />
      <AccountChip />
    </AppBar>
  );
}

const STEPS = [
  { label: "Entrega", Icon: FileTextIcon },
  { label: "Defensa", Icon: SpeechIcon },
  { label: "Nota", Icon: ClipboardCheckIcon },
];

/** Entrega · Defensa · Nota, joined by hairlines; `onColor` for full-bleed color screens. */
export function Stepper({ index, onColor = false }: { index: number; onColor?: boolean }) {
  return (
    <nav aria-label="Pasos">
      <ol className="flex items-center gap-2">
        {STEPS.map(({ label, Icon }, i) => {
          const done = i < index;
          const current = i === index;
          const dot = onColor
            ? current || done
              ? "bg-white text-ink"
              : "bg-white/20 text-white"
            : current
              ? "bg-brand text-white"
              : done
                ? "bg-brand-subtle text-brand-text"
                : "bg-subtle text-graphite";
          const text = onColor ? "text-white" : current ? "text-ink" : "text-graphite";
          return (
            <Fragment key={label}>
              {i > 0 && <li aria-hidden="true" className={`h-0.5 min-w-3 flex-1 ${onColor ? "bg-white/40" : "bg-rule"}`} />}
              <li aria-current={current ? "step" : undefined} className="flex shrink-0 items-center gap-1.5">
                <span className={`grid size-[26px] place-items-center rounded-full ${dot}`}>
                  {done ? <CheckIcon size={14} /> : <Icon size={14} />}
                </span>
                <span className={`text-sm ${current ? "font-bold" : ""} ${text}`}>
                  {label}
                  {done && <span className="sr-only"> (hecho)</span>}
                </span>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export type PillTone = "success" | "neutral" | "highlight" | "pen" | "brand" | "white-success" | "white-neutral" | "white-ink";

const PILL: Record<PillTone, string> = {
  success: "bg-success-subtle text-success",
  neutral: "bg-subtle text-graphite",
  highlight: "bg-highlight-subtle text-ink",
  pen: "bg-pen-soft text-pen",
  brand: "bg-brand-subtle text-brand-text",
  "white-success": "bg-white text-success",
  "white-neutral": "bg-white text-graphite",
  "white-ink": "bg-white text-ink",
};

/** Rounded status pill with a dot: color plus text, never color alone. */
export function Pill({ tone, children, className = "" }: { tone: PillTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${PILL[tone]} ${className}`}>
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** A line with its icon in a soft brand square ("4 preguntas sobre lo que tú hiciste."). */
export function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-brand-subtle text-brand-text">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

/** Success strip shown once the work is handed in. */
export function HandedIn() {
  return (
    <p className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-success-subtle px-3 py-2.5 font-bold text-success">
      <CheckIcon size={18} /> Entregaste tu trabajo
    </p>
  );
}

/** "Ver mi entrega": opens the student's own work below the button. */
export function WorkToggle({ work, label = "Ver mi entrega", className = "btn-secondary w-full" }: { work: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-3">
      <button type="button" className={className} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <EyeIcon size={18} /> {open ? "Ocultar mi entrega" : label}
      </button>
      {open && (
        <pre className="rise max-h-80 overflow-auto whitespace-pre-wrap rounded-[var(--radius-lg)] border border-rule bg-surface p-4 text-left font-mono text-sm text-ink">
          {work}
        </pre>
      )}
    </div>
  );
}

/** Phone-first column used by every student screen. */
export function StudentMain({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <main id="contenido" tabIndex={-1} className={`mx-auto grid w-full max-w-xl content-start gap-[18px] px-4 py-5 outline-none sm:px-6 sm:py-8 ${className}`}>
      {children}
    </main>
  );
}
