import { describe, expect, it } from "vitest";
import { acceptsSubmissions, DEFAULT_SESSION, gradeQuestion, isLive, proposeQueue, setFinalGrade, studentStatus, studentView } from "./session";
import type { Assignment, ClassSession, Submission } from "./types";

const NOW = new Date("2026-10-31T12:00:00Z");

function submission(id: string, createdAt = "2026-10-31T10:00:00Z"): Submission {
  return {
    id,
    alias: `alias-${id}`,
    work: "",
    questions: [1, 2, 3].map((n) => ({ id: `q${n}`, criterionId: "c1", question: `Pregunta ${n} de ${id}` })),
    answers: [],
    evaluation: null,
    createdAt,
    answeredAt: null,
    token: `token-${id}`,
  };
}

function assignment(session: Partial<ClassSession>, submissions: Submission[]): Assignment {
  return { submissions, session: { ...DEFAULT_SESSION, ...session }, redesign: { criteria: [] } } as unknown as Assignment;
}

describe("session", () => {
  it("asks the student to answer again when the teacher requests it, until they answer", () => {
    const s = submission("a");
    s.redoRequested = true;
    const session: ClassSession = { ...DEFAULT_SESSION, method: "escrito", phase: "publicado" };
    expect(studentStatus(session, s)).toBe("responder");
    expect(studentView(assignment(session, [s]), s, NOW).redoRequested).toBe(true);
    s.answeredAt = "2026-10-31T12:30:00Z";
    expect(studentStatus(session, s)).toBe("publicado");
  });

  it("accepts submissions only while open and before the deadline", () => {
    const now = new Date("2026-10-31T12:00:00Z");
    expect(acceptsSubmissions(DEFAULT_SESSION, now)).toBe(true);
    expect(acceptsSubmissions({ ...DEFAULT_SESSION, deadline: "2026-10-31T11:00:00Z" }, now)).toBe(false);
    expect(acceptsSubmissions({ ...DEFAULT_SESSION, phase: "defensas" }, now)).toBe(false);
  });

  it("proposes the queue by arrival order", () => {
    expect(proposeQueue([submission("b", "2026-10-31T10:05:00Z"), submission("a", "2026-10-31T10:01:00Z")])).toEqual(["a", "b"]);
  });

  it("walks the questions, averages the grade and moves to the next ungraded student", () => {
    const subs = [submission("a"), submission("b"), submission("c")];
    subs[1].grade = 15;
    let s: ClassSession = { ...DEFAULT_SESSION, phase: "defensas", queue: ["a", "b", "c"], current: "a" };
    s = gradeQuestion(s, subs, "a", "q1", 14);
    expect(s).toMatchObject({ current: "a", currentQuestion: 1 });
    s = gradeQuestion(s, subs, "a", "q2", 17);
    expect(subs[0].grade).toBe(15.5);
    expect(s).toMatchObject({ current: "c", currentQuestion: 0 });
  });

  it("records a letter and calls the next student who has no grade yet", () => {
    const subs = [submission("a"), submission("b"), submission("c")];
    subs[1].letter = "A";
    const s = setFinalGrade({ ...DEFAULT_SESSION, phase: "defensas", queue: ["a", "b", "c"], current: "a" }, subs, "a", { letter: "AD" });
    expect(subs[0].letter).toBe("AD");
    expect(s).toMatchObject({ current: "c", currentQuestion: 0 });
    expect(studentStatus(s, subs[0])).toBe("evaluado");
  });

  it("derives the student status from phase and method", () => {
    const sub = submission("a");
    const on = (session: Partial<ClassSession>) => studentStatus({ ...DEFAULT_SESSION, ...session }, sub);
    expect(on({})).toBe("entregado");
    expect(on({ phase: "defensas", current: "a" })).toBe("turno");
    expect(on({ phase: "defensas", current: "b" })).toBe("en_cola");
    expect(on({ phase: "defensas", method: "escrito" })).toBe("responder");
    expect(on({ phase: "defensas", method: "papel" })).toBe("papel");
    sub.grade = 12;
    expect(on({ phase: "defensas", current: "b" })).toBe("evaluado");
    expect(on({ phase: "publicado" })).toBe("publicado");
  });

  it("hides the grade until published and never leaks other students' data", () => {
    const subs = [submission("a"), submission("b")];
    subs[1].grade = 18;
    const live = studentView(assignment({ phase: "defensas", queue: ["a", "b"], current: "b" }, subs), subs[1], NOW);
    expect(live.result).toBeNull();
    expect(live.queue).toEqual(["alias-a", "alias-b"]);
    expect(JSON.stringify(live)).not.toContain("token-a");

    const turn = studentView(assignment({ phase: "defensas", queue: ["a", "b"], current: "a", currentQuestion: 1 }, subs), subs[0], NOW);
    expect(turn.question).toEqual({ number: 2, total: 2, text: "Pregunta 2 de a" });

    const published = studentView(assignment({ phase: "publicado" }, subs), subs[1], NOW);
    expect(published.result?.grade).toBe(18);
    expect(studentView(assignment({ phase: "publicado", passingGrade: 13 }, subs), subs[1], NOW).passingGrade).toBe(13);
  });

  it("lets the student replace their work only while submissions are open", () => {
    const sub = submission("a");
    expect(studentView(assignment({}, [sub]), sub, NOW).canReplace).toBe(true);
    expect(studentView(assignment({ deadline: "2026-10-31T11:00:00Z" }, [sub]), sub, NOW).canReplace).toBe(false);
    expect(studentView(assignment({ phase: "defensas" }, [sub]), sub, NOW).canReplace).toBe(false);
  });

  describe("without a session configured by the teacher", () => {
    const selfPaced = (sub: Submission) => ({ submissions: [sub], redesign: { criteria: [] } }) as unknown as Assignment;

    it("lets the student answer every question right after handing in", () => {
      const sub = submission("a");
      const view = studentView(selfPaced(sub), sub, NOW);
      expect(view.status).toBe("responder");
      expect(view.questions.map((q) => q.id)).toEqual(["q1", "q2", "q3"]);
      expect(view.result).toBeNull();
    });

    it("keeps the AI review in review until the teacher publishes: the teacher decides the grade", () => {
      const sub = submission("a");
      sub.answeredAt = "2026-10-31T11:00:00Z";
      sub.evaluation = { summary: "Explica bien", perCriterion: [] } as unknown as Submission["evaluation"];
      const view = studentView(selfPaced(sub), sub, NOW);
      expect(view.status).toBe("evaluado");
      expect(view.questions).toEqual([]);
      expect(view.result).toBeNull();
    });

    it("shows the result once the teacher publishes", () => {
      const sub = submission("a");
      sub.answeredAt = "2026-10-31T11:00:00Z";
      sub.grade = 16;
      sub.evaluation = { summary: "Explica bien", perCriterion: [] } as unknown as Submission["evaluation"];
      const published = { ...selfPaced(sub), session: { ...DEFAULT_SESSION, phase: "publicado" } } as Assignment;
      const view = studentView(published, sub, NOW);
      expect(view.status).toBe("publicado");
      expect(view.result).toMatchObject({ grade: 16, evaluation: sub.evaluation, criteria: [], comment: null });
    });

    it("still accepts submissions", () => {
      const sub = submission("a");
      expect(studentView(selfPaced(sub), sub, NOW).canReplace).toBe(true);
      expect(isLive(selfPaced(sub))).toBe(false);
      expect(isLive(assignment({}, [sub]))).toBe(true);
    });
  });
});
