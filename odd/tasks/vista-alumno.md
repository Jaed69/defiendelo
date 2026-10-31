# Defiéndelo: vista del alumno en sesión de aula

Objective: the student uploads their work and is then evaluated according to the method the teacher configured, inside a live classroom session the teacher controls (Kahoot-like, no user accounts). Branch: `feat/vista-alumno` from `main`. Delivery: single-pr. Test runner: Vitest for pure logic. The teacher side is built by another teammate; this task only consumes the contract below.

## Specs

- S1. "Yo hare la parte del alumno ... subir el entregable y luego esperar a que me toque ser evaluado y recibir mi nota. Cuando me toca ser evaluado depende del criterio de evaluación. El sistema no maneja usuarios, es como un kahoot" — student enters with link/code + alias; a token in `localStorage` reconnects them after a reload.
- S2. "Cuando cierra el plazo de entrega ... el orden de expo se puede ver y todo, el docente siempre tiene control" — the student sees the deadline countdown, then the presentation order, their position and who is presenting now.
- S3. "El sistema te lo propone opciones pero se puede editar" — order is proposed by the system and edited by the teacher; the student view only reads it.
- S4. "El docente pone la nota y luego continua ... el sistema genera las 2 preguntas orales ... una vez le pone la nota a cada pregunta le toca al siguiente" — oral: on their turn the student sees "Te toca" and the question currently being asked. AI generates the questions from each submission.
- S5. "Como sera para escuelas del estado el examen escrito puede hacerse incluso impreso" — written: may be on paper; the student view must not assume the defense happens on the phone.
- S6. "El docente decide, puede publicar las notas al final" — the grade (scale set by the teacher) appears only once published; before that, "pendiente".

## Student screens (from Figma `Alumno/*`, plus new ones)

| Phase | Screen | In Figma |
| --- | --- | --- |
| entregas | Entrega: statement, method, deadline countdown, alias, file/paste | yes (+ method, deadline) |
| entregas, already submitted | Entregado ✓ + countdown, see own work, "Cambiar mi entrega" until close | no |
| orden / defensas | Sala: queue of aliases, own position, "Ahora: X" | no |
| own turn, oral | Te toca: alias + current question | no |
| own turn, escrito digital | Defensa (existing one-question-at-a-time) | yes |
| escrito impreso | "Tu evaluación es en papel" | no |
| done, not published | Listo ✓, nota pendiente | no |
| publicado | Resultado + final grade and per-question grades | yes (+ grade) |

## Contract with the teacher side (implemented, see `src/domain/types.ts` and `src/domain/session.ts`)

- `Assignment.session?: ClassSession` (read it with `sessionOf()`, defaults: oral, no deadline, 2 questions, scale 20, phase `entregas`).
- `ClassSession = { method: "oral" | "escrito" | "papel", deadline, questionsPerStudent, gradeScale, phase: "entregas" | "defensas" | "publicado", queue, current, currentQuestion }`. "Orden" is not a phase: it is `defensas` with `current: null`.
- `Submission += { token?, questionGrades?: Record<questionId, number>, grade? }`.
- Questions: the AI generates them at submission (as before); only the first `questionsPerStudent` count.

| Who | Endpoint | Does |
| --- | --- | --- |
| Student | `POST /api/assignments/[id]/submissions` `{alias, work}` | 409 if closed; returns `{id, token}` |
| Student | `GET /api/assignments/[id]/submissions/[sid]` + `x-student-token` | `StudentView`, polled every 3 s; 404 on bad token |
| Student | `PUT /api/assignments/[id]/submissions/[sid]` + token `{work}` | replaces the work and regenerates questions; 409 once closed |
| Student | `POST /api/assignments/[id]/submissions/[sid]` + token `{answers}` | written defense, only in `escrito` + `defensas` |
| Teacher | `PATCH /api/assignments/[id]/session` + `x-teacher-key` | partial `ClassSession`; leaving `entregas` with an empty queue proposes it by arrival |
| Teacher | `POST /api/assignments/[id]/session` + key `{submissionId, questionId?, score}` | scores a question (oral: advances question, then next ungraded student; grade = average) or sets the final grade |

The teacher UI for these endpoints is the teammate's; this branch only adds the API.

## Log

- L1 (2026-10-31, user): answers above (S2–S6). Figma PNGs reviewed: `Alumno/Entrega`, `Defensa`, `Resultado` cover the old instant flow; queue, turn and grade screens are missing.
- L2 (user): "Celular o papel" — the teacher picks; written is a third method value (`escrito` on the phone, `papel` printed), not a separate flag.
- L3 (user): "Mejor ve programando y luego vemos como queda el merge" — implemented domain (`session.ts`, 5 tests), API and the student page by status. Evidence: vitest 55/55, tsc clean, eslint 0 errors; demo-mode browser run at 375 px: submit → "Entregado" with countdown → queue "n.º 3 de 3, ahora defiende ana" → "¡Te toca!" with live question after grading ana and bruno → "Ya te evaluaron" → publish → 16/20 with per-question scores. API checks: late submit 409, written answer before opening 409, bad token 404, bad teacher key 403, written defense evaluates. Fixed: polling kept running after publish.
- L4 (user): "El alumno no puede editar su entrega o volver a subir otra" — added "Cambiar mi entrega" (prefilled, alias kept) while submissions are open; questions are regenerated from the new work. Evidence: vitest 6/6 in session.test.ts; browser: submit v1 → change → v2 saved; API: questions quote v2, bad token 404, after close 409 and `canReplace: false`.
