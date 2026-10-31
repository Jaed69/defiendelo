"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./api-client";
import { FileDrop } from "./components/file-drop";
import { Waiting } from "./components/waiting";

const ORIGINAL_LIMIT = 8000;

const REDESIGN_STEPS = [
  { after: 0, text: "Leyendo tu tarea y sus criterios…" },
  { after: 6, text: "Buscando qué partes puede resolver una IA sola…" },
  { after: 14, text: "Moviendo esos puntos a decisiones que el alumno tiene que defender…" },
  { after: 24, text: "Armando la rúbrica nueva. Ya casi está." },
];

const EXAMPLE = {
  title: "Búsqueda en una lista ordenada",
  subject: "Programación",
  original:
    "Escribe en Python una función que reciba una lista ordenada de números y un valor, y devuelva la posición del valor o -1 si no está. Incluye comentarios y tres casos de prueba.",
};

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", subject: "", original: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <main>
      <section>
        <p className="font-display text-lg font-bold text-pen">Defiéndelo</p>
        <h1 className="mt-3 max-w-[18ch]">Que la nota mida lo que entendiste, no lo que escribió la IA.</h1>
        <p className="prose-measure mt-5 text-graphite">
          Pega una tarea que ya usas. La rediseñamos para que la IA esté permitida, comprobamos cuánta nota
          saca la IA sola, y cada alumno defiende su propia entrega. Tú ves quién entendió y qué reforzar mañana.
        </p>
        <ol className="steps mt-6" aria-label="Cómo funciona">
          {["Sube o pega tu tarea", "Revisa la versión rediseñada", "Comparte el enlace", "Mira quién entendió"].map((step, i) => (
            <li key={step}>
              <span>
                <span className="step-number" aria-hidden="true">
                  {i + 1}
                </span>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2>Rediseña una tarea</h2>
          <button type="button" className="btn-quiet" onClick={() => setForm(EXAMPLE)}>
            Usar una tarea de ejemplo
          </button>
        </div>
        <form onSubmit={create} className="mt-6 grid gap-5">
          <label className="grid gap-1.5">
            <span className="font-bold">Título</span>
            <input
              type="text"
              required
              maxLength={120}
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
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </label>
          <div className="grid gap-1.5">
            <label htmlFor="original" className="font-bold">
              Tarea original
            </label>
            <span id="original-hint" className="text-sm text-graphite">
              Tal como se la das hoy a tus alumnos. Puedes pegarla o subir el documento.
            </span>
            <FileDrop
              limit={ORIGINAL_LIMIT}
              hint="PDF, Word (.docx) o texto. Se lee en tu dispositivo."
              onText={(original) => setForm((f) => ({ ...f, original }))}
            />
            <textarea
              id="original"
              required
              minLength={20}
              maxLength={ORIGINAL_LIMIT}
              rows={9}
              aria-describedby="original-hint original-count"
              value={form.original}
              onChange={(e) => setForm({ ...form, original: e.target.value })}
            />
            <span id="original-count" className="text-right text-sm tabular-nums text-graphite">
              {form.original.length.toLocaleString("es")} / {ORIGINAL_LIMIT.toLocaleString("es")} caracteres
            </span>
          </div>
          {error && (
            <p role="alert" className="font-bold text-pen">
              {error}
            </p>
          )}
          <div>
            <button className="btn" disabled={busy}>
              {busy ? "Rediseñando la tarea…" : "Rediseñar la tarea"}
            </button>
            {busy && <Waiting steps={REDESIGN_STEPS} expected="suele tardar menos de un minuto" />}
          </div>
        </form>
      </section>
    </main>
  );
}
