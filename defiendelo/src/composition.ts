import { ClaudeAssessmentAI } from "@/adapters/claude-assessment-ai";
import { DemoAssessmentAI } from "@/adapters/demo-assessment-ai";
import { MemoryAssignmentStore } from "@/adapters/memory-assignment-store";
import { UpstashAssignmentStore } from "@/adapters/upstash-assignment-store";
import type { AssessmentAI } from "@/ports/assessment-ai";
import type { AssignmentStore } from "@/ports/assignment-store";

export function isDemoMode(): boolean {
  return !process.env.ANTHROPIC_API_KEY;
}

export function assessmentAI(): AssessmentAI {
  return isDemoMode() ? new DemoAssessmentAI() : new ClaudeAssessmentAI();
}

export function assignmentStore(): AssignmentStore {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new UpstashAssignmentStore(url, token) : new MemoryAssignmentStore();
}
