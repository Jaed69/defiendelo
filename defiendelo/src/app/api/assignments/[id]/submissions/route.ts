import { z } from "zod/v4";
import { remember, startDefense } from "@/application/use-cases";
import { aiForTask, assignmentStore } from "@/composition";
import { accountCode, handle } from "../../../http";

export const maxDuration = 60;

const body = z.object({
  alias: z.string().trim().min(1).max(40),
  work: z.string().trim().min(20).max(20000),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    const { alias, work } = body.parse(await request.json());
    const store = assignmentStore();
    const submission = await startDefense(aiForTask, store, id, alias, work);
    const code = await remember(store, "alumno", accountCode(request), { assignmentId: id, submissionId: submission.id, token: submission.token! });
    return { id: submission.id, token: submission.token, code };
  });
}
