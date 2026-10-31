"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "./api-client";
import { AppBar, Logo, TeacherNote } from "./components/brand";
import { FileDrop } from "./components/file-drop";
import { Waiting } from "./components/waiting";
import { EXAMPLES, EXAMPLE_SUBJECTS, type ExampleTask, exampleSubjectLabel } from "./examples";

const ORIGINAL_LIMIT = 8000;

const REDESIGN_STEPS = [
  { after: 0, text: "Leyendo tu tarea y sus criterios…" },
  { after: 6, text: "Buscando qué partes puede resolver una IA sola…" },
  { after: 14, text: "Moviendo esos puntos a decisiones que el alumno tiene que defender…" },
  { after: 24, text: "Armando la rúbrica nueva. Ya casi está." },
];

const HERO_EXAMPLE = EXAMPLES.find((e) => e.id === "programacion-busqueda-binaria")!;

const HOW = [
  ["Sube tu tarea", "PDF, Word o texto. La que ya usas con tus alumnos."],
  ["Revisa el rediseño", "La IA sigue permitida; la nota pasa a las decisiones y a la defensa."],
  ["Comparte el enlace", "Cada alumno entrega y responde preguntas sobre su propio trabajo."],
  ["Mira quién entendió", "Ves la brecha de cada alumno y qué reforzar en la próxima clase."],
];

const SAMPLE_CODE = [
  "def binary_search(arr, target):",
  "    low, high = 0, len(arr) - 1",
  "    while low <= high:",
  "        mid = low + (high - low) // 2",
  "        if arr[mid] < target:",
  "            low = mid + 1",
];

/** The hero's example: a corrected submission, showing the product's whole argument at a glance. */
function CorrectedSheet() {
  return (
    <figure className="card grid-paper relative grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 overflow-hidden p-6 sm:p-8" aria-label="Ejemplo: entrega de un alumno corregida por Defiéndelo">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="label text-graphite">Entrega de Bruno, 4.º de secundaria</span>
        <span className="chip chip-danger">Brecha 64%</span>
      </div>
      <div className="relative">
        <pre className="overflow-x-auto rounded-[var(--radius-md)] bg-subtle px-5 py-4 font-mono text-[0.875rem] leading-6 sm:text-[0.9375rem]">
          {SAMPLE_CODE.join("\n")}
        </pre>
        <span className="absolute right-3 top-[5.5rem] hidden xl:block">
          <TeacherNote>¿y por qué + 1?</TeacherNote>
        </span>
      </div>
      <div className="grid gap-2">
        <span className="label text-brand-text">Pregunta de defensa</span>
        <p className="font-bold">¿Por qué mueves low a mid + 1 y no a mid? ¿Qué pasaría con una lista de 2 elementos?</p>
        <p className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="italic text-graphite">&ldquo;no sé, lo hizo ChatGPT&rdquo;</span>
          <TeacherNote>no lo puede explicar</TeacherNote>
        </p>
      </div>
      <figcaption className="grid gap-4 sm:grid-cols-2">
        <div className="card grid gap-1 p-5 shadow-none">
          <span className="label text-graphite">IA sola, tarea original</span>
          <span className="stat-value text-pen">100%</span>
          <span className="text-[0.9375rem] text-graphite">Saca la nota completa sin ningún alumno.</span>
        </div>
        <div className="card grid gap-1 p-5 shadow-none">
          <span className="label text-graphite">IA sola, tarea rediseñada</span>
          <span className="stat-value text-success">20%</span>
          <span className="text-[0.9375rem] text-graphite">El resto se gana en la defensa.</span>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", subject: "", original: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [loaded, setLoaded] = useState("");
  const titleInput = useRef<HTMLInputElement>(null);
  const shown = filter ? EXAMPLES.filter((e) => e.subject === filter) : EXAMPLES;

  function loadExample(example: ExampleTask) {
    setForm({ title: example.title, subject: exampleSubjectLabel(example), original: example.original });
    setLoaded(`Cargamos «${example.title}» en el formulario. Revísala y pulsa «Rediseñar la tarea».`);
    document.getElementById("redisena")?.scrollIntoView({ behavior: "smooth" });
    titleInput.current?.focus({ preventScroll: true });
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { id, teacherKey } = await api<{ id: string; teacherKey: string }>("/api/assignments", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push(`/docente/${id}?k=${teacherKey}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <AppBar>
        <Logo />
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-x-6">
          <span className="hidden sm:inline">
            <a href="#como-funciona" className="btn-quiet">
              Cómo funciona
            </a>
          </span>
          <a href="#redisena" className="btn-secondary">
            Rediseñar una tarea
          </a>
        </nav>
      </AppBar>

      <main id="contenido" tabIndex={-1} className="outline-none">
        <section className="container-page grid grid-cols-[minmax(0,1fr)] items-center gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:gap-16 lg:py-20">
          <div className="grid justify-items-start gap-6">
            <span className="chip chip-highlight">Para docentes de secundaria</span>
            <h1 className="max-w-[15ch]">Que la nota mida lo que entendiste, no lo que escribió la IA.</h1>
            <p className="prose-measure max-w-[36rem] text-[1.1875rem] leading-[1.6] text-graphite">
              Sube una tarea que ya usas. La rediseñamos para que la IA esté permitida pero no alcance, comprobamos cuánta nota saca la IA
              sola y cada alumno defiende su propia entrega.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="#redisena" className="btn">
                Rediseñar mi tarea
              </a>
              <button
                type="button"
                className="btn-quiet"
                onClick={() => loadExample(HERO_EXAMPLE)}
              >
                Ver un ejemplo con búsqueda binaria
              </button>
            </div>
            <p className="max-w-[32rem] text-[0.9375rem] text-graphite">
              Sin registro. Los archivos se leen en tu dispositivo y no se suben a ningún servidor.
            </p>
          </div>
          <CorrectedSheet />
        </section>

        <section id="como-funciona" className="container-page grid gap-8 py-12">
          <h2>Cómo funciona</h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cómo funciona">
            {HOW.map(([title, desc], i) => (
              <li key={title} className="card grid content-start gap-3 p-6 shadow-none">
                <span className="steps">
                  <span className="step-filled inline-flex items-center gap-3 font-bold">
                    <span className="step-number" aria-hidden="true">
                      {i + 1}
                    </span>
                    {title}
                  </span>
                </span>
                <span className="text-[0.9375rem] text-graphite">{desc}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="ejemplos" className="container-page grid gap-8 py-12" aria-labelledby="ejemplos-titulo">
          <div className="grid gap-3">
            <h2 id="ejemplos-titulo">Ejemplos por curso</h2>
            <p className="prose-measure text-graphite">
              Tareas que hoy se dejan en secundaria. En cada una ves qué parte entrega una IA sola y qué tendría que explicar el alumno
              en su defensa. Elige una para probar Defiéndelo o úsala como modelo para la tuya.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar ejemplos por curso">
            <button type="button" className="filter" aria-pressed={filter === null} onClick={() => setFilter(null)}>
              Todos los cursos
            </button>
            {EXAMPLE_SUBJECTS.map((subject) => (
              <button key={subject} type="button" className="filter" aria-pressed={filter === subject} onClick={() => setFilter(subject)}>
                {subject}
              </button>
            ))}
          </div>
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((example) => (
              <li key={example.id} className="card flex flex-col gap-4 p-6">
                <div className="grid gap-1">
                  <span className="label text-brand-text">{exampleSubjectLabel(example)}</span>
                  <h3>{example.title}</h3>
                  <span className="text-[0.9375rem] text-graphite">Tema: {example.topic}</span>
                </div>
                <p className="text-[0.9375rem]">{example.original}</p>
                <div className="grid gap-3 text-[0.9375rem]">
                  <p className="rounded-[var(--radius-md)] border-l-4 border-pen bg-danger-subtle p-4">
                    <span className="label block text-pen">Hoy la IA lo entrega sola</span>
                    {example.aiAlone}
                  </p>
                  <p className="rounded-[var(--radius-md)] border-l-4 border-brand bg-brand-subtle p-4">
                    <span className="label block text-brand-text">Con Defiéndelo, el alumno explica</span>
                    {example.defense}
                  </p>
                </div>
                <button type="button" className="btn-secondary mt-auto self-start" onClick={() => loadExample(example)}>
                  Usar esta tarea
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section id="redisena" className="container-page grid gap-8 pb-20 pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid gap-2">
              <h2>Rediseña una tarea</h2>
              <p className="text-graphite">Tarda menos de un minuto. Después puedes editar todo.</p>
            </div>
            <a href="#ejemplos" className="btn-quiet">
              Ver tareas de ejemplo por curso
            </a>
          </div>
          <p role="status">
            {loaded && <span className="block rounded-[var(--radius-md)] bg-success-subtle p-4 font-bold">{loaded}</span>}
          </p>
          <form onSubmit={create} className="card grid gap-6 p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="font-bold">Título</span>
                <input
                  ref={titleInput}
                  type="text"
                  required
                  maxLength={120}
                  placeholder="Ej. Fotosíntesis en casa"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
              <label className="grid gap-2">
                <span className="font-bold">Curso o materia</span>
                <input
                  type="text"
                  required
                  maxLength={80}
                  placeholder="Ej. Ciencia y Tecnología, 3.º"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </label>
            </div>
            <div className="grid gap-3">
              <label htmlFor="original" className="font-bold">
                Tarea original
              </label>
              <span id="original-hint" className="sr-only">
                Tal como se la das hoy a tus alumnos. Puedes subir el documento o pegar el texto.
              </span>
              <FileDrop
                limit={ORIGINAL_LIMIT}
                title="Arrastra aquí tu PDF o Word"
                hint="También sirve un archivo de texto. Se lee en tu dispositivo: no se sube a ningún servidor."
                onText={(original) => setForm((f) => ({ ...f, original }))}
              />
              <div className="flex items-center gap-3 text-graphite" aria-hidden="true">
                <span className="h-px flex-1 bg-rule" />
                <span className="label">o pega el texto</span>
                <span className="h-px flex-1 bg-rule" />
              </div>
              <textarea
                id="original"
                required
                minLength={20}
                maxLength={ORIGINAL_LIMIT}
                rows={7}
                aria-describedby="original-hint original-count"
                value={form.original}
                onChange={(e) => setForm({ ...form, original: e.target.value })}
              />
              <span id="original-count" className="text-right text-[0.9375rem] tabular-nums text-graphite">
                {form.original.length.toLocaleString("es")} / {ORIGINAL_LIMIT.toLocaleString("es")} caracteres
              </span>
            </div>
            {error && (
              <p role="alert" className="font-bold text-pen">
                {error}
              </p>
            )}
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <button className="btn" disabled={busy}>
                  {busy ? "Rediseñando la tarea…" : "Rediseñar la tarea"}
                </button>
                <span className="text-[0.9375rem] text-graphite">Después verás la versión nueva, su rúbrica y la prueba con la IA sola.</span>
              </div>
              {busy && <Waiting steps={REDESIGN_STEPS} expected="suele tardar menos de un minuto" />}
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
