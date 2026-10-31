# Defiéndelo: accessible UX/UI and document upload

Objective: make the teacher and student flows easier and more accessible, and let teachers (and students) load a PDF, Word or text file instead of pasting. Branch: `feat/ux-accesible`. Delivery: single-pr (hackathon). Test runner: Vitest for pure logic; Playwright (scratchpad) for the end-to-end check.

## Specs

- S1. "considera que un profesor peude subir un pdf, o cosas aprecidas, a esos docuemtnos" — the teacher can drop or pick a PDF, DOCX, TXT or MD file to fill "Tarea original". Text is extracted in the browser (the file never leaves the device), with clear feedback: file name, characters extracted, truncation to the 8000-character limit, and an actionable error for scanned PDFs without text or unsupported types. The text stays editable.
- S2. Assumption (same intent as S1): the student can load their work from a file (PDF, DOCX, TXT, MD, or source code such as .py/.js/.java/.c/.cpp) into "Tu trabajo", same feedback, 20000-character limit.
- S3. "Mejores el UX U IU pARA HACERLO mas aexxeible a ususairo" — accessibility: skip link; 44px touch targets; visible focus; the defense timer must not announce every second to screen readers; the timer can be extended once (WCAG 2.2.1); blocked paste in answers explains why instead of failing silently; errors announced with `role="alert"`.
- S4. Inspired by awwwards.com collections ("Inspiring UX Design" conversational forms, "Microcopy and UX writing" loading microcopy): the defense shows one question at a time with "Pregunta N de M" progress and keyboard navigation; long waits (redesign, stress test ~2 min, questions, evaluation, insights) show staged progress microcopy and elapsed time in a polite live region.
- S5. Teacher dashboard orientation: a step overview (rediseño → prueba → compartir → resultados) linking to each section; the student link is reachable without scrolling past the whole rubric.

## Tasks

| ID | S# | Route | Status | Commit |
| --- | --- | --- | --- | --- |
| T1 | S1, S2 | inline | done | 9cdd71c, ce6a0c8 |
| T2 | S3, S4 | inline | done | ce6a0c8 |
| T3 | S5 | inline | done | ce6a0c8 |
| T4 | S1–S5 | inline | local done; production pending push/deploy | — |

Route evidence: one app, the units share `globals.css` and the new upload component; no disjoint parallel units worth a writer. Forecast ~600 authored lines; single-pr accepted for the hackathon.

## Log

- L1 (2026-10-30, user): "Mejores el UX U IU pARA HACERLO mas aexxeible  a ususairo , peudese usar skillr o el mcp de figma, asi mimso, considera que un profesor peude subir un pdf, o cosas aprecidas, a esos docuemtnos, no , y de mas consideracion puedes usar los sitios de https://www.awwwards.com/collections/ para inpirate, usa la extesion de choem apra navegar ente ellos y asi entdar en lso sitiso y endende de los mejora qque tomes en ceunta"
- L2: Browsed awwwards collections in Chrome: "Inspiring UX Design" (Typeform-style one-question-at-a-time forms, "press Enter" hints, natural-language forms) and "Microcopy and UX writing" (loading-state microcopy). Figma MCP not used: it needs authentication and adds nothing over code for this scope.
- L3: Libraries: pdfjs-dist 6.4.299 (2026-10-03) and mammoth 1.13.0, both loaded on demand in the browser.
- L4: Evidence. Vitest RED (missing module) then GREEN 16/16 (fileKind, fitToLimit). tsc clean, eslint 0 errors (1 pre-existing warning), next build OK; pdf.js is loaded on demand (route first-load JS ~108 kB). Playwright end-to-end in demo mode, 16/16 PASS: skip link first focus; Word-exported PDF and DOCX fill the task; .jpg shows an alert; image-only PDF explains it has no text; teacher step nav (4 links); student .py upload; one question at a time; paste blocked with explanation; "Necesito más tiempo" 10:00 -> 15:00 once; Ctrl+Enter walks questions; result; triage lists the student; no horizontal scroll at 375 px; no console errors. Visual QA fixed stretched step circles and missing spacing under the teacher step nav. Commits 9cdd71c, ce6a0c8.
