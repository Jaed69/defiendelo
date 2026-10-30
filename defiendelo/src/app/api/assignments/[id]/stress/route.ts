import { runStressTest } from "@/application/use-cases";
import { assessmentAI, assignmentStore } from "@/composition";
import { handle, teacherKey } from "../../../http";

export const maxDuration = 120;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    return runStressTest(assessmentAI(), assignmentStore(), id, teacherKey(request));
  });
}
