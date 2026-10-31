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
| T5 | S8 | inline | done: live at https://defiendelo.vercel.app | bd4623b, 9c8bf5c |

Route evidence: single coherent app, no parallel independent units of several minutes each with disjoint surfaces worth a writer; inline.

## Log

- L1 (2026-10-30, user): "Listo podemoa a comezar a ahcer una demo" — chose "Next.js en Phi (Recommended)".
- L3: Evidence: Vitest RED (missing module) then GREEN 7/7 for gap/triage/AI-obtainable score; `tsc` clean; lint 0 errors; `next build` OK; end-to-end smoke in demo mode against `next start` (create, stress, 403 on bad teacher key, defense, evaluation, insights, 400, 404, both pages 200). Added teacher key so students only get the public view.
- L4 (user): "Está es de openroutebpeude usar los modelos gratuitos quizá el glm5 flash que ví que se s gratis o similares" — GLM 5.3 Flash is NOT free on OpenRouter (~US$0.018/M in, US$0.14/M out); chose it as default (8 s, good Spanish, JSON schema OK); free models tested: nemotron-3.5-super-vl:free 41 s, openrouter/free empty. Added OpenRouter adapter + shared PromptedAssessmentAI. Found GLM scored "no se" as defense 1.0 → added domain reconcileEvaluation (RED→GREEN, 11/11). Real run: AI alone 100% original vs 20% redesigned; stress 95–132 s → maxDuration 300. Commit 4a172e8.
- L2: Phi was not its own repo (git root was the user home); initialized a new repo in Phi, branch `feat/defiendelo-demo`.
- L5 (user): "Crea u súbelo a un reporte de github y ahí lo conetare con vercel" — created private repo https://github.com/Jaed69/defiendelo, pushed `main` and `feat/defiendelo-demo` (history checked: 0 secrets). T5 now waits on the user connecting Vercel.
- L6 (user): "hazlo tú por la CLI" — Vercel project `defiendelo` (scope figs-projects-8e407275), Git-linked to Jaed69/defiendelo, root `defiendelo`, `OPENROUTER_API_KEY` sensitive, Upstash Redis `defiendelo-redis` (iad1, free). Integration injects `KV_REST_API_*`, so the store now also reads those (bd4623b). Vercel blocked Next 15.5.4 as vulnerable; bumped to 15.5.28 (9c8bf5c; tsc, 11/11 tests, build OK). Deployed from a clean `git archive` root because CLI deploy needs the repo root when Root Directory is set. Production smoke: create assignment with real AI 200, public GET x4 200 without teacherKey, bad key 403, student submission returns 5 questions (43 s), /alumno page 200. Commits not pushed yet.
