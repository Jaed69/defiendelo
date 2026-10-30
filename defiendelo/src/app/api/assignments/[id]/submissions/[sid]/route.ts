import { z } from "zod/v4";
import { submitDefense } from "@/application/use-cases";
import { assessmentAI, assignmentStore } from "@/composition";
import { handle } from "../../../../http";

export const maxDuration = 60;

const body = z.object({
  answers: z
    .array(z.object({ questionId: z.string().max(10), answer: z.string().max(4000) }))
    .max(10),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string; sid: string }> }) {
  return handle(async () => {
    const { id, sid } = await params;
    const { answers } = body.parse(await request.json());
    const submission = await submitDefense(assessmentAI(), assignmentStore(), id, sid, answers);
    return { evaluation: submission.evaluation };
  });
}
