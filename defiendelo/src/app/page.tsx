"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "./api-client";
import { AppBar, Logo } from "./components/brand";
import { ExamplePicker } from "./components/example-picker";
import { FileDrop } from "./components/file-drop";
import { Waiting } from "./components/waiting";
import { type ExampleTask, exampleSubjectLabel } from "./examples";

const ORIGINAL_LIMIT = 8000;

const REDESIGN_STEPS = [
  { after: 0, text: "Leyendo tu tarea y sus criterios…" },
  { after: 6, text: "Buscando qué partes puede resolver una IA sola…" },
  { after: 14, text: "Moviendo esos puntos a decisiones que el alumno tiene que defender…" },
  { after: 24, text: "Armando la rúbrica nueva. Ya casi está." },
];

const HOW = [
  ["Sube tu tarea", "PDF, Word o texto."],
  ["La rediseñamos", "Copiar a la IA ya no alcanza."],
  ["Comparte el enlace", "Cada alumno entrega y explica."],
  ["Mira quién entendió", "Y qué repasar en clase."],
];

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", subject: "", original: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState("");
  const titleInput = useRef<HTMLInputElement>(null);

  function loadExample(example: ExampleTask) {
    setForm({ title: example.title, subject: exampleSubjectLabel(example), original: example.original });
    setLoaded(`Listo: cargamos «${example.title}». Pulsa «Rediseñar la tarea».`);
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
        <nav aria-label="Principal">
          <a href="#redisena" className="btn-secondary">
            Rediseñar una tarea
          </a>
        </nav>
      </AppBar>

      <main id="contenido" tabIndex={-1} className="outline-none">
        <section className="container-page grid grid-cols-[minmax(0,1fr)] items-center gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:gap-16 lg:py-20">
          <div className="grid justify-items-start gap-6">
            <h1 className="max-w-[15ch]">Que la nota mida lo que entendiste, no lo que escribió la IA.</h1>
            <p className="prose-measure max-w-[36rem] text-[1.1875rem] leading-[1.6] text-graphite">
              Sube la tarea que ya usas. La cambiamos para que copiar a la IA no alcance: cada alumno tiene que explicar lo que entregó.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="#redisena" className="btn">
                Rediseñar mi tarea
              </a>
            </div>
            <p className="text-[0.9375rem] text-graphite">Gratis y sin registro.</p>
          </div>
          <ExamplePicker onUse={loadExample} />
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


        <section id="redisena" className="container-page grid gap-8 pb-20 pt-12">
          <h2>Rediseña una tarea</h2>
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
                hint="PDF, Word o texto."
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
              {form.original.length > ORIGINAL_LIMIT * 0.8 && (
                <span id="original-count" className="text-right text-[0.9375rem] tabular-nums text-graphite">
                  {form.original.length.toLocaleString("es")} / {ORIGINAL_LIMIT.toLocaleString("es")} caracteres
                </span>
              )}
            </div>
            {error && (
              <p role="alert" className="font-bold text-pen">
                {error}
              </p>
            )}
            <div className="grid gap-4">
              <div>
                <button className="btn" disabled={busy}>
                  {busy ? "Rediseñando la tarea…" : "Rediseñar la tarea"}
                </button>
              </div>
              {busy && <Waiting steps={REDESIGN_STEPS} expected="suele tardar menos de un minuto" />}
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
