"use client";

import { useId, useState } from "react";
import { fitToLimit } from "@/app/documents/document-text";

const ACCEPT =
  ".pdf,.docx,.txt,.md,.csv,.json,.html,.css,.py,.js,.jsx,.ts,.tsx,.java,.c,.h,.cpp,.hpp,.cs,.go,.rb,.php,.kt,.swift,.sql,.r,.m,application/pdf,text/plain";

type Status = { kind: "idle" } | { kind: "reading"; name: string } | { kind: "done"; message: string } | { kind: "error"; message: string };

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 56 56" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="10" y="4" width="36" height="48" rx="6" fill="white" stroke="var(--color-bg-brand)" strokeWidth="2.5" />
      <path d="M28 36V20M28 20L21 27M28 20L35 27" stroke="var(--color-bg-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 44H38" stroke="var(--color-bg-brand)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export interface AttachedFile {
  name: string;
  href: string;
}

/**
 * Lets a person drop or pick a document; its text is read in the browser and handed to the form field.
 * `attached` shows a document already loaded (a ready-made example) instead of the last upload.
 */
export function FileDrop({
  limit,
  title,
  hint,
  attached,
  onText,
}: {
  limit: number;
  title: string;
  hint: string;
  attached?: AttachedFile | null;
  onText: (text: string) => void;
}) {
  const inputId = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);

  async function read(file: File | undefined) {
    if (!file) return;
    setStatus({ kind: "reading", name: file.name });
    try {
      const { extractText } = await import("@/app/documents/extract");
      const { text, truncated } = fitToLimit(await extractText(file), limit);
      onText(text);
      const size = text.length.toLocaleString("es");
      setStatus({
        kind: "done",
        message: truncated
          ? `Leímos «${file.name}». Era más largo que el límite, así que usamos los primeros ${size} caracteres: revisa el final.`
          : `Leímos «${file.name}» (${size} caracteres). Puedes editar el texto abajo.`,
      });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message || "No pudimos leer el archivo. Prueba con otro formato." });
    }
  }

  return (
    <div
      className={`drop file-drop flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:p-8 sm:text-left ${dragging ? "drop-active" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void read(e.dataTransfer.files[0]);
      }}
    >
      <UploadIcon />
      <div className="grid flex-1 gap-1">
        <p className="font-display text-xl font-bold">{title}</p>
        <p className="text-[0.9375rem] text-graphite">{hint}</p>
        <p
          className={`text-[0.9375rem] ${status.kind === "error" ? "font-bold text-pen" : "text-ink"}`}
          role={status.kind === "error" ? "alert" : "status"}
        >
          {status.kind === "reading" && `Leyendo «${status.name}» en tu dispositivo; el archivo no se sube a ningún servidor.`}
          {status.kind !== "reading" && attached && (
            <>
              PDF de ejemplo cargado:{" "}
              <a href={attached.href} target="_blank" rel="noopener" className="font-bold text-brand-text underline">
                {attached.name}
              </a>
            </>
          )}
          {!attached && (status.kind === "done" || status.kind === "error") && status.message}
        </p>
      </div>
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          void read(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <label htmlFor={inputId} className="btn-secondary shrink-0">
        {status.kind === "reading" ? "Leyendo…" : "Elegir archivo"}
      </label>
    </div>
  );
}
