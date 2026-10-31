import { z } from "zod/v4";
import { startDefense } from "@/application/use-cases";
import { assessmentAI, assignmentStore } from "@/composition";
import { handle } from "../../../http";

export const maxDuration = 60;

const body = z.object({
  alias: z.string().trim().min(1).max(40),
  work: z.string().trim().min(20).max(20000),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    const { alias, work } = body.parse(await request.json());
    const submission = await startDefense(assessmentAI(), assignmentStore(), id, alias, work);
    return { id: submission.id, token: submission.token };
  });
}
