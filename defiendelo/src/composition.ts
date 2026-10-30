import { ClaudeAssessmentAI } from "@/adapters/claude-assessment-ai";
import { DemoAssessmentAI } from "@/adapters/demo-assessment-ai";
import { MemoryAssignmentStore } from "@/adapters/memory-assignment-store";
import { OpenRouterAssessmentAI } from "@/adapters/openrouter-assessment-ai";
import { UpstashAssignmentStore } from "@/adapters/upstash-assignment-store";
import type { AssessmentAI } from "@/ports/assessment-ai";
import type { AssignmentStore } from "@/ports/assignment-store";

/** Provider order: Claude if configured, then OpenRouter, else offline demo responses. */
export function assessmentAI(): AssessmentAI {
  if (process.env.ANTHROPIC_API_KEY) return new ClaudeAssessmentAI();
  if (process.env.OPENROUTER_API_KEY) {
    return new OpenRouterAssessmentAI(process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_MODEL || undefined);
  }
  return new DemoAssessmentAI();
}

export function assignmentStore(): AssignmentStore {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new UpstashAssignmentStore(url, token) : new MemoryAssignmentStore();
}
