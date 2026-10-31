import { describe, expect, it } from "vitest";
import { classSummary } from "./class-summary";

describe("classSummary", () => {
  it("says when nobody handed in yet", () => {
    expect(classSummary({ handedIn: 0, needHelp: [], answering: 0 })).toBe("Todavía nadie entregó.");
  });

  it("names who needs help", () => {
    expect(classSummary({ handedIn: 3, needHelp: ["Mateo"], answering: 0 })).toBe("3 alumnos entregaron. Necesita ayuda: Mateo.");
    expect(classSummary({ handedIn: 5, needHelp: ["Bruno", "Ximena"], answering: 0 })).toBe(
      "5 alumnos entregaron. Necesitan ayuda: Bruno y Ximena.",
    );
    expect(classSummary({ handedIn: 6, needHelp: ["Ana", "Bruno", "Ceci"], answering: 0 })).toBe(
      "6 alumnos entregaron. Necesitan ayuda: Ana, Bruno y Ceci.",
    );
  });

  it("says so when nobody needs help", () => {
    expect(classSummary({ handedIn: 1, needHelp: [], answering: 0 })).toBe("1 alumno entregó. No necesita ayuda.");
    expect(classSummary({ handedIn: 3, needHelp: [], answering: 0 })).toBe("3 alumnos entregaron. Nadie necesita ayuda.");
  });

  it("mentions students still answering their defense", () => {
    expect(classSummary({ handedIn: 0, needHelp: [], answering: 1 })).toBe("1 alumno está respondiendo ahora.");
    expect(classSummary({ handedIn: 2, needHelp: [], answering: 2 })).toBe(
      "2 alumnos entregaron. Nadie necesita ayuda. 2 alumnos están respondiendo ahora.",
    );
  });
});
