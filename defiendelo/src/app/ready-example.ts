import { EXAMPLES, type ExampleTask, exampleSubjectLabel } from "./examples";

/**
 * The example a task form holds, only when it is submitted exactly as loaded: then the demo replays
 * its synthetic data at once. Any edit means it is the teacher's own task, and it goes through the real AI.
 */
export function exampleFor(form: { title: string; subject: string; original: string }): ExampleTask | null {
  const same = (a: string, b: string) => a.trim() === b.trim();
  return (
    EXAMPLES.find((e) => same(e.title, form.title) && same(exampleSubjectLabel(e), form.subject) && same(e.original, form.original)) ?? null
  );
}
