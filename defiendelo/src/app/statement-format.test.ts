import { describe, expect, it } from "vitest";
import { parseStatement } from "./statement-format";

describe("parseStatement", () => {
  it("keeps a statement without sections as one paragraph", () => {
    expect(parseStatement("Lee el cuento y explica qué decisiones tomaste.")).toEqual([
      { kind: "paragraph", text: "Lee el cuento y explica qué decisiones tomaste." },
    ]);
  });

  it("pulls out the central question and named phases", () => {
    const text =
      "Pregunta central: ¿debería prohibirse el celular? En esta tarea trabajarás con IA. Fase 1 — Exploración: pide argumentos a una IA. Fase 2 — Decisión y posicionamiento: elige tu tesis.";
    expect(parseStatement(text)).toEqual([
      { kind: "question", text: "¿debería prohibirse el celular?" },
      { kind: "paragraph", text: "En esta tarea trabajarás con IA." },
      { kind: "step", number: 1, title: "Exploración", text: "pide argumentos a una IA." },
      { kind: "step", number: 2, title: "Decisión y posicionamiento", text: "elige tu tesis." },
    ]);
  });

  it("reads parenthesized steps with an upper-case title and turns it into sentence case", () => {
    const text = "El trabajo tiene dos momentos. (1) EXPERIMENTO: planifica tu procedimiento. (2) ENTREGA Y DEFENSA: presenta tu informe.";
    expect(parseStatement(text)).toEqual([
      { kind: "paragraph", text: "El trabajo tiene dos momentos." },
      { kind: "step", number: 1, title: "Experimento", text: "planifica tu procedimiento." },
      { kind: "step", number: 2, title: "Entrega y defensa", text: "presenta tu informe." },
    ]);
  });

  it("keeps the IA acronym when it sentence-cases a title", () => {
    expect(parseStatement("(2) TRABAJO CON IA: lleva un diario.")[0]).toEqual({ kind: "step", number: 2, title: "Trabajo con IA", text: "lleva un diario." });
  });

  it("leaves words that only contain 'ia' alone", () => {
    expect(parseStatement("(1) MATERIA E HISTORIA: lee.")[0]).toMatchObject({ title: "Materia e historia" });
  });

  it("does not count a parenthetical against the title length", () => {
    expect(parseStatement("Fase 4 — Defensa oral (obligatoria, se califica en vivo): explica tu tesis.")[0]).toEqual({
      kind: "step",
      number: 4,
      title: "Defensa oral (obligatoria, se califica en vivo)",
      text: "explica tu tesis.",
    });
  });

  it("reads untitled parenthesized steps after a colon", () => {
    const text = "Puedes usar IA con estas condiciones: (1) Elige una festividad que hayas vivido. (2) Elige tú las expresiones de tiempo.";
    expect(parseStatement(text)).toEqual([
      { kind: "paragraph", text: "Puedes usar IA con estas condiciones:" },
      { kind: "step", number: 1, title: null, text: "Elige una festividad que hayas vivido." },
      { kind: "step", number: 2, title: null, text: "Elige tú las expresiones de tiempo." },
    ]);
  });

  it("reads numbered steps written as '1.'", () => {
    const text = "Proceda así: 1. Utilice una IA generativa. 2. Analice las opciones generadas.";
    expect(parseStatement(text)).toEqual([
      { kind: "paragraph", text: "Proceda así:" },
      { kind: "step", number: 1, title: null, text: "Utilice una IA generativa." },
      { kind: "step", number: 2, title: null, text: "Analice las opciones generadas." },
    ]);
  });

  it("separates delivery and important notes from the last step", () => {
    const text = "Fase 1 — Redacción: escribe tu texto. Entrega: el texto final y tu registro. Importante: no presentes texto de IA sin verificar.";
    expect(parseStatement(text)).toEqual([
      { kind: "step", number: 1, title: "Redacción", text: "escribe tu texto." },
      { kind: "note", label: "Entrega", text: "el texto final y tu registro." },
      { kind: "note", label: "Importante", text: "no presentes texto de IA sin verificar." },
    ]);
  });

  it("does not split on numbers that are not steps", () => {
    const text = "Elabora una monografía sobre la Guerra del Pacífico (1879-1884). Cobra S/ 1,50 por km y escribe 400 palabras.";
    expect(parseStatement(text)).toEqual([{ kind: "paragraph", text }]);
  });

  it("keeps a long lead-in before the colon as part of the step text", () => {
    const text = "Pasos: (1) Registra al menos cinco decisiones que tomaste y, para cada una, una alternativa descartada: por ejemplo, el enfoque.";
    expect(parseStatement(text)[1]).toEqual({
      kind: "step",
      number: 1,
      title: null,
      text: "Registra al menos cinco decisiones que tomaste y, para cada una, una alternativa descartada: por ejemplo, el enfoque.",
    });
  });

  it("treats line breaks as paragraph boundaries", () => {
    expect(parseStatement("Primera idea.\n\nSegunda idea.")).toEqual([
      { kind: "paragraph", text: "Primera idea." },
      { kind: "paragraph", text: "Segunda idea." },
    ]);
  });
});
