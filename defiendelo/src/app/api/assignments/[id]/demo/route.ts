import { demoSamples, simulateClass } from "@/application/use-cases";
import { assignmentStore } from "@/composition";
import { handle, teacherKey } from "../../../http";

/** Synthetic works and answers a demo student can load; empty for tasks that are not examples. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => demoSamples(assignmentStore(), (await params).id));
}

/** Teacher only: adds the example class (handed in, answered and reviewed by the AI) at once. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => simulateClass(assignmentStore(), (await params).id, teacherKey(request)));
}
