import { savedAccountCode } from "./account";

export async function api<T>(path: string, init?: RequestInit & { teacherKey?: string }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (init?.teacherKey) headers.set("x-teacher-key", init.teacherKey);
  // Tasks and submissions created on this device join the code it remembers.
  const code = savedAccountCode();
  if (code && !headers.has("x-account-code")) headers.set("x-account-code", code);
  const response = await fetch(path, { ...init, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? `Error ${response.status}`);
  return body as T;
}
