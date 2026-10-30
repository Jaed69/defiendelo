export async function api<T>(path: string, init?: RequestInit & { teacherKey?: string }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (init?.teacherKey) headers.set("x-teacher-key", init.teacherKey);
  const response = await fetch(path, { ...init, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? `Error ${response.status}`);
  return body as T;
}
