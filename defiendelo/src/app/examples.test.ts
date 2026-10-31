import { describe, expect, it } from "vitest";
import { EXAMPLES, EXAMPLE_SUBJECTS, HEADLINE_EVIDENCE, exampleSubjectLabel } from "./examples";

describe("example tasks", () => {
  it("cover at least six different school subjects", () => {
    expect(EXAMPLE_SUBJECTS.length).toBeGreaterThanOrEqual(6);
  });

  it("have unique ids", () => {
    expect(new Set(EXAMPLES.map((e) => e.id)).size).toBe(EXAMPLES.length);
  });

  it.each(EXAMPLES)("$id fits what the create-assignment endpoint accepts", (example) => {
    expect(example.title.length).toBeGreaterThan(0);
    expect(example.title.length).toBeLessThanOrEqual(120);
    expect(exampleSubjectLabel(example).length).toBeLessThanOrEqual(80);
    expect(example.original.trim().length).toBeGreaterThanOrEqual(20);
    expect(example.original.length).toBeLessThanOrEqual(8000);
  });

  it.each(EXAMPLES)("$id explains what the AI does alone and what the student defends", (example) => {
    expect(example.aiAlone.trim()).not.toBe("");
    expect(example.defense.trim()).not.toBe("");
  });

  it.each(EXAMPLES)("$id names the kind of task it is", (example) => {
    expect(example.kind.trim()).not.toBe("");
  });

  it("cites every figure with a named source and a secure link", () => {
    for (const evidence of [HEADLINE_EVIDENCE, ...EXAMPLES.flatMap((e) => (e.evidence ? [e.evidence] : []))]) {
      expect(evidence.source.trim()).not.toBe("");
      expect(evidence.url).toMatch(/^https:\/\//);
    }
  });

  it("labels the subject with its grade", () => {
    expect(exampleSubjectLabel({ subject: "Matemática", level: "3.º de secundaria" })).toBe("Matemática, 3.º de secundaria");
  });
});
