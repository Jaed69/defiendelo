import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod/v4";
import { PromptedAssessmentAI } from "./prompted-assessment-ai";

const MODEL = "claude-opus-5-5";

export class ClaudeAssessmentAI extends PromptedAssessmentAI {
  private readonly client = new Anthropic();

  protected async structured<T>(schema: z.ZodType<T>, system: string, user: string): Promise<T> {
    const response = await this.client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(schema) },
      system,
      messages: [{ role: "user", content: user }],
    });
    if (response.stop_reason === "refusal") throw new Error("The model declined this request.");
    if (!response.parsed_output) {
      throw new Error(`Could not parse model output (stop_reason: ${response.stop_reason}).`);
    }
    return response.parsed_output as T;
  }

  protected async text(system: string, user: string): Promise<string> {
    const response = await this.client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: user }],
    });
    if (response.stop_reason === "refusal") throw new Error("The model declined this request.");
    return response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim();
  }
}
