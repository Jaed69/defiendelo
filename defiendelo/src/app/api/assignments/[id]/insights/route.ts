import { analyzeClass } from "@/application/use-cases";
import { aiForTask, assignmentStore } from "@/composition";
import { handle, teacherKey } from "../../../http";

export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    return analyzeClass(aiForTask, assignmentStore(), id, teacherKey(request));
  });
}
