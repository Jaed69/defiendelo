import { describe, expect, it } from "vitest";
import { redesignSchema } from "./prompted-assessment-ai";

const criterion = { id: "c1", name: "Defensa", description: "Explica sus decisiones", weight: 100, evidence: "defensa" as const };
const valid = {
  statement:
    "Escribe en Python una función de búsqueda binaria, registra qué te propuso la IA, qué corregiste y por qué, y prepárate para trazarla en vivo.",
  aiPolicy: "Puedes usar IA, pero debes declarar qué herramienta usaste y para qué.",
  criteria: [criterion],
  originalCriteria: [criterion],
  rationale: "La nota pasa del código, que una IA produce sola, a las decisiones que el alumno defiende.",
};

describe("redesignSchema", () => {
  it("accepts a complete redesign", () => {
    expect(redesignSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["a placeholder statement", { statement: "ok" }],
    ["a title instead of the statement", { statement: "Menos basura en nuestro colegio" }],
    ["an empty rationale", { rationale: "" }],
    ["an empty AI policy", { aiPolicy: "" }],
  ])("rejects %s, so the model is asked again", (_, broken) => {
    expect(redesignSchema.safeParse({ ...valid, ...broken }).success).toBe(false);
  });
});
