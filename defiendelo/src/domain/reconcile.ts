import type { DefenseAnswer, DefenseQuestion, Evaluation } from "./types";

/** Highest defense score allowed once the evaluator itself reported a misconception. */
export const MISCONCEPTION_CAP = 0.5;
const MIN_WORDS = 4;

function isNonAnswer(text: string | undefined): boolean {
  const normalized = (text ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim();
  return normalized.split(/\s+/).filter(Boolean).length < MIN_WORDS;
}

/**
 * Enforces rules a model may contradict: a criterion whose questions all got empty or non-answers
 * cannot be defended, and a detected misconception caps the defense score.
 */
export function reconcileEvaluation(
  evaluation: Evaluation,
  questions: DefenseQuestion[],
  answers: DefenseAnswer[],
): Evaluation {
  return {
    ...evaluation,
    perCriterion: evaluation.perCriterion.map((p) => {
      const related = questions.filter((q) => q.criterionId === p.criterionId);
      if (related.length === 0) return p;
      const allNonAnswers = related.every((q) => isNonAnswer(answers.find((a) => a.questionId === q.id)?.answer));
      if (allNonAnswers) return { ...p, defenseScore: 0 };
      if (p.misconception) return { ...p, defenseScore: Math.min(p.defenseScore, MISCONCEPTION_CAP) };
      return p;
    }),
  };
}
