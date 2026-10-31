import type { ClassSession, Criterion, Evaluation, Letter, Submission } from "./types";

export const LETTERS: Letter[] = ["AD", "A", "B", "C"];

export const LETTER_LABEL: Record<Letter, string> = {
  AD: "Logro destacado",
  A: "Logro esperado",
  B: "En proceso",
  C: "En inicio",
};

export function isGraded(submission: Submission): boolean {
  return submission.grade != null || submission.letter != null;
}

/** Literal: A or AD. Numeric: at or above the passing grade. */
export function achieved(session: Pick<ClassSession, "grading" | "passingGrade">, submission: Submission): boolean {
  if (session.grading === "literal") return submission.letter === "A" || submission.letter === "AD";
  return submission.grade != null && submission.grade >= session.passingGrade;
}

/** Weighted share (0..1) of the rubric the student explained in the defense. */
function explained(criteria: Criterion[], evaluation: Evaluation): number {
  let weight = 0;
  let sum = 0;
  for (const p of evaluation.perCriterion) {
    const w = criteria.find((c) => c.id === p.criterionId)?.weight ?? 0;
    weight += w;
    sum += w * p.defenseScore;
  }
  return weight === 0 ? 0 : sum / weight;
}

// ponytail: fixed cut points for the AI suggestion; the teacher always confirms or changes it.
export function suggestLetter(criteria: Criterion[], evaluation: Evaluation): Letter {
  const share = explained(criteria, evaluation);
  return share >= 0.85 ? "AD" : share >= 0.65 ? "A" : share >= 0.45 ? "B" : "C";
}

export function suggestGrade(session: Pick<ClassSession, "gradeScale">, criteria: Criterion[], evaluation: Evaluation): number {
  return Math.round(explained(criteria, evaluation) * session.gradeScale);
}

export interface GradeReport {
  total: number;
  graded: number;
  /** Literal: A + AD. Numeric: passed. */
  achieved: number;
  letters: Record<Letter, number>;
  /** Numeric only, over graded students. */
  average: number | null;
}

export function gradeReport(session: Pick<ClassSession, "grading" | "passingGrade">, submissions: Submission[]): GradeReport {
  const graded = submissions.filter(isGraded);
  const letters: Record<Letter, number> = { AD: 0, A: 0, B: 0, C: 0 };
  for (const s of graded) if (s.letter) letters[s.letter]++;
  const grades = graded.map((s) => s.grade).filter((g): g is number => g != null);
  return {
    total: submissions.length,
    graded: graded.length,
    achieved: graded.filter((s) => achieved(session, s)).length,
    letters,
    average: session.grading === "numerica" && grades.length ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10 : null,
  };
}

/** Weights must be whole numbers that add up to 100, with at least one criterion. */
export function rubricProblem(criteria: Pick<Criterion, "name" | "weight">[]): string | null {
  if (criteria.length === 0) return "La rúbrica necesita al menos un criterio.";
  if (criteria.some((c) => !c.name.trim())) return "Cada criterio necesita un nombre.";
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  return total === 100 ? null : `Los pesos suman ${total}%; deben sumar 100%.`;
}
