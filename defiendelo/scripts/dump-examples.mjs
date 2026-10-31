// Prints the example tasks as JSON for scripts/build-example-pdfs.py (Node strips the TypeScript types).
const { EXAMPLES, exampleSubjectLabel, examplePdf } = await import("../src/app/examples.ts");

const rows = EXAMPLES.map((e) => ({ title: e.title, course: exampleSubjectLabel(e), original: e.original, file: examplePdf(e).name }));
process.stdout.write(JSON.stringify(rows));
