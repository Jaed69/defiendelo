"use client";

import { useId } from "react";
import { type StatementBlock, parseStatement } from "@/app/statement-format";
import type { Criterion } from "@/domain/types";
import { ListIcon, MicIcon, PenIcon, PrinterIcon } from "./icons";

type Step = Extract<StatementBlock, { kind: "step" }>;

// The defense step is the only one that stands out: it is where the grade is decided.
const LIVE = /defens|sustent|oral|conversaci|entrevista|en vivo/i;

function isLive(step: Step) {
  // A title says what the step is about; without one, its opening clause does.
  return LIVE.test(step.title ?? step.text.split(/[,.:;]/)[0]);
}

/** One label per block, small and quiet: the text carries the content, not boxes and icons. */
function Label({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "brand" | "danger" }) {
  const color = tone === "brand" ? "text-brand-text" : tone === "danger" ? "text-pen" : "text-graphite";
  return <span className={`label ${color}`}>{children}</span>;
}

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="sheet-steps grid gap-4">
      {steps.map((step) => {
        const live = isLive(step);
        // Skip the chip when the title already says it is graded live.
        const chip = live && !/califica|en vivo/i.test(step.title ?? "");
        return (
          <li key={step.number} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
            <span
              className={`grid size-8 place-items-center rounded-full font-display font-bold ${
                live ? "bg-brand text-white" : "border border-rule text-ink"
              }`}
              aria-hidden="true"
            >
              {step.number}
            </span>
            <div className="grid gap-1 pt-1">
              {step.title && (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold">
                  {live && <MicIcon className="size-4 text-brand-text" />}
                  <span>
                    <span className="sr-only">Paso {step.number}: </span>
                    {step.title}
                  </span>
                </p>
              )}
              {chip && <span className="chip chip-brand justify-self-start">Se califica en la defensa</span>}
              <p className="leading-relaxed text-graphite">
                {!step.title && <span className="sr-only">Paso {step.number}: </span>}
                {step.text}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Blocks({ blocks }: { blocks: StatementBlock[] }) {
  // Consecutive steps share one ordered list; everything else renders in reading order.
  const groups: (StatementBlock | Step[])[] = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (block.kind === "step" && Array.isArray(last)) last.push(block);
    else groups.push(block.kind === "step" ? [block] : block);
  }
  return groups.map((group, i) => {
    if (Array.isArray(group)) return <Steps key={i} steps={group} />;
    if (group.kind === "question") {
      return (
        <div key={i} className="grid gap-1 border-l-4 border-brand pl-4">
          <Label tone="brand">Pregunta central</Label>
          <p className="font-display text-xl font-bold leading-snug">{group.text}</p>
        </div>
      );
    }
    if (group.kind === "note") {
      return (
        <div key={i} className="grid gap-1">
          <Label tone={group.label === "Importante" ? "danger" : "neutral"}>{group.label}</Label>
          <p className="leading-relaxed">{group.text}</p>
        </div>
      );
    }
    return (
      <p key={i} className={`prose-measure leading-relaxed ${i === 0 ? "text-[1.0625rem]" : ""}`}>
        {group.text}
      </p>
    );
  });
}

/** Opens the print dialog with only this element on the page; it may be hidden on screen (class "hidden"). */
export function printSheet(sheetId: string) {
  const sheet = document.getElementById(sheetId);
  if (!sheet) return;
  const root = document.createElement("div");
  root.id = "print-root";
  const copy = sheet.cloneNode(true) as HTMLElement;
  copy.classList.remove("hidden");
  copy.removeAttribute("id");
  root.appendChild(copy);
  document.body.appendChild(root);
  document.documentElement.classList.add("printing-sheet");
  const cleanUp = () => {
    document.documentElement.classList.remove("printing-sheet");
    root.remove();
    window.removeEventListener("afterprint", cleanUp);
  };
  window.addEventListener("afterprint", cleanUp);
  window.print();
}

/** `quiet` is a text action for tight rows (the student page); the default is a secondary button. */
export function PrintSheetButton({ sheetId, quiet = false, label }: { sheetId: string; quiet?: boolean; label?: string }) {
  return (
    <button
      type="button"
      className={quiet ? "flex min-h-11 items-center gap-2 font-bold text-brand-text" : "btn-secondary inline-flex items-center gap-2"}
      onClick={() => printSheet(sheetId)}
    >
      <PrinterIcon /> {label ?? (quiet ? "Imprimir" : "Imprimir tarea")}
    </button>
  );
}

/** The redesigned assignment laid out like a task sheet a teacher would hand out, ready to print. */
export function AssignmentSheet({
  id,
  title,
  subject,
  statement,
  aiPolicy,
  criteria,
}: {
  id?: string;
  title: string;
  subject: string;
  statement: string;
  aiPolicy: string;
  criteria: Pick<Criterion, "id" | "name" | "description" | "weight" | "evidence">[];
}) {
  const fallbackId = useId();
  const sheetId = id ?? fallbackId;
  return (
    <article id={sheetId} className="sheet-doc min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-rule bg-surface">
      <header className="grid-paper grid gap-3 border-b border-rule px-4 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label text-brand-text">Tarea rediseñada · La IA está permitida</span>
          {/* Not a .chip: long subject names must wrap on a phone instead of widening the sheet. */}
          <span className="rounded-2xl bg-brand-subtle px-3 py-1 text-sm font-bold leading-snug text-brand-text">{subject}</span>
        </div>
        <h3 className="font-display text-2xl font-extrabold sm:text-[1.75rem]">{title}</h3>
        <div className="hidden gap-6 pt-2 text-[0.9375rem] print:grid print:grid-cols-[2fr_1fr]">
          <span className="flex items-end gap-2">
            Nombre o apodo: <span className="h-px flex-1 bg-ink" />
          </span>
          <span className="flex items-end gap-2">
            Fecha: <span className="h-px flex-1 bg-ink" />
          </span>
        </div>
      </header>

      <div className="grid gap-6 px-4 py-6 sm:px-8">
        <Blocks blocks={parseStatement(statement)} />

        <div className="grid gap-1 border-t border-rule pt-5">
          <Label>Uso de la IA</Label>
          <p className="leading-relaxed">{aiPolicy}</p>
        </div>

        <section className="grid gap-2" aria-label="Cómo se califica">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-[var(--radius-md)] border border-rule text-left">
            <thead>
              <tr className="bg-subtle">
                <th scope="col" className="px-3 py-2.5 font-display text-[1rem] font-bold sm:px-4">
                  <span className="flex items-center gap-2">
                    <ListIcon className="text-brand-text" size={18} /> Cómo se califica
                  </span>
                </th>
                <th scope="col" className="px-3 py-2.5 text-right text-[0.875rem] font-bold text-graphite sm:px-4">
                  Dónde se ve
                </th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => (
                <tr key={c.id}>
                  <td className="border-t border-rule px-3 py-2.5 sm:px-4">
                    <span className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-2">
                      <span className="font-display text-[1.0625rem] font-extrabold tabular-nums text-brand-text">{c.weight}%</span>
                      <span className="grid gap-0.5">
                        <span className="font-bold leading-snug">{c.name}</span>
                        <span className="hidden text-[0.9375rem] text-graphite print:block">{c.description}</span>
                      </span>
                    </span>
                  </td>
                  <td className="border-t border-rule px-3 py-2.5 text-right align-middle sm:px-4">
                    <span className={`chip ${c.evidence === "defensa" ? "chip-brand" : "chip-neutral"}`}>
                      {c.evidence === "defensa" ? <MicIcon className="size-3.5" /> : <PenIcon className="size-3.5" />}
                      {c.evidence === "defensa" ? "En la defensa" : "En la entrega"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-rule px-4 py-3 text-[0.875rem] text-graphite sm:px-8">
        <span>Defiéndelo · defiendelo.vercel.app</span>
        <span>La nota final la pone tu docente.</span>
      </footer>
    </article>
  );
}
