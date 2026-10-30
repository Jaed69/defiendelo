"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./api-client";

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
          <label className="grid gap-1.5">
            <span className="font-bold">Tarea original</span>
            <span className="text-sm text-graphite">Tal como se la das hoy a tus alumnos.</span>
            <textarea
              required
              minLength={20}
              maxLength={8000}
              rows={7}
              value={form.original}
              onChange={(e) => setForm({ ...form, original: e.target.value })}
            />
          </label>
          {error && <p className="text-pen">{error}</p>}
          <div>
            <button className="btn" disabled={busy}>
              {busy ? "Rediseñando la tarea…" : "Rediseñar la tarea"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
