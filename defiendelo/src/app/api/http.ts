import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { ConflictError, ForbiddenError, NotFoundError } from "@/application/use-cases";

export function teacherKey(request: Request): string | null {
  return request.headers.get("x-teacher-key");
}

export function studentToken(request: Request): string | null {
  return request.headers.get("x-student-token");
}

export async function handle(run: () => Promise<unknown>): Promise<NextResponse> {
  try {
    return NextResponse.json(await run());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", issues: error.issues }, { status: 400 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Clave de docente inválida" }, { status: 403 });
    }
    if (error instanceof ConflictError) {
      return NextResponse.json({ error: "Esto no se puede hacer en este momento de la sesión." }, { status: 409 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Algo falló al procesar la solicitud. Intenta de nuevo." }, { status: 500 });
  }
}
