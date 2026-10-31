import { openAccount } from "@/application/use-cases";
import { assignmentStore } from "@/composition";
import { handle } from "../../http";

/** A PROFE- code lists the teacher's tasks; an ALUM- code the student's evaluations. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  return handle(async () => openAccount(assignmentStore(), decodeURIComponent((await params).code)));
}
