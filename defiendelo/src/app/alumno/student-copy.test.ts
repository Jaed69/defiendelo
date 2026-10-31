import { describe, expect, it } from "vitest";
import type { CriterionMark } from "../../domain/grading";
import {
  criterionVerdict,
  evaluationCard,
  firstSteps,
  formatDeadline,
  formatPoints,
  gradeShown,
  methodSentence,
  nextUpLine,
  quoteForQuestion,
  sampleIndexFor,
  teacherChange,
} from "./student-copy";

const WORK =
  "Hi Emma!\n\nHow are you? I want to tell you about the Fiesta de la Candelaria in Puno, my city. It is every year in February and it lasts two weeks.\n\nMy uncle makes the masks, they are very big and heavy. Every night we eat together.";

function mark(over: Partial<CriterionMark> = {}): CriterionMark {
  return {
    criterionId: "c1",
    name: "Verificación de lo que dio la IA",
    evidence: "defensa",
    weight: 15,
    max: 3,
    suggested: 0,
    points: null,
    level: "C",
    evidenceQuote: "",
    misconception: null,
    ...over,
  };
}

describe("quoteForQuestion", () => {
  it("shows the sentence of the work that the question quotes", () => {
    const q = "You wrote 'very big and heavy'. How did you check it?";
    expect(quoteForQuestion(q, WORK)).toEqual({ quoted: true, text: "My uncle makes the masks, they are very big and heavy." });
  });

  it("accepts typographic quotes and ignores case", () => {
    const q = "¿Por qué escribiste «EVERY YEAR IN FEBRUARY»?";
    expect(quoteForQuestion(q, WORK)).toEqual({ quoted: true, text: "It is every year in February and it lasts two weeks." });
  });

  it("falls back to the start of the work when nothing is quoted", () => {
    const result = quoteForQuestion("¿Qué aprendiste?", WORK);
    expect(result.quoted).toBe(false);
    expect(result.text.startsWith("Hi Emma! How are you? I want to tell you")).toBe(true);
    expect(result.text.endsWith("…")).toBe(true);
    expect(result.text.length).toBeLessThanOrEqual(141);
  });

  it("falls back when the quoted words are not in the work", () => {
    expect(quoteForQuestion("Mencionó 'muy grandes y pesadas'.", WORK).quoted).toBe(false);
  });
});

describe("methodSentence", () => {
  it("tells each method with the number of questions", () => {
    expect(methodSentence("escrito", 4)).toBe("Después de entregar, explicas tu trabajo por escrito aquí mismo: 4 preguntas sobre lo que hiciste.");
    expect(methodSentence("oral", 2)).toBe("Después de entregar, explicas tu trabajo en voz alta, en clase: tu profe te hará 2 preguntas sobre lo que hiciste.");
    expect(methodSentence("papel", 3)).toBe("Después de entregar, explicas tu trabajo por escrito en una hoja que te da tu profe: 3 preguntas sobre lo que hiciste.");
  });

  it("drops the number when it is not known and uses the singular for one", () => {
    expect(methodSentence("escrito", null)).toBe("Después de entregar, explicas tu trabajo por escrito aquí mismo: unas preguntas sobre lo que hiciste.");
    expect(methodSentence("escrito", 1)).toBe("Después de entregar, explicas tu trabajo por escrito aquí mismo: 1 pregunta sobre lo que hiciste.");
  });
});

describe("formatDeadline", () => {
  it("reads like «vie 7 nov, 23:59»", () => {
    expect(formatDeadline(new Date(2025, 10, 7, 23, 59).toISOString())).toBe("vie 7 nov, 23:59");
  });
});

describe("nextUpLine", () => {
  const queue = ["mateo", "luz", "ale_23", "ana"];
  it("names who goes before the student", () => {
    expect(nextUpLine(queue, "mateo", 3)).toBe("Después: luz, y luego tú.");
    expect(nextUpLine(queue, "luz", 3)).toBe("Después vas tú.");
  });

  it("counts when many go first and handles a session not started", () => {
    expect(nextUpLine(["a", "b", "c", "d", "e", "me"], "a", 6)).toBe("Después: b, c y 2 más; luego tú.");
    expect(nextUpLine(queue, null, 3)).toBe("Antes de ti: 2 compañeros.");
    expect(nextUpLine(queue, null, 1)).toBe("Vas primero.");
  });
});

describe("evaluationCard", () => {
  it("maps each status to the card of «Mis evaluaciones»", () => {
    expect(evaluationCard("publicado")).toMatchObject({ tone: "success", chip: "Nota publicada" });
    expect(evaluationCard("evaluado")).toEqual({ tone: "neutral", chip: "Nota en revisión", note: "Ya respondiste. Tu profe está revisando tu nota." });
    expect(evaluationCard("responder")).toMatchObject({ tone: "highlight", chip: "Te falta defender tu trabajo" });
    expect(evaluationCard("en_cola")).toMatchObject({ tone: "highlight", chip: "Te falta defender tu trabajo" });
  });
});

describe("teacherChange", () => {
  it("says when the teacher raised or lowered the AI suggestion", () => {
    expect(teacherChange(mark({ suggested: 0, points: 1 }))).toBe("La IA sugirió 0/3. Tu profe lo subió a 1/3.");
    expect(teacherChange(mark({ suggested: 2.5, points: 1.5 }))).toBe("La IA sugirió 2,5/3. Tu profe lo bajó a 1,5/3.");
  });

  it("says nothing when the teacher kept it or did not review", () => {
    expect(teacherChange(mark({ suggested: 2, points: 2 }))).toBeNull();
    expect(teacherChange(mark({ suggested: 2, points: null }))).toBeNull();
  });
});

describe("criterionVerdict", () => {
  it("praises with the evidence when there is no gap", () => {
    expect(criterionVerdict(mark({ level: "A", evidenceQuote: "Explicaste bien por qué elegiste la Candelaria." }))).toEqual({
      good: true,
      title: "Lo hiciste bien",
      text: "Explicaste bien por qué elegiste la Candelaria.",
    });
  });

  it("asks to review the misconception or a low level", () => {
    expect(criterionVerdict(mark({ level: "A", misconception: "No supiste decir cómo comprobaste las fechas." }))).toEqual({
      good: false,
      title: "Para repasar",
      text: "No supiste decir cómo comprobaste las fechas.",
    });
    expect(criterionVerdict(mark({ level: "C", evidenceQuote: "Poco." })).good).toBe(false);
  });
});

describe("gradeShown", () => {
  it("shows the teacher's numeric grade", () => {
    expect(gradeShown({ grade: 16, letter: null, criteria: [] }, "numerica", 20)).toEqual({ value: "16/20", label: null, byTeacher: true });
  });

  it("shows the teacher's letter with its label", () => {
    expect(gradeShown({ grade: null, letter: "A", criteria: [] }, "literal", 20)).toEqual({ value: "A", label: "Logro esperado", byTeacher: true });
  });

  it("falls back to the sum of the marks when no teacher graded", () => {
    const criteria = [mark({ max: 6, suggested: 5 }), mark({ max: 4, suggested: 3.5 })];
    expect(gradeShown({ grade: null, letter: null, criteria }, "numerica", 20)).toEqual({ value: "8,5/20", label: null, byTeacher: false });
    expect(gradeShown({ grade: null, letter: null, criteria: [] }, "numerica", 20)).toBeNull();
  });
});

describe("firstSteps", () => {
  it("takes up to three numbered steps, one sentence each", () => {
    const statement = "Escribe un correo. (1) Elige una festividad real. Verifica cada dato. (2) Elige tú las expresiones. (3) Entrega un registro. (4) Sustenta en clase.";
    expect(firstSteps(statement)).toEqual(["Elige una festividad real.", "Elige tú las expresiones.", "Entrega un registro."]);
    expect(firstSteps("Solo un párrafo sin pasos.")).toEqual([]);
  });
});

describe("sampleIndexFor and formatPoints", () => {
  it("finds the example whose work was loaded", () => {
    const samples = [{ work: "uno" }, { work: "dos  " }];
    expect(sampleIndexFor(samples, " dos")).toBe(1);
    expect(sampleIndexFor(samples, "otro")).toBe(-1);
  });

  it("writes half points with a comma", () => {
    expect(formatPoints(4)).toBe("4");
    expect(formatPoints(4.5)).toBe("4,5");
  });
});
