import { describe, expect, it } from "vitest";
import { gradeReport, rubricProblem, suggestGrade, suggestLetter } from "./grading";
import type { Criterion, Evaluation, Submission } from "./types";

const criteria = [
  { id: "c1", name: "Producto", weight: 40 },
  { id: "c2", name: "Defensa", weight: 60 },
] as Criterion[];

function evaluation(c1: number, c2: number): Evaluation {
  return {
    summary: "",
    perCriterion: [
      { criterionId: "c1", submissionScore: 1, defenseScore: c1, evidenceQuote: "", misconception: null },
      { criterionId: "c2", submissionScore: 1, defenseScore: c2, evidenceQuote: "", misconception: null },
    ],
  };
}

const sub = (fields: Partial<Submission>) => ({ id: "x", alias: "x", ...fields }) as Submission;

describe("grading", () => {
  it("suggests a letter and a number from what the student explained", () => {
    expect(suggestLetter(criteria, evaluation(1, 1))).toBe("AD");
    expect(suggestLetter(criteria, evaluation(1, 0.5))).toBe("A"); // 0.4 + 0.3 = 0.7
    expect(suggestLetter(criteria, evaluation(0.5, 0.5))).toBe("B"); // 0.5
    expect(suggestLetter(criteria, evaluation(0.5, 0.4))).toBe("C"); // 0.44, just under B
    expect(suggestLetter(criteria, evaluation(0, 0))).toBe("C");
    expect(suggestGrade({ gradeScale: 20 }, criteria, evaluation(1, 0.5))).toBe(14);
  });

  it("counts who reached A or AD on the literal scale", () => {
    const report = gradeReport({ grading: "literal", passingGrade: 11 }, [
      sub({ letter: "AD" }),
      sub({ letter: "A" }),
      sub({ letter: "B" }),
      sub({ letter: "C" }),
      sub({}),
    ]);
    expect(report).toEqual({ total: 5, graded: 4, achieved: 2, letters: { AD: 1, A: 1, B: 1, C: 1 }, average: null });
  });

  it("counts who passed and averages on the numeric scale", () => {
    const report = gradeReport({ grading: "numerica", passingGrade: 11 }, [sub({ grade: 15 }), sub({ grade: 10 }), sub({ grade: 11 }), sub({})]);
    expect(report.achieved).toBe(2);
    expect(report.graded).toBe(3);
    expect(report.average).toBe(12);
  });

  it("explains what is wrong with an edited rubric", () => {
    expect(rubricProblem([{ name: "A", weight: 60 }, { name: "B", weight: 40 }])).toBeNull();
    expect(rubricProblem([{ name: "A", weight: 60 }, { name: "B", weight: 30 }])).toBe("Los pesos suman 90%; deben sumar 100%.");
    expect(rubricProblem([{ name: " ", weight: 100 }])).toBe("Cada criterio necesita un nombre.");
    expect(rubricProblem([])).toBe("La rúbrica necesita al menos un criterio.");
  });
});
