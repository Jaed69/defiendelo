import { z } from "zod/v4";
import { getStudentView, replaceSubmission, submitDefense } from "@/application/use-cases";
import { assessmentAI, assignmentStore } from "@/composition";
import { handle, studentToken } from "../../../../http";

export const maxDuration = 60;

const body = z.object({
  answers: z
    .array(z.object({ questionId: z.string().max(10), answer: z.string().max(4000) }))
    .max(10),
});

/** What the student sees right now; the student page polls it. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string; sid: string }> }) {
  return handle(async () => {
    const { id, sid } = await params;
    return getStudentView(assignmentStore(), id, sid, studentToken(request));
  });
}

/** Student replaces their work while submissions are open. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string; sid: string }> }) {
  return handle(async () => {
    const { id, sid } = await params;
    const { work } = z.object({ work: z.string().trim().min(20).max(20000) }).parse(await request.json());
    await replaceSubmission(assessmentAI(), assignmentStore(), id, sid, studentToken(request), work);
    return { ok: true };
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string; sid: string }> }) {
  return handle(async () => {
    const { id, sid } = await params;
    const { answers } = body.parse(await request.json());
    const submission = await submitDefense(assessmentAI(), assignmentStore(), id, sid, studentToken(request), answers);
    return { evaluation: submission.evaluation };
  });
}
