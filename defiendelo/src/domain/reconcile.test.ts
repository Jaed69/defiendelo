import { describe, expect, it } from "vitest";
import { reconcileEvaluation } from "./reconcile";
import type { DefenseAnswer, DefenseQuestion, Evaluation } from "./types";

const questions: DefenseQuestion[] = [
  { id: "q1", criterionId: "c1", question: "" },
  { id: "q2", criterionId: "c2", question: "" },
  { id: "q3", criterionId: "c2", question: "" },
];

function evaluation(c1: { defenseScore: number; misconception: string | null }, c2 = { defenseScore: 1, misconception: null as string | null }): Evaluation {
  return {
    summary: "",
    perCriterion: [
      { criterionId: "c1", submissionScore: 1, evidenceQuote: "", ...c1 },
      { criterionId: "c2", submissionScore: 1, evidenceQuote: "", ...c2 },
      { criterionId: "c3", submissionScore: 1, defenseScore: 0.9, evidenceQuote: "", misconception: null },
    ],
  };
}

const answered = (text: string, ids = ["q1", "q2", "q3"]): DefenseAnswer[] => ids.map((questionId) => ({ questionId, answer: text }));

describe("reconcileEvaluation", () => {
  it("sets the defense to zero when every answer for the criterion is empty or a non-answer", () => {
    const answers = [
      { questionId: "q1", answer: "no se" },
      { questionId: "q2", answer: "Elegí iterativa para usar memoria constante en listas grandes." },
    ];
    const result = reconcileEvaluation(evaluation({ defenseScore: 1, misconception: null }), questions, answers);
    expect(result.perCriterion.find((p) => p.criterionId === "c1")!.defenseScore).toBe(0);
  });

  it("keeps a criterion with at least one real answer", () => {
    const answers = [
      { questionId: "q1", answer: "Elegí iterativa para usar memoria constante en listas grandes." },
      { questionId: "q2", answer: "" },
      { questionId: "q3", answer: "Lo cambié a división entera porque el índice debe ser int." },
    ];
    const result = reconcileEvaluation(evaluation({ defenseScore: 0.8, misconception: null }), questions, answers);
    expect(result.perCriterion.find((p) => p.criterionId === "c2")!.defenseScore).toBe(1);
  });

  it("caps the defense at 0.5 when a misconception was detected", () => {
    const result = reconcileEvaluation(
      evaluation({ defenseScore: 1, misconception: "Confunde búsqueda lineal con binaria." }),
      questions,
      answered("Una respuesta con suficiente contenido para contar como real."),
    );
    expect(result.perCriterion.find((p) => p.criterionId === "c1")!.defenseScore).toBe(0.5);
  });

  it("leaves criteria without questions untouched", () => {
    const result = reconcileEvaluation(evaluation({ defenseScore: 1, misconception: null }), questions, answered(""));
    expect(result.perCriterion.find((p) => p.criterionId === "c3")!.defenseScore).toBe(0.9);
  });
});
