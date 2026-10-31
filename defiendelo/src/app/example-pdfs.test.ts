import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import { EXAMPLES, examplePdf } from "./examples";

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

/** Same reading the browser does in documents/extract.ts, on the file shipped in public/. */
async function pdfText(path: string) {
  const pdf = await getDocument({ data: new Uint8Array(readFileSync(path)), useSystemFonts: false }).promise;
  const pages: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const content = await (await pdf.getPage(n)).getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : "") : "")).join(""));
  }
  return pages.join("\n\n");
}

describe("example PDFs", () => {
  it.each(EXAMPLES)("$id ships a PDF whose text is the task the form loads", async (example) => {
    const path = join(process.cwd(), "public", examplePdf(example).href);
    expect(existsSync(path), `${path} is missing: run npm run examples:pdf`).toBe(true);
    expect(normalize(await pdfText(path))).toContain(normalize(example.original));
  });

  it("are long, structured handouts rather than one-line prompts", () => {
    for (const example of EXAMPLES) {
      expect(example.original.length, example.id).toBeGreaterThan(900);
      expect(example.original.split("\n\n").length, example.id).toBeGreaterThanOrEqual(4);
    }
  });

  it("names each file after its example", () => {
    const example = EXAMPLES.find((e) => e.id === "sociales-guerra-del-pacifico")!;
    expect(examplePdf(example)).toEqual({ name: "sociales-guerra-del-pacifico.pdf", href: "/ejemplos/sociales-guerra-del-pacifico.pdf" });
  });
});
