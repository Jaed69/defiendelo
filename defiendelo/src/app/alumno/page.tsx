"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/app/api-client";
import type { StudentTaskSummary } from "@/application/use-cases";
import { LETTER_LABEL } from "@/domain/grading";
import { type CardTone, evaluationCard, formatPoints } from "./student-copy";
import { currentAccountCode, writeSubmission } from "./tab-code";
import { Pill, type PillTone, StudentBar, StudentMain } from "./ui";

type Account = { code: string; role: "alumno"; evaluations: StudentTaskSummary[] } | { code: string; role: "docente" };

const CARD: Record<CardTone, { box: string; pill: PillTone }> = {
  success: { box: "bg-success-subtle", pill: "white-success" },
  neutral: { box: "bg-subtle", pill: "white-neutral" },
  highlight: { box: "bg-highlight-subtle", pill: "white-ink" },
};

const DEFENSE: Record<StudentTaskSummary["method"], string> = {
  oral: "Defensa oral en clase.",
  escrito: "Defensa escrita en tu celular.",
  papel: "Defensa escrita, en papel.",
};

function gradeOf(e: StudentTaskSummary) {
  if (e.grading === "literal" && e.letter) return { value: e.letter, label: LETTER_LABEL[e.letter] };
  if (e.grade != null) return { value: `${formatPoints(e.grade)}/${e.gradeScale}`, label: null };
  return null;
}

function EvaluationCard({ e }: { e: StudentTaskSummary }) {
  const card = evaluationCard(e.status);
  const tone = CARD[card.tone];
  const grade = e.status === "publicado" ? gradeOf(e) : null;
  const router = useRouter();
  // The token goes to this device's storage, never to the URL, so the task page can open the submission.
  const open = () => {
    writeSubmission(e.assignmentId, { sid: e.submissionId, token: e.token });
    router.push(`/alumno/${e.assignmentId}`);
  };
  return (
    <li className={`grid gap-2.5 rounded-[var(--radius-lg)] p-[18px] md:grid-cols-[1fr_auto] md:gap-x-8 md:p-6 ${tone.box}`}>
      <div className="grid content-start gap-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-sm text-graphite">{e.subject}</span>
          <Pill tone={tone.pill} className="md:order-none">
            {card.chip}
          </Pill>
        </div>
        <h2 className="text-[1.375rem]! leading-snug!">{e.title}</h2>
        {e.status === "publicado" && (e.strength || e.toReview) && (
          <dl className="grid gap-1 text-[0.9375rem]">
            {e.strength && (
              <div>
                <dt className="inline font-bold text-success">Lo explicaste bien: </dt>
                <dd className="inline">{e.strength}</dd>
              </div>
            )}
            {e.toReview && (
              <div>
                <dt className="inline font-bold text-pen">Para repasar: </dt>
                <dd className="inline">{e.toReview}</dd>
              </div>
            )}
          </dl>
        )}
        {card.note && <p>{card.note}</p>}
        {card.tone === "highlight" && <p>{e.status === "entregado" ? "Entregaste. Tu profe te avisa cuando empiece la defensa." : DEFENSE[e.method]}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-4 md:grid md:content-center md:justify-items-end md:gap-2">
        {grade && (
          <p className="flex items-baseline gap-2 md:grid md:justify-items-end md:gap-0">
            <span className="eyebrow">Tu nota</span>
            <span className="font-display text-3xl leading-none font-extrabold tabular-nums">{grade.value}</span>
            {grade.label && <span className="text-sm font-bold">{grade.label}</span>}
          </p>
        )}
        {e.status === "publicado" ? (
          <button type="button" className="btn-secondary btn-sm" onClick={open}>
            Ver detalle
          </button>
        ) : card.tone === "highlight" ? (
          <button type="button" className="btn btn-sm" onClick={open}>
            Ir a mi tarea
          </button>
        ) : null}
      </div>
    </li>
  );
}

/** A5 · Mis evaluaciones: every task of this student code with its status. */
export default function StudentHome() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = currentAccountCode();
    if (!code) {
      router.replace("/entrar");
      return;
    }
    api<Account>(`/api/accounts/${encodeURIComponent(code)}`).then(
      (a) => {
        if (a.role === "docente") router.replace("/docente");
        else setAccount(a);
      },
      (e) => setError(e.message),
    );
  }, [router]);

  const evaluations = account?.role === "alumno" ? account.evaluations : [];
  const aliases = [...new Set(evaluations.map((e) => e.alias))];

  return (
    <>
      <StudentBar />
      <StudentMain className="max-w-4xl! gap-4!">
        <h1 className="text-[2rem]! leading-tight! md:text-[2.5rem]!">Mis evaluaciones</h1>
        {error && (
          <div role="alert" className="grid gap-3">
            <p className="font-bold text-pen">No pudimos abrir tu código. Revisa tu conexión o entra otra vez con él.</p>
            <Link href="/entrar" className="btn-secondary justify-self-start">
              Entrar con otro código
            </Link>
          </div>
        )}
        {!account && !error && (
          <p className="text-graphite" role="status">
            Cargando…
          </p>
        )}
        {account && aliases.length > 0 && (
          <p className="text-graphite">
            Tus profes te ven como {aliases.map((a) => `«${a}»`).join(" o ")}. No guardamos tu nombre real.
          </p>
        )}
        {account && evaluations.length === 0 && <p>Todavía no entregaste ninguna tarea. Abre el enlace que te dio tu profe.</p>}
        {evaluations.length > 0 && (
          <ul className="grid gap-4">
            {evaluations.map((e) => (
              <EvaluationCard key={e.submissionId} e={e} />
            ))}
          </ul>
        )}
      </StudentMain>
    </>
  );
}
