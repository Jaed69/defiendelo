import type { AssessmentAI } from "@/ports/assessment-ai";

/**
 * Real AI first; if a call fails (network, quota, or a reply that breaks the schema twice), the
 * deterministic demo answer keeps the class going instead of showing the student an error.
 */
export function withFallback(
  primary: AssessmentAI,
  fallback: AssessmentAI,
  log: (method: string, error: unknown) => void = (method, error) => console.error(`AI ${method} failed, using demo answer:`, error),
): AssessmentAI {
  return new Proxy(primary, {
    get(target, prop: keyof AssessmentAI) {
      const method = target[prop];
      if (typeof method !== "function") return method;
      return async (...args: unknown[]) => {
        try {
          return await (method as (...a: unknown[]) => Promise<unknown>).apply(target, args);
        } catch (error) {
          log(String(prop), error);
          return (fallback[prop] as (...a: unknown[]) => Promise<unknown>).apply(fallback, args);
        }
      };
    },
  });
}
