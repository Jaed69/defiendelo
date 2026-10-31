import { z } from "zod/v4";
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

const LANGUAGE_RULE =
  "Write every user-facing string in neutral, clear Spanish suitable for Peruvian university students and teachers.";

const criterionSchema = z.object({
  id: z.string().describe("Short stable id such as c1, c2"),
  name: z.string(),
  description: z.string(),
  weight: z.number().int().describe("Integer weight; all weights in the list sum to 100"),
  evidence: z.enum(["entrega", "defensa"]),
});

// Minimum lengths reject placeholders ("ok") and bare titles, which smaller models sometimes return;
// a rejected reply is asked again by the provider adapter.
export const redesignSchema = z.object({
  statement: z
    .string()
    .trim()
    .min(80)
    .describe("The complete redesigned assignment, as the student will read it, in the language of the original. Never a title."),
  aiPolicy: z.string().trim().min(20).describe("What AI use is allowed and what the student must declare."),
  criteria: z.array(criterionSchema),
  originalCriteria: z.array(criterionSchema),
  rationale: z.string().trim().min(20).describe("One or two sentences for the teacher on why the grade moved."),
});

const scoresSchema = z.object({
  scores: z.array(
    z.object({
      criterionId: z.string(),
      score: z.number().describe("From 0 to 1"),
      reason: z.string(),
    }),
  ),
});

const questionsSchema = z.object({
  questions: z.array(z.object({ criterionId: z.string(), question: z.string() })),
});

const evaluationSchema = z.object({
  perCriterion: z.array(
    z.object({
      criterionId: z.string(),
      submissionScore: z.number().describe("From 0 to 1"),
      defenseScore: z.number().describe("From 0 to 1"),
      evidenceQuote: z.string().describe("Verbatim quote from the student's defense answers"),
      misconception: z.string().nullable(),
    }),
  ),
  summary: z.string(),
});

const clustersSchema = z.object({
  clusters: z.array(
    z.object({
      label: z.string(),
      criterionId: z.string(),
      studentAliases: z.array(z.string()),
      quotes: z.array(z.string()),
      suggestion: z.string(),
    }),
  ),
});

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function rubricText(criteria: Criterion[]): string {
  return criteria
    .map((c) => `- ${c.id} | ${c.name} (${c.weight}%, verified in: ${c.evidence}): ${c.description}`)
    .join("\n");
}

/**
 * Holds the prompts and schemas shared by every model provider.
 * Providers implement only two primitives: free text and schema-validated JSON.
 */
export abstract class PromptedAssessmentAI implements AssessmentAI {
  protected abstract structured<T>(schema: z.ZodType<T>, system: string, user: string): Promise<T>;
  protected abstract text(system: string, user: string): Promise<string>;

  private ask<T>(schema: z.ZodType<T>, system: string, user: string): Promise<T> {
    return this.structured(schema, `${system}\n\n${LANGUAGE_RULE}`, user);
  }

  async redesign(input: RedesignInput): Promise<Redesign> {
    return this.ask(
      redesignSchema,
      `You help teachers redesign assignments for a world where students use generative AI.
The redesigned task must ALLOW AI, but the grade must be earned through the student's own judgment:
decisions taken, alternatives discarded and why, verification of AI output, and the ability to explain choices.
Execution quality that an AI can produce alone must weigh little.
Mark a criterion with evidence "defensa" when it can only be verified by asking the student about their own work live;
mark it "entrega" when it is verified in the written submission. At least half of the weight must be "defensa".
Also produce originalCriteria: the product-focused rubric a teacher would typically use for the ORIGINAL task today (mostly "entrega").
Use 3 to 5 criteria in each list. Weights in each list sum to 100.
"statement" is the full text of the redesigned assignment the student will receive, not its title.`,
      `Subject: ${input.subject}\nTitle: ${input.title}\n\nOriginal assignment:\n${input.original}`,
    );
  }

  async solveAlone(subject: string, statement: string): Promise<string> {
    return this.text(
      `You are a student who delegates the whole assignment to an AI and submits whatever it produces.
Write the complete submission exactly as it would be handed in, including any justifications the task asks for.
Keep it under 500 words. ${LANGUAGE_RULE}`,
      `Subject: ${subject}\n\nAssignment:\n${statement}`,
    );
  }

  async grade(statement: string, criteria: Criterion[], answer: string): Promise<CriterionScore[]> {
    const result = await this.ask(
      scoresSchema,
      `You are a strict, fair grader. Score each criterion from 0 to 1 using only the written submission.
Give one short reason per criterion. Return one score per criterion id.`,
      `Assignment:\n${statement}\n\nRubric:\n${rubricText(criteria)}\n\nSubmission:\n${answer}`,
    );
    return result.scores.map((s) => ({ ...s, score: clamp01(s.score) }));
  }

  async defenseQuestions(statement: string, criteria: Criterion[], work: string): Promise<DefenseQuestion[]> {
    const result = await this.ask(
      questionsSchema,
      `You run a short oral-style defense of a student's own submission.
Write 3 to 5 questions about concrete decisions IN THIS submission (quote or point to the exact part),
prioritizing criteria verified in "defensa". Each question must be answerable in 2-4 sentences by someone who
truly made the work, and hard to answer by someone who only pasted AI output. Never ask for definitions.`,
      `Assignment:\n${statement}\n\nRubric:\n${rubricText(criteria)}\n\nStudent submission:\n${work}`,
    );
    return result.questions.slice(0, 5).map((q, i) => ({ id: `q${i + 1}`, ...q }));
  }

  async evaluateDefense(
    statement: string,
    criteria: Criterion[],
    work: string,
    questions: DefenseQuestion[],
    answers: DefenseAnswer[],
  ): Promise<Evaluation> {
    const transcript = questions
      .map(
        (q) =>
          `${q.id} [${q.criterionId}] ${q.question}\nAnswer: ${answers.find((a) => a.questionId === q.id)?.answer || "(no answer)"}`,
      )
      .join("\n\n");
    const result = await this.ask(
      evaluationSchema,
      `You compare what a student SUBMITTED with what they could EXPLAIN in their defense.
For every criterion give submissionScore (quality visible in the written work) and defenseScore (how well the
student's own answers show they understand and made those decisions). Quote the student's words verbatim as evidence.
defenseScore scale: 0 = no answer, "no sé", or an answer that does not address the question; 0.3 = vague or generic;
0.6 = correct but shallow; 1 = specific, correct and clearly about their own work. Judge only the defense answers here,
never the written work. A criterion with a misconception cannot score above 0.5.
If an answer reveals a specific misunderstanding, state it in one sentence as misconception; otherwise null.
You do not assign the final grade; the teacher does. The summary speaks to the student, warmly and concretely.`,
      `Assignment:\n${statement}\n\nRubric:\n${rubricText(criteria)}\n\nSubmission:\n${work}\n\nDefense:\n${transcript}`,
    );
    return {
      summary: result.summary,
      perCriterion: result.perCriterion.map((p) => ({
        ...p,
        submissionScore: clamp01(p.submissionScore),
        defenseScore: clamp01(p.defenseScore),
      })),
    };
  }

  async clusterMisconceptions(
    statement: string,
    criteria: Criterion[],
    submissions: Submission[],
  ): Promise<MisconceptionCluster[]> {
    const evidence = submissions
      .filter((s) => s.evaluation)
      .map(
        (s) =>
          `Student ${s.alias}:\n` +
          s.evaluation!.perCriterion
            .filter((p) => p.misconception)
            .map((p) => `- [${p.criterionId}] ${p.misconception} | quote: "${p.evidenceQuote}"`)
            .join("\n"),
      )
      .join("\n\n");
    const result = await this.ask(
      clustersSchema,
      `Group the misconceptions found across a class into at most 5 clusters, largest first.
For each cluster: a short label, the criterion id, the student aliases, up to 3 verbatim quotes, and ONE concrete
activity the teacher can run in the next class (10-15 minutes) to address it.`,
      `Assignment:\n${statement}\n\nRubric:\n${rubricText(criteria)}\n\nMisconceptions:\n${evidence || "(none)"}`,
    );
    return result.clusters;
  }
}
