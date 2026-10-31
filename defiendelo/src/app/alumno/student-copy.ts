import { type CriterionMark, LETTER_LABEL, marksTotal } from "../../domain/grading";
import type { StudentStatus } from "../../domain/session";
import type { EvaluationMethod, GradingSystem, Letter } from "../../domain/types";
import { parseStatement } from "../statement-format";

/** Copy and small decisions of the student screens, kept pure so they can be tested without a browser. */

const QUOTED = /'([^']{4,})'|"([^"]{4,})"|«([^»]{4,})»|“([^”]{4,})”|‘([^’]{4,})’/gu;
const START_LENGTH = 140;

function clip(text: string, length: number) {
  if (text.length <= length) return text;
  const cut = text.slice(0, length);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : length).replace(/[\s,;:]+$/u, "")}…`;
}

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

/**
 * What to show above a written-defense question: the sentence of the student's own work the
 * question quotes, or the start of the work when the question quotes nothing found in it.
 */
export function quoteForQuestion(question: string, work: string): { quoted: boolean; text: string } {
  const flat = squash(work);
  const lower = flat.toLowerCase();
  for (const match of question.matchAll(QUOTED)) {
    const fragment = squash(match.slice(1).find(Boolean) ?? "").toLowerCase();
    const at = lower.indexOf(fragment);
    if (!fragment || at === -1) continue;
    const before = flat.slice(0, at);
    const start = Math.max(before.lastIndexOf(". "), before.lastIndexOf("! "), before.lastIndexOf("? "));
    const after = flat.slice(at + fragment.length).search(/[.!?](\s|$)/u);
    const end = after === -1 ? flat.length : at + fragment.length + after + 1;
    return { quoted: true, text: clip(flat.slice(start === -1 ? 0 : start + 2, end).trim(), 220) };
  }
  return { quoted: false, text: clip(flat, START_LENGTH) };
}

export function methodSentence(method: EvaluationMethod, questions: number | null): string {
  const count = questions == null ? "unas preguntas" : `${questions} ${questions === 1 ? "pregunta" : "preguntas"}`;
  const how = {
    escrito: `por escrito aquí mismo: ${count}`,
    oral: `en voz alta, en clase: tu profe te hará ${count}`,
    papel: `por escrito en una hoja que te da tu profe: ${count}`,
  }[method];
  return `Después de entregar, explicas tu trabajo ${how} sobre lo que hiciste.`;
}

/** "vie 7 nov, 23:59" in the device's time zone. */
export function formatDeadline(iso: string): string {
  const parts = new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) => (parts.find((p) => p.type === type)?.value ?? "").replace(/\.$/u, "");
  return `${part("weekday")} ${part("day")} ${part("month")}, ${part("hour")}:${part("minute")}`;
}

/** Oral queue: who goes between the one presenting now and the student. `position` is 1-based. */
export function nextUpLine(queue: string[], presenting: string | null, position: number | null): string | null {
  if (!position) return null;
  const mine = position - 1;
  if (!presenting) return mine === 0 ? "Vas primero." : `Antes de ti: ${mine} ${mine === 1 ? "compañero" : "compañeros"}.`;
  const now = queue.indexOf(presenting);
  if (now === -1 || mine <= now) return null;
  const between = queue.slice(now + 1, mine);
  if (between.length === 0) return "Después vas tú.";
  if (between.length === 1) return `Después: ${between[0]}, y luego tú.`;
  if (between.length === 2) return `Después: ${between[0]} y ${between[1]}, y luego tú.`;
  return `Después: ${between[0]}, ${between[1]} y ${between.length - 2} más; luego tú.`;
}

export type CardTone = "success" | "neutral" | "highlight";

/** One task in «Mis evaluaciones», by status. */
export function evaluationCard(status: StudentStatus): { tone: CardTone; chip: string; note: string | null } {
  if (status === "publicado") return { tone: "success", chip: "Nota publicada", note: null };
  if (status === "evaluado") return { tone: "neutral", chip: "Nota en revisión", note: "Ya respondiste. Tu profe está revisando tu nota." };
  return { tone: "highlight", chip: "Te falta defender tu trabajo", note: null };
}

export function formatPoints(value: number): string {
  return String(Math.round(value * 10) / 10).replace(".", ",");
}

/** "La IA sugirió 0/3. Tu profe lo subió a 1/3." when the teacher changed the AI suggestion. */
export function teacherChange(mark: CriterionMark): string | null {
  if (mark.points == null || mark.points === mark.suggested) return null;
  const max = formatPoints(mark.max);
  const verb = mark.points > mark.suggested ? "subió" : "bajó";
  return `La IA sugirió ${formatPoints(mark.suggested)}/${max}. Tu profe lo ${verb} a ${formatPoints(mark.points)}/${max}.`;
}

/** "Lo hiciste bien" with the evidence, or "Para repasar" with the gap the review found. */
export function criterionVerdict(mark: CriterionMark): { good: boolean; title: string; text: string } {
  const good = !mark.misconception && (mark.level === "AD" || mark.level === "A");
  return { good, title: good ? "Lo hiciste bien" : "Para repasar", text: mark.misconception ?? mark.evidenceQuote };
}

/** The grade to show: the teacher's, else the sum of the AI marks (self-paced tasks). */
export function gradeShown(
  result: { grade: number | null; letter: Letter | null; criteria: CriterionMark[] },
  grading: GradingSystem,
  scale: number,
): { value: string; label: string | null; byTeacher: boolean } | null {
  if (grading === "literal" && result.letter) return { value: result.letter, label: LETTER_LABEL[result.letter], byTeacher: true };
  if (grading === "numerica" && result.grade != null) return { value: `${formatPoints(result.grade)}/${scale}`, label: null, byTeacher: true };
  if (result.criteria.length === 0) return null;
  return { value: `${formatPoints(marksTotal(result.criteria))}/${scale}`, label: null, byTeacher: false };
}

function firstSentence(text: string) {
  const match = /^([\s\S]+?[.!?])(?=\s|$)/u.exec(text.trim());
  return match ? match[1] : text.trim();
}

/** Up to three steps of the statement for "Qué tienes que hacer"; empty when it has no numbered steps. */
export function firstSteps(statement: string): string[] {
  return parseStatement(statement)
    .filter((b) => b.kind === "step")
    .slice(0, 3)
    .map((b) => (b.kind === "step" ? clip(b.title ? `${b.title}: ${firstSentence(b.text)}` : firstSentence(b.text), 120) : ""));
}

/** Index of the demo example whose work the student loaded, or -1. */
export function sampleIndexFor(samples: { work: string }[], work: string): number {
  const mine = work.trim();
  return samples.findIndex((s) => s.work.trim() === mine);
}
