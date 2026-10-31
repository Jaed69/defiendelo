import { useCallback, useEffect, useState } from "react";
import { api } from "@/app/api-client";
import type { ClassSession } from "@/domain/types";

/** Changes the live session (configure, close submissions, reorder, call a student, publish). */
export function patchSession(id: string, teacherKey: string, patch: Partial<ClassSession>) {
  return api<ClassSession>(`/api/assignments/${id}/session`, { method: "PATCH", teacherKey, body: JSON.stringify(patch) });
}

/** Scores one question of a student, or sets the final grade when questionId is omitted. */
export function gradeSession(id: string, teacherKey: string, body: { submissionId: string; questionId?: string; score: number }) {
  return api<{ session: ClassSession; grade: number | null }>(`/api/assignments/${id}/session`, {
    method: "POST",
    teacherKey,
    body: JSON.stringify(body),
  });
}

/** Current time, refreshed every second while `active` (for countdowns). */
export function useNow(active: boolean, ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(timer);
  }, [active, ms]);
  return now;
}

/** Calls `refresh` every `ms` while `active`; a failed refresh is ignored and retried on the next tick. */
export function usePolling(refresh: () => Promise<void>, ms: number, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      refresh().catch(() => {});
    }, ms);
    return () => clearInterval(timer);
  }, [refresh, ms, active]);
}

/** Runs a teacher action, reloads the assignment afterwards and reports failures in the shared error banner. */
export function useAction(load: () => Promise<void>, setError: (message: string | null) => void) {
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      setBusy(true);
      setError(null);
      try {
        await action();
        await load();
        return true;
      } catch (e) {
        setError((e as Error).message);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [load, setError],
  );
  return { busy, run };
}
