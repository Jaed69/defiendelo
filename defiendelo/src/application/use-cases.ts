import type { AssessmentAI, RedesignInput } from "@/ports/assessment-ai";
import type { AssignmentStore } from "@/ports/assignment-store";
import { reconcileEvaluation } from "@/domain/reconcile";
import { rubricProblem } from "@/domain/grading";
import { acceptsSubmissions, gradeQuestion, isLive, setFinalGrade, proposeQueue, questionsFor, sessionOf, studentStatus, studentView } from "@/domain/session";
import type { Assignment, ClassSession, Criterion, DefenseAnswer, Letter, Redesign, Submission } from "@/domain/types";

export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}
/** The action is not allowed in the current session phase (e.g. submitting after the deadline). */
export class ConflictError extends Error {}

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
  session: Pick<ClassSession, "method" | "deadline" | "phase" | "questionsPerStudent">;
  /** False until the teacher configures a live session; until then the defense is self-paced. */
  live: boolean;
  acceptsSubmissions: boolean;
}

export async function getForTeacher(store: AssignmentStore, id: string, teacherKey: string | null) {
  return loadAsTeacher(store, id, teacherKey);
}

export async function getForStudent(store: AssignmentStore, id: string): Promise<PublicAssignment> {
  const a = await load(store, id);
  const { method, deadline, phase, questionsPerStudent } = sessionOf(a);
  return {
    id: a.id,
    title: a.title,
    subject: a.subject,
    statement: a.redesign.statement,
    aiPolicy: a.redesign.aiPolicy,
    criteria: a.redesign.criteria.map(({ id, name, description, weight, evidence }) => ({ id, name, description, weight, evidence })),
    session: { method, deadline, phase, questionsPerStudent },
    live: isLive(a),
    acceptsSubmissions: acceptsSubmissions(sessionOf(a), new Date()),
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
  if (!acceptsSubmissions(sessionOf(assignment), new Date())) throw new ConflictError("Submissions are closed");
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
    token: crypto.randomUUID().replaceAll("-", ""),
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
  token: string | null,
  answers: DefenseAnswer[],
): Promise<Submission> {
  const assignment = await load(store, id);
  const submission = ownSubmission(assignment, submissionId, token);
  if (submission.evaluation) return submission;
  const live = isLive(assignment);
  if (studentStatus(sessionOf(assignment), submission, live) !== "responder") throw new ConflictError("Not answering now");
  const evaluation = reconcileEvaluation(
    await ai.evaluateDefense(
      assignment.redesign.statement,
      assignment.redesign.criteria,
      submission.work,
      questionsFor(sessionOf(assignment), submission, live),
      answers,
    ),
    questionsFor(sessionOf(assignment), submission, live),
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

/** A wrong token answers 404 so it does not reveal which submissions exist. */
function ownSubmission(assignment: Assignment, submissionId: string, token: string | null): Submission {
  const submission = assignment.submissions.find((s) => s.id === submissionId);
  if (!submission || !token || submission.token !== token) throw new NotFoundError("Submission not found");
  return submission;
}

export async function getStudentView(store: AssignmentStore, id: string, submissionId: string, token: string | null) {
  const assignment = await load(store, id);
  return studentView(assignment, ownSubmission(assignment, submissionId, token), new Date());
}

/** Replaces the work until submissions close; questions are regenerated because they quote the work. */
export async function replaceSubmission(
  ai: AssessmentAI,
  store: AssignmentStore,
  id: string,
  submissionId: string,
  token: string | null,
  work: string,
) {
  const assignment = await load(store, id);
  ownSubmission(assignment, submissionId, token);
  if (!acceptsSubmissions(sessionOf(assignment), new Date())) throw new ConflictError("Submissions are closed");
  const questions = await ai.defenseQuestions(assignment.redesign.statement, assignment.redesign.criteria, work);
  const latest = await load(store, id);
  const target = ownSubmission(latest, submissionId, token);
  target.work = work;
  target.questions = questions;
  await store.save(latest);
}

export async function updateSession(
  store: AssignmentStore,
  id: string,
  teacherKey: string | null,
  patch: Partial<ClassSession>,
) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const session = { ...sessionOf(assignment), ...patch };
  if (session.phase !== "entregas") {
    // Keep the teacher's order, drop unknown ids and append anyone who handed in after it was proposed.
    const ids = new Set(assignment.submissions.map((s) => s.id));
    const kept = session.queue.filter((sid) => ids.has(sid));
    session.queue = [...kept, ...proposeQueue(assignment.submissions).filter((sid) => !kept.includes(sid))];
  }
  assignment.session = session;
  await store.save(assignment);
  return assignment;
}

export type TeacherGrade = { questionId: string; score: number } | { grade: number } | { letter: Letter };

/** A question score (may advance the oral queue), a final numeric grade or a final letter. */
export async function gradeSubmission(store: AssignmentStore, id: string, teacherKey: string | null, submissionId: string, input: TeacherGrade) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const submission = assignment.submissions.find((s) => s.id === submissionId);
  if (!submission) throw new NotFoundError("Submission not found");
  const session = sessionOf(assignment);
  assignment.session =
    "questionId" in input
      ? gradeQuestion(session, assignment.submissions, submissionId, input.questionId, input.score)
      : setFinalGrade(session, assignment.submissions, submissionId, input);
  await store.save(assignment);
  return assignment;
}

export class InvalidInputError extends Error {}

/**
 * The teacher edits what the AI generated. A changed statement or rubric makes the stress test stale,
 * so it is cleared and can be run again.
 */
export async function updateRedesign(
  store: AssignmentStore,
  id: string,
  teacherKey: string | null,
  patch: Partial<Pick<Redesign, "statement" | "aiPolicy">> & { criteria?: (Omit<Criterion, "id"> & { id?: string })[] },
) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const { redesign } = assignment;
  const before = JSON.stringify([redesign.statement, redesign.criteria]);
  if (patch.criteria) {
    const problem = rubricProblem(patch.criteria);
    if (problem) throw new InvalidInputError(problem);
    redesign.criteria = patch.criteria.map(({ id: cid, name, description, weight, evidence }) => ({ id: cid ?? newId(), name, description, weight, evidence }));
  }
  if (patch.statement !== undefined) redesign.statement = patch.statement;
  if (patch.aiPolicy !== undefined) redesign.aiPolicy = patch.aiPolicy;
  if (JSON.stringify([redesign.statement, redesign.criteria]) !== before) assignment.stress = null;
  await store.save(assignment);
  return assignment;
}
