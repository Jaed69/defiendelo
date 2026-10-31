# Defiéndelo: el docente edita, configura y califica

Objective: close the teacher side of the flow. The teacher edits what the AI generated, chooses how the class is evaluated (scale, method, deadline) and grades each student; the final report counts who reached the expected result. Branch: `feat/evaluacion-docente` from `main`. Delivery: single-pr. Test runner: Vitest.

## Specs

- S1. "Falta que el docente pueda editar la evaluación generada" — statement, AI policy and rubric (name, description, weight, where it is evaluated) are editable; weights must add up to 100. A changed statement or rubric clears the stress test so it can be run again.
- S2. "si la rubrica es del tipo literal (a,b,c,ad) ... el reporte final debe mostrar cuantos de los alumnos logran el resultado logrado o destacado" — literal scale AD/A/B/C (default, secondary school). The teacher sets one final letter per student (user chose "Letra final por alumno"); the AI suggests one when there is a written defense. Report: how many reached A or AD, plus the count per letter.
- S3. "si fuera para una universidad se sigue usando el sistema del 0 al 10 (editable) y se configura la nota minima aprobatoria" — numeric scale, editable maximum (default 20, user chose "0 a 20") and passing grade (default 11). Report: how many passed and the average.
- S4. "Tambien se configura si es examen oral o escrito. Se define el plazo de entrega." — method (oral, written on the phone, written on paper), deadline and questions per student, set on the task screen after the AI (user chose "Después de la IA"). Saving it starts the live session.
- S5. "Actualmente no permite al docente colocar la nota" — submissions screen: close submissions, reorder and call students (oral), see the question being asked, grade, publish and hide grades again.

## API added

| Endpoint | Does |
| --- | --- |
| `PATCH /api/assignments/[id]` + `x-teacher-key` `{statement?, aiPolicy?, criteria?}` | edit the redesign; 400 with the reason if weights do not add up to 100 |
| `PATCH /api/assignments/[id]/session` | now also `grading: "literal" \| "numerica"`; returns the whole assignment |
| `POST /api/assignments/[id]/session` `{submissionId, letter}` or `{submissionId, grade}` or `{submissionId, questionId, score}` | letter or final grade; in oral mode the next ungraded student is called |

## Log

- L1 (2026-10-31, user): request above; answers: letra final por alumno, 0 a 20, configurar después de la IA, "Yo, en mi rama".
- L2: Evidence: vitest 80/80 (`grading.test.ts` new; letter + auto-advance in `session.test.ts`), tsc, eslint 0 errors. Browser, demo mode: settings saved (literal, oral); editor blocks 110% and saves a renamed criterion; 3 students hand in; close → queue; letters AD/B/A advance ana → bruno → luz_23; report "2 de 3 lograron A o AD" (AD 1, A 1, B 1, C 0); publish; student sees "A · Logro esperado". Numeric/paper via API: 14, 9.5, 11 with passing 11 → "2 de 3 aprobaron", average 11.5; a non-numeric grade 400; edit without key 403. Fixed during the run: submissions summary said "3 están respondiendo" / "nadie entregó" for oral sessions.
