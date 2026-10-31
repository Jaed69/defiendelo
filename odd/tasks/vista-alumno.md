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
| entregas, already submitted | Entregado ✓, can replace until close | no |
| orden / defensas | Sala: queue of aliases, own position, "Ahora: X" | no |
| own turn, oral | Te toca: alias + current question | no |
| own turn, escrito digital | Defensa (existing one-question-at-a-time) | yes |
| escrito impreso | "Tu evaluación es en papel" | no |
| done, not published | Listo ✓, nota pendiente | no |
| publicado | Resultado + final grade and per-question grades | yes (+ grade) |

## Contract with the teacher side (draft, to agree)

```ts
Assignment += {
  method: "oral" | "escrito" | "papel",   // escrito = on the phone, papel = printed
  deadline: string,
  questionsPerStudent: number,
  gradeScale: number,            // e.g. 20
  phase: "entregas" | "orden" | "defensas" | "publicado",
  queue: string[],               // submissionIds, editable by teacher
  currentSubmissionId: string | null,
  currentQuestionIndex: number,
}
Submission += {
  token: string,                 // student reconnection, never exposed to others
  questionGrades: { questionId: string; score: number }[],
  grade: number | null,
}
```

Student endpoint: `GET /api/assignments/[id]/sala?s=<sid>` with header `x-student-token`, polled every 2–3 s. Returns phase, method, deadline, queue aliases, current alias, current question (only on own turn), own status, own grade only when `phase === "publicado"`.

## Log

- L1 (2026-10-31, user): answers above (S2–S6). Figma PNGs reviewed: `Alumno/Entrega`, `Defensa`, `Resultado` cover the old instant flow; queue, turn and grade screens are missing.
- L2 (user): "Celular o papel" — the teacher picks; written is a third method value (`escrito` on the phone, `papel` printed), not a separate flag.
