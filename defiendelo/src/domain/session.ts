import type { Assignment, ClassSession, DefenseQuestion, Evaluation, EvaluationMethod, SessionPhase, Submission } from "./types";

export const DEFAULT_SESSION: ClassSession = {
  method: "oral",
  deadline: null,
  questionsPerStudent: 2,
  gradeScale: 20,
  passingGrade: 11,
  phase: "entregas",
  queue: [],
  current: null,
  currentQuestion: 0,
};

export function sessionOf(assignment: Assignment): ClassSession {
  return { ...DEFAULT_SESSION, ...assignment.session };
}

/**
 * The live session starts once the teacher configures it. Until then the assignment keeps the
 * self-paced flow: the student hands in, answers the written defense at once and sees the result.
 */
export function isLive(assignment: Assignment): boolean {
  return assignment.session !== undefined;
}

export function acceptsSubmissions(session: ClassSession, now: Date): boolean {
  return session.phase === "entregas" && (!session.deadline || now < new Date(session.deadline));
}

// ponytail: arrival order only; the teacher reorders by hand. Add gap or random proposals when asked.
export function proposeQueue(submissions: Submission[]): string[] {
  return [...submissions].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((s) => s.id);
}

/** The AI may return more questions than the teacher asked for; in a live session only the first N count. */
export function questionsFor(session: ClassSession, submission: Submission, live = true): DefenseQuestion[] {
  return live ? submission.questions.slice(0, session.questionsPerStudent) : submission.questions;
}

/**
 * Records a teacher score for one question. Once every question is scored the grade is their
 * average; in oral mode the session then moves to the next ungraded student in the queue.
 */
export function gradeQuestion(
  session: ClassSession,
  submissions: Submission[],
  submissionId: string,
  questionId: string,
  score: number,
): ClassSession {
  const submission = submissions.find((s) => s.id === submissionId)!;
  submission.questionGrades = { ...submission.questionGrades, [questionId]: score };
  const questions = questionsFor(session, submission);
  const pending = questions.findIndex((q) => !(q.id in submission.questionGrades!));
  if (pending === -1) {
    // ponytail: re-scoring a question recomputes the average and overwrites a manual grade.
    const sum = questions.reduce((total, q) => total + submission.questionGrades![q.id], 0);
    submission.grade = Math.round((sum / questions.length) * 10) / 10;
  }
  if (session.method !== "oral" || session.current !== submissionId) return session;
  if (pending !== -1) return { ...session, currentQuestion: pending };
  const after = session.queue.slice(session.queue.indexOf(submissionId) + 1);
  const next = after.find((id) => submissions.find((s) => s.id === id)?.grade == null) ?? null;
  return { ...session, current: next, currentQuestion: 0 };
}

export type StudentStatus = "entregado" | "en_cola" | "turno" | "responder" | "papel" | "evaluado" | "publicado";

export function studentStatus(session: ClassSession, submission: Submission, live = true): StudentStatus {
  if (!live) return submission.answeredAt ? "publicado" : "responder";
  if (session.phase === "publicado") return "publicado";
  if (session.phase === "entregas") return "entregado";
  if (submission.grade != null || (session.method === "escrito" && submission.answeredAt)) return "evaluado";
  if (session.method === "papel") return "papel";
  if (session.method === "escrito") return "responder";
  return session.current === submission.id ? "turno" : "en_cola";
}

export interface StudentView {
  alias: string;
  method: EvaluationMethod;
  phase: SessionPhase;
  deadline: string | null;
  gradeScale: number;
  passingGrade: number;
  status: StudentStatus;
  /** The student's own work and whether they may still replace it (only before submissions close). */
  work: string;
  canReplace: boolean;
  /** Aliases in presentation order (oral); no other student data leaves the server. */
  queue: string[];
  position: number | null;
  presenting: string | null;
  /** Question being asked right now, only on the student's own oral turn. */
  question: { number: number; total: number; text: string } | null;
  /** Written defense questions, only while the student has to answer them. */
  questions: DefenseQuestion[];
  result: {
    grade: number | null;
    perQuestion: { question: string; score: number | null }[];
    evaluation: Evaluation | null;
  } | null;
}

export function studentView(assignment: Assignment, submission: Submission, now: Date): StudentView {
  const session = sessionOf(assignment);
  const live = isLive(assignment);
  const status = studentStatus(session, submission, live);
  const questions = questionsFor(session, submission, live);
  const aliasOf = (id: string | null) => assignment.submissions.find((s) => s.id === id)?.alias ?? null;
  const oral = session.method === "oral" && session.phase === "defensas";
  const position = session.queue.indexOf(submission.id);
  return {
    alias: submission.alias,
    method: session.method,
    phase: session.phase,
    deadline: session.deadline,
    gradeScale: session.gradeScale,
    passingGrade: session.passingGrade,
    status,
    work: submission.work,
    canReplace: acceptsSubmissions(session, now),
    queue: oral ? session.queue.map((id) => aliasOf(id) ?? "") : [],
    position: oral && position !== -1 ? position + 1 : null,
    presenting: oral ? aliasOf(session.current) : null,
    question:
      status === "turno" && questions[session.currentQuestion]
        ? { number: session.currentQuestion + 1, total: questions.length, text: questions[session.currentQuestion].question }
        : null,
    questions: status === "responder" ? questions : [],
    result:
      status === "publicado"
        ? {
            grade: submission.grade ?? null,
            // Without a live session the teacher grades nothing per question, so there is nothing to list.
            perQuestion: live ? questions.map((q) => ({ question: q.question, score: submission.questionGrades?.[q.id] ?? null })) : [],
            evaluation: submission.evaluation,
          }
        : null,
  };
}
