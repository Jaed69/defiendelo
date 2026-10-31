import { describe, expect, it } from "vitest";
import { aiObtainableScore, averageGap, givenAwayCriteria, studentGap, triage } from "./gap";
import type { Criterion, Submission } from "./types";

const criteria: Criterion[] = [
  { id: "c1", name: "Correctness", description: "", weight: 40, evidence: "entrega" },
  { id: "c2", name: "Decisions", description: "", weight: 60, evidence: "defensa" },
];

function submission(alias: string, perCriterion: [number, number][]): Submission {
  return {
    id: alias,
    alias,
    work: "",
    questions: [],
    answers: [],
    createdAt: "",
    answeredAt: "",
    evaluation: {
      summary: "",
      perCriterion: perCriterion.map(([submissionScore, defenseScore], i) => ({
        criterionId: criteria[i].id,
        submissionScore,
        defenseScore,
        evidenceQuote: "",
        misconception: null,
      })),
    },
  };
}

describe("aiObtainableScore", () => {
  it("counts only criteria verified in the written work, weighted, as a percentage", () => {
    const scores = [
      { criterionId: "c1", score: 0.5, reason: "" },
      { criterionId: "c2", score: 1, reason: "" },
    ];
    expect(aiObtainableScore(criteria, scores)).toBe(20);
  });

  it("treats a criterion without a score as zero", () => {
    expect(aiObtainableScore(criteria, [])).toBe(0);
  });
});

describe("givenAwayCriteria", () => {
  it("lists written-work criteria where the AI alone scores at least 0.7", () => {
    const scores = [
      { criterionId: "c1", score: 0.7, reason: "" },
      { criterionId: "c2", score: 0.9, reason: "" },
    ];
    expect(givenAwayCriteria(criteria, scores).map((c) => c.id)).toEqual(["c1"]);
  });
});

describe("studentGap", () => {
  it("is the weighted percentage the student submitted but could not explain", () => {
    expect(studentGap(criteria, submission("a", [[1, 0.5], [1, 0]]))).toBe(80);
  });

  it("never rewards explaining more than was submitted", () => {
    expect(studentGap(criteria, submission("a", [[0.2, 1], [0.5, 0.5]]))).toBe(0);
  });

  it("is null when the defense was not evaluated yet", () => {
    expect(studentGap(criteria, { ...submission("a", []), evaluation: null })).toBeNull();
  });
});

describe("triage", () => {
  it("orders evaluated students by gap, largest first, and skips unevaluated ones", () => {
    const result = triage(criteria, [
      submission("low", [[1, 1], [1, 0.9]]),
      { ...submission("pending", []), evaluation: null },
      submission("high", [[1, 0], [1, 0]]),
    ]);
    expect(result.map((r) => r.alias)).toEqual(["high", "low"]);
    expect(result[0].gap).toBe(100);
  });
});

describe("averageGap", () => {
  it("averages the triage gaps, rounded to a whole percent", () => {
    const entries = [
      { submissionId: "a", alias: "Ana", gap: 10 },
      { submissionId: "b", alias: "Bruno", gap: 64 },
      { submissionId: "c", alias: "Carla", gap: 25 },
    ];
    expect(averageGap(entries)).toBe(33);
  });

  it("is null when nobody has defended yet", () => {
    expect(averageGap([])).toBeNull();
  });
});
