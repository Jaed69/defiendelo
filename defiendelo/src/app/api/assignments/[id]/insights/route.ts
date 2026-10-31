import { analyzeClass } from "@/application/use-cases";
import { assessmentAI, assignmentStore } from "@/composition";
import { handle, teacherKey } from "../../../http";

// Real AI calls can take close to a minute and retry once before the demo fallback (Fluid Compute).
export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    return analyzeClass(assessmentAI(), assignmentStore(), id, teacherKey(request));
  });
}
