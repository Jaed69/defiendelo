/** Pure helpers for the teacher's session screens (deadline inputs and countdown text). */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** ISO date -> value of an <input type="datetime-local"> in the browser's own time zone. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Value of a datetime-local input -> ISO date the API accepts; empty or invalid means no deadline. */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Time left until the deadline, as "1 h 05 min", "12:30" (mm:ss) or null once it has passed. */
export function formatRemaining(deadline: string, now: number): string | null {
  const left = Math.floor((new Date(deadline).getTime() - now) / 1000);
  if (!(left > 0)) return null;
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  return h > 0 ? `${h} h ${pad(m)} min` : `${m}:${pad(s)}`;
}

/** Share of expected students that already handed in, 0..100; null when the teacher did not say how many. */
export function deliveryProgress(delivered: number, expected: number): number | null {
  if (expected <= 0) return null;
  return Math.min(100, Math.round((delivered / expected) * 100));
}
