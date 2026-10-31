"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { forgetAccountCode, rememberAccountCode } from "@/app/account";
import { keepForTab } from "@/app/alumno/tab-code";
import { AppBar, Logo } from "@/app/components/brand";
import { LogInIcon } from "@/app/components/icons";
import { normalizeAccountCode } from "@/domain/account";

/** V1 · one entry for both roles: a PROFE- code opens the teacher's tasks, an ALUM- code the student's grades. */
export default function EnterPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enter(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = normalizeAccountCode(value);
    if (!parsed) {
      setError("Ese código no tiene la forma correcta. Se ve así: ALUM-4X9P2R o PROFE-7K2M9Q.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/accounts/${encodeURIComponent(parsed.code)}`);
      if (response.status === 404) {
        setError("No encontramos ese código. Revisa cada letra y número.");
        return;
      }
      if (!response.ok) throw new Error();
      // Remembered codes live in localStorage; otherwise only this tab keeps it.
      if (remember) {
        rememberAccountCode(parsed.code);
        keepForTab(null);
      } else {
        forgetAccountCode();
        keepForTab(parsed.code);
      }
      router.push(parsed.role === "docente" ? "/docente" : "/alumno");
    } catch {
      setError("No pudimos revisar el código. Revisa tu conexión e inténtalo otra vez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AppBar>
        <Logo />
      </AppBar>
      <main id="contenido" tabIndex={-1} className="grid min-h-[calc(100dvh-4rem)] place-items-start px-4 py-6 outline-none sm:place-items-center sm:py-12">
        <form
          onSubmit={enter}
          className="mx-auto grid w-full max-w-md gap-6 rounded-[var(--radius-lg)] border border-rule bg-surface p-6 sm:p-10"
          noValidate
        >
          <h1 className="text-[clamp(1.875rem,7vw,2.25rem)]! leading-tight!">Entra con tu código</h1>
          <div className="grid gap-2">
            <label htmlFor="codigo" className="text-lg font-bold">
              Tu código
            </label>
            <input
              id="codigo"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              placeholder="ALUM-4X9P2R"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "codigo-error" : undefined}
              className="rounded-[var(--radius-lg)]! border-ink! px-[18px]! py-4! font-mono text-[1.375rem] uppercase tracking-[0.08em]"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            {error && (
              <p id="codigo-error" role="alert" className="font-bold text-pen">
                {error}
              </p>
            )}
          </div>
          <label className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1">
            <input
              type="checkbox"
              className="size-6 shrink-0 accent-[var(--color-bg-brand)]"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="text-[1.0625rem]">Recordar en este dispositivo</span>
            <span className="text-graphite">(no en computadoras del colegio)</span>
          </label>
          <button className="btn w-full" disabled={busy || !value.trim()}>
            <LogInIcon size={18} /> {busy ? "Entrando…" : "Entrar"}
          </button>
          <p className="text-graphite">
            ¿No tienes código? Se crea solo la primera vez que creas una tarea o entregas un trabajo. ¿Lo perdiste? Alumno: pídeselo a tu profe.
            Docente: abre el enlace privado de cualquiera de tus tareas.
          </p>
        </form>
      </main>
    </>
  );
}
