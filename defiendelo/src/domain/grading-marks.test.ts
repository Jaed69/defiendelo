import { describe, expect, it } from "vitest";
import { criterionMarks, letterForMarks, marksTotal } from "./grading";
import type { Criterion, Submission } from "./types";

const criteria: Criterion[] = [
  { id: "c1", name: "Funciona", description: "", weight: 30, evidence: "entrega" },
  { id: "c2", name: "Verifica", description: "", weight: 40, evidence: "defensa" },
  { id: "c3", name: "Cambia", description: "", weight: 30, evidence: "defensa" },
];

const submission = (extra: Partial<Submission> = {}): Submission => ({
  id: "s1",
  alias: "Bruno",
  work: "",
  questions: [],
  answers: [],
  createdAt: "",
  answeredAt: "",
  evaluation: {
    summary: "",
    perCriterion: [
      { criterionId: "c1", submissionScore: 0.85, defenseScore: 0.1, evidenceQuote: "pasa las pruebas", misconception: null },
      { criterionId: "c2", submissionScore: 0.9, defenseScore: 0, evidenceQuote: "no sé", misconception: "No explicó cómo lo comprobó." },
      { criterionId: "c3", submissionScore: 0.9, defenseScore: 0, evidenceQuote: "", misconception: "No pudo hacer el cambio." },
    ],
  },
  ...extra,
});

describe("criterionMarks", () => {
  it("suggests written-work points for entrega criteria and defense points for defensa ones, on the grade scale", () => {
    const marks = criterionMarks({ gradeScale: 20 }, criteria, submission());
    expect(marks.map((m) => [m.max, m.suggested, m.points])).toEqual([
      [6, 5, null],
      [8, 0, null],
      [6, 0, null],
    ]);
    expect(marksTotal(marks)).toBe(5);
    expect(marks[1].misconception).toBe("No explicó cómo lo comprobó.");
  });

  it("uses the teacher's points where set and keeps the AI suggestion apart", () => {
    const marks = criterionMarks({ gradeScale: 20 }, criteria, submission({ criterionPoints: { c2: 2 } }));
    expect(marks[1].points).toBe(2);
    expect(marksTotal(marks)).toBe(7);
    expect(marksTotal(marks, "suggested")).toBe(5);
  });

  it("maps the total to a letter with the suggestion cut points", () => {
    expect(letterForMarks(criterionMarks({ gradeScale: 20 }, criteria, submission()))).toBe("C");
    expect(letterForMarks(criterionMarks({ gradeScale: 20 }, criteria, submission({ criterionPoints: { c1: 6, c2: 8, c3: 4 } })))).toBe("AD");
  });

  it("is empty until the defense is reviewed", () => {
    expect(criterionMarks({ gradeScale: 20 }, criteria, submission({ evaluation: null }))).toEqual([]);
  });
});
