import type { DefenseAnswer, DefenseQuestion, Evaluation, MisconceptionCluster, Redesign, StressTest } from "@/domain/types";
import arte from "./fixtures/arte-indigenismo.json";
import ciencia from "./fixtures/ciencia-informe-indagacion.json";
import lectura from "./fixtures/comunicacion-comprension-lectora.json";
import argumentativo from "./fixtures/comunicacion-texto-argumentativo.json";
import dpcc from "./fixtures/dpcc-residuos.json";
import ingles from "./fixtures/ingles-festival.json";
import matematica from "./fixtures/matematica-funcion-lineal.json";
import programacion from "./fixtures/programacion-busqueda-binaria.json";
import sociales from "./fixtures/sociales-guerra-del-pacifico.json";

/** A synthetic student of an example class: their work, the questions it produced, their answers and the AI review. */
export interface DemoStudent {
  alias: string;
  work: string;
  questions: DefenseQuestion[];
  answers: DefenseAnswer[];
  evaluation: Evaluation;
}

/**
 * One example task already run through the real AI pipeline (redesign, AI-alone test, a small class
 * and its class insights). Demo assignments replay it, so the pitch never waits on a model.
 * The data is synthetic: invented students, no personal data.
 */
export interface DemoFixture {
  exampleId: string;
  redesign: Redesign;
  stress: StressTest;
  insights: { clusters: MisconceptionCluster[] } | null;
  students: DemoStudent[];
}

const FIXTURES = [arte, ciencia, lectura, argumentativo, dpcc, ingles, matematica, programacion, sociales] as unknown as DemoFixture[];

export function demoFixture(exampleId: string | undefined): DemoFixture | null {
  return FIXTURES.find((f) => f.exampleId === exampleId) ?? null;
}

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

/** The synthetic student whose work this is, when a demo student loaded the example work unchanged. */
export function demoStudentFor(fixture: DemoFixture, work: string): DemoStudent | null {
  const target = normalize(work);
  return fixture.students.find((s) => normalize(s.work) === target) ?? null;
}

/** The recorded review, only when the questions and answers are exactly the recorded ones. */
export function recordedEvaluation(student: DemoStudent, questions: DefenseQuestion[], answers: DefenseAnswer[]): Evaluation | null {
  const sameQuestions = questions.every((q) => student.questions.some((r) => r.id === q.id && r.question === q.question));
  const sameAnswers =
    answers.length === student.answers.length &&
    answers.every((a) => normalize(a.answer) === normalize(student.answers.find((r) => r.questionId === a.questionId)?.answer ?? ""));
  return sameQuestions && sameAnswers ? structuredClone(student.evaluation) : null;
}
