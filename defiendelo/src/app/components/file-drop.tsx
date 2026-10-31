"use client";

import { useId, useState } from "react";
import { fitToLimit } from "@/app/documents/document-text";

const ACCEPT =
  ".pdf,.docx,.txt,.md,.csv,.json,.html,.css,.py,.js,.jsx,.ts,.tsx,.java,.c,.h,.cpp,.hpp,.cs,.go,.rb,.php,.kt,.swift,.sql,.r,.m,application/pdf,text/plain";

type Status = { kind: "idle" } | { kind: "reading"; name: string } | { kind: "done"; message: string } | { kind: "error"; message: string };

/** Lets a person drop or pick a document; its text is read in the browser and handed to the form field. */
export function FileDrop({ limit, hint, onText }: { limit: number; hint: string; onText: (text: string) => void }) {
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
      className={`drop ${dragging ? "drop-active" : ""}`}
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
      <label htmlFor={inputId} className="btn-outline">
        {status.kind === "reading" ? "Leyendo el archivo…" : "Subir un archivo"}
      </label>
      <span className="text-sm text-graphite">{hint}</span>
      <p
        className={`w-full text-sm ${status.kind === "error" ? "font-bold text-pen" : ""}`}
        role={status.kind === "error" ? "alert" : "status"}
      >
        {status.kind === "reading" && `Leyendo «${status.name}» en tu dispositivo; el archivo no se sube a ningún servidor.`}
        {(status.kind === "done" || status.kind === "error") && status.message}
      </p>
    </div>
  );
}
