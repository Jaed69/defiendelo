export type FileKind = "pdf" | "docx" | "text";

const TEXT_EXTENSIONS = new Set([
  "txt", "md", "csv", "json", "html", "css",
  "py", "js", "jsx", "ts", "tsx", "java", "c", "h", "cpp", "hpp", "cs", "go", "rb", "php", "kt", "swift", "sql", "r", "m",
]);

/** Which extractor can read a file, or null when the format is not supported. */
export function fileKind(name: string, mime: string): FileKind | null {
  const extension = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
  if (extension === "pdf" || mime === "application/pdf") return "pdf";
  if (extension === "docx" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (TEXT_EXTENSIONS.has(extension) || (!extension && mime.startsWith("text/"))) return "text";
  return null;
}

/** Cleans extracted text and cuts it to the field's character limit. */
export function fitToLimit(raw: string, limit: number): { text: string; truncated: boolean } {
  const clean = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return clean.length > limit ? { text: clean.slice(0, limit), truncated: true } : { text: clean, truncated: false };
}
