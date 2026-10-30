export type Evidence = "entrega" | "defensa";

export interface Criterion {
  id: string;
  name: string;
  description: string;
  /** Integer weight; weights of a rubric sum to 100. */
  weight: number;
  /** Where the criterion is verified: the written work or the live defense. */
  evidence: Evidence;
}

export interface Redesign {
  statement: string;
  aiPolicy: string;
  criteria: Criterion[];
  /** Product-focused rubric that represents how the original task is graded today. */
  originalCriteria: Criterion[];
  rationale: string;
}

export interface CriterionScore {
  criterionId: string;
  /** 0..1 */
  score: number;
  reason: string;
}

export interface StressRun {
  aiAnswer: string;
  scores: CriterionScore[];
}

export interface StressTest {
  original: StressRun;
  redesigned: StressRun;
  ranAt: string;
}

export interface DefenseQuestion {
  id: string;
  criterionId: string;
  question: string;
}

export interface DefenseAnswer {
  questionId: string;
  answer: string;
}

export interface CriterionEvaluation {
  criterionId: string;
  /** 0..1, quality shown in the written submission */
  submissionScore: number;
  /** 0..1, how well the student explained it in the defense */
  defenseScore: number;
  evidenceQuote: string;
  misconception: string | null;
}

export interface Evaluation {
  perCriterion: CriterionEvaluation[];
  summary: string;
}

export interface Submission {
  id: string;
  alias: string;
  work: string;
  questions: DefenseQuestion[];
  answers: DefenseAnswer[];
  evaluation: Evaluation | null;
  createdAt: string;
  answeredAt: string | null;
}

export interface MisconceptionCluster {
  label: string;
  criterionId: string;
  studentAliases: string[];
  quotes: string[];
  suggestion: string;
}

export interface ClassInsights {
  clusters: MisconceptionCluster[];
  generatedAt: string;
}

export interface Assignment {
  id: string;
  /** Secret that unlocks the teacher dashboard; students only get the public view. */
  teacherKey: string;
  title: string;
  subject: string;
  original: string;
  redesign: Redesign;
  stress: StressTest | null;
  submissions: Submission[];
  insights: ClassInsights | null;
  createdAt: string;
}
