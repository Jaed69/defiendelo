import { z } from "zod/v4";
import { createAssignment } from "@/application/use-cases";
import { assessmentAI, assignmentStore } from "@/composition";
import { handle } from "../http";

export const maxDuration = 60;

const body = z.object({
  title: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1).max(80),
  original: z.string().trim().min(20).max(8000),
});

export async function POST(request: Request) {
  return handle(async () => {
    const input = body.parse(await request.json());
    const assignment = await createAssignment(assessmentAI(), assignmentStore(), input);
    return { id: assignment.id, teacherKey: assignment.teacherKey };
  });
}
