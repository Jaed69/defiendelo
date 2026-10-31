import { describe, expect, it } from "vitest";
import { demoFixture } from "../demo/demo-class";
import { EXAMPLES, exampleSubjectLabel } from "./examples";
import { exampleFor } from "./ready-example";

const example = EXAMPLES.find((e) => e.id === "ingles-festival")!;
const loaded = { title: example.title, subject: exampleSubjectLabel(example), original: example.original };

describe("exampleFor", () => {
  it("returns the example when it is submitted unchanged", () => {
    expect(exampleFor(loaded)?.id).toBe("ingles-festival");
  });

  it("returns nothing once the teacher edits the loaded example", () => {
    expect(exampleFor({ ...loaded, original: `${loaded.original} Agrega una foto.` })).toBeNull();
    expect(exampleFor({ ...loaded, title: "Otro título" })).toBeNull();
  });

  it("returns nothing for a task that is not an example", () => {
    expect(exampleFor({ title: "Fotosíntesis", subject: "Ciencia, 3.º", original: "Explica la fotosíntesis con un dibujo." })).toBeNull();
  });

  it("has synthetic data for every example, with a class of students already reviewed", () => {
    for (const e of EXAMPLES) {
      const fixture = demoFixture(e.id);
      expect(fixture, e.id).not.toBeNull();
      expect(fixture!.students.length, e.id).toBeGreaterThanOrEqual(3);
      expect(fixture!.students.every((s) => s.evaluation && s.answers.length === s.questions.length), e.id).toBe(true);
    }
  });
});
