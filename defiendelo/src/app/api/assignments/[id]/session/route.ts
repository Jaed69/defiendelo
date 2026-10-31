import { z } from "zod/v4";
import { gradeSubmission, updateSession } from "@/application/use-cases";
import { assignmentStore } from "@/composition";
import { handle, teacherKey } from "../../../http";

const patch = z
  .object({
    method: z.enum(["oral", "escrito", "papel"]),
    deadline: z.iso.datetime().nullable(),
    questionsPerStudent: z.number().int().min(1).max(5),
    grading: z.enum(["literal", "numerica"]),
    gradeScale: z.number().int().min(1).max(100),
    passingGrade: z.number().min(0).max(100),
    phase: z.enum(["entregas", "defensas", "publicado"]),
    queue: z.array(z.string().max(10)).max(200),
    current: z.string().max(10).nullable(),
    currentQuestion: z.number().int().min(0).max(4),
  })
  .partial();

const grade = z.intersection(
  z.object({ submissionId: z.string().max(10) }),
  z.union([
    z.object({ questionId: z.string().max(10), score: z.number().min(0).max(100) }),
    z.object({ grade: z.number().min(0).max(100) }),
    z.object({ letter: z.enum(["AD", "A", "B", "C"]) }),
    z.object({ criterionId: z.string().max(10), points: z.number().min(0).max(100) }),
    z.object({ comment: z.string().max(1000) }),
    z.object({ redo: z.literal(true) }),
  ]),
);

/** Teacher drives the live session: configure, close submissions, reorder, call a student, publish. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    return updateSession(assignmentStore(), id, teacherKey(request), patch.parse(await request.json()));
  });
}

/**
 * Teacher scores one question (advances the oral queue when done), confirms or changes a criterion,
 * writes a comment, asks the student to explain again, or sets the final grade or letter.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    const { submissionId, ...input } = grade.parse(await request.json());
    return gradeSubmission(assignmentStore(), id, teacherKey(request), submissionId, input);
  });
}
