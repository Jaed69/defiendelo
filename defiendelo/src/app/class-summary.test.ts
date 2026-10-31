import { describe, expect, it } from "vitest";
import { aiAloneGrade, classSummary, evaluationSummary, markedGrade, sessionLine, taskStatus, teacherDecides } from "./class-summary";

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

describe("taskStatus", () => {
  const base = { handedIn: 0, needHelp: [] as string[], toReview: 0, live: true, phase: "entregas" as const };

  it("asks to finish the setup before the evaluation is chosen", () => {
    expect(taskStatus({ ...base, live: false })).toEqual({
      line: "Sin compartir todavía.",
      chips: [{ tone: "highlight", text: "Falta elegir cómo evaluar" }],
      action: "configurar",
    });
  });

  it("offers the student link while nobody handed in", () => {
    expect(taskStatus(base)).toEqual({ line: "Todavía nadie entregó.", chips: [], action: "copiar" });
  });

  it("names who needs help and how many grades are left", () => {
    expect(taskStatus({ ...base, handedIn: 4, needHelp: ["Bruno"], toReview: 2, phase: "defensas" })).toEqual({
      line: "4 alumnos entregaron.",
      chips: [
        { tone: "danger", text: "Necesita ayuda: Bruno" },
        { tone: "highlight", text: "2 notas por revisar" },
      ],
      action: "entregas",
    });
    expect(taskStatus({ ...base, handedIn: 1, toReview: 1 }).chips).toEqual([
      { tone: "success", text: "Nadie necesita ayuda" },
      { tone: "highlight", text: "1 nota por revisar" },
    ]);
  });

  it("says when grades are published", () => {
    expect(taskStatus({ ...base, handedIn: 12, phase: "publicado" })).toEqual({
      line: "12 alumnos entregaron.",
      chips: [
        { tone: "success", text: "Nadie necesita ayuda" },
        { tone: "neutral", text: "Notas publicadas" },
      ],
      action: "entregas",
    });
  });

  it("goes to the submissions when students handed in without a configured evaluation", () => {
    expect(taskStatus({ ...base, live: false, handedIn: 2, needHelp: ["Ana", "Luz"] })).toEqual({
      line: "2 alumnos entregaron.",
      chips: [{ tone: "danger", text: "Necesitan ayuda: Ana y Luz" }],
      action: "entregas",
    });
  });
});

describe("sessionLine", () => {
  const session = { method: "escrito" as const, grading: "numerica" as const, gradeScale: 20, passingGrade: 11, questionsPerStudent: 4 };

  it("describes the written defense with its passing grade", () => {
    expect(sessionLine(session)).toBe("Evaluación escrita · nota de 0 a 20 · aprueba con 11");
  });

  it("describes oral and paper defenses with their questions", () => {
    expect(sessionLine({ ...session, method: "oral" })).toBe("Defensa oral, en clase · nota de 0 a 20 · 4 preguntas por alumno");
    expect(sessionLine({ ...session, method: "papel", questionsPerStudent: 1 })).toBe(
      "Defensa escrita, en papel · nota de 0 a 20 · 1 pregunta por alumno",
    );
  });

  it("describes the literal scale", () => {
    expect(sessionLine({ ...session, grading: "literal" })).toBe("Evaluación escrita · nota AD · A · B · C");
  });
});

describe("evaluationSummary", () => {
  it("sums up the saved settings in one line", () => {
    const session = { method: "escrito" as const, grading: "numerica" as const, gradeScale: 20 };
    expect(evaluationSummary(session, "vie 7 nov")).toBe("0 a 20 · escrito en el celular · hasta vie 7 nov");
    expect(evaluationSummary({ ...session, method: "oral", grading: "literal" }, null)).toBe("AD · A · B · C · oral, en clase · sin plazo");
    expect(evaluationSummary({ ...session, method: "papel" }, null)).toBe("0 a 20 · escrito en papel · sin plazo");
  });
});

describe("aiAloneGrade", () => {
  it("puts the AI-alone percentage on the numeric scale", () => {
    expect(aiAloneGrade(100, "numerica", 20)).toBe("20/20");
    expect(aiAloneGrade(30, "numerica", 20)).toBe("6/20");
    expect(aiAloneGrade(33, "numerica", 10)).toBe("3/10");
  });

  it("uses the letter cut points on the literal scale", () => {
    expect(aiAloneGrade(90, "literal", 20)).toBe("AD");
    expect(aiAloneGrade(70, "literal", 20)).toBe("A");
    expect(aiAloneGrade(50, "literal", 20)).toBe("B");
    expect(aiAloneGrade(10, "literal", 20)).toBe("C");
  });
});

describe("teacherDecides", () => {
  const mark = (suggested: number, points: number | null) => ({ suggested, points });

  it("counts the criteria the teacher changed out of the ones reviewed", () => {
    expect(teacherDecides([[mark(5, 5), mark(0, 2), mark(0, 0)], [mark(3, null)]])).toBe(
      "Cambiaste 1 de 3 criterios que sugirió la IA (33%).",
    );
    expect(teacherDecides([[mark(4, 4)]])).toBe("Cambiaste 0 de 1 criterio que sugirió la IA (0%).");
  });

  it("says so before any criterion is reviewed", () => {
    expect(teacherDecides([[mark(5, null)]])).toBe("Todavía no revisaste ningún criterio.");
    expect(teacherDecides([])).toBe("Todavía no revisaste ningún criterio.");
  });
});

describe("markedGrade", () => {
  it("averages the marks on the numeric scale once every question is marked", () => {
    expect(markedGrade([1, 0.5, 1, 0], { grading: "numerica", gradeScale: 20 })).toBe(12.5);
    expect(markedGrade([1, 1, 1, 1], { grading: "numerica", gradeScale: 20 })).toBe(20);
    expect(markedGrade([1, null, 1], { grading: "numerica", gradeScale: 20 })).toBeNull();
    expect(markedGrade([], { grading: "numerica", gradeScale: 20 })).toBeNull();
  });

  it("turns the marks into a letter on the literal scale", () => {
    expect(markedGrade([1, 1, 1, 0.5], { grading: "literal", gradeScale: 20 })).toBe("AD");
    expect(markedGrade([1, 0.5, 0.5, 0.5], { grading: "literal", gradeScale: 20 })).toBe("B");
    expect(markedGrade([0, 0.5, 0, 0], { grading: "literal", gradeScale: 20 })).toBe("C");
  });
});
