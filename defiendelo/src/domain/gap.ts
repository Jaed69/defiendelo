import type { Assignment, Criterion, CriterionScore, Submission } from "./types";

/** Score at or above which a criterion is considered "given away" to an AI working alone. */
export const GIVEN_AWAY_THRESHOLD = 0.7;

function totalWeight(criteria: Criterion[]): number {
  return criteria.reduce((sum, c) => sum + c.weight, 0);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Percentage of the grade an AI can obtain without the student.
 * Criteria verified in the live defense cannot be delegated, so they add nothing.
 */
export function aiObtainableScore(criteria: Criterion[], scores: CriterionScore[]): number {
  const total = totalWeight(criteria);
  if (total === 0) return 0;
  const earned = criteria
    .filter((c) => c.evidence === "entrega")
    .reduce((sum, c) => sum + c.weight * (scores.find((s) => s.criterionId === c.id)?.score ?? 0), 0);
  return round((earned / total) * 100);
}

export function givenAwayCriteria(criteria: Criterion[], scores: CriterionScore[]): Criterion[] {
  return criteria.filter(
    (c) =>
      c.evidence === "entrega" &&
      (scores.find((s) => s.criterionId === c.id)?.score ?? 0) >= GIVEN_AWAY_THRESHOLD,
  );
}

/**
 * Weighted percentage of what the student submitted but could not explain in the defense.
 * Null until the defense is evaluated.
 */
export function studentGap(criteria: Criterion[], submission: Submission): number | null {
  if (!submission.evaluation) return null;
  const total = totalWeight(criteria);
  if (total === 0) return 0;
  const gap = criteria.reduce((sum, c) => {
    const e = submission.evaluation!.perCriterion.find((p) => p.criterionId === c.id);
    if (!e) return sum;
    return sum + c.weight * Math.max(0, e.submissionScore - e.defenseScore);
  }, 0);
  return round((gap / total) * 100);
}

export interface TriageEntry {
  submissionId: string;
  alias: string;
  gap: number;
}

export function triage(criteria: Criterion[], submissions: Submission[]): TriageEntry[] {
  return submissions
    .map((s) => ({ submissionId: s.id, alias: s.alias, gap: studentGap(criteria, s) }))
    .filter((e): e is TriageEntry => e.gap !== null)
    .sort((a, b) => b.gap - a.gap);
}

/** Mean gap across defended submissions, as a whole percent; null before the first defense. */
export function averageGap(entries: TriageEntry[]): number | null {
  if (entries.length === 0) return null;
  return Math.round(entries.reduce((sum, e) => sum + e.gap, 0) / entries.length);
}

export interface AssignmentSummary {
  /** AI-alone score on the original task; null before the stress test. */
  aiOriginal: number | null;
  /** AI-alone score on the redesigned task; null before the stress test. */
  aiRedesigned: number | null;
  defenses: number;
  meanGap: number | null;
}

/** The headline numbers of an assignment: how much an AI gets alone, before and after, and how the class defended. */
export function assignmentSummary({ redesign, stress, submissions }: Pick<Assignment, "redesign" | "stress" | "submissions">): AssignmentSummary {
  const ranking = triage(redesign.criteria, submissions);
  return {
    aiOriginal: stress ? aiObtainableScore(redesign.originalCriteria, stress.original.scores) : null,
    aiRedesigned: stress ? aiObtainableScore(redesign.criteria, stress.redesigned.scores) : null,
    defenses: ranking.length,
    meanGap: averageGap(ranking),
  };
}
