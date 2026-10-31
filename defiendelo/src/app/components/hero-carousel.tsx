"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EXAMPLES, exampleSubjectLabel } from "@/app/examples";
import { SHOWCASE } from "@/app/showcase";
import type { AssignmentSummary } from "@/domain/gap";
import { resultHref } from "./example-gallery";

const ROTATE_MS = 4500;

/** The preloaded examples, one at a time: course, title, and how much the AI alone scores before and after. */
export function HeroCarousel({ summaries }: { summaries: Record<string, AssignmentSummary> }) {
  const slides = EXAMPLES.flatMap((example) => {
    const summary = summaries[example.id];
    const ready = SHOWCASE[example.id];
    if (!ready || !summary || summary.aiOriginal === null || summary.aiRedesigned === null) return [];
    return [{ example, ready, before: Math.round(summary.aiOriginal), after: Math.round(summary.aiRedesigned) }];
  });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Moving content is opt-out for people who asked their system for less motion.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduced || slides.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  // Same height while loading, so the hero does not jump when the numbers arrive.
  if (slides.length === 0) return <div className="card min-h-[22rem]" aria-hidden="true" />;

  const { example, ready, before, after } = slides[index % slides.length];
  return (
    <section
      className="card grid min-h-[22rem] content-between gap-6 p-6 sm:p-8"
      aria-roledescription="carrusel"
      aria-label="Tareas de ejemplo ya probadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid gap-2" aria-live={paused ? "polite" : "off"}>
        <span className="label text-brand-text">{exampleSubjectLabel(example)}</span>
        <p className="font-display text-2xl font-bold leading-snug">{example.title}</p>
        <span className="label mt-4 text-graphite">Nota de la IA sola</span>
        <p className="flex flex-wrap items-baseline gap-x-4">
          <span className="stat-value text-pen">{before}%</span>
          <span className="text-2xl text-graphite" aria-hidden="true">
            →
          </span>
          <span className="sr-only">antes; con la tarea rediseñada,</span>
          <span className="stat-value text-success">{after}%</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={resultHref(ready)} className="btn">
          Ver el resultado
        </Link>
        <div className="flex gap-1" role="group" aria-label="Elegir ejemplo">
          {slides.map((slide, i) => (
            <button
              key={slide.example.id}
              type="button"
              aria-label={`Ejemplo ${i + 1}: ${slide.example.title}`}
              aria-current={i === index % slides.length ? "true" : undefined}
              onClick={() => setIndex(i)}
              className="grid size-6 place-items-center"
            >
              <span className={`block size-2.5 rounded-full ${i === index % slides.length ? "bg-brand" : "bg-rule"}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
