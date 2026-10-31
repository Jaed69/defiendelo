import type { Assignment, ClassSession, DefenseQuestion, Evaluation, EvaluationMethod, SessionPhase, Submission } from "./types";

export const DEFAULT_SESSION: ClassSession = {
  method: "oral",
  deadline: null,
  questionsPerStudent: 2,
  gradeScale: 20,
  phase: "entregas",
  queue: [],
  current: null,
  currentQuestion: 0,
};

export function sessionOf(assignment: Assignment): ClassSession {
  return { ...DEFAULT_SESSION, ...assignment.session };
}

export function acceptsSubmissions(session: ClassSession, now: Date): boolean {
  return session.phase === "entregas" && (!session.deadline || now < new Date(session.deadline));
}

// ponytail: arrival order only; the teacher reorders by hand. Add gap or random proposals when asked.
export function proposeQueue(submissions: Submission[]): string[] {
  return [...submissions].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((s) => s.id);
}

/** The AI may return more questions than the teacher asked for; only the first N count. */
export function questionsFor(session: ClassSession, submission: Submission): DefenseQuestion[] {
  return submission.questions.slice(0, session.questionsPerStudent);
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

export function studentStatus(session: ClassSession, submission: Submission): StudentStatus {
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
  status: StudentStatus;
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

export function studentView(assignment: Assignment, submission: Submission): StudentView {
  const session = sessionOf(assignment);
  const status = studentStatus(session, submission);
  const questions = questionsFor(session, submission);
  const aliasOf = (id: string | null) => assignment.submissions.find((s) => s.id === id)?.alias ?? null;
  const oral = session.method === "oral" && session.phase === "defensas";
  const position = session.queue.indexOf(submission.id);
  return {
    alias: submission.alias,
    method: session.method,
    phase: session.phase,
    deadline: session.deadline,
    gradeScale: session.gradeScale,
    status,
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
            perQuestion: questions.map((q) => ({ question: q.question, score: submission.questionGrades?.[q.id] ?? null })),
            evaluation: submission.evaluation,
          }
        : null,
  };
}
