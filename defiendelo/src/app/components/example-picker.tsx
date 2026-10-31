"use client";

import { EXAMPLES, type ExampleTask } from "@/app/examples";

const SHORT_SUBJECT: Record<string, string> = {
  "Desarrollo Personal, Ciudadanía y Cívica": "DPCC",
};

/** "Comunicación 4.º": subject and grade, short enough for a chip. */
export function courseLabel(example: Pick<ExampleTask, "subject" | "level">) {
  return `${SHORT_SUBJECT[example.subject] ?? example.subject} ${example.level.split(" ")[0]}`;
}

/** "un ensayo argumentativo de Comunicación, 4.º de secundaria": the example named inside a sentence. */
export function exampleIntro(example: Pick<ExampleTask, "kind" | "subject" | "level">) {
  const article = /^(Monograf|Redacci)/.test(example.kind) ? "una" : "un";
  return `${article} ${example.kind.toLowerCase()} de ${example.subject}, ${example.level}`;
}

/**
 * Ready-made tasks as chips: the kind of task and the course. Picking one only fills the form; on a
 * phone the chips scroll sideways so the form stays in reach.
 */
export function ExamplePicker({ selectedId, onPick }: { selectedId: string | null; onPick: (example: ExampleTask) => void }) {
  return (
    <div className="grid gap-2.5">
      <h3 id="ejemplos-titulo" className="text-[0.9375rem] font-bold text-graphite">
        ¿Sin una tarea a mano? Prueba un ejemplo
      </h3>
      <ul
        aria-labelledby="ejemplos-titulo"
        className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {EXAMPLES.map((example) => {
          const selected = example.id === selectedId;
          return (
            <li key={example.id} className="shrink-0 snap-start sm:shrink">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onPick(example)}
                className={`grid h-full w-44 cursor-pointer content-start gap-0.5 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors sm:w-full ${
                  selected ? "border-brand bg-brand text-white" : "border-rule bg-surface text-ink hover:border-ink"
                }`}
              >
                <span className="text-[0.9375rem] font-bold leading-snug">{example.kind}</span>
                <span className={`text-[0.8125rem] ${selected ? "text-white/85" : "text-graphite"}`}>{courseLabel(example)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
