# Defiéndelo: preloaded showcase for a 3-minute pitch

Objective: every example task opens an already computed teacher panel (redesign, stress test, students, defenses, class insights) so the pitch has no waiting time; examples come from research on the assignment types AI solves alone today. Branch: `feat/demo-precargada` from `main`. Delivery: single-pr. Test runner: Vitest + Playwright checks (scratchpad).

## Specs

- S1. "como es algo rapido que vamso expoder en menos de 3 minutos, no puede haber tiempos muertos, asi que vamso a precargas todos lso resultado y de mas, para los ejemplos, asi tenelos guradados, alumnos, y de ms" — each example has its results stored in production (redesign, stress test, several students with defenses, class insights) and the home page opens them instantly.
- S2. "podemos usarte a ti claude, para eso" — Claude writes the student submissions and defense answers; the app's real AI pipeline produces every score, so the numbers are real.
- S3. "invetiga cuales son los examanes o ipsos de examenes mas acutalmene usados en alumonso que se resuelves con IA, y asi usarlos como ejemplos, para demostar qeu tan efectiva es la transformacion" — research the most used assignment/exam types that AI solves alone, with sources, and base the examples on them.

## Tasks

| ID | S# | Route | Status | Commit |
| --- | --- | --- | --- | --- |
| T1 | S3 | delegated (research: broad web evidence, mapping trigger) | done: 8 ranked task types with sources; PISA 2025 Peru figures spot-checked against the source | — |
| T2 | S3 | inline | done: 9 examples (adds reading comprehension and a lab report, replaces the photosynthesis essay), cited evidence per example and a headline PISA figure; tests 42/42 | — |
| T3 | S1, S2 | inline | done: 9 assignments, 9 stress tests, 27 submissions, 127 defense answers, 27 evaluations, 9 class insights in production; resumable after two 504s | see L5 |
| T4 | S1 | inline | done: `ExampleGallery` with real before/after AI scores per card, class average headline, "Ver el resultado ya listo"; `assignmentSummary` shared with the teacher panel (RED→GREEN) | — |

## Log

- L1 (2026-10-30, user): "Mira como es algo rapido que vamso expoder en menos de 3 minutos, no puede haber tiempos muertos, asi que vamso a precargas todos lso resultado y de mas, para los ejemplos, asi tenelos guradados, alumnos, y de ms, ess mas podemos usarte a ti claude, para eso, invetiga cuales son los examanes o ipsos de examenes mas acutalmene usados en alumonso que se resuelves con IA, y asi usarlos como ejemplos, para demostar qeu tan efectiva es la transformacion"
- L2: Upstash keys expire after 30 days (`TTL_SECONDS`), enough for the hackathon; the seed script is kept in the repo so the showcase can be rebuilt.
- L3: Research (T1) ranked: argumentative essay, reading comprehension + summary, contextual math problems, take-home monografía, lab report, English writing, artwork analysis, DPCC/EPT projects. Key sources: PISA 2025 Peru via La República (54% weekly chatbot use vs 46% OECD; 36% drafts, 40% summaries, 43% research; confirmed verbatim), Pew 2026 (40%+ US teens use chatbots for math), Common Sense Media 2024 (41% translation), Scarfe & Roesch PLOS ONE 2024 (94% undetected), Bastani et al. PNAS 2025 (+48% practice, -17% exam). GPT-4 AP/SAT scores and Fordham figures are secondary-only and are not used in the UI.
- L4: Each assignment's steps run sequentially in the seed script because the app saves whole assignments; different assignments run in parallel.
- L5: Production results (real AI, computed by `assignmentSummary`): AI-alone score averages 89% on the original tasks and 8% on the redesigned ones. The student who copied from AI ranks first in "A quién atender" in 8 of 9 classes (tie in Ciencia). Two 504s (60 s route limit) were recovered by re-running each phase; the create phase now reconciles with the server so a timed-out request that still saved is adopted, not duplicated.
- L6: Found while reviewing results: `studentGap` counts "entrega" criteria the defense never asked about; the evaluator gives them defenseScore 0, so strong students get a gap (Ximena 32.5, all from C3-C5). Product decision pending with the user; not changed.
