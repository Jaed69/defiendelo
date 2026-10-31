import type { AssessmentAI, RedesignInput } from "@/ports/assessment-ai";
import type { AssignmentStore } from "@/ports/assignment-store";
import { reconcileEvaluation } from "@/domain/reconcile";
import { rubricProblem } from "@/domain/grading";
import { acceptsSubmissions, gradeQuestion, isLive, setFinalGrade, proposeQueue, questionsFor, sessionOf, studentStatus, studentView } from "@/domain/session";
import type { Account, AccountRole, Assignment, ClassSession, Criterion, DefenseAnswer, Letter, Redesign, Submission } from "@/domain/types";
import { newAccountCode, normalizeAccountCode } from "@/domain/account";
import { criterionMarks, isGraded, letterForMarks, marksTotal } from "@/domain/grading";
import { studentGap } from "@/domain/gap";
import { type DemoFixture, demoFixture, demoStudentFor, recordedEvaluation } from "@/demo/demo-class";

/** A fixed AI, or one chosen per task: demo tasks replay synthetic data with the instant offline engine. */
export type AISource = AssessmentAI | ((assignment: Pick<Assignment, "demo">) => AssessmentAI);

function aiFor(source: AISource, assignment: Pick<Assignment, "demo">): AssessmentAI {
  return typeof source === "function" ? source(assignment) : source;
}

export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}
/** The action is not allowed in the current session phase (e.g. submitting after the deadline). */
export class ConflictError extends Error {}
export class InvalidInputError extends Error {}

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

/** With a fixture the task is a demo: redesign and AI-alone test come from it at once, with no model call. */
export async function createAssignment(ai: AISource, store: AssignmentStore, input: RedesignInput, fixture: DemoFixture | null = null) {
  const redesign = fixture ? structuredClone(fixture.redesign) : await aiFor(ai, {}).redesign(input);
  const assignment: Assignment = {
    id: newId(),
    teacherKey: crypto.randomUUID().replaceAll("-", ""),
    ...input,
    redesign,
    stress: fixture ? { ...structuredClone(fixture.stress), ranAt: new Date().toISOString() } : null,
    submissions: [],
    insights: null,
    createdAt: new Date().toISOString(),
    ...(fixture ? { demo: { exampleId: fixture.exampleId } } : {}),
  };
  await store.save(assignment);
  return assignment;
}

export async function runStressTest(source: AISource, store: AssignmentStore, id: string, teacherKey: string | null) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const ai = aiFor(source, assignment);
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
  source: AISource,
  store: AssignmentStore,
  id: string,
  alias: string,
  work: string,
): Promise<Submission> {
  const assignment = await load(store, id);
  if (!acceptsSubmissions(sessionOf(assignment), new Date())) throw new ConflictError("Submissions are closed");
  const questions = await questionsForWork(source, assignment, work);
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

/** A demo student who loaded the example work gets its recorded questions; anyone else gets fresh ones. */
async function questionsForWork(source: AISource, assignment: Assignment, work: string) {
  const fixture = demoFixture(assignment.demo?.exampleId);
  const student = fixture && demoStudentFor(fixture, work);
  if (student) return structuredClone(student.questions);
  return aiFor(source, assignment).defenseQuestions(assignment.redesign.statement, assignment.redesign.criteria, work);
}

export async function submitDefense(
  source: AISource,
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
  const questions = questionsFor(sessionOf(assignment), submission, live);
  const fixture = demoFixture(assignment.demo?.exampleId);
  const student = fixture && demoStudentFor(fixture, submission.work);
  const recorded = student ? recordedEvaluation(student, questions, answers) : null;
  const evaluation = reconcileEvaluation(
    recorded ??
      (await aiFor(source, assignment).evaluateDefense(assignment.redesign.statement, assignment.redesign.criteria, submission.work, questions, answers)),
    questions,
    answers,
  );
  const latest = await load(store, id);
  const target = latest.submissions.find((s) => s.id === submissionId)!;
  target.answers = answers;
  target.evaluation = evaluation;
  target.answeredAt = new Date().toISOString();
  target.redoRequested = false;
  await store.save(latest);
  return target;
}

export async function analyzeClass(source: AISource, store: AssignmentStore, id: string, teacherKey: string | null) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const clusters =
    recordedClusters(assignment) ??
    (await aiFor(source, assignment).clusterMisconceptions(assignment.redesign.statement, assignment.redesign.criteria, assignment.submissions));
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
  source: AISource,
  store: AssignmentStore,
  id: string,
  submissionId: string,
  token: string | null,
  work: string,
) {
  const assignment = await load(store, id);
  ownSubmission(assignment, submissionId, token);
  if (!acceptsSubmissions(sessionOf(assignment), new Date())) throw new ConflictError("Submissions are closed");
  const questions = await questionsForWork(source, assignment, work);
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

export type TeacherGrade =
  | { questionId: string; score: number }
  | { grade: number }
  | { letter: Letter }
  | { criterionId: string; points: number }
  | { comment: string }
  | { redo: true };

/** A question score (may advance the oral queue), a final numeric grade or a final letter. */
export async function gradeSubmission(store: AssignmentStore, id: string, teacherKey: string | null, submissionId: string, input: TeacherGrade) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const submission = assignment.submissions.find((s) => s.id === submissionId);
  if (!submission) throw new NotFoundError("Submission not found");
  const session = sessionOf(assignment);
  if ("criterionId" in input) {
    const mark = criterionMarks(session, assignment.redesign.criteria, submission).find((m) => m.criterionId === input.criterionId);
    if (!mark) throw new InvalidInputError("Ese criterio no está en la rúbrica o todavía no tiene revisión.");
    if (input.points < 0 || input.points > mark.max) throw new InvalidInputError(`Pon entre 0 y ${mark.max} puntos.`);
    submission.criterionPoints = { ...submission.criterionPoints, [input.criterionId]: input.points };
  } else if ("comment" in input) {
    submission.comment = input.comment;
  } else if ("redo" in input) {
    // The student answers again from scratch; the old review would mislead the new grade.
    Object.assign(submission, {
      answers: [],
      evaluation: null,
      answeredAt: null,
      criterionPoints: {},
      grade: null,
      letter: null,
      questionGrades: {},
      redoRequested: true,
    });
  } else
    assignment.session =
      "questionId" in input
      ? gradeQuestion(session, assignment.submissions, submissionId, input.questionId, input.score)
      : setFinalGrade(session, assignment.submissions, submissionId, input);
  await store.save(assignment);
  return assignment;
}


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

/** Recorded class insights of a demo task, narrowed to the students in it; null when there is nothing to replay. */
function recordedClusters(assignment: Assignment) {
  const fixture = demoFixture(assignment.demo?.exampleId);
  if (!fixture?.insights) return null;
  const present = new Set(assignment.submissions.filter((s) => s.evaluation).map((s) => s.alias));
  const clusters = fixture.insights.clusters
    .map((c) => ({ ...c, studentAliases: c.studentAliases.filter((a) => present.has(a)) }))
    .filter((c) => c.studentAliases.length > 0);
  return clusters.length > 0 ? clusters : null;
}

/**
 * Fills a demo task with its synthetic class: each student hands in, answers and is reviewed by the
 * AI, as if the class had already happened. Students already in the task are not added twice.
 * If the teacher never chose how to evaluate, it uses a written defense graded 0 to 20.
 */
export async function simulateClass(store: AssignmentStore, id: string, teacherKey: string | null) {
  const assignment = await loadAsTeacher(store, id, teacherKey);
  const fixture = demoFixture(assignment.demo?.exampleId);
  if (!fixture) throw new ConflictError("Only example tasks can simulate a class");
  const taken = new Set(assignment.submissions.map((s) => s.alias.toLowerCase()));
  const now = Date.now();
  const total = fixture.students.length;
  fixture.students
    .filter((s) => !taken.has(s.alias.toLowerCase()))
    .forEach((s, i) => {
      assignment.submissions.push({
        id: newId(),
        alias: s.alias,
        work: s.work,
        questions: structuredClone(s.questions),
        answers: structuredClone(s.answers),
        evaluation: structuredClone(s.evaluation),
        createdAt: new Date(now - (total - i) * 60_000).toISOString(),
        answeredAt: new Date(now - (total - i) * 30_000).toISOString(),
        token: crypto.randomUUID().replaceAll("-", ""),
      });
    });
  const session = assignment.session
    ? sessionOf(assignment)
    : { ...sessionOf(assignment), method: "escrito" as const, grading: "numerica" as const, questionsPerStudent: 4 };
  const phase = session.phase === "entregas" ? "defensas" : session.phase;
  assignment.session = { ...session, phase, queue: [...new Set([...session.queue, ...proposeQueue(assignment.submissions)])] };
  assignment.insights = { clusters: recordedClusters(assignment) ?? [], generatedAt: new Date().toISOString() };
  await store.save(assignment);
  return assignment;
}

/** Example works a demo student can hand in, with the answers that go with them, in question order. */
export async function demoSamples(store: AssignmentStore, id: string) {
  const assignment = await load(store, id);
  const fixture = demoFixture(assignment.demo?.exampleId);
  if (!fixture) return { students: [] };
  return {
    students: fixture.students.map((s) => ({
      alias: s.alias.toLowerCase(),
      work: s.work,
      answers: s.questions.map((q) => s.answers.find((a) => a.questionId === q.id)?.answer ?? ""),
    })),
  };
}

function newCode(role: AccountRole) {
  return newAccountCode(role, crypto.getRandomValues(new Uint8Array(6)));
}

/** Adds a task or a submission to the account with that code, or to a new account when there is none yet. */
export async function remember(
  store: AssignmentStore,
  role: AccountRole,
  code: string | null,
  item: { id: string; teacherKey: string } | { assignmentId: string; submissionId: string; token: string },
): Promise<string> {
  const parsed = code ? normalizeAccountCode(code) : null;
  const existing = parsed && parsed.role === role ? await store.getAccount(parsed.code) : null;
  const account: Account = existing ?? { code: newCode(role), role, assignments: [], submissions: [], createdAt: new Date().toISOString() };
  if ("teacherKey" in item) account.assignments = [item, ...account.assignments.filter((a) => a.id !== item.id)];
  else account.submissions = [item, ...account.submissions.filter((s) => s.submissionId !== item.submissionId)];
  await store.saveAccount(account);
  return account.code;
}

export interface TeacherTaskSummary {
  id: string;
  teacherKey: string;
  title: string;
  subject: string;
  createdAt: string;
  handedIn: number;
  needHelp: string[];
  toReview: number;
  live: boolean;
  phase: ClassSession["phase"];
}

export interface StudentTaskSummary {
  assignmentId: string;
  submissionId: string;
  token: string;
  title: string;
  subject: string;
  alias: string;
  method: ClassSession["method"];
  status: ReturnType<typeof studentStatus>;
  deadline: string | null;
  grading: ClassSession["grading"];
  gradeScale: number;
  grade: number | null;
  letter: Letter | null;
  /** Published only: the best explained criterion and one thing to review, from the review the teacher accepted. */
  strength: string | null;
  toReview: string | null;
}

/** What a code opens: a teacher's tasks or a student's submissions. Unknown codes answer 404. */
export async function openAccount(store: AssignmentStore, code: string) {
  const parsed = normalizeAccountCode(code);
  const account = parsed ? await store.getAccount(parsed.code) : null;
  if (!account) throw new NotFoundError("Account not found");
  if (account.role === "docente") {
    const tasks: TeacherTaskSummary[] = [];
    for (const item of account.assignments) {
      const a = await store.get(item.id);
      if (!a || a.teacherKey !== item.teacherKey) continue;
      const evaluated = a.submissions.filter((s) => s.evaluation);
      tasks.push({
        id: a.id,
        teacherKey: a.teacherKey,
        title: a.title,
        subject: a.subject,
        createdAt: a.createdAt,
        handedIn: a.submissions.length,
        needHelp: evaluated.filter((s) => (studentGap(a.redesign.criteria, s) ?? 0) >= 25).map((s) => s.alias),
        toReview: evaluated.filter((s) => !isGraded(s)).length,
        live: isLive(a),
        phase: sessionOf(a).phase,
      });
    }
    return { code: account.code, role: account.role, tasks };
  }
  const evaluations: StudentTaskSummary[] = [];
  for (const item of account.submissions) {
    const a = await store.get(item.assignmentId);
    const s = a?.submissions.find((x) => x.id === item.submissionId && x.token === item.token);
    if (!a || !s) continue;
    const session = sessionOf(a);
    const status = studentStatus(session, s, isLive(a));
    const published = status === "publicado";
    const marks = published ? criterionMarks(session, a.redesign.criteria, s) : [];
    const share = (m: (typeof marks)[number]) => (m.points ?? m.suggested) / (m.max || 1);
    const best = [...marks].sort((x, y) => share(y) - share(x))[0];
    const weak = marks.find((m) => m.misconception);
    evaluations.push({
      ...item,
      title: a.title,
      subject: a.subject,
      alias: s.alias,
      method: session.method,
      status,
      deadline: session.deadline,
      grading: session.grading,
      gradeScale: session.gradeScale,
      grade: published ? (s.grade ?? (marks.length ? marksTotal(marks) : null)) : null,
      letter: published ? (s.letter ?? (marks.length && session.grading === "literal" ? letterForMarks(marks) : null)) : null,
      strength: best ? best.name : null,
      toReview: weak?.misconception ?? null,
    });
  }
  return { code: account.code, role: account.role, evaluations };
}
