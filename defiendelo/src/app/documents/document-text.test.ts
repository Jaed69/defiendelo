import { describe, expect, it } from "vitest";
import { fileKind, fitToLimit } from "./document-text";

describe("fileKind", () => {
  it("recognises PDF and Word documents by extension or MIME type", () => {
    expect(fileKind("tarea.PDF", "")).toBe("pdf");
    expect(fileKind("sin-extension", "application/pdf")).toBe("pdf");
    expect(fileKind("tarea.docx", "")).toBe("docx");
  });

  it("treats plain text and source code as text", () => {
    for (const name of ["notas.txt", "guia.md", "solucion.py", "Main.java", "app.js", "lista.c", "datos.csv"]) {
      expect(fileKind(name, "")).toBe("text");
    }
    expect(fileKind("archivo", "text/plain")).toBe("text");
  });

  it("rejects formats it cannot read, including legacy .doc and images", () => {
    expect(fileKind("tarea.doc", "application/msword")).toBeNull();
    expect(fileKind("foto.jpg", "image/jpeg")).toBeNull();
  });
});

describe("fitToLimit", () => {
  it("normalises line endings, trailing spaces and runs of blank lines", () => {
    expect(fitToLimit("Hola  \r\n\r\n\r\n\r\nmundo\t \n", 100)).toEqual({ text: "Hola\n\nmundo", truncated: false });
  });

  it("cuts at the limit and reports truncation", () => {
    const result = fitToLimit("a".repeat(30), 20);
    expect(result.text).toHaveLength(20);
    expect(result.truncated).toBe(true);
  });
});
