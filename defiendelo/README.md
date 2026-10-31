# Defiéndelo

Assignments students may solve with AI, graded on what they can explain. Built for DSC HACK 2026 (Educación 2036).

Flow: the teacher redesigns an assignment → a stress test shows how much of the grade an AI earns alone → each student submits and defends their own work → the teacher sees who to attend first and what to re-teach.

## Run locally

```bash
npm install
npm run dev
```

Put keys in `.env.local` (git-ignored). With no AI key the app runs in **demo mode**: deterministic canned responses, so the whole flow works offline.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Option A | Claude API (`claude-opus-5-5`, with server-side refusal fallback). Takes precedence |
| `OPENROUTER_API_KEY` | Option B | OpenRouter; used when no Anthropic key is set |
| `OPENROUTER_MODEL` | No | OpenRouter model id. Default `z-ai/glm-5.3-flash` (very low cost, not free). Free `:free` models work but are slower and rate-limited |
| `UPSTASH_REDIS_REST_URL` | For deploys | Shared storage across serverless instances |
| `UPSTASH_REDIS_REST_TOKEN` | For deploys | Token for the URL above |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Alternative | Names the Vercel Upstash integration injects; used when the `UPSTASH_*` pair is absent |

Without Upstash, data lives in process memory: fine for `npm run dev`, but on Vercel instances do not share it.

## Deploy on Vercel

1. Import the repository and set the **Root Directory** to `defiendelo`.
2. Add an Upstash Redis integration (free tier) and either `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY`.
3. Deploy. The stress-test route can take 1–3 minutes with free or small models (`maxDuration` 300 s, needs Fluid Compute).

## Structure

- `src/domain` — types and pure scoring logic (gap, triage, AI-obtainable score), tested with Vitest.
- `src/ports` — `AssessmentAI` and `AssignmentStore` interfaces.
- `src/adapters` — shared prompts (`PromptedAssessmentAI`), Claude, OpenRouter, demo, memory and Upstash implementations.
- `src/application` — use cases; API routes in `src/app/api` stay thin.

## Privacy

Students use an alias; no personal data or audio is stored. The teacher dashboard requires the teacher key in its URL.

## Tests

```bash
npm test
```

## Example PDFs

Each example task ships as a PDF in `public/ejemplos/`, shown as already loaded when a teacher picks the example. The text comes from `src/app/examples.ts`; after editing an example, rebuild them (needs Python with `reportlab`). A test checks that each PDF reads back as its task.

```bash
npm run examples:pdf
```
