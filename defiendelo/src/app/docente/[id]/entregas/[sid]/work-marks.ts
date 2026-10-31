export interface WorkSegment {
  text: string;
  /** Set on the parts of the work a question or a grade comes from. */
  label?: string;
}

const MIN_QUOTE = 8;

/** A quote as the AI wrote it, without the quote marks or the ellipsis around it. */
function clean(quote: string) {
  return quote
    .trim()
    .replace(/^[«"“'‘]+|[»"”'’]+$/g, "")
    .replace(/(\.\.\.|…)+$/g, "")
    .replace(/^(\.\.\.|…)+/g, "")
    .trim();
}

/**
 * Splits the student's work into plain text and the parts quoted as evidence, so the teacher sees
 * where each question comes from. Quotes not found in the work, too short or overlapping are skipped.
 */
export function markWork(work: string, quotes: { quote: string; label: string }[]): WorkSegment[] {
  const lower = work.toLowerCase();
  const found: { start: number; end: number; label: string }[] = [];
  for (const { quote, label } of quotes) {
    const text = clean(quote);
    if (text.length < MIN_QUOTE) continue;
    const start = lower.indexOf(text.toLowerCase());
    if (start === -1) continue;
    const end = start + text.length;
    if (found.some((f) => start < f.end && end > f.start)) continue;
    found.push({ start, end, label });
  }
  found.sort((a, b) => a.start - b.start);

  const segments: WorkSegment[] = [];
  let at = 0;
  for (const f of found) {
    if (f.start > at) segments.push({ text: work.slice(at, f.start) });
    segments.push({ text: work.slice(f.start, f.end), label: f.label });
    at = f.end;
  }
  if (at < work.length || segments.length === 0) segments.push({ text: work.slice(at) });
  return segments;
}
