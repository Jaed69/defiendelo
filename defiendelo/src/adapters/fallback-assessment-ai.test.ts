import { describe, expect, it } from "vitest";
import { DemoAssessmentAI } from "./demo-assessment-ai";
import { withFallback } from "./fallback-assessment-ai";
import type { AssessmentAI } from "@/ports/assessment-ai";

describe("withFallback", () => {
  it("uses the real AI when it answers", async () => {
    const real = { solveAlone: async () => "real" } as unknown as AssessmentAI;
    expect(await withFallback(real, new DemoAssessmentAI()).solveAlone("s", "t")).toBe("real");
  });

  it("falls back to the demo answer when the real AI fails", async () => {
    const broken = {
      redesign: async () => {
        throw new Error("schema mismatch");
      },
    } as unknown as AssessmentAI;
    const redesign = await withFallback(broken, new DemoAssessmentAI(), () => {}).redesign({ title: "t", subject: "s", original: "Escribe una función." });
    expect(redesign.criteria.length).toBeGreaterThan(0);
    expect(redesign.statement).toContain("Escribe una función.");
  });
});
