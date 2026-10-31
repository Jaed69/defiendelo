/** A piece of a redesigned statement, so it can be laid out as a task sheet instead of one block of text. */
export type StatementBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "question"; text: string }
  | { kind: "step"; number: number; title: string | null; text: string }
  | { kind: "note"; label: string; text: string };

const NOTE_LABELS = ["Entrega", "Importante", "Nota", "Recuerda", "Producto", "Condiciones"];

// A marker starts the text or follows sentence punctuation, so "(1879-1884)" or "S/ 1,50" never split a sentence.
const MARKER = new RegExp(
  String.raw`(?:^|(?<=[.:;!?]\s))(?:` +
    String.raw`Fase\s+(\d{1,2})\s*[—–-]\s*` +
    String.raw`|\((\d{1,2})\)\s+` +
    String.raw`|(\d{1,2})\.\s+(?=[A-ZÁÉÍÓÚÑ¿¡])` +
    String.raw`|(Pregunta central|${NOTE_LABELS.join("|")})\s*:\s*` +
    ")",
  "gu",
);

// A step title is a short label before a colon, such as "Exploración:" or "EXPERIMENTO:".
const TITLE = /^([^:.;?¿]{1,60}?)\s*:\s+([\s\S]+)$/u;
const MAX_TITLE_WORDS = 6;

const ACRONYMS = /(?<!\p{L})(ia|ods|minedu)(?!\p{L})/gu;

function sentenceCase(title: string) {
  if (title !== title.toUpperCase()) return title;
  const lower = title.toLowerCase();
  return (lower.charAt(0).toUpperCase() + lower.slice(1)).replace(ACRONYMS, (a) => a.toUpperCase());
}

function wordCount(title: string) {
  return title.replace(/\([^)]*\)/gu, "").trim().split(/\s+/).length;
}

function step(number: number, body: string): StatementBlock {
  const titled = TITLE.exec(body);
  if (titled && wordCount(titled[1]) <= MAX_TITLE_WORDS) {
    return { kind: "step", number, title: sentenceCase(titled[1].trim()), text: titled[2].trim() };
  }
  return { kind: "step", number, title: null, text: body };
}

function parseParagraph(paragraph: string): StatementBlock[] {
  const blocks: StatementBlock[] = [];
  const matches = [...paragraph.matchAll(MARKER)];
  const lead = paragraph.slice(0, matches[0]?.index ?? paragraph.length).trim();
  if (lead) blocks.push({ kind: "paragraph", text: lead });

  matches.forEach((match, i) => {
    const end = matches[i + 1]?.index ?? paragraph.length;
    const body = paragraph.slice(match.index! + match[0].length, end).trim();
    if (!body) return;
    const [, fase, parenthesized, dotted, label] = match;
    if (label === "Pregunta central") {
      const question = /^([^?]*\?)\s*([\s\S]*)$/u.exec(body);
      blocks.push({ kind: "question", text: question ? question[1] : body });
      if (question?.[2]) blocks.push({ kind: "paragraph", text: question[2] });
    } else if (label) {
      blocks.push({ kind: "note", label, text: body });
    } else {
      blocks.push(step(Number(fase ?? parenthesized ?? dotted), body));
    }
  });
  return blocks;
}

export function parseStatement(statement: string): StatementBlock[] {
  return statement
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap(parseParagraph);
}
