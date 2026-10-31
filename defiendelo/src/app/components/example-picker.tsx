"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EXAMPLES, type ExampleTask, exampleSubjectLabel } from "@/app/examples";
import { SHOWCASE } from "@/app/showcase";

const ROTATE_MS = 6000;

/** Where "Ver el resultado" lands: the submissions screen, which carries the demo's point. */
function resultHref({ id, teacherKey }: { id: string; teacherKey: string }) {
  return `/docente/${id}/entregas?k=${teacherKey}`;
}

/** Subject, plus the grade when two examples share a subject, so every button names one example. */
function courseLabel(example: ExampleTask) {
  const shared = EXAMPLES.filter((e) => e.subject === example.subject).length > 1;
  return shared ? `${example.subject} ${example.level.split(" ")[0]}` : example.subject;
}

/**
 * The preloaded examples in one card: pick a course and see what the AI hands in on its own versus what
 * the student now has to explain. It rotates by itself until someone picks a course.
 */
export function ExamplePicker({ onUse }: { onUse: (example: ExampleTask) => void }) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Moving content is opt-out for people who asked their system for less motion.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (chosen || paused || reduced) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % EXAMPLES.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [chosen, paused]);

  return (
    <section
      id="ejemplos"
      className="card grid gap-6 p-6 sm:p-8"
      aria-labelledby="ejemplos-titulo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid gap-3">
        <h2 id="ejemplos-titulo" className="label text-graphite">
          Mira un ejemplo de tu curso
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Elegir curso">
          {EXAMPLES.map((example, i) => (
            <button
              key={example.id}
              type="button"
              className="filter"
              aria-pressed={i === index}
              onClick={() => {
                setIndex(i);
                setChosen(true);
              }}
            >
              {courseLabel(example)}
            </button>
          ))}
        </div>
      </div>

      {/* Every example sits in the same cell, so the card keeps the height of the longest one. */}
      <div className="grid" aria-live={chosen || paused ? "polite" : "off"}>
        {EXAMPLES.map((example, i) => {
          const ready = SHOWCASE[example.id];
          const active = i === index;
          return (
            <div key={example.id} className={`grid content-start gap-4 [grid-area:1/1] ${active ? "" : "invisible"}`} aria-hidden={!active}>
              <div className="grid gap-1">
                <span className="label text-brand-text">{exampleSubjectLabel(example)}</span>
                <p className="font-display text-2xl font-bold leading-snug">{example.title}</p>
              </div>
              <p className="rounded-[var(--radius-md)] border-l-4 border-pen bg-danger-subtle p-4">
                <span className="label block text-pen">La IA sola entrega</span>
                {example.aiAlone}
              </p>
              <p className="rounded-[var(--radius-md)] border-l-4 border-success bg-success-subtle p-4">
                <span className="label block text-success">Ahora el alumno tiene que explicar</span>
                {example.defense}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {ready && (
                  <Link href={resultHref(ready)} className="btn" tabIndex={active ? undefined : -1}>
                    Ver el resultado
                  </Link>
                )}
                <button type="button" className="btn-quiet" tabIndex={active ? undefined : -1} onClick={() => onUse(example)}>
                  Usar esta tarea
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
