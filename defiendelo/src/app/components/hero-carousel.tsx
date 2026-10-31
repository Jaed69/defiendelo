"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EXAMPLES, exampleSubjectLabel } from "@/app/examples";
import { SHOWCASE } from "@/app/showcase";
import { resultHref } from "./example-gallery";

const ROTATE_MS = 6000;

/** One example at a time: what the AI hands in on its own, and what the student now has to explain. */
export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Moving content is opt-out for people who asked their system for less motion.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduced) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % EXAMPLES.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="card grid gap-6 p-6 sm:p-8"
      aria-roledescription="carrusel"
      aria-label="Ejemplos de tareas rediseñadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Every slide sits in the same cell, so the card keeps the height of the longest one. */}
      <div className="grid" aria-live={paused ? "polite" : "off"}>
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
              {ready && (
                <Link href={resultHref(ready)} className="btn justify-self-start" tabIndex={active ? undefined : -1}>
                  Ver el resultado
                </Link>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Elegir ejemplo">
        {EXAMPLES.map((example, i) => (
          <button
            key={example.id}
            type="button"
            aria-label={`Ejemplo ${i + 1}: ${example.title}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setIndex(i)}
            className="grid size-6 place-items-center"
          >
            <span className={`block size-2.5 rounded-full ${i === index ? "bg-brand" : "bg-rule"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
