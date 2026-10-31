import Link from "next/link";

/** Brand mark: a speech bubble (the defense is a conversation) with the teacher's red tick. */
export function Logo() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight text-ink">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path
          d="M6 4H30C32.2 4 34 5.8 34 8V24C34 26.2 32.2 28 30 28H16L8 34V28H6C3.8 28 2 26.2 2 24V8C2 5.8 3.8 4 6 4Z"
          fill="var(--color-bg-brand)"
        />
        <path d="M11 16.5L16 21L25.5 11" stroke="var(--color-text-danger)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Defiéndelo
    </Link>
  );
}

/** Handwritten red-pen remark with a small arrow; decorative, so it is hidden from assistive tech. */
export function TeacherNote({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`note pointer-events-none inline-flex items-center gap-2 ${className}`} aria-hidden="true">
      <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
        <path d="M2 20C10 6 20 3 32 6M32 6L25 2M32 6L27 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  );
}

export function AppBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="app-bar">
      <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-x-8 gap-y-3 py-3">{children}</div>
    </header>
  );
}
