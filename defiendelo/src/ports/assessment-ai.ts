import type {
  Criterion,
  CriterionScore,
  DefenseAnswer,
  DefenseQuestion,
  Evaluation,
  MisconceptionCluster,
  Redesign,
  Submission,
} from "@/domain/types";

export interface RedesignInput {
  title: string;
  subject: string;
  original: string;
}

export interface AssessmentAI {
  redesign(input: RedesignInput): Promise<Redesign>;
  /** Solves a task with no human involved, as a student who delegates everything would. */
  solveAlone(subject: string, statement: string): Promise<string>;
  grade(statement: string, criteria: Criterion[], answer: string): Promise<CriterionScore[]>;
  defenseQuestions(statement: string, criteria: Criterion[], work: string): Promise<DefenseQuestion[]>;
  evaluateDefense(
    statement: string,
    criteria: Criterion[],
    work: string,
    questions: DefenseQuestion[],
    answers: DefenseAnswer[],
  ): Promise<Evaluation>;
  clusterMisconceptions(
    statement: string,
    criteria: Criterion[],
    submissions: Submission[],
  ): Promise<MisconceptionCluster[]>;
}
