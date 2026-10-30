# Defiéndelo demo (DSC HACK 2026)

Objective: deployable Next.js demo of Defiéndelo (steps 1–6 of the cycle). Branch: `feat/defiendelo-demo`. Delivery: single-pr (hackathon). Test runner: Vitest for domain logic.

## Specs

- S1. Teacher redesigns an assignment: paste original task + subject → "pro-IA" version where AI is allowed but the grade is earned through judgment (decisions, discarded alternatives, justification), with a criteria rubric.
- S2. Stress test: the AI solves the task alone and is graded against the rubric, before (original) and after (redesigned); show "% de la nota que la IA saca sola" and which criteria are "regalables".
- S3. Student submits work (may use AI) and answers 3–5 defense questions about decisions in THEIR submission, text mode, time-limited.
- S4. Gap map: per student, submission score vs defense score per criterion; class misconceptions grouped with quotes. Teacher has the final grade.
- S5. Triage: students sorted by gap ("atiende a estos 5 esta semana") + one re-teaching suggestion per frequent misconception.
- S6. Banco vivo: mock section only.
- S7. Works without an API key (demo mode with canned responses) so it can be shown anywhere; real mode uses Claude API.
- S8. Deployable on Vercel. No minors' personal data; no audio stored.

## Tasks

| ID | S# | Route | Status | Commit |
| --- | --- | --- | --- | --- |
| T1 | S7, S8 | inline | done (demo mode verified; real Claude mode untested, no API key) | first commit |
| T2 | S1, S2 | inline | done | first commit |
| T3 | S3, S4 | inline | done | first commit |
| T4 | S5, S6 | inline | done | first commit |
| T5 | S8 | inline | pending: Vercel deploy needs the user's account, API key and Upstash | — |

Route evidence: single coherent app, no parallel independent units of several minutes each with disjoint surfaces worth a writer; inline.

## Log

- L1 (2026-10-30, user): "Listo podemoa a comezar a ahcer una demo" — chose "Next.js en Phi (Recommended)".
- L3: Evidence: Vitest RED (missing module) then GREEN 7/7 for gap/triage/AI-obtainable score; `tsc` clean; lint 0 errors; `next build` OK; end-to-end smoke in demo mode against `next start` (create, stress, 403 on bad teacher key, defense, evaluation, insights, 400, 404, both pages 200). Added teacher key so students only get the public view.
- L2: Phi was not its own repo (git root was the user home); initialized a new repo in Phi, branch `feat/defiendelo-demo`.
