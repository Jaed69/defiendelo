"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isTeacherCode, rememberAccountCode, savedAccountCode } from "./account";
import { api } from "./api-client";
import { AccountChip } from "./components/account-chip";
import { AppBar, Logo } from "./components/brand";
import { ExamplePicker, exampleIntro } from "./components/example-picker";
import { FileDrop } from "./components/file-drop";
import { FileTextIcon, UsersIcon } from "./components/icons";
import { Waiting } from "./components/waiting";
import { type ExampleTask, examplePdf, exampleSubjectLabel } from "./examples";
import { exampleFor } from "./ready-example";

const ORIGINAL_LIMIT = 8000;

// Only the teacher's own task waits on the AI; an example is ready at once.
const REDESIGN_STEPS = [
  { after: 0, text: "Leyendo tu tarea y sus criterios…" },
  { after: 6, text: "Buscando qué partes puede resolver una IA sola…" },
  { after: 14, text: "Moviendo esos puntos a decisiones que el alumno tiene que defender…" },
  { after: 24, text: "Armando la rúbrica nueva. Ya casi está." },
];

interface Created {
  id: string;
  teacherKey: string;
  code: string;
  demo: boolean;
}

/** D1 · Inicio: the teacher uploads a task (or picks an example) and gets it redesigned. */
export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", subject: "", original: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // An example counts only while the form holds it unchanged: then the result is instant.
  const example = exampleFor(form);

  function pick(chosen: ExampleTask) {
    setForm({ title: chosen.title, subject: exampleSubjectLabel(chosen), original: chosen.original });
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const firstTask = !isTeacherCode(savedAccountCode());
    try {
      const { id, teacherKey, code } = await api<Created>("/api/assignments", { method: "POST", body: JSON.stringify(form) });
      rememberAccountCode(code);
      router.push(firstTask ? `/docente/${id}/bienvenida?k=${teacherKey}` : `/docente/${id}?k=${teacherKey}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <AppBar>
        <Logo />
        <AccountChip />
      </AppBar>

      <main id="contenido" tabIndex={-1} className="outline-none">
        <div className="container-page grid grid-cols-[minmax(0,1fr)] items-start gap-10 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] lg:gap-16 lg:py-16">
          <section className="grid justify-items-start gap-5 lg:sticky lg:top-24" aria-labelledby="titular">
            <span className="chip chip-brand">
              <UsersIcon size={16} /> Para docentes
            </span>
            <h1 id="titular" className="max-w-[18ch] text-[clamp(2.25rem,4.4vw,3.25rem)] leading-[1.05]">
              <span className="block">En la era de la IA, deja de medir el resultado.</span>
              <span className="mt-3 block text-brand-text">Mide lo que tu alumno aprendió.</span>
            </h1>
            <p className="prose-measure max-w-[34rem] text-[1.125rem] leading-[1.6] text-graphite">
              Sube la tarea que ya usas. La rediseñamos para evaluar sus competencias, no lo que entrega.
            </p>
          </section>

          <section id="redisena" className="card grid gap-5 p-5 sm:p-7" aria-labelledby="redisena-titulo">
            <h2 id="redisena-titulo" className="text-[1.5rem]">
              Rediseña tu tarea
            </h2>
            <ExamplePicker selectedId={example?.id ?? null} onPick={pick} />

            <p role="status" className="empty:hidden">
              {example && (
                <span className="rise flex items-start gap-2.5 rounded-[var(--radius-md)] bg-highlight-subtle px-4 py-3 font-bold">
                  <FileTextIcon size={18} className="mt-0.5" />
                  Vas a rediseñar {exampleIntro(example)}.
                </span>
              )}
            </p>

            <form onSubmit={create} className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="font-bold">Título</span>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    placeholder="Ej. Fotosíntesis en casa"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </label>
                <label className="grid gap-1.5">
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
              <div className="grid gap-2.5">
                <label htmlFor="original" className="font-bold">
                  Tarea original
                </label>
                <span id="original-hint" className="sr-only">
                  Tal como se la das hoy a tus alumnos. Puedes subir el documento o pegar el texto.
                </span>
                <FileDrop
                  limit={ORIGINAL_LIMIT}
                  title="Sube tu PDF o Word"
                  hint="o pega el texto abajo"
                  attached={example ? examplePdf(example) : null}
                  onText={(original) => setForm((f) => ({ ...f, original }))}
                />
                <textarea
                  id="original"
                  required
                  minLength={20}
                  maxLength={ORIGINAL_LIMIT}
                  rows={5}
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
              {/* On a phone the main button stays at the bottom of the screen, in reach of the thumb. */}
              <div className="grid gap-3 max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-5 max-sm:border-t max-sm:border-rule max-sm:bg-surface max-sm:px-5 max-sm:py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <button className="btn max-sm:w-full" disabled={busy}>
                    {busy ? "Rediseñando la tarea…" : "Rediseñar la tarea"}
                  </button>
                  <span className="text-[0.9375rem] text-graphite max-sm:hidden">Con un ejemplo, el resultado sale al instante.</span>
                </div>
                {busy && !example && <Waiting steps={REDESIGN_STEPS} expected="suele tardar menos de un minuto" />}
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
