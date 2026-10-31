import type { AssessmentAI, RedesignInput } from "@/ports/assessment-ai";
import type { AssignmentStore } from "@/ports/assignment-store";
import { reconcileEvaluation } from "@/domain/reconcile";
import { acceptsSubmissions, gradeQuestion, isLive, proposeQueue, questionsFor, sessionOf, studentStatus, studentView } from "@/domain/session";
import type { Assignment, ClassSession, Criterion, DefenseAnswer, Submission } from "@/domain/types";

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
  if (session.phase !== "entregas" && session.queue.length === 0) session.queue = proposeQueue(assignment.submissions);
  assignment.session = session;
  await store.save(assignment);
  return session;
}

/** With questionId scores that question (and may advance the oral queue); without it sets the final grade. */
export async function gradeSubmission(
  store: AssignmentStore,
  id: string,
  teacherKey: string | null,
  submissionId: string,
  score: number,
  questionId?: string,
) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const submission = assignment.submissions.find((s) => s.id === submissionId);
  if (!submission) throw new NotFoundError("Submission not found");
  if (questionId) assignment.session = gradeQuestion(sessionOf(assignment), assignment.submissions, submissionId, questionId, score);
  else submission.grade = score;
  await store.save(assignment);
  return { session: sessionOf(assignment), grade: submission.grade ?? null };
}
