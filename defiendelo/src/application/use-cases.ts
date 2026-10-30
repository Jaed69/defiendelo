import type { AssessmentAI, RedesignInput } from "@/ports/assessment-ai";
import type { AssignmentStore } from "@/ports/assignment-store";
import type { Assignment, Criterion, DefenseAnswer, Submission } from "@/domain/types";

export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}

function newId(): string {
  return crypto.randomUUID().slice(0, 8);
}

async function load(store: AssignmentStore, id: string): Promise<Assignment> {
  const assignment = await store.get(id);
  if (!assignment) throw new NotFoundError("Assignment not found");
  return assignment;
}

async function loadAsTeacher(store: AssignmentStore, id: string, teacherKey: string | null): Promise<Assignment> {
  const assignment = await load(store, id);
  if (teacherKey !== assignment.teacherKey) throw new ForbiddenError("Invalid teacher key");
  return assignment;
}

export interface PublicAssignment {
  id: string;
  title: string;
  subject: string;
  statement: string;
  aiPolicy: string;
  criteria: Pick<Criterion, "id" | "name" | "description" | "weight" | "evidence">[];
}

export async function getForTeacher(store: AssignmentStore, id: string, teacherKey: string | null) {
  return loadAsTeacher(store, id, teacherKey);
}

export async function getForStudent(store: AssignmentStore, id: string): Promise<PublicAssignment> {
  const a = await load(store, id);
  return {
    id: a.id,
    title: a.title,
    subject: a.subject,
    statement: a.redesign.statement,
    aiPolicy: a.redesign.aiPolicy,
    criteria: a.redesign.criteria.map(({ id, name, description, weight, evidence }) => ({ id, name, description, weight, evidence })),
  };
}

export async function createAssignment(ai: AssessmentAI, store: AssignmentStore, input: RedesignInput) {
  const redesign = await ai.redesign(input);
  const assignment: Assignment = {
    id: newId(),
    teacherKey: crypto.randomUUID().replaceAll("-", ""),
    ...input,
    redesign,
    stress: null,
    submissions: [],
    insights: null,
    createdAt: new Date().toISOString(),
  };
  await store.save(assignment);
  return assignment;
}

export async function runStressTest(ai: AssessmentAI, store: AssignmentStore, id: string, teacherKey: string | null) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const { redesign, subject, original } = assignment;
  const [originalAnswer, redesignedAnswer] = await Promise.all([
    ai.solveAlone(subject, original),
    ai.solveAlone(subject, redesign.statement),
  ]);
  const [originalScores, redesignedScores] = await Promise.all([
    ai.grade(original, redesign.originalCriteria, originalAnswer),
    ai.grade(redesign.statement, redesign.criteria, redesignedAnswer),
  ]);
  assignment.stress = {
    original: { aiAnswer: originalAnswer, scores: originalScores },
    redesigned: { aiAnswer: redesignedAnswer, scores: redesignedScores },
    ranAt: new Date().toISOString(),
  };
  await store.save(assignment);
  return assignment;
}

export async function startDefense(
  ai: AssessmentAI,
  store: AssignmentStore,
  id: string,
  alias: string,
  work: string,
): Promise<Submission> {
  const assignment = await load(store, id);
  const questions = await ai.defenseQuestions(assignment.redesign.statement, assignment.redesign.criteria, work);
  const submission: Submission = {
    id: newId(),
    alias,
    work,
    questions,
    answers: [],
    evaluation: null,
    createdAt: new Date().toISOString(),
    answeredAt: null,
  };
  // Re-read right before writing to shrink the window for concurrent submissions.
  const latest = await load(store, id);
  latest.submissions.push(submission);
  await store.save(latest);
  return submission;
}

export async function submitDefense(
  ai: AssessmentAI,
  store: AssignmentStore,
  id: string,
  submissionId: string,
  answers: DefenseAnswer[],
): Promise<Submission> {
  const assignment = await load(store, id);
  const submission = assignment.submissions.find((s) => s.id === submissionId);
  if (!submission) throw new NotFoundError("Submission not found");
  if (submission.evaluation) return submission;
  const evaluation = await ai.evaluateDefense(
    assignment.redesign.statement,
    assignment.redesign.criteria,
    submission.work,
    submission.questions,
    answers,
  );
  const latest = await load(store, id);
  const target = latest.submissions.find((s) => s.id === submissionId)!;
  target.answers = answers;
  target.evaluation = evaluation;
  target.answeredAt = new Date().toISOString();
  await store.save(latest);
  return target;
}

export async function analyzeClass(ai: AssessmentAI, store: AssignmentStore, id: string, teacherKey: string | null) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const clusters = await ai.clusterMisconceptions(
    assignment.redesign.statement,
    assignment.redesign.criteria,
    assignment.submissions,
  );
  const latest = await load(store, id);
  latest.insights = { clusters, generatedAt: new Date().toISOString() };
  await store.save(latest);
  return latest;
}
