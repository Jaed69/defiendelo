import { z } from "zod/v4";
import { PromptedAssessmentAI } from "./prompted-assessment-ai";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
export const DEFAULT_OPENROUTER_MODEL = "z-ai/glm-5.3-flash";

interface ChatResponse {
  choices?: { message?: { content?: string | null } }[];
  error?: { message?: string };
}

/** Strips a Markdown code fence some models wrap around JSON. */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : raw).trim();
}

export class OpenRouterAssessmentAI extends PromptedAssessmentAI {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = DEFAULT_OPENROUTER_MODEL,
  ) {
    super();
  }

  private async complete(system: string, user: string, responseFormat?: object): Promise<string> {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Defiendelo",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...(responseFormat ? { response_format: responseFormat } : {}),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as ChatResponse;
    if (!response.ok || body.error) {
      throw new Error(`OpenRouter request failed (${response.status}): ${body.error?.message ?? "unknown error"}`);
    }
    const content = body.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenRouter returned an empty response.");
    return content;
  }

  protected async structured<T>(schema: z.ZodType<T>, system: string, user: string): Promise<T> {
    const format = {
      type: "json_schema",
      json_schema: { name: "result", strict: false, schema: z.toJSONSchema(schema) },
    };
    const instruction = `${system}\n\nReply with a single JSON object that matches the requested schema. No prose.`;
    let lastError: unknown;
    // Smaller models occasionally break the schema; one retry is cheap and usually enough.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await this.complete(instruction, user, format);
        return schema.parse(JSON.parse(extractJson(raw)));
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  protected async text(system: string, user: string): Promise<string> {
    return (await this.complete(system, user)).trim();
  }
}
