"use client";

import { use, useCallback, useEffect, useState } from "react";
import { api } from "@/app/api-client";
import { LockIcon } from "@/app/components/icons";
import type { PublicAssignment } from "@/application/use-cases";
import type { StudentView } from "@/domain/session";
import { sampleIndexFor } from "../student-copy";
import { currentAccountCode, readSubmission, type SavedSubmission, writeSubmission } from "../tab-code";
import { StudentBar, StudentMain } from "../ui";
import { CodeSaved, type DemoSample, HandIn } from "./hand-in";
import { GradeInReview, OralQueue, OralTurn, PaperDefense, RedoRequested, WaitingForDefense } from "./live-states";
import { Result } from "./result";
import { DefenseIntro, DefenseSent, WrittenDefense } from "./written-defense";

// ponytail: polling every 2 s; switch to SSE or websockets if a class of 40 phones is too much for the store.
const POLL_MS = 2000;

/**
 * The student's whole flow for one task (Pencil A1–A6): hand in, save the code, defend
 * (written, oral or on paper) and see the grade. Demo tasks answer at once, so nothing waits.
 */
export default function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<PublicAssignment | null>(null);
  const [samples, setSamples] = useState<DemoSample[]>([]);
  const [saved, setSaved] = useState<SavedSubmission | null>(null);
  const [view, setView] = useState<StudentView | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Moments of this visit that the server does not keep.
  const [newCode, setNewCode] = useState<string | null>(null);
  const [freshHandIn, setFreshHandIn] = useState(false);
  const [started, setStarted] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    api<PublicAssignment>(`/api/assignments/${id}`).then(setAssignment, (e) => setError(e.message));
    api<{ students: DemoSample[] }>(`/api/assignments/${id}/demo`).then(
      (r) => setSamples(r.students),
      () => setSamples([]),
    );
    setSaved(readSubmission(id));
    setCode(currentAccountCode());
  }, [id]);

  const refresh = useCallback(async () => {
    if (!saved) return;
    try {
      setView(await api<StudentView>(`/api/assignments/${id}/submissions/${saved.sid}`, { headers: { "x-student-token": saved.token } }));
    } catch {
      // ponytail: a lost or foreign token just starts over with a new submission.
      writeSubmission(id, null);
      setSaved(null);
    }
  }, [id, saved]);

  const published = view?.status === "publicado";
  useEffect(() => {
    if (!saved || published) return;
    void refresh();
    const timer = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [published, refresh, saved]);

  const sendDefense = useCallback(
    async (answers: Record<string, string>) => {
      if (!saved || !view) return;
      await api(`/api/assignments/${id}/submissions/${saved.sid}`, {
        method: "POST",
        headers: { "x-student-token": saved.token },
        body: JSON.stringify({ answers: view.questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "" })) }),
      });
      // Keep the questions on screen until the new status arrives, so nothing flashes in between.
      setJustSent(true);
      await refresh();
      setStarted(false);
    },
    [id, refresh, saved, view],
  );

  if (!assignment || (saved && !view && !newCode)) {
    return (
      <>
        <StudentBar />
        <StudentMain>
          {error ? (
            <p role="alert" className="font-bold text-pen">
              {error}
            </p>
          ) : (
            <p className="text-graphite" role="status">
              Cargando…
            </p>
          )}
        </StudentMain>
      </>
    );
  }

  // Until the teacher configures a live session, the defense is answered on the phone right after handing in.
  const method = assignment.live ? assignment.session.method : "escrito";
  const questionCount = assignment.live ? assignment.session.questionsPerStudent : null;
  const status = view?.status;

  // Full-bleed color moments carry their own <main>.
  if (view && status === "turno") {
    return (
      <>
        <StudentBar />
        <OralTurn view={view} />
      </>
    );
  }
  if (view && status === "evaluado" && justSent) {
    return (
      <>
        <StudentBar />
        <DefenseSent code={code} />
      </>
    );
  }

  let screen: React.ReactNode;
  if (newCode) {
    screen = <CodeSaved code={newCode} onContinue={() => setNewCode(null)} />;
  } else if (!saved || !view) {
    screen = assignment.acceptsSubmissions ? (
      <HandIn
        assignment={assignment}
        method={method}
        questions={questionCount}
        samples={samples}
        onDone={(result, isNew) => {
          const next = { sid: result.id, token: result.token };
          writeSubmission(id, next);
          setCode(result.code);
          setFreshHandIn(true);
          if (isNew) setNewCode(result.code);
          setSaved(next);
        }}
      />
    ) : (
      <section className="grid justify-items-center gap-3 rounded-[var(--radius-lg)] border border-rule bg-surface px-5 py-8 text-center" role="status">
        <span className="grid size-16 place-items-center rounded-full bg-subtle text-graphite">
          <LockIcon size={32} />
        </span>
        <h1 className="text-[1.75rem]!">Entregas cerradas</h1>
        <p className="text-graphite">{assignment.title}</p>
      </section>
    );
  } else if (status === "entregado") {
    screen = <WaitingForDefense view={view} assignmentId={id} saved={saved} onChanged={refresh} />;
  } else if (status === "responder") {
    const sampleIndex = sampleIndexFor(samples, view.work);
    if (!started && view.redoRequested) screen = <RedoRequested onAnswer={() => setStarted(true)} />;
    else if (!started) screen = <DefenseIntro questions={view.questions.length} freshHandIn={freshHandIn} onStart={() => setStarted(true)} />;
    else
      screen = (
        <WrittenDefense
          assignmentId={id}
          sid={saved.sid}
          questions={view.questions}
          work={view.work}
          exampleAnswers={sampleIndex === -1 ? null : samples[sampleIndex].answers}
          instant={samples.length > 0}
          onSend={sendDefense}
        />
      );
  } else if (status === "en_cola") {
    screen = <OralQueue view={view} />;
  } else if (status === "papel") {
    screen = <PaperDefense view={view} questions={assignment.session.questionsPerStudent} />;
  } else if (status === "evaluado") {
    screen = <GradeInReview title={assignment.title} subject={assignment.subject} />;
  } else {
    screen = <Result view={view} title={assignment.title} subject={assignment.subject} backToList={code != null} justSent={justSent} />;
  }

  return (
    <>
      <StudentBar />
      <StudentMain className={status === "publicado" ? "max-w-4xl!" : ""}>{screen}</StudentMain>
    </>
  );
}
