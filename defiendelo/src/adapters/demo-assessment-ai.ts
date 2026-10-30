import type { AssessmentAI, RedesignInput } from "@/ports/assessment-ai";
import type {
  Criterion,
  CriterionScore,
  DefenseAnswer,
  DefenseQuestion,
  Evaluation,
  MisconceptionCluster,
  Redesign,
  Submission,
} from "@/domain/types";

/**
 * Deterministic stand-in used when no API key is configured, so the full flow can be shown offline.
 * Defense answers are scored with simple heuristics (length and references to the student's own work).
 */
export class DemoAssessmentAI implements AssessmentAI {
  async redesign(input: RedesignInput): Promise<Redesign> {
    return {
      statement:
        `${input.original.trim()}\n\nPuedes usar IA en cualquier parte del trabajo. Además entrega:\n` +
        "1. Dos enfoques que consideraste y por qué descartaste uno.\n" +
        "2. Un error o limitación que encontraste en lo que te dio la IA y cómo lo verificaste.\n" +
        "3. Un caso de prueba que tú diseñaste y qué demuestra.\n" +
        "Después defenderás tus decisiones en una conversación corta.",
      aiPolicy: "La IA está permitida. La nota se gana con tus decisiones y con cómo las defiendes, no con el producto final.",
      criteria: [
        { id: "c1", name: "Solución funcional", description: "El trabajo resuelve lo pedido.", weight: 20, evidence: "entrega" },
        { id: "c2", name: "Alternativas y descarte", description: "Compara al menos dos enfoques y justifica la elección.", weight: 20, evidence: "entrega" },
        { id: "c3", name: "Verificación de la IA", description: "Explica en vivo qué revisó de la salida de la IA y cómo.", weight: 30, evidence: "defensa" },
        { id: "c4", name: "Dominio de sus decisiones", description: "Explica en vivo por qué su solución funciona y qué pasaría si cambia un supuesto.", weight: 30, evidence: "defensa" },
      ],
      originalCriteria: [
        { id: "o1", name: "Funciona correctamente", description: "El resultado es correcto.", weight: 60, evidence: "entrega" },
        { id: "o2", name: "Orden y presentación", description: "Está bien presentado y documentado.", weight: 40, evidence: "entrega" },
      ],
      rationale:
        "La tarea original se califica por el producto, que una IA entrega completo. La nueva mueve 60% de la nota a la defensa en vivo, que no se puede delegar.",
    };
  }

  async solveAlone(_subject: string, statement: string): Promise<string> {
    return (
      `Solución generada íntegramente por IA para: "${statement.slice(0, 80)}..."\n\n` +
      "Implementación completa y documentada. Se consideraron dos enfoques (iterativo y recursivo); se eligió el iterativo por eficiencia. " +
      "La IA verificó su propio resultado con tres casos de prueba estándar."
    );
  }

  async grade(_statement: string, criteria: Criterion[], _answer: string): Promise<CriterionScore[]> {
    return criteria.map((c) => ({
      criterionId: c.id,
      score: c.evidence === "entrega" ? 0.9 : 0.6,
      reason:
        c.evidence === "entrega"
          ? "La IA produce este criterio completo por escrito."
          : "Hay una justificación escrita genérica, pero solo se verifica preguntándole al alumno.",
    }));
  }

  async defenseQuestions(_statement: string, criteria: Criterion[], work: string): Promise<DefenseQuestion[]> {
    const excerpt = work.trim().split(/\s+/).slice(0, 8).join(" ");
    const byId = (id: string) => criteria.find((c) => c.id === id)?.id ?? criteria[0].id;
    return [
      { id: "q1", criterionId: byId("c4"), question: `En tu entrega empiezas con "${excerpt}...". ¿Por qué elegiste ese punto de partida y no otro?` },
      { id: "q2", criterionId: byId("c3"), question: "¿Qué parte de lo que te dio la IA revisaste o corregiste, y cómo supiste que estaba mal?" },
      { id: "q3", criterionId: byId("c2"), question: "¿Qué alternativa descartaste? ¿En qué caso concreto habría sido mejor esa alternativa?" },
      { id: "q4", criterionId: byId("c4"), question: "Si el tamaño de la entrada se multiplica por 100, ¿qué parte de tu solución falla primero y por qué?" },
    ];
  }

  async evaluateDefense(
    _statement: string,
    criteria: Criterion[],
    work: string,
    questions: DefenseQuestion[],
    answers: DefenseAnswer[],
  ): Promise<Evaluation> {
    const workWords = new Set(work.toLowerCase().match(/\p{L}{5,}/gu) ?? []);
    const perCriterion = criteria.map((c) => {
      const related = questions.filter((q) => q.criterionId === c.id);
      const texts = related.map((q) => answers.find((a) => a.questionId === q.id)?.answer?.trim() ?? "");
      const joined = texts.join(" ");
      const words = joined.split(/\s+/).filter(Boolean).length;
      const references = (joined.toLowerCase().match(/\p{L}{5,}/gu) ?? []).filter((w) => workWords.has(w)).length;
      const defenseScore = related.length === 0 ? 0.8 : Math.min(1, words / 40 + references / 10);
      const weak = related.length > 0 && defenseScore < 0.5;
      return {
        criterionId: c.id,
        submissionScore: 0.85,
        defenseScore: Math.round(defenseScore * 100) / 100,
        evidenceQuote: joined.slice(0, 140) || "(sin respuesta)",
        misconception: weak ? `No logra explicar "${c.name}" con referencia a su propio trabajo.` : null,
      };
    });
    const weakCount = perCriterion.filter((p) => p.misconception).length;
    return {
      perCriterion,
      summary:
        weakCount === 0
          ? "Defendiste tus decisiones con referencias concretas a tu trabajo. Buen nivel de dominio."
          : `Tu entrega está bien, pero en ${weakCount} criterio(s) no pudiste explicar tus decisiones. Revisa esas partes antes del examen.`,
    };
  }

  async clusterMisconceptions(
    _statement: string,
    criteria: Criterion[],
    submissions: Submission[],
  ): Promise<MisconceptionCluster[]> {
    return criteria
      .map((c) => {
        const hits = submissions.filter((s) =>
          s.evaluation?.perCriterion.some((p) => p.criterionId === c.id && p.misconception),
        );
        return {
          label: `No explica "${c.name}"`,
          criterionId: c.id,
          studentAliases: hits.map((s) => s.alias),
          quotes: hits
            .map((s) => s.evaluation!.perCriterion.find((p) => p.criterionId === c.id)!.evidenceQuote)
            .slice(0, 3),
          suggestion: `Actividad de 10 minutos: en parejas, cada uno explica al otro "${c.name}" en su propio trabajo sin mirar la pantalla; el compañero anota qué no quedó claro.`,
        };
      })
      .filter((c) => c.studentAliases.length > 0)
      .sort((a, b) => b.studentAliases.length - a.studentAliases.length);
  }
}
