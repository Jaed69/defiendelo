import type { ClassSession, GradingSystem, Letter } from "@/domain/types";

function students(n: number) {
  return n === 1 ? "1 alumno" : `${n} alumnos`;
}

function handedInLine(n: number) {
  return `${students(n)} ${n === 1 ? "entregó" : "entregaron"}.`;
}

function listNames(names: string[]) {
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

function needHelpText(names: string[]) {
  return `${names.length === 1 ? "Necesita" : "Necesitan"} ayuda: ${listNames(names)}`;
}

/** The one sentence at the top of the submissions screen: who handed in, who needs help, who is still answering. */
export function classSummary({ handedIn, needHelp, answering }: { handedIn: number; needHelp: string[]; answering: number }) {
  const parts: string[] = [];
  if (handedIn > 0) {
    parts.push(handedInLine(handedIn));
    if (needHelp.length > 0) parts.push(`${needHelpText(needHelp)}.`);
    else parts.push(handedIn === 1 ? "No necesita ayuda." : "Nadie necesita ayuda.");
  }
  if (answering > 0) parts.push(`${students(answering)} ${answering === 1 ? "está" : "están"} respondiendo ahora.`);
  return parts.length > 0 ? parts.join(" ") : "Todavía nadie entregó.";
}

export type ChipTone = "danger" | "success" | "highlight" | "neutral";

export interface TaskStatus {
  line: string;
  chips: { tone: ChipTone; text: string }[];
  /** The one button of the task card in "Mis tareas". */
  action: "entregas" | "copiar" | "configurar";
}

/** Status of one task in "Mis tareas": what happened and the next thing to do. */
export function taskStatus(task: {
  handedIn: number;
  needHelp: string[];
  toReview: number;
  live: boolean;
  phase: ClassSession["phase"];
}): TaskStatus {
  if (task.handedIn === 0) {
    return task.live
      ? { line: "Todavía nadie entregó.", chips: [], action: "copiar" }
      : { line: "Sin compartir todavía.", chips: [{ tone: "highlight", text: "Falta elegir cómo evaluar" }], action: "configurar" };
  }
  const chips: TaskStatus["chips"] = [
    task.needHelp.length > 0 ? { tone: "danger", text: needHelpText(task.needHelp) } : { tone: "success", text: "Nadie necesita ayuda" },
  ];
  if (task.phase === "publicado") chips.push({ tone: "neutral", text: "Notas publicadas" });
  else if (task.toReview > 0) chips.push({ tone: "highlight", text: `${task.toReview} ${task.toReview === 1 ? "nota" : "notas"} por revisar` });
  return { line: handedInLine(task.handedIn), chips, action: "entregas" };
}

const METHOD_LINE: Record<ClassSession["method"], string> = {
  escrito: "Evaluación escrita",
  oral: "Defensa oral, en clase",
  papel: "Defensa escrita, en papel",
};

/** "Evaluación escrita · nota de 0 a 20 · aprueba con 11": how the class is graded, above the submissions. */
export function sessionLine(
  session: Pick<ClassSession, "method" | "grading" | "gradeScale" | "passingGrade" | "questionsPerStudent">,
): string {
  const parts = [METHOD_LINE[session.method], session.grading === "literal" ? "nota AD · A · B · C" : `nota de 0 a ${session.gradeScale}`];
  if (session.method === "escrito") {
    if (session.grading === "numerica") parts.push(`aprueba con ${session.passingGrade}`);
  } else {
    const n = session.questionsPerStudent;
    parts.push(`${n} ${n === 1 ? "pregunta" : "preguntas"} por alumno`);
  }
  return parts.join(" · ");
}

const METHOD_SUMMARY: Record<ClassSession["method"], string> = {
  escrito: "escrito en el celular",
  oral: "oral, en clase",
  papel: "escrito en papel",
};

/** "0 a 20 · escrito en el celular · hasta vie 7 nov": the saved settings, once the teacher chose them. */
export function evaluationSummary(session: Pick<ClassSession, "method" | "grading" | "gradeScale">, deadline: string | null): string {
  const scale = session.grading === "literal" ? "AD · A · B · C" : `0 a ${session.gradeScale}`;
  return [scale, METHOD_SUMMARY[session.method], deadline ? `hasta ${deadline}` : "sin plazo"].join(" · ");
}

function letterOf(share: number): Letter {
  return share >= 0.85 ? "AD" : share >= 0.65 ? "A" : share >= 0.45 ? "B" : "C";
}

/** What an AI working alone would get, on the scale the teacher grades with: "6/20" or a letter. */
export function aiAloneGrade(percent: number, grading: GradingSystem, scale: number): string {
  if (grading === "literal") return letterOf(percent / 100);
  return `${Math.round((percent / 100) * scale)}/${scale}`;
}

/** "Tú decides": how many reviewed criteria the teacher changed from the AI suggestion. */
export function teacherDecides(marks: { suggested: number; points: number | null }[][]): string {
  const reviewed = marks.flat().filter((m) => m.points !== null);
  if (reviewed.length === 0) return "Todavía no revisaste ningún criterio.";
  const changed = reviewed.filter((m) => m.points !== m.suggested).length;
  const percent = Math.round((changed / reviewed.length) * 100);
  return `Cambiaste ${changed} de ${reviewed.length} ${reviewed.length === 1 ? "criterio" : "criterios"} que sugirió la IA (${percent}%).`;
}

/**
 * Grade from how the student answered each question (1 explained, 0.5 partly, 0 not), once every
 * question is marked: the average on the numeric scale (to half points) or its letter.
 */
export function markedGrade(marks: (number | null)[], session: Pick<ClassSession, "grading" | "gradeScale">): number | Letter | null {
  if (marks.length === 0 || marks.some((m) => m === null)) return null;
  const share = (marks as number[]).reduce((sum, m) => sum + m, 0) / marks.length;
  if (session.grading === "literal") return letterOf(share);
  return Math.round(share * session.gradeScale * 2) / 2;
}
