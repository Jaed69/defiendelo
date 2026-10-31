import { z } from "zod/v4";
import { gradeSubmission, updateSession } from "@/application/use-cases";
import { assignmentStore } from "@/composition";
import { handle, teacherKey } from "../../../http";

const patch = z
  .object({
    method: z.enum(["oral", "escrito", "papel"]),
    deadline: z.iso.datetime().nullable(),
    questionsPerStudent: z.number().int().min(1).max(5),
    gradeScale: z.number().int().min(1).max(100),
    phase: z.enum(["entregas", "defensas", "publicado"]),
    queue: z.array(z.string().max(10)).max(200),
    current: z.string().max(10).nullable(),
    currentQuestion: z.number().int().min(0).max(4),
  })
  .partial();

const grade = z.object({
  submissionId: z.string().max(10),
  questionId: z.string().max(10).optional(),
  score: z.number().min(0).max(100),
});

/** Teacher drives the live session: configure, close submissions, reorder, call a student, publish. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    return updateSession(assignmentStore(), id, teacherKey(request), patch.parse(await request.json()));
  });
}

/** Teacher scores one question (advances the oral queue when done) or sets the final grade. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    const { submissionId, questionId, score } = grade.parse(await request.json());
    return gradeSubmission(assignmentStore(), id, teacherKey(request), submissionId, score, questionId);
  });
}
