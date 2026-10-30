import { getForStudent, getForTeacher } from "@/application/use-cases";
import { assignmentStore } from "@/composition";
import { handle, teacherKey } from "../../http";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    const key = teacherKey(request);
    return key ? getForTeacher(assignmentStore(), id, key) : getForStudent(assignmentStore(), id);
  });
}
