// Builds the preloaded showcase: real assignments, stress tests, student defenses and class insights,
// produced by the deployed app's own AI pipeline, so the pitch never waits on a model.
//
//   node --no-warnings scripts/seed-showcase.mjs create   # assignments, stress tests, submissions -> questions
//   node --no-warnings scripts/seed-showcase.mjs answer   # defense answers, class insights -> src/app/showcase.ts
//
// Env: BASE (default https://defiendelo.vercel.app), SHOWCASE_DIR (default scripts/showcase), SHOWCASE_OUT.
// Tasks come from src/app/examples.ts. Inputs: content.json ([{ exampleId, students: [{ alias, work }] }]),
// answers.json (answers in question order, keyed "<exampleId>/<alias>").
// State between phases: state.json (ignored by git).
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = process.env.BASE ?? "https://defiendelo.vercel.app";
const DIR = process.env.SHOWCASE_DIR ?? path.join(root, "scripts", "showcase");
const STATE = path.join(DIR, "state.json");
const OUTPUT = process.env.SHOWCASE_OUT ?? path.join(root, "src", "app", "showcase.ts");

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (e) {
    if (fallback !== undefined && e.code === "ENOENT") return fallback;
    throw e;
  }
}

async function call(route, { body, teacherKey } = {}) {
  const started = Date.now();
  const response = await fetch(`${BASE}${route}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", ...(teacherKey ? { "x-teacher-key": teacherKey } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${route}: ${response.status} ${json.error ?? ""}`);
  console.log(`  ${route} ${((Date.now() - started) / 1000).toFixed(1)}s`);
  return json;
}

/** Runs one async job per item; a failure in one item never interrupts the others. */
async function eachSettled(items, job) {
  const results = await Promise.allSettled(items.map(job));
  const failures = results.filter((r) => r.status === "rejected").map((r) => r.reason.message);
  if (failures.length > 0) {
    console.error(["Failed:", ...failures.map((f) => `  ${f}`), "Run the same phase again to resume."].join("\n"));
    process.exitCode = 1;
  }
}

async function create() {
  const { EXAMPLES, exampleSubjectLabel } = await import(pathToFileURL(path.join(root, "src", "app", "examples.ts")).href);
  const content = await readJson(path.join(DIR, "content.json"));
  const state = await readJson(STATE, {});
  const save = () => writeFile(STATE, JSON.stringify(state, null, 2));
  await eachSettled(content, async (task) => {
    const example = EXAMPLES.find((e) => e.id === task.exampleId);
    if (!example) throw new Error(`${task.exampleId}: not in src/app/examples.ts`);
    if (!state[task.exampleId]) {
      console.log(`${task.exampleId}: creating`);
      const { id, teacherKey } = await call("/api/assignments", {
        body: { title: example.title, subject: exampleSubjectLabel(example), original: example.original },
      });
      state[task.exampleId] = { id, teacherKey, submissions: [] };
      await save();
    }
    const entry = state[task.exampleId];
    // Resume from what the server already holds: a timed-out request may still have saved its result.
    const current = await call(`/api/assignments/${entry.id}`, { teacherKey: entry.teacherKey });
    if (!current.stress) await call(`/api/assignments/${entry.id}/stress`, { body: {}, teacherKey: entry.teacherKey });
    for (const student of task.students) {
      if (entry.submissions.some((s) => s.alias === student.alias)) continue;
      const saved = current.submissions.find((s) => s.alias === student.alias);
      const { id: sid, questions } = saved ?? (await call(`/api/assignments/${entry.id}/submissions`, { body: student }));
      entry.submissions.push({ alias: student.alias, id: sid, questions });
      await save();
    }
  });
  await save();
  console.log(`Questions saved to ${STATE}. Write answers.json, then run "answer".`);
}

async function answer() {
  const state = await readJson(STATE);
  const answers = await readJson(path.join(DIR, "answers.json"));
  await eachSettled(
    Object.entries(state),
    async ([exampleId, { id, teacherKey, submissions }]) => {
      console.log(`${exampleId}: answering`);
      const current = await call(`/api/assignments/${id}`, { teacherKey });
      for (const s of submissions) {
        if (current.submissions.find((x) => x.id === s.id)?.evaluation) continue;
        const given = answers[`${exampleId}/${s.alias}`];
        if (!given || given.length !== s.questions.length) throw new Error(`${exampleId}/${s.alias}: expected ${s.questions.length} answers`);
        await call(`/api/assignments/${id}/submissions/${s.id}`, {
          body: { answers: s.questions.map((q, i) => ({ questionId: q.id, answer: given[i] })) },
        });
      }
      await call(`/api/assignments/${id}/insights`, { body: {}, teacherKey });
    },
  );
  if (process.exitCode) return;
  const entries = Object.entries(state)
    .map(([exampleId, { id, teacherKey }]) => `  "${exampleId}": { id: "${id}", teacherKey: "${teacherKey}" },`)
    .join("\n");
  await writeFile(
    OUTPUT,
    `// Generated by scripts/seed-showcase.mjs: example assignments already run through the real pipeline.\n` +
      `// The teacher keys only unlock these demo assignments, which hold no personal data.\n` +
      `export const SHOWCASE: Record<string, { id: string; teacherKey: string }> = {\n${entries}\n};\n`,
  );
  console.log(`Wrote ${OUTPUT}`);
}

const phase = process.argv[2];
if (phase === "create") await create();
else if (phase === "answer") await answer();
else {
  console.error('Usage: node scripts/seed-showcase.mjs create|answer');
  process.exit(1);
}
