import { z } from "zod/v4";
import { getForStudent, getForTeacher, updateRedesign } from "@/application/use-cases";
import { assignmentStore } from "@/composition";
import { handle, teacherKey } from "../../http";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    const key = teacherKey(request);
    return key ? getForTeacher(assignmentStore(), id, key) : getForStudent(assignmentStore(), id);
  });
}

const edit = z
  .object({
    statement: z.string().trim().min(20).max(8000),
    aiPolicy: z.string().trim().min(1).max(1000),
    criteria: z
      .array(
        z.object({
          id: z.string().max(10).optional(),
          name: z.string().trim().min(1).max(120),
          description: z.string().trim().max(600),
          weight: z.number().int().min(1).max(100),
          evidence: z.enum(["entrega", "defensa"]),
        }),
      )
      .min(1)
      .max(12),
  })
  .partial();

/** Teacher edits the redesigned statement, AI policy or rubric. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    return updateRedesign(assignmentStore(), id, teacherKey(request), edit.parse(await request.json()));
  });
}
