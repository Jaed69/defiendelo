import { fileKind } from "./document-text";

const MAX_BYTES = 15 * 1024 * 1024;

/** Reads a document's text in the browser; the file is never uploaded. Throws messages meant for the user. */
export async function extractText(file: File): Promise<string> {
  const kind = fileKind(file.name, file.type);
  if (!kind) throw new Error("Ese formato no se puede leer. Usa PDF, Word (.docx), texto o un archivo de código.");
  if (file.size > MAX_BYTES) throw new Error("El archivo pesa más de 15 MB. Prueba con una versión más liviana.");

  if (kind === "text") return file.text();

  const data = await file.arrayBuffer();
  if (kind === "docx") {
    const mammoth = await import("mammoth");
    return (await mammoth.extractRawText({ arrayBuffer: data })).value;
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const content = await (await pdf.getPage(n)).getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : "") : "")).join(""));
  }
  const text = pages.join("\n\n");
  if (!text.trim()) {
    throw new Error("Este PDF no tiene texto seleccionable (parece una imagen escaneada). Copia el texto a mano o sube un PDF exportado desde Word.");
  }
  return text;
}
