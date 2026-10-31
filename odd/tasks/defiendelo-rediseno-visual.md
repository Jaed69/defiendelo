# Defiéndelo: full visual redesign from Figma

Objective: replace the plain notebook look with the "cuaderno cuadriculado" visual system designed in Figma (https://www.figma.com/design/vJbFealOdYHmWfiR8SumcH), keeping every behavior and accessibility check from `defiendelo-ux-accesible`. Branch: `feat/rediseno-visual` from `main`. Delivery: single-pr. Test runner: Vitest + Playwright UX check (scratchpad).

## Specs

- S1. "MM no sigue siendo extrmadamente simeple, usa si o si el MCP de Figma, ya qeu encesito un redise;o visual completo" — design in Figma first (tokens, text styles, components, screens: Docente / Inicio, Docente / Panel, Alumno / Entrega, Defensa, Resultado), then implement it in the app.
- S2. Implementation keeps all S1–S5 behavior of `defiendelo-ux-accesible` (uploads, one-question defense, timer rules, skip link, alerts) and passes the same 16-check UX run.

## Tasks

| ID | S# | Route | Status | Commit |
| --- | --- | --- | --- | --- |
| T1 | S1 | inline | done: Figma file with 16 primitives, 23 semantic colors, 12 spacing/radius vars, 11 text styles, 1 effect style, 9 components, 5 screens | — (Figma) |
| T2 | S1, S2 | inline | done: tokens, fonts, Logo/TeacherNote/AppBar, FileDrop, GapBar, home, teacher panel and student pages; `averageGap` RED→GREEN; tsc, eslint, vitest 18/18, build, UX check 16/16 | see L4 |

## Log

- L1 (2026-10-30, user): "MM no sigue siendo extrmadamente simeple, usa si o si el MCP de Figma, ya qeu encesito un redise;o visual completo"
- L2: Figma connected via /mcp. Built in Figma with figma-use, figma-generate-design and figma-generate-library skills. QA: 220 text nodes, only Bricolage Grotesque / Atkinson Hyperlegible / Caveat / JetBrains Mono (code), 69 component instances, no placeholder text; fixed stat-card heights, an annotation position and a clipped mobile stepper after screenshots.
- L3 (2026-10-30, user): "Ya me gusta la pantalla lo apruebo"
- L4: Implemented the approved design. Evidence: `averageGap` tests failed first, then 18/18; `tsc --noEmit` clean; eslint 0 errors (1 pre-existing warning); `next build` ok; Playwright UX check 16/16 in demo mode on three runs. Visual QA against the Figma screens fixed a timer ring too small for "15:00" (64→80px), a hero card clipped at 375px (grid tracks needed `minmax(0,1fr)`), and a red-pen note overlapping the code on narrow screens.
