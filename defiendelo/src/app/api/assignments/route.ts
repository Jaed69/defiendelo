import { z } from "zod/v4";
import { createAssignment, remember } from "@/application/use-cases";
import { exampleFor } from "@/app/ready-example";
import { aiForTask, assignmentStore } from "@/composition";
import { demoFixture } from "@/demo/demo-class";
import { accountCode, handle } from "../http";

export const maxDuration = 60;

const body = z.object({
  title: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1).max(80),
  original: z.string().trim().min(20).max(8000),
});

/** An example sent unchanged becomes a demo task with synthetic data, ready at once; anything else goes to the AI. */
export async function POST(request: Request) {
  return handle(async () => {
    const input = body.parse(await request.json());
    const store = assignmentStore();
    const example = exampleFor(input);
    const assignment = await createAssignment(aiForTask, store, input, demoFixture(example?.id));
    const code = await remember(store, "docente", accountCode(request), { id: assignment.id, teacherKey: assignment.teacherKey });
    return { id: assignment.id, teacherKey: assignment.teacherKey, code, demo: Boolean(assignment.demo) };
  });
}
